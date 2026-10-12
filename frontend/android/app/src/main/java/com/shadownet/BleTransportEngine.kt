package com.shadownet

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothGattServer
import android.bluetooth.BluetoothGattServerCallback
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.io.ByteArrayOutputStream
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * BleTransportEngine — the real Bluetooth LE fallback transport. Each device is
 * both a GATT peripheral (advertises the ShadowNet service so peers can find and
 * connect to it) and a GATT central (scans and dials peers). Data flows on one
 * characteristic: central→peripheral via writes, peripheral→central via
 * notifications. Packets use the same wire framing as Wi-Fi Direct —
 * [4-byte big-endian length][UTF-8 JSON] — chunked across the BLE MTU and
 * reassembled per peer.
 *
 * It emits the identical event vocabulary the transport engine already consumes
 * (deviceFound / deviceLost / connected / disconnected / message / stateChanged),
 * tagged transport = "ble", so NativeBleTransport lights up with zero changes
 * above the transport layer. The automatic Wi-Fi Direct → BLE switch is the
 * existing ConnectionManager priority fallthrough.
 */
@SuppressLint("MissingPermission")
class BleTransportEngine(
  private val context: ReactApplicationContext,
  private val sink: ShadowNetCommModule.TransportEventSink,
  private val activityProvider: () -> Activity?,
) {

  private val mainHandler = Handler(Looper.getMainLooper())
  private val worker: ExecutorService = Executors.newSingleThreadExecutor()

  private val bluetoothManager: BluetoothManager? =
    context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
  private val adapter: BluetoothAdapter? = bluetoothManager?.adapter

  private var scanner: BluetoothLeScanner? = null
  private var advertiser: BluetoothLeAdvertiser? = null
  private var gattServer: BluetoothGattServer? = null
  private var serverCharacteristic: BluetoothGattCharacteristic? = null

  @Volatile private var wantDiscovery = false
  @Volatile private var scanning = false
  @Volatile private var advertising = false
  @Volatile private var announcedDiscovering = false

  private val knownPeers = ConcurrentHashMap<String, String>()
  private val lastSeen = ConcurrentHashMap<String, Long>()
  private val centralGatts = ConcurrentHashMap<String, BluetoothGatt>()
  private val centralMtu = ConcurrentHashMap<String, Int>()
  private val serverPeers = ConcurrentHashMap<String, BluetoothDevice>()
  private val subscribers = ConcurrentHashMap<String, BluetoothDevice>()
  private val assemblers = ConcurrentHashMap<String, FrameAssembler>()
  private val pendingConnect = ConcurrentHashMap<String, Promise>()
  private val connectTimeouts = ConcurrentHashMap<String, Runnable>()

  // Single in-flight GATT op at a time (all sends serialized on `worker`).
  @Volatile private var writeLatch: CountDownLatch? = null
  @Volatile private var writeOk = true
  @Volatile private var notifyLatch: CountDownLatch? = null
  @Volatile private var notifyOk = true

  private val peerSweeper = object : Runnable {
    override fun run() {
      val now = System.currentTimeMillis()
      lastSeen.entries.filter { now - it.value > PEER_TTL_MS }.forEach { emitDeviceLost(it.key) }
      if (wantDiscovery) mainHandler.postDelayed(this, PEER_SWEEP_MS)
    }
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  fun initialize() {
    sink.setState(STATE_IDLE)
    mainHandler.post {
      sink.required(EVENT_DISCOVERY_STOPPED, null)
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_IDLE) }
      if (adapter == null || !supportsBle()) emitDiscoveryFailed(REASON_UNSUPPORTED)
    }
  }

  fun startDiscovery() {
    Log.d(TAG, "startDiscovery requested (adapter=${adapter != null}, supportsBle=${supportsBle()})")
    if (adapter == null || !supportsBle()) {
      emitDiscoveryFailed(REASON_UNSUPPORTED)
      return
    }
    if (!adapter.isEnabled) {
      Log.d(TAG, "startDiscovery: Bluetooth adapter is off")
      emitDiscoveryFailed(REASON_DISABLED)
      return
    }
    ensurePermissions { granted ->
      Log.d(TAG, "startDiscovery: permission granted=$granted (required=${requiredPermissions().joinToString()})")
      if (!granted) {
        emitDiscoveryFailed(REASON_PERMISSION)
        return@ensurePermissions
      }
      wantDiscovery = true
      startServer()
      startAdvertising()
      startScanning()
      announceDiscovering()
      mainHandler.removeCallbacks(peerSweeper)
      mainHandler.postDelayed(peerSweeper, PEER_SWEEP_MS)
    }
  }

  fun stopDiscovery() {
    wantDiscovery = false
    mainHandler.removeCallbacks(peerSweeper)
    stopScanning()
    stopAdvertising()
    knownPeers.clear()
    lastSeen.clear()
    announcedDiscovering = false
    sink.setState(STATE_IDLE)
    mainHandler.post {
      sink.required(EVENT_DISCOVERY_STOPPED, null)
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_IDLE) }
    }
  }

  fun teardown() {
    wantDiscovery = false
    mainHandler.removeCallbacks(peerSweeper)
    stopScanning()
    stopAdvertising()
    centralGatts.values.forEach { safeClose(it) }
    centralGatts.clear()
    try {
      gattServer?.close()
    } catch (e: Exception) {
      // Ignore.
    }
    gattServer = null
    worker.shutdownNow()
  }

  // ---------------------------------------------------------------------------
  // Peripheral role: GATT server + advertising (be discoverable & receive)
  // ---------------------------------------------------------------------------

  private fun startServer() {
    if (gattServer != null) return
    val manager = bluetoothManager ?: return
    val server = manager.openGattServer(context, serverCallback) ?: return
    val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
    val characteristic = BluetoothGattCharacteristic(
      DATA_CHAR_UUID,
      BluetoothGattCharacteristic.PROPERTY_WRITE or
        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE or
        BluetoothGattCharacteristic.PROPERTY_NOTIFY,
      BluetoothGattCharacteristic.PERMISSION_WRITE,
    )
    val cccd = BluetoothGattDescriptor(
      CCCD_UUID,
      BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE,
    )
    characteristic.addDescriptor(cccd)
    service.addCharacteristic(characteristic)
    server.addService(service)
    gattServer = server
    serverCharacteristic = characteristic
  }

  private fun startAdvertising() {
    if (advertising) return
    val adv = adapter?.bluetoothLeAdvertiser ?: return
    val settings = AdvertiseSettings.Builder()
      .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
      .setConnectable(true)
      .setTimeout(0)
      .build()
    // A 128-bit service UUID fills most of the 31-byte payload, so keep the
    // name out of the advert; peers resolve it after connecting.
    val data = AdvertiseData.Builder()
      .setIncludeDeviceName(false)
      .addServiceUuid(ParcelUuid(SERVICE_UUID))
      .build()
    advertiser = adv
    adv.startAdvertising(settings, data, advertiseCallback)
    advertising = true
  }

  private fun stopAdvertising() {
    if (!advertising) return
    try {
      advertiser?.stopAdvertising(advertiseCallback)
    } catch (e: Exception) {
      // Ignore.
    }
    advertising = false
  }

  private val advertiseCallback = object : AdvertiseCallback() {
    override fun onStartFailure(errorCode: Int) {
      advertising = false
    }
  }

  private val serverCallback = object : BluetoothGattServerCallback() {
    override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
      val id = device.address
      if (newState == BluetoothProfile.STATE_CONNECTED) {
        serverPeers[id] = device
      } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
        serverPeers.remove(id)
        subscribers.remove(id)
        assemblers.remove(id)
        if (centralGatts[id] == null) emitConnectionLost(id)
      }
    }

    override fun onCharacteristicWriteRequest(
      device: BluetoothDevice,
      requestId: Int,
      characteristic: BluetoothGattCharacteristic,
      preparedWrite: Boolean,
      responseNeeded: Boolean,
      offset: Int,
      value: ByteArray,
    ) {
      if (characteristic.uuid == DATA_CHAR_UUID) {
        assemblerFor(device.address).append(value)
      }
      if (responseNeeded) {
        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
      }
    }

    override fun onDescriptorWriteRequest(
      device: BluetoothDevice,
      requestId: Int,
      descriptor: BluetoothGattDescriptor,
      preparedWrite: Boolean,
      responseNeeded: Boolean,
      offset: Int,
      value: ByteArray,
    ) {
      // A central enabling notifications == an established messaging link.
      if (descriptor.uuid == CCCD_UUID) {
        subscribers[device.address] = device
        serverPeers[device.address] = device
      }
      if (responseNeeded) {
        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
      }
    }

    override fun onNotificationSent(device: BluetoothDevice, status: Int) {
      notifyOk = status == BluetoothGatt.GATT_SUCCESS
      notifyLatch?.countDown()
    }
  }

  // ---------------------------------------------------------------------------
  // Central role: scan + connect + write
  // ---------------------------------------------------------------------------

  private fun startScanning() {
    if (scanning) return
    val s = adapter?.bluetoothLeScanner ?: run {
      Log.d(TAG, "startScanning: bluetoothLeScanner unavailable")
      return
    }
    val filter = ScanFilter.Builder().setServiceUuid(ParcelUuid(SERVICE_UUID)).build()
    val settings = ScanSettings.Builder()
      .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
      .build()
    scanner = s
    s.startScan(listOf(filter), settings, scanCallback)
    scanning = true
    Log.d(TAG, "startScanning: BLE scan started, filtering for service UUID $SERVICE_UUID")
  }

  private fun stopScanning() {
    if (!scanning) return
    try {
      scanner?.stopScan(scanCallback)
    } catch (e: Exception) {
      // Ignore.
    }
    scanning = false
  }

  private val scanCallback = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult) {
      val device = result.device
      val address = device.address ?: return
      val name = result.scanRecord?.deviceName ?: device.name ?: address
      lastSeen[address] = System.currentTimeMillis()
      if (knownPeers.put(address, name) == null) {
        Log.d(TAG, "onScanResult: new ShadowNet peer address=$address name=$name")
        emitDeviceFound(address, name)
      }
    }

    override fun onScanFailed(errorCode: Int) {
      Log.d(TAG, "onScanFailed errorCode=$errorCode")
      emitDiscoveryFailed("scan-failed-$errorCode")
    }
  }

  fun connect(deviceId: String, promise: Promise) {
    val adapter = adapter
    if (adapter == null || !supportsBle()) {
      emitConnectionFailed(deviceId, REASON_UNSUPPORTED)
      promise.reject(ERROR_CONNECT, REASON_UNSUPPORTED)
      return
    }
    ensurePermissions { granted ->
      if (!granted) {
        emitConnectionFailed(deviceId, REASON_PERMISSION)
        promise.reject(ERROR_CONNECT, REASON_PERMISSION)
        return@ensurePermissions
      }
      val device = try {
        adapter.getRemoteDevice(deviceId)
      } catch (e: IllegalArgumentException) {
        emitConnectionFailed(deviceId, "bad-address")
        promise.reject(ERROR_CONNECT, "bad-address")
        return@ensurePermissions
      }
      pendingConnect[deviceId] = promise
      sink.setState(STATE_CONNECTING)
      sink.required(EVENT_CONNECTING) { putString("deviceId", deviceId) }
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_CONNECTING) }
      val gatt = device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
      if (gatt == null) {
        failConnect(deviceId, "gatt-null")
        return@ensurePermissions
      }
      centralGatts[deviceId] = gatt
      val timeout = Runnable {
        if (pendingConnect.containsKey(deviceId)) failConnect(deviceId, REASON_TIMEOUT)
      }
      connectTimeouts[deviceId] = timeout
      mainHandler.postDelayed(timeout, CONNECT_TIMEOUT_MS)
    }
  }

  fun disconnect(deviceId: String) {
    clearConnectTimeout(deviceId)
    centralGatts.remove(deviceId)?.let { safeClose(it) }
    serverPeers.remove(deviceId)
    subscribers.remove(deviceId)
    assemblers.remove(deviceId)
    sink.setState(STATE_IDLE)
    mainHandler.post {
      sink.required(EVENT_DISCONNECTED) { putString("deviceId", deviceId) }
      sink.bridge(TYPE_DISCONNECTED) { putString("deviceId", deviceId) }
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_IDLE) }
    }
  }

  private val gattCallback = object : BluetoothGattCallback() {
    override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
      val id = gatt.device.address
      if (newState == BluetoothProfile.STATE_CONNECTED) {
        gatt.requestMtu(REQUESTED_MTU)
      } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
        val wasConnected = centralGatts.containsKey(id)
        centralGatts.remove(id)
        centralMtu.remove(id)
        assemblers.remove(id)
        safeClose(gatt)
        if (pendingConnect.remove(id) != null) {
          clearConnectTimeout(id)
          emitConnectionFailed(id, "gatt-disconnected")
        } else if (wasConnected) {
          emitConnectionLost(id)
        }
      }
    }

    override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
      centralMtu[gatt.device.address] = mtu
      gatt.discoverServices()
    }

    override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
      val characteristic = gatt.getService(SERVICE_UUID)?.getCharacteristic(DATA_CHAR_UUID)
      if (status != BluetoothGatt.GATT_SUCCESS || characteristic == null) {
        failConnect(gatt.device.address, "no-service")
        return
      }
      gatt.setCharacteristicNotification(characteristic, true)
      val cccd = characteristic.getDescriptor(CCCD_UUID)
      if (cccd != null) {
        cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        gatt.writeDescriptor(cccd)
      } else {
        completeConnect(gatt.device.address)
      }
    }

    override fun onDescriptorWrite(gatt: BluetoothGatt, descriptor: BluetoothGattDescriptor, status: Int) {
      if (descriptor.uuid == CCCD_UUID) completeConnect(gatt.device.address)
    }

    override fun onCharacteristicWrite(
      gatt: BluetoothGatt,
      characteristic: BluetoothGattCharacteristic,
      status: Int,
    ) {
      writeOk = status == BluetoothGatt.GATT_SUCCESS
      writeLatch?.countDown()
    }

    // Pre-API-33 notification delivery (value carried on the characteristic).
    @Suppress("DEPRECATION")
    override fun onCharacteristicChanged(
      gatt: BluetoothGatt,
      characteristic: BluetoothGattCharacteristic,
    ) {
      if (characteristic.uuid == DATA_CHAR_UUID) {
        val value = characteristic.value ?: return
        assemblerFor(gatt.device.address).append(value)
      }
    }

    // API-33+ notification delivery (value passed explicitly).
    override fun onCharacteristicChanged(
      gatt: BluetoothGatt,
      characteristic: BluetoothGattCharacteristic,
      value: ByteArray,
    ) {
      if (characteristic.uuid == DATA_CHAR_UUID) {
        assemblerFor(gatt.device.address).append(value)
      }
    }
  }

  private fun completeConnect(deviceId: String) {
    val promise = pendingConnect.remove(deviceId) ?: return
    clearConnectTimeout(deviceId)
    sink.setState(STATE_CONNECTED)
    mainHandler.post {
      sink.required(EVENT_CONNECTED) {
        putString("deviceId", deviceId)
        putDouble("latencyMs", 0.0)
      }
      sink.bridge(TYPE_CONNECTED) {
        putString("deviceId", deviceId)
        putDouble("latencyMs", 0.0)
      }
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_CONNECTED) }
    }
    // Resolve the JS connect() promise now that the link can carry packets.
    promise.resolve(
      Arguments.createMap().apply {
        putString("transport", TRANSPORT_BLE)
        putString("deviceId", deviceId)
        putDouble("latencyMs", 0.0)
      },
    )
  }

  private fun failConnect(deviceId: String, reason: String) {
    val promise = pendingConnect.remove(deviceId)
    clearConnectTimeout(deviceId)
    centralGatts.remove(deviceId)?.let { safeClose(it) }
    emitConnectionFailed(deviceId, reason)
    promise?.reject(ERROR_CONNECT, reason)
  }

  private fun clearConnectTimeout(deviceId: String) {
    connectTimeouts.remove(deviceId)?.let { mainHandler.removeCallbacks(it) }
  }

  // ---------------------------------------------------------------------------
  // Send (central write or peripheral notify) + receive framing
  // ---------------------------------------------------------------------------

  fun send(deviceId: String, payload: String, promise: Promise) {
    worker.execute {
      val packetId = packetIdOf(payload)
      val framed = frame(payload)
      val start = System.currentTimeMillis()
      val gatt = centralGatts[deviceId]
      val subscriber = subscribers[deviceId]
      val ok = when {
        gatt != null -> sendViaGatt(deviceId, gatt, framed)
        subscriber != null -> sendViaNotify(subscriber, framed)
        else -> false
      }
      if (ok) {
        val latency = System.currentTimeMillis() - start
        mainHandler.post { emitPacketSent(deviceId, packetId, latency) }
        promise.resolve(sendResult(latency))
      } else {
        mainHandler.post { emitPacketFailed(deviceId, packetId, "ble-write-failed") }
        promise.reject(ERROR_SEND, "ble-write-failed")
      }
    }
  }

  private fun sendViaGatt(deviceId: String, gatt: BluetoothGatt, framed: ByteArray): Boolean {
    val characteristic = gatt.getService(SERVICE_UUID)?.getCharacteristic(DATA_CHAR_UUID) ?: return false
    val chunkSize = ((centralMtu[deviceId] ?: DEFAULT_MTU) - GATT_HEADER).coerceAtLeast(MIN_CHUNK)
    var offset = 0
    while (offset < framed.size) {
      val end = minOf(offset + chunkSize, framed.size)
      val chunk = framed.copyOfRange(offset, end)
      characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
      characteristic.value = chunk
      val latch = CountDownLatch(1)
      writeLatch = latch
      writeOk = false
      if (!gatt.writeCharacteristic(characteristic)) return false
      if (!latch.await(OP_TIMEOUT_MS, TimeUnit.MILLISECONDS) || !writeOk) return false
      offset = end
    }
    return true
  }

  private fun sendViaNotify(device: BluetoothDevice, framed: ByteArray): Boolean {
    val server = gattServer ?: return false
    val characteristic = serverCharacteristic ?: return false
    var offset = 0
    while (offset < framed.size) {
      val end = minOf(offset + NOTIFY_CHUNK, framed.size)
      val chunk = framed.copyOfRange(offset, end)
      characteristic.value = chunk
      val latch = CountDownLatch(1)
      notifyLatch = latch
      notifyOk = false
      @Suppress("DEPRECATION")
      val queued = server.notifyCharacteristicChanged(device, characteristic, false)
      if (queued == false) return false
      if (!latch.await(OP_TIMEOUT_MS, TimeUnit.MILLISECONDS) || !notifyOk) return false
      offset = end
    }
    return true
  }

  private fun assemblerFor(deviceId: String): FrameAssembler =
    assemblers.computeIfAbsent(deviceId) { FrameAssembler { json -> onFrame(deviceId, json) } }

  private fun onFrame(deviceId: String, json: String) {
    mainHandler.post { emitPacketReceived(deviceId, json) }
  }

  private fun frame(payload: String): ByteArray {
    val body = payload.toByteArray(Charsets.UTF_8)
    val out = ByteArray(4 + body.size)
    out[0] = (body.size ushr 24 and 0xFF).toByte()
    out[1] = (body.size ushr 16 and 0xFF).toByte()
    out[2] = (body.size ushr 8 and 0xFF).toByte()
    out[3] = (body.size and 0xFF).toByte()
    System.arraycopy(body, 0, out, 4, body.size)
    return out
  }

  private fun packetIdOf(json: String): String = try {
    org.json.JSONObject(json).optString("id", "")
  } catch (e: Exception) {
    ""
  }

  private fun sendResult(latencyMs: Long): WritableMap = Arguments.createMap().apply {
    putBoolean("sent", true)
    putDouble("confidence", 0.9)
    putDouble("latencyMs", latencyMs.toDouble())
  }

  // ---------------------------------------------------------------------------
  // Event emission (mirrors the module's dual public/internal contract)
  // ---------------------------------------------------------------------------

  private fun announceDiscovering() {
    sink.setState(STATE_DISCOVERING)
    if (announcedDiscovering) return
    announcedDiscovering = true
    mainHandler.post {
      sink.required(EVENT_DISCOVERY_STARTED, null)
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_DISCOVERING) }
    }
  }

  private fun emitDeviceFound(address: String, name: String) {
    mainHandler.post {
      sink.required(EVENT_DEVICE_FOUND) {
        putString("deviceId", address)
        putString("name", name)
      }
      sink.bridge(TYPE_DEVICE_FOUND) {
        putString("id", address)
        putString("name", name)
      }
    }
  }

  private fun emitDeviceLost(address: String) {
    knownPeers.remove(address)
    lastSeen.remove(address)
    mainHandler.post {
      sink.required(EVENT_DEVICE_LOST) { putString("deviceId", address) }
      sink.bridge(TYPE_DEVICE_LOST) { putString("id", address) }
    }
  }

  private fun emitConnectionFailed(deviceId: String, reason: String) {
    sink.setState(STATE_IDLE)
    mainHandler.post {
      sink.required(EVENT_CONNECTION_FAILED) {
        putString("deviceId", deviceId)
        putString("reason", reason)
      }
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_IDLE) }
    }
  }

  private fun emitConnectionLost(deviceId: String) {
    sink.setState(STATE_IDLE)
    mainHandler.post {
      sink.required(EVENT_CONNECTION_LOST) { putString("deviceId", deviceId) }
      sink.bridge(TYPE_DISCONNECTED) { putString("deviceId", deviceId) }
      sink.bridge(TYPE_STATE_CHANGED) { putString("state", STATE_IDLE) }
    }
  }

  private fun emitPacketSent(deviceId: String, packetId: String, latencyMs: Long) {
    sink.required(EVENT_PACKET_SENT) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
      putDouble("latencyMs", latencyMs.toDouble())
    }
  }

  private fun emitPacketReceived(deviceId: String, json: String) {
    sink.required(EVENT_PACKET_RECEIVED) {
      putString("deviceId", deviceId)
      putString("data", json)
    }
    sink.bridge(TYPE_MESSAGE) {
      putString("deviceId", deviceId)
      putString("data", json)
    }
  }

  private fun emitPacketFailed(deviceId: String, packetId: String, reason: String) {
    sink.required(EVENT_PACKET_FAILED) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
      putString("reason", reason)
    }
  }

  private fun emitDiscoveryFailed(reason: String) {
    mainHandler.post { sink.required(EVENT_DISCOVERY_FAILED) { putString("reason", reason) } }
  }

  // ---------------------------------------------------------------------------
  // Permissions & helpers
  // ---------------------------------------------------------------------------

  private fun supportsBle(): Boolean =
    context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)

  private fun requiredPermissions(): Array<String> =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      arrayOf(
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_ADVERTISE,
        Manifest.permission.BLUETOOTH_CONNECT,
      )
    } else {
      arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
    }

  private fun hasPermissions(): Boolean = requiredPermissions().all {
    ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
  }

  private fun ensurePermissions(onResult: (Boolean) -> Unit) {
    if (hasPermissions()) {
      onResult(true)
      return
    }
    val missing = requiredPermissions().filter {
      ContextCompat.checkSelfPermission(context, it) != PackageManager.PERMISSION_GRANTED
    }
    val activity = activityProvider()
    if (activity is PermissionAwareActivity) {
      activity.requestPermissions(missing.toTypedArray(), REQUEST_PERMISSIONS, PermissionListener { code, _, results ->
        if (code != REQUEST_PERMISSIONS) return@PermissionListener false
        onResult(results.isNotEmpty() && results.all { it == PackageManager.PERMISSION_GRANTED })
        true
      })
    } else {
      onResult(false)
    }
  }

  private fun safeClose(gatt: BluetoothGatt) {
    try {
      gatt.disconnect()
      gatt.close()
    } catch (e: Exception) {
      // Ignore.
    }
  }

  /** Reassembles [4-byte length][payload] frames from a stream of BLE chunks. */
  private class FrameAssembler(private val onFrame: (String) -> Unit) {
    private val buffer = ByteArrayOutputStream()

    @Synchronized
    fun append(bytes: ByteArray) {
      buffer.write(bytes)
      var data = buffer.toByteArray()
      var offset = 0
      while (data.size - offset >= 4) {
        val length = ((data[offset].toInt() and 0xFF) shl 24) or
          ((data[offset + 1].toInt() and 0xFF) shl 16) or
          ((data[offset + 2].toInt() and 0xFF) shl 8) or
          (data[offset + 3].toInt() and 0xFF)
        if (length <= 0 || length > MAX_FRAME_BYTES) {
          buffer.reset()
          return
        }
        if (data.size - offset - 4 < length) break
        onFrame(String(data, offset + 4, length, Charsets.UTF_8))
        offset += 4 + length
      }
      buffer.reset()
      if (offset < data.size) buffer.write(data, offset, data.size - offset)
    }
  }

  companion object {
    val SERVICE_UUID: UUID = UUID.fromString("7b3e8f00-9c2a-4b6d-8e1f-2a5c9d4e7f10")
    val DATA_CHAR_UUID: UUID = UUID.fromString("7b3e8f01-9c2a-4b6d-8e1f-2a5c9d4e7f10")
    val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

    private const val TAG = "ShadowNetBle"
    private const val TRANSPORT_BLE = "ble"

    private const val STATE_IDLE = "idle"
    private const val STATE_DISCOVERING = "discovering"
    private const val STATE_CONNECTING = "connecting"
    private const val STATE_CONNECTED = "connected"

    private const val TYPE_STATE_CHANGED = "stateChanged"
    private const val TYPE_CONNECTED = "connected"
    private const val TYPE_DISCONNECTED = "disconnected"
    private const val TYPE_DEVICE_FOUND = "deviceFound"
    private const val TYPE_DEVICE_LOST = "deviceLost"
    private const val TYPE_MESSAGE = "message"

    private const val EVENT_DISCOVERY_STARTED = "DiscoveryStarted"
    private const val EVENT_DISCOVERY_STOPPED = "DiscoveryStopped"
    private const val EVENT_DISCOVERY_FAILED = "DiscoveryFailed"
    private const val EVENT_DEVICE_FOUND = "DeviceFound"
    private const val EVENT_DEVICE_LOST = "DeviceLost"
    private const val EVENT_CONNECTING = "Connecting"
    private const val EVENT_CONNECTED = "Connected"
    private const val EVENT_DISCONNECTED = "Disconnected"
    private const val EVENT_CONNECTION_FAILED = "ConnectionFailed"
    private const val EVENT_CONNECTION_LOST = "ConnectionLost"
    private const val EVENT_PACKET_SENT = "PacketSent"
    private const val EVENT_PACKET_RECEIVED = "PacketReceived"
    private const val EVENT_PACKET_FAILED = "PacketFailed"

    private const val REASON_UNSUPPORTED = "ble-unsupported"
    private const val REASON_DISABLED = "ble-disabled"
    private const val REASON_PERMISSION = "permission-denied"
    private const val REASON_TIMEOUT = "timeout"

    private const val ERROR_CONNECT = "E_SHADOWNET_BLE_CONNECT"
    private const val ERROR_SEND = "E_SHADOWNET_BLE_SEND"

    private const val REQUEST_PERMISSIONS = 0x5D02
    private const val REQUESTED_MTU = 512
    private const val DEFAULT_MTU = 23
    private const val GATT_HEADER = 3
    private const val MIN_CHUNK = 20
    private const val NOTIFY_CHUNK = 20
    private const val MAX_FRAME_BYTES = 1 shl 20
    private const val OP_TIMEOUT_MS = 5_000L
    private const val CONNECT_TIMEOUT_MS = 10_000L
    private const val PEER_SWEEP_MS = 5_000L
    private const val PEER_TTL_MS = 15_000L
  }
}
