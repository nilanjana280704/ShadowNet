package com.shadownet

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.wifi.WpsInfo
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pDeviceList
import android.net.wifi.p2p.WifiP2pInfo
import android.net.wifi.p2p.WifiP2pManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.IOException
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import org.json.JSONObject
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

class ShadowNetCommModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val transportStates = mutableMapOf<String, String>()
  private val mainHandler = Handler(Looper.getMainLooper())

  // ---- Wi-Fi Direct discovery state (transport == "wifi-direct") ------------
  private var wifiP2pManager: WifiP2pManager? = null
  private var wifiChannel: WifiP2pManager.Channel? = null
  private var wifiReceiver: BroadcastReceiver? = null
  private var receiverRegistered = false
  private var wantDiscovery = false
  private var announcedDiscovering = false
  private var discoveryFailures = 0
  private val knownPeers = LinkedHashMap<String, String>()
  private val discoveryRunnable = Runnable { if (wantDiscovery) runDiscovery() }

  // ---- Wi-Fi Direct connection state ----------------------------------------
  private var wantConnection = false
  private var connectionFormed = false
  private var isGroupOwner = false
  private var groupOwnerAddress = ""
  private var currentDeviceId: String? = null
  private var pendingDeviceId: String? = null
  private var pendingConnectPromise: Promise? = null
  private var connectStartedAt = 0L
  private var reconnectAttempts = 0
  private val connectTimeoutRunnable = Runnable { onConnectTimeout() }
  private val reconnectRunnable = Runnable {
    val id = currentDeviceId
    if (wantConnection && id != null) initiateConnect(id, null)
  }

  // ---- Wi-Fi Direct messaging (TCP sockets over the P2P group) --------------
  private val ioExecutor: ExecutorService = Executors.newCachedThreadPool()
  private val peers = ConcurrentHashMap<String, PeerLink>()
  @Volatile private var serverSocket: ServerSocket? = null
  @Volatile private var messagingWantOpen = false
  @Volatile private var messagingStarted = false

  // ---- Bluetooth LE fallback transport (transport == "ble") -----------------
  /** Event surface the BLE engine uses; transport is fixed to "ble". */
  interface TransportEventSink {
    fun required(event: String, block: (WritableMap.() -> Unit)?)
    fun bridge(type: String, block: (WritableMap.() -> Unit)?)
    fun setState(state: String)
  }

  private val bleSink = object : TransportEventSink {
    override fun required(event: String, block: (WritableMap.() -> Unit)?) =
      emitRequiredEvent(event, TRANSPORT_BLE, block)

    override fun bridge(type: String, block: (WritableMap.() -> Unit)?) =
      emitBridgeEvent(type, TRANSPORT_BLE, block)

    override fun setState(state: String) {
      transportStates[TRANSPORT_BLE] = state
    }
  }

  private val bleEngine: BleTransportEngine by lazy {
    BleTransportEngine(reactContext, bleSink) { reactContext.currentActivity }
  }

  override fun getName(): String = NAME

  /**
   * Exposes the native contract to JS as compile-time constants: the single
   * DeviceEventEmitter channel, the catalog of event names emitted on it, and
   * the transport states. Lets JS reference event names from one source of
   * truth instead of hard-coding strings.
   */
  override fun getConstants(): Map<String, Any> = mapOf(
    "EVENT_CHANNEL" to EVENT_CHANNEL,
    "EVENTS" to mapOf(
      "DiscoveryStarted" to EVENT_DISCOVERY_STARTED,
      "DiscoveryStopped" to EVENT_DISCOVERY_STOPPED,
      "DiscoveryFailed" to EVENT_DISCOVERY_FAILED,
      "DeviceFound" to EVENT_DEVICE_FOUND,
      "DeviceLost" to EVENT_DEVICE_LOST,
      "Connecting" to EVENT_CONNECTING,
      "Connected" to EVENT_CONNECTED,
      "Disconnected" to EVENT_DISCONNECTED,
      "ConnectionFailed" to EVENT_CONNECTION_FAILED,
      "ConnectionLost" to EVENT_CONNECTION_LOST,
      "PacketReceived" to EVENT_PACKET_RECEIVED,
      "PacketSent" to EVENT_PACKET_SENT,
      "PacketDelivered" to EVENT_PACKET_DELIVERED,
      "PacketFailed" to EVENT_PACKET_FAILED,
      "Error" to EVENT_ERROR,
    ),
    "STATES" to mapOf(
      "idle" to STATE_IDLE,
      "discovering" to STATE_DISCOVERING,
      "connecting" to STATE_CONNECTING,
    ),
  )

  // ---------------------------------------------------------------------------
  // React methods
  // ---------------------------------------------------------------------------

  @ReactMethod
  fun initialize(transport: String, promise: Promise) {
    Log.d(TAG, "initialize transport=$transport")
    transportStates[transport] = STATE_IDLE
    if (transport == TRANSPORT_WIFI_DIRECT) {
      val ready = ensureWifiDirect()
      Log.d(TAG, "initialize wifi-direct: ensureWifiDirect()=$ready")
      emitRequiredEvent(EVENT_DISCOVERY_STOPPED, transport)
      emitBridgeEvent(TYPE_STATE_CHANGED, transport) { putString("state", STATE_IDLE) }
      if (!ready) emitDiscoveryFailed(transport, REASON_UNSUPPORTED)
      promise.resolve(statusFor(transport))
      return
    }
    if (transport == TRANSPORT_BLE) {
      bleEngine.initialize()
      promise.resolve(statusFor(transport))
      return
    }
    emitRequiredEvent(EVENT_DISCOVERY_STOPPED, transport)
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) { putString("state", STATE_IDLE) }
    promise.resolve(statusFor(transport))
  }

  @ReactMethod
  fun startDiscovery(transport: String, promise: Promise) {
    Log.d(TAG, "startDiscovery requested transport=$transport")
    if (transport == TRANSPORT_BLE) {
      bleEngine.startDiscovery()
      promise.resolve(statusFor(transport))
      return
    }
    if (transport == TRANSPORT_WIFI_DIRECT) {
      if (!ensureWifiDirect()) {
        Log.d(TAG, "startDiscovery wifi-direct: ensureWifiDirect() failed (no FEATURE_WIFI_DIRECT or manager/channel init failed)")
        emitDiscoveryFailed(transport, REASON_UNSUPPORTED)
        promise.resolve(statusFor(transport))
        return
      }
      wantDiscovery = true
      discoveryFailures = 0
      knownPeers.clear()
      runDiscovery()
      promise.resolve(statusFor(transport))
      return
    }
    // Generic fallback: transports without a radio implementation yet.
    transportStates[transport] = STATE_DISCOVERING
    emitRequiredEvent(EVENT_DISCOVERY_STARTED, transport)
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) { putString("state", STATE_DISCOVERING) }
    promise.resolve(statusFor(transport))
  }

  @ReactMethod
  fun stopDiscovery(transport: String, promise: Promise) {
    if (transport == TRANSPORT_BLE) {
      bleEngine.stopDiscovery()
      promise.resolve(statusFor(transport))
      return
    }
    if (transport == TRANSPORT_WIFI_DIRECT) {
      finishDiscovery(transport, announce = true)
      promise.resolve(statusFor(transport))
      return
    }
    transportStates[transport] = STATE_IDLE
    emitRequiredEvent(EVENT_DISCOVERY_STOPPED, transport)
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) { putString("state", STATE_IDLE) }
    promise.resolve(statusFor(transport))
  }

  @ReactMethod
  fun connect(transport: String, deviceId: String, promise: Promise) {
    if (transport == TRANSPORT_BLE) {
      bleEngine.connect(deviceId, promise)
      return
    }
    if (transport == TRANSPORT_WIFI_DIRECT) {
      // Already connected to this peer: resolve immediately with live info.
      if (connectionFormed && currentDeviceId == deviceId) {
        promise.resolve(connectionInfoMap(deviceId, 0L))
        return
      }
      reconnectAttempts = 0
      initiateConnect(deviceId, promise)
      return
    }
    transportStates[transport] = STATE_CONNECTING
    emitRequiredEvent(EVENT_CONNECTING, transport) {
      putString("deviceId", deviceId)
    }
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) {
      putString("state", STATE_CONNECTING)
    }
    rejectNotImplemented("connect", transport, promise)
  }

  @ReactMethod
  fun disconnect(transport: String, deviceId: String, promise: Promise) {
    if (transport == TRANSPORT_BLE) {
      bleEngine.disconnect(deviceId)
      promise.resolve(statusFor(transport))
      return
    }
    if (transport == TRANSPORT_WIFI_DIRECT) {
      wantConnection = false
      reconnectAttempts = 0
      mainHandler.removeCallbacks(connectTimeoutRunnable)
      mainHandler.removeCallbacks(reconnectRunnable)
      val target = currentDeviceId ?: deviceId
      // Suppress broadcast-driven loss handling; we own this teardown.
      connectionFormed = false
      takePendingPromise()?.reject(ERROR_CONNECT, REASON_CANCELLED)
      cancelConnect()
      val manager = wifiP2pManager
      val channel = wifiChannel
      if (manager != null && channel != null) {
        try {
          manager.removeGroup(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
              finalizeDisconnect(target)
              promise.resolve(statusFor(transport))
            }

            override fun onFailure(reason: Int) {
              finalizeDisconnect(target)
              promise.resolve(statusFor(transport))
            }
          })
        } catch (se: SecurityException) {
          finalizeDisconnect(target)
          promise.resolve(statusFor(transport))
        }
      } else {
        finalizeDisconnect(target)
        promise.resolve(statusFor(transport))
      }
      return
    }
    transportStates[transport] = STATE_IDLE
    emitRequiredEvent(EVENT_DISCONNECTED, transport) {
      putString("deviceId", deviceId)
    }
    emitBridgeEvent(TYPE_DISCONNECTED, transport) {
      putString("deviceId", deviceId)
    }
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) {
      putString("state", STATE_IDLE)
    }
    promise.resolve(statusFor(transport))
  }

  @ReactMethod
  fun send(transport: String, deviceId: String, payload: String, promise: Promise) {
    if (transport == TRANSPORT_BLE) {
      bleEngine.send(deviceId, payload, promise)
      return
    }
    if (transport == TRANSPORT_WIFI_DIRECT) {
      val link = resolvePeer(deviceId)
      val packetId = packetIdOf(payload)
      if (link == null) {
        emitPacketFailed(deviceId, packetId, "not-connected")
        promise.reject(ERROR_SEND, "not-connected")
        return
      }
      ioExecutor.execute { writeWithRetry(link, deviceId, packetId, payload, promise) }
      return
    }
    rejectNotImplemented("send", transport, promise) {
      putString("deviceId", deviceId)
      putString("payload", payload)
    }
  }

  @ReactMethod
  fun getStatus(transport: String, promise: Promise) {
    promise.resolve(statusFor(transport))
  }

  @ReactMethod
  fun getConnectionInfo(transport: String, promise: Promise) {
    promise.resolve(connectionStatusMap())
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by NativeEventEmitter. Events are emitted on ShadowNetCommEvent.
  }

  @ReactMethod
  fun removeListeners(count: Double) {
    // Required by NativeEventEmitter. Listener bookkeeping is handled by React Native.
  }

  override fun invalidate() {
    wantDiscovery = false
    wantConnection = false
    mainHandler.removeCallbacks(discoveryRunnable)
    mainHandler.removeCallbacks(connectTimeoutRunnable)
    mainHandler.removeCallbacks(reconnectRunnable)
    stopMessaging()
    ioExecutor.shutdownNow()
    bleEngine.teardown()
    unregisterReceiver()
    super.invalidate()
  }

  // ---------------------------------------------------------------------------
  // Wi-Fi Direct discovery (Android WifiP2pManager)
  // ---------------------------------------------------------------------------

  /** Lazily binds WifiP2pManager, opens a channel, and registers the receiver. */
  private fun ensureWifiDirect(): Boolean {
    if (wifiP2pManager != null && wifiChannel != null) {
      ensureReceiver()
      return true
    }
    if (!reactContext.packageManager.hasSystemFeature(PackageManager.FEATURE_WIFI_DIRECT)) {
      return false
    }
    val manager = reactContext.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
      ?: return false
    val channel = manager.initialize(reactContext, Looper.getMainLooper(), WifiP2pManager.ChannelListener {
      // Framework channel died; drop it so the next cycle reopens one, and keep
      // discovery alive if the user still wants it (restart after failure).
      wifiChannel = null
      if (wantDiscovery) scheduleDiscovery(DISCOVERY_RETRY_MS)
    }) ?: return false
    wifiP2pManager = manager
    wifiChannel = channel
    ensureReceiver()
    return true
  }

  private fun ensureReceiver() {
    if (receiverRegistered) return
    val receiver = wifiReceiver ?: object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) = handleWifiBroadcast(intent)
    }.also { wifiReceiver = it }
    val filter = IntentFilter().apply {
      addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION)
      addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION)
      addAction(WifiP2pManager.WIFI_P2P_DISCOVERY_CHANGED_ACTION)
      addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION)
    }
    ContextCompat.registerReceiver(reactContext, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
    receiverRegistered = true
  }

  private fun unregisterReceiver() {
    if (!receiverRegistered) return
    wifiReceiver?.let {
      try {
        reactContext.unregisterReceiver(it)
      } catch (e: IllegalArgumentException) {
        // Already unregistered; nothing to do.
      }
    }
    receiverRegistered = false
  }

  private fun handleWifiBroadcast(intent: Intent) {
    when (intent.action) {
      WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION -> {
        val enabled = intent.getIntExtra(WifiP2pManager.EXTRA_WIFI_STATE, -1) ==
          WifiP2pManager.WIFI_P2P_STATE_ENABLED
        if (!enabled && wantDiscovery) emitDiscoveryFailed(TRANSPORT_WIFI_DIRECT, REASON_DISABLED)
      }
      WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION -> requestPeers()
      WifiP2pManager.WIFI_P2P_DISCOVERY_CHANGED_ACTION -> {
        val stopped = intent.getIntExtra(WifiP2pManager.EXTRA_DISCOVERY_STATE, -1) ==
          WifiP2pManager.WIFI_P2P_DISCOVERY_STOPPED
        // Android time-boxes peer discovery (~2 min). Restart while still wanted.
        if (stopped && wantDiscovery) scheduleDiscovery(DISCOVERY_RETRY_MS)
      }
      WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION -> handleConnectionChanged()
    }
  }

  private fun runDiscovery() {
    if (!ensureWifiDirect()) {
      emitDiscoveryFailed(TRANSPORT_WIFI_DIRECT, REASON_UNSUPPORTED)
      finishDiscovery(TRANSPORT_WIFI_DIRECT, announce = false)
      return
    }
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return
    if (!hasDiscoveryPermission()) {
      Log.d(TAG, "runDiscovery: missing permission (${requiredPermissions().joinToString()}), requesting")
      requestPermissionsThenDiscover()
      return
    }
    try {
      manager.discoverPeers(channel, object : WifiP2pManager.ActionListener {
        override fun onSuccess() {
          Log.d(TAG, "discoverPeers() accepted by framework — scan is running")
          discoveryFailures = 0
          announceDiscovering()
          // Re-arm before the framework's internal timeout to keep the scan live.
          scheduleDiscovery(DISCOVERY_REFRESH_MS)
        }

        override fun onFailure(reason: Int) {
          Log.d(TAG, "discoverPeers() onFailure reason=${discoveryReason(reason)} ($reason)")
          handleDiscoverFailure(reason)
        }
      })
    } catch (se: SecurityException) {
      Log.d(TAG, "discoverPeers() threw SecurityException, re-requesting permission")
      requestPermissionsThenDiscover()
    }
  }

  private fun announceDiscovering() {
    transportStates[TRANSPORT_WIFI_DIRECT] = STATE_DISCOVERING
    if (announcedDiscovering) return
    announcedDiscovering = true
    emitRequiredEvent(EVENT_DISCOVERY_STARTED, TRANSPORT_WIFI_DIRECT)
    emitBridgeEvent(TYPE_STATE_CHANGED, TRANSPORT_WIFI_DIRECT) {
      putString("state", STATE_DISCOVERING)
    }
  }

  private fun handleDiscoverFailure(reason: Int) {
    discoveryFailures++
    emitDiscoveryFailed(TRANSPORT_WIFI_DIRECT, discoveryReason(reason), reason)
    when {
      reason == WifiP2pManager.P2P_UNSUPPORTED -> finishDiscovery(TRANSPORT_WIFI_DIRECT, announce = true)
      wantDiscovery && discoveryFailures <= MAX_DISCOVERY_RETRIES -> scheduleDiscovery(DISCOVERY_RETRY_MS)
      else -> finishDiscovery(TRANSPORT_WIFI_DIRECT, announce = true)
    }
  }

  private fun requestPeers() {
    Log.d(TAG, "WIFI_P2P_PEERS_CHANGED_ACTION received — requesting peer list")
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return
    if (!hasDiscoveryPermission()) {
      Log.d(TAG, "requestPeers: skipped, missing permission")
      return
    }
    try {
      manager.requestPeers(channel) { peers -> onPeersAvailable(peers) }
    } catch (se: SecurityException) {
      // Permission revoked mid-scan; the next start will re-request.
    }
  }

  private fun onPeersAvailable(peers: WifiP2pDeviceList) {
    val current = LinkedHashMap<String, String>()
    for (device in peers.deviceList) {
      val address = device.deviceAddress ?: continue
      val name = device.deviceName?.takeIf { it.isNotEmpty() } ?: address
      current[address] = name
    }
    Log.d(TAG, "requestPeers callback: framework reports ${current.size} peer(s): ${current.values}")
    for ((address, name) in current) {
      if (!knownPeers.containsKey(address)) emitDeviceFound(address, name)
    }
    for (address in knownPeers.keys.toList()) {
      if (!current.containsKey(address)) emitDeviceLost(address)
    }
    knownPeers.clear()
    knownPeers.putAll(current)
  }

  private fun finishDiscovery(transport: String, announce: Boolean) {
    wantDiscovery = false
    announcedDiscovering = false
    discoveryFailures = 0
    mainHandler.removeCallbacks(discoveryRunnable)
    knownPeers.clear()
    stopPeerDiscovery()
    transportStates[transport] = STATE_IDLE
    if (announce) emitRequiredEvent(EVENT_DISCOVERY_STOPPED, transport)
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) { putString("state", STATE_IDLE) }
  }

  private fun stopPeerDiscovery() {
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return
    try {
      manager.stopPeerDiscovery(channel, object : WifiP2pManager.ActionListener {
        override fun onSuccess() {}
        override fun onFailure(reason: Int) {}
      })
    } catch (se: SecurityException) {
      // No permission means there is nothing running to stop.
    }
  }

  private fun scheduleDiscovery(delayMs: Long) {
    mainHandler.removeCallbacks(discoveryRunnable)
    mainHandler.postDelayed(discoveryRunnable, delayMs)
  }

  // ---------------------------------------------------------------------------
  // Wi-Fi Direct connection (WifiP2pManager.connect / group formation)
  // ---------------------------------------------------------------------------

  private fun initiateConnect(deviceId: String, promise: Promise?) {
    if (!ensureWifiDirect()) {
      emitConnectionFailed(deviceId, REASON_UNSUPPORTED)
      promise?.reject(ERROR_CONNECT, REASON_UNSUPPORTED)
      return
    }
    if (!hasDiscoveryPermission()) {
      // Unlike discovery, connect() used to fail immediately here instead of
      // ever prompting — a caller that never ran startDiscovery() first would
      // get permission-denied with no system dialog. Request it, then retry.
      requestPermissionsThenConnect(deviceId, promise)
      return
    }
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return

    // A new caller replaces any earlier pending promise.
    takePendingPromise()?.reject(ERROR_CONNECT, REASON_CANCELLED)
    wantConnection = true
    currentDeviceId = deviceId
    pendingDeviceId = deviceId
    pendingConnectPromise = promise
    connectStartedAt = System.currentTimeMillis()
    transportStates[TRANSPORT_WIFI_DIRECT] = STATE_CONNECTING
    emitRequiredEvent(EVENT_CONNECTING, TRANSPORT_WIFI_DIRECT) { putString("deviceId", deviceId) }
    emitBridgeEvent(TYPE_STATE_CHANGED, TRANSPORT_WIFI_DIRECT) { putString("state", STATE_CONNECTING) }

    val config = WifiP2pConfig().apply {
      this.deviceAddress = deviceId
      wps.setup = WpsInfo.PBC
    }
    mainHandler.removeCallbacks(connectTimeoutRunnable)
    mainHandler.postDelayed(connectTimeoutRunnable, CONNECT_TIMEOUT_MS)
    try {
      manager.connect(channel, config, object : WifiP2pManager.ActionListener {
        // onSuccess only means the request was accepted; group formation is
        // confirmed later via WIFI_P2P_CONNECTION_CHANGED_ACTION.
        override fun onSuccess() {}

        override fun onFailure(reason: Int) = failConnect(discoveryReason(reason))
      })
    } catch (se: SecurityException) {
      failConnect(REASON_PERMISSION)
    }
  }

  private fun onConnectTimeout() {
    if (connectionFormed) return
    failConnect(REASON_TIMEOUT)
  }

  private fun failConnect(reason: String) {
    mainHandler.removeCallbacks(connectTimeoutRunnable)
    cancelConnect()
    val target = currentDeviceId
    if (target != null) emitConnectionFailed(target, reason)
    takePendingPromise()?.reject(ERROR_CONNECT, reason)
    if (wantConnection && target != null && reconnectAttempts < MAX_RECONNECT) {
      scheduleReconnect()
    } else {
      resetConnectionState()
    }
  }

  private fun cancelConnect() {
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return
    try {
      manager.cancelConnect(channel, object : WifiP2pManager.ActionListener {
        override fun onSuccess() {}
        override fun onFailure(reason: Int) {}
      })
    } catch (se: SecurityException) {
      // Nothing in flight to cancel.
    }
  }

  private fun handleConnectionChanged() {
    val manager = wifiP2pManager ?: return
    val channel = wifiChannel ?: return
    if (!hasDiscoveryPermission()) return
    try {
      manager.requestConnectionInfo(channel) { info -> onConnectionInfoAvailable(info) }
    } catch (se: SecurityException) {
      // Permission revoked; ignore.
    }
  }

  private fun onConnectionInfoAvailable(info: WifiP2pInfo) {
    if (info.groupFormed) {
      mainHandler.removeCallbacks(connectTimeoutRunnable)
      val already = connectionFormed
      connectionFormed = true
      isGroupOwner = info.isGroupOwner
      groupOwnerAddress = info.groupOwnerAddress?.hostAddress ?: ""
      reconnectAttempts = 0
      val deviceId = currentDeviceId ?: pendingDeviceId ?: ""
      currentDeviceId = deviceId
      pendingDeviceId = null
      transportStates[TRANSPORT_WIFI_DIRECT] = STATE_CONNECTED
      val latency = if (connectStartedAt > 0L) System.currentTimeMillis() - connectStartedAt else 0L
      takePendingPromise()?.resolve(connectionInfoMap(deviceId, latency))
      if (!already) {
        emitRequiredEvent(EVENT_CONNECTED, TRANSPORT_WIFI_DIRECT) {
          putConnectionInfo(deviceId, latency)
        }
        emitBridgeEvent(TYPE_CONNECTED, TRANSPORT_WIFI_DIRECT) {
          putString("deviceId", deviceId)
          putDouble("latencyMs", latency.toDouble())
        }
        emitBridgeEvent(TYPE_STATE_CHANGED, TRANSPORT_WIFI_DIRECT) { putString("state", STATE_CONNECTED) }
      }
      // Bring up the messaging socket for this group (idempotent).
      startMessaging(deviceId, info.isGroupOwner, groupOwnerAddress)
    } else if (connectionFormed) {
      // We were connected and the group is gone: real disconnect.
      handleConnectionLost()
    }
  }

  private fun handleConnectionLost() {
    val lost = currentDeviceId ?: return
    stopMessaging()
    connectionFormed = false
    isGroupOwner = false
    groupOwnerAddress = ""
    mainHandler.removeCallbacks(connectTimeoutRunnable)
    if (wantConnection && reconnectAttempts < MAX_RECONNECT) {
      emitDisconnected(lost)
      scheduleReconnect()
    } else {
      emitDisconnected(lost)
      resetConnectionState()
    }
  }

  private fun finalizeDisconnect(deviceId: String) {
    stopMessaging()
    isGroupOwner = false
    groupOwnerAddress = ""
    currentDeviceId = null
    pendingDeviceId = null
    connectStartedAt = 0L
    reconnectAttempts = 0
    emitDisconnected(deviceId)
  }

  private fun resetConnectionState() {
    stopMessaging()
    wantConnection = false
    connectionFormed = false
    isGroupOwner = false
    groupOwnerAddress = ""
    currentDeviceId = null
    pendingDeviceId = null
    connectStartedAt = 0L
    reconnectAttempts = 0
    transportStates[TRANSPORT_WIFI_DIRECT] = STATE_IDLE
    emitBridgeEvent(TYPE_STATE_CHANGED, TRANSPORT_WIFI_DIRECT) { putString("state", STATE_IDLE) }
  }

  private fun scheduleReconnect() {
    reconnectAttempts++
    mainHandler.removeCallbacks(reconnectRunnable)
    mainHandler.postDelayed(reconnectRunnable, RECONNECT_DELAY_MS)
  }

  private fun takePendingPromise(): Promise? {
    val p = pendingConnectPromise
    pendingConnectPromise = null
    return p
  }

  // ---------------------------------------------------------------------------
  // Messaging: TCP sockets over the Wi-Fi Direct group
  //
  // Wire framing mirrors the JS protocol exactly: [4-byte big-endian length]
  // followed by the UTF-8 JSON packet. The group owner runs a ServerSocket; the
  // client dials it. Both directions read/write on the same duplex connection.
  // A tiny transport ACK frame ({"__ack":"<id>"}) is exchanged for delivery
  // confirmation and is never surfaced to JS.
  // ---------------------------------------------------------------------------

  private inner class PeerLink(val id: String, val socket: Socket) {
    val input = DataInputStream(BufferedInputStream(socket.getInputStream()))
    val output = DataOutputStream(BufferedOutputStream(socket.getOutputStream()))
    @Volatile var open = true

    fun close() {
      open = false
      try {
        socket.close()
      } catch (e: IOException) {
        // Already closed.
      }
    }
  }

  private fun startMessaging(deviceId: String, groupOwner: Boolean, ownerAddress: String) {
    if (messagingStarted) return
    messagingStarted = true
    messagingWantOpen = true
    if (groupOwner) {
      startServer(deviceId)
    } else {
      startClient(deviceId, ownerAddress)
    }
  }

  private fun startServer(deviceId: String) {
    if (serverSocket != null) return
    ioExecutor.execute {
      try {
        val server = ServerSocket(MESSAGING_PORT)
        server.reuseAddress = true
        serverSocket = server
        while (messagingWantOpen && !server.isClosed) {
          val socket = server.accept()
          // In a two-device group the remote is our known peer; fall back to its
          // IP when we joined without initiating (no MAC on hand).
          val peerId = deviceId.ifEmpty { socket.inetAddress?.hostAddress ?: "peer" }
          addPeer(PeerLink(peerId, socket))
        }
      } catch (e: IOException) {
        // If messagingWantOpen is false this is expected teardown (stopMessaging
        // closed the socket to unblock accept()) — nothing to report. Otherwise
        // the bind/accept genuinely failed: the Wi-Fi Direct group is formed but
        // the messaging layer never came up, so the link is NOT actually usable
        // even though a Connected event/promise already fired. Surface it and
        // reuse the existing peer-disconnected recovery path (auto-reconnect).
        serverSocket = null
        messagingStarted = false
        if (messagingWantOpen) {
          val reason = e.message ?: "server-bind-failed"
          mainHandler.post {
            emitMessagingFailed("startServer", deviceId, reason)
            emitConnectionLost(deviceId)
          }
        }
      }
    }
  }

  private fun startClient(deviceId: String, ownerAddress: String) {
    if (ownerAddress.isEmpty()) return
    ioExecutor.execute {
      var attempt = 0
      var lastError = "owner-address-unreachable"
      while (messagingWantOpen && attempt < CLIENT_CONNECT_ATTEMPTS) {
        attempt++
        try {
          val socket = Socket()
          socket.connect(InetSocketAddress(ownerAddress, MESSAGING_PORT), SOCKET_CONNECT_TIMEOUT_MS)
          addPeer(PeerLink(deviceId, socket))
          return@execute
        } catch (e: IOException) {
          // Group owner's server may not be up yet; back off and retry.
          lastError = e.message ?: lastError
          try {
            Thread.sleep(CLIENT_RETRY_DELAY_MS)
          } catch (ie: InterruptedException) {
            return@execute
          }
        }
      }
      // Exhausted every retry without ever connecting: same "group formed but
      // messaging never came up" situation as a server bind failure.
      if (messagingWantOpen) {
        messagingStarted = false
        mainHandler.post {
          emitMessagingFailed("startClient", deviceId, lastError)
          emitConnectionLost(deviceId)
        }
      }
    }
  }

  private fun addPeer(link: PeerLink) {
    peers[link.id] = link
    ioExecutor.execute { readLoop(link) }
  }

  private fun readLoop(link: PeerLink) {
    try {
      while (link.open) {
        val length = link.input.readInt()
        if (length <= 0 || length > MAX_FRAME_BYTES) break
        val buffer = ByteArray(length)
        link.input.readFully(buffer)
        handleInboundFrame(link, String(buffer, Charsets.UTF_8))
      }
    } catch (e: IOException) {
      // Stream closed / peer gone — handled below.
    }
    onPeerDisconnected(link)
  }

  private fun handleInboundFrame(link: PeerLink, json: String) {
    val ackFor = transportAckId(json)
    if (ackFor != null) {
      mainHandler.post { emitPacketDelivered(link.id, ackFor) }
      return
    }
    mainHandler.post { emitPacketReceived(link.id, json) }
    // Confirm receipt to the sender (transport-level acknowledgement).
    sendTransportAck(link, packetIdOf(json))
  }

  private fun sendTransportAck(link: PeerLink, packetId: String) {
    if (packetId.isEmpty()) return
    val frame = JSONObject().put(TRANSPORT_ACK_KEY, packetId).toString()
    try {
      writeFrame(link, frame)
    } catch (e: IOException) {
      // Best-effort; a dropped ack simply means the sender won't see delivered.
    }
  }

  private fun writeWithRetry(
    link: PeerLink,
    deviceId: String,
    packetId: String,
    payload: String,
    promise: Promise,
  ) {
    val start = System.currentTimeMillis()
    var attempt = 0
    while (true) {
      try {
        writeFrame(link, payload)
        val latency = System.currentTimeMillis() - start
        mainHandler.post { emitPacketSent(deviceId, packetId, latency) }
        promise.resolve(sendResultMap(latency))
        return
      } catch (e: IOException) {
        attempt++
        if (attempt > SEND_RETRIES) {
          val reason = e.message ?: "io-error"
          mainHandler.post {
            emitPacketFailed(deviceId, packetId, reason)
          }
          onPeerDisconnected(link)
          promise.reject(ERROR_SEND, reason)
          return
        }
        try {
          Thread.sleep(SEND_RETRY_DELAY_MS)
        } catch (ie: InterruptedException) {
          promise.reject(ERROR_SEND, "interrupted")
          return
        }
      }
    }
  }

  private fun writeFrame(link: PeerLink, payload: String) {
    val bytes = payload.toByteArray(Charsets.UTF_8)
    synchronized(link.output) {
      link.output.writeInt(bytes.size)
      link.output.write(bytes)
      link.output.flush()
    }
  }

  private fun onPeerDisconnected(link: PeerLink) {
    link.close()
    if (peers.remove(link.id) == null) return
    // Unexpected drop while we still wanted the link open == connection lost.
    if (messagingWantOpen) {
      mainHandler.post { emitConnectionLost(link.id) }
    }
  }

  private fun stopMessaging() {
    messagingWantOpen = false
    messagingStarted = false
    serverSocket?.let {
      try {
        it.close()
      } catch (e: IOException) {
        // Already closed.
      }
    }
    serverSocket = null
    peers.values.forEach { it.close() }
    peers.clear()
  }

  /** Routes a send to the peer's link, tolerating MAC/IP id mismatch (2-device). */
  private fun resolvePeer(deviceId: String): PeerLink? =
    peers[deviceId] ?: peers.values.firstOrNull()

  private fun packetIdOf(json: String): String = try {
    JSONObject(json).optString("id", "")
  } catch (e: Exception) {
    ""
  }

  private fun transportAckId(json: String): String? = try {
    val obj = JSONObject(json)
    if (obj.has(TRANSPORT_ACK_KEY)) obj.getString(TRANSPORT_ACK_KEY) else null
  } catch (e: Exception) {
    null
  }

  // ---------------------------------------------------------------------------
  // Runtime permissions
  // ---------------------------------------------------------------------------

  private fun requiredPermissions(): Array<String> =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      arrayOf(Manifest.permission.NEARBY_WIFI_DEVICES)
    } else {
      arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
    }

  private fun hasDiscoveryPermission(): Boolean =
    requiredPermissions().all {
      ContextCompat.checkSelfPermission(reactContext, it) == PackageManager.PERMISSION_GRANTED
    }

  private fun requestPermissionsThenDiscover() {
    val missing = requiredPermissions().filter {
      ContextCompat.checkSelfPermission(reactContext, it) != PackageManager.PERMISSION_GRANTED
    }
    if (missing.isEmpty()) {
      scheduleDiscovery(0L)
      return
    }
    val activity = reactContext.currentActivity
    if (activity is PermissionAwareActivity) {
      activity.requestPermissions(missing.toTypedArray(), REQUEST_PERMISSIONS, PermissionListener { code, _, results ->
        if (code != REQUEST_PERMISSIONS) return@PermissionListener false
        val granted = results.isNotEmpty() && results.all { it == PackageManager.PERMISSION_GRANTED }
        if (granted && wantDiscovery) {
          runDiscovery()
        } else {
          emitDiscoveryFailed(TRANSPORT_WIFI_DIRECT, REASON_PERMISSION)
          finishDiscovery(TRANSPORT_WIFI_DIRECT, announce = false)
        }
        true
      })
    } else {
      emitDiscoveryFailed(TRANSPORT_WIFI_DIRECT, REASON_PERMISSION)
      finishDiscovery(TRANSPORT_WIFI_DIRECT, announce = false)
    }
  }

  /** Same request/retry pattern as requestPermissionsThenDiscover(), for connect(). */
  private fun requestPermissionsThenConnect(deviceId: String, promise: Promise?) {
    val missing = requiredPermissions().filter {
      ContextCompat.checkSelfPermission(reactContext, it) != PackageManager.PERMISSION_GRANTED
    }
    if (missing.isEmpty()) {
      initiateConnect(deviceId, promise)
      return
    }
    val activity = reactContext.currentActivity
    if (activity is PermissionAwareActivity) {
      activity.requestPermissions(missing.toTypedArray(), REQUEST_PERMISSIONS, PermissionListener { code, _, results ->
        if (code != REQUEST_PERMISSIONS) return@PermissionListener false
        val granted = results.isNotEmpty() && results.all { it == PackageManager.PERMISSION_GRANTED }
        if (granted) {
          initiateConnect(deviceId, promise)
        } else {
          emitConnectionFailed(deviceId, REASON_PERMISSION)
          promise?.reject(ERROR_CONNECT, REASON_PERMISSION)
        }
        true
      })
    } else {
      emitConnectionFailed(deviceId, REASON_PERMISSION)
      promise?.reject(ERROR_CONNECT, REASON_PERMISSION)
    }
  }

  private fun discoveryReason(code: Int): String = when (code) {
    WifiP2pManager.P2P_UNSUPPORTED -> "p2p-unsupported"
    WifiP2pManager.BUSY -> "busy"
    WifiP2pManager.ERROR -> "internal-error"
    else -> "error-$code"
  }

  // ---------------------------------------------------------------------------
  // Event emission
  // ---------------------------------------------------------------------------

  private fun emitDeviceFound(address: String, name: String) {
    Log.d(TAG, "emitDeviceFound address=$address name=$name")
    emitRequiredEvent(EVENT_DEVICE_FOUND, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", address)
      putString("name", name)
    }
    // Internal event the transport engine consumes (TransportEvent.DEVICE_FOUND).
    emitBridgeEvent(TYPE_DEVICE_FOUND, TRANSPORT_WIFI_DIRECT) {
      putString("id", address)
      putString("name", name)
    }
  }

  private fun emitDeviceLost(address: String) {
    emitRequiredEvent(EVENT_DEVICE_LOST, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", address)
    }
    emitBridgeEvent(TYPE_DEVICE_LOST, TRANSPORT_WIFI_DIRECT) {
      putString("id", address)
    }
  }

  private fun emitDiscoveryFailed(transport: String, reason: String, code: Int? = null) {
    emitRequiredEvent(EVENT_DISCOVERY_FAILED, transport) {
      putString("reason", reason)
      if (code != null) putInt("code", code)
    }
  }

  private fun emitConnectionFailed(deviceId: String, reason: String) {
    transportStates[TRANSPORT_WIFI_DIRECT] = STATE_IDLE
    emitRequiredEvent(EVENT_CONNECTION_FAILED, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("reason", reason)
    }
  }

  private fun emitDisconnected(deviceId: String) {
    transportStates[TRANSPORT_WIFI_DIRECT] = STATE_IDLE
    emitRequiredEvent(EVENT_DISCONNECTED, TRANSPORT_WIFI_DIRECT) { putString("deviceId", deviceId) }
    emitBridgeEvent(TYPE_DISCONNECTED, TRANSPORT_WIFI_DIRECT) { putString("deviceId", deviceId) }
    emitBridgeEvent(TYPE_STATE_CHANGED, TRANSPORT_WIFI_DIRECT) { putString("state", STATE_IDLE) }
  }

  private fun emitPacketSent(deviceId: String, packetId: String, latencyMs: Long) {
    emitRequiredEvent(EVENT_PACKET_SENT, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
      putDouble("latencyMs", latencyMs.toDouble())
    }
  }

  private fun emitPacketReceived(deviceId: String, json: String) {
    emitRequiredEvent(EVENT_PACKET_RECEIVED, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("data", json)
    }
    // Internal event the transport engine parses (TransportEvent.MESSAGE).
    emitBridgeEvent(TYPE_MESSAGE, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("data", json)
    }
  }

  private fun emitPacketDelivered(deviceId: String, packetId: String) {
    emitRequiredEvent(EVENT_PACKET_DELIVERED, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
    }
    // Internal event the transport engine consumes (real peer-ack, not local
    // send success — see TransportEvent.MESSAGE_ACKNOWLEDGED on the JS side).
    emitBridgeEvent(TYPE_PACKET_DELIVERED, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
    }
  }

  /** Surfaces a messaging-layer failure (socket bind/connect) instead of swallowing it. */
  private fun emitMessagingFailed(operation: String, deviceId: String, reason: String) {
    emitRequiredEvent(EVENT_ERROR, TRANSPORT_WIFI_DIRECT) {
      putString("operation", operation)
      putString("message", reason)
      putString("deviceId", deviceId)
    }
  }

  private fun emitPacketFailed(deviceId: String, packetId: String, reason: String) {
    emitRequiredEvent(EVENT_PACKET_FAILED, TRANSPORT_WIFI_DIRECT) {
      putString("deviceId", deviceId)
      putString("packetId", packetId)
      putString("reason", reason)
    }
  }

  private fun emitConnectionLost(deviceId: String) {
    emitRequiredEvent(EVENT_CONNECTION_LOST, TRANSPORT_WIFI_DIRECT) { putString("deviceId", deviceId) }
    // Let the engine mark the peer disconnected so it can re-establish.
    emitBridgeEvent(TYPE_DISCONNECTED, TRANSPORT_WIFI_DIRECT) { putString("deviceId", deviceId) }
  }

  private fun sendResultMap(latencyMs: Long): WritableMap = Arguments.createMap().apply {
    putBoolean("sent", true)
    putDouble("confidence", 0.97)
    putDouble("latencyMs", latencyMs.toDouble())
  }

  /** Populates a map with the live connection details for [deviceId]. */
  private fun WritableMap.putConnectionInfo(deviceId: String, latencyMs: Long) {
    putString("deviceId", deviceId)
    putDouble("latencyMs", latencyMs.toDouble())
    putBoolean("isGroupOwner", isGroupOwner)
    putString("groupOwnerAddress", groupOwnerAddress)
  }

  private fun connectionInfoMap(deviceId: String, latencyMs: Long): WritableMap =
    Arguments.createMap().apply {
      putString("transport", TRANSPORT_WIFI_DIRECT)
      putConnectionInfo(deviceId, latencyMs)
    }

  private fun connectionStatusMap(): WritableMap = Arguments.createMap().apply {
    putString("transport", TRANSPORT_WIFI_DIRECT)
    putBoolean("connected", connectionFormed)
    putString("state", transportStates[TRANSPORT_WIFI_DIRECT] ?: STATE_IDLE)
    putBoolean("isGroupOwner", isGroupOwner)
    putString("groupOwnerAddress", groupOwnerAddress)
    currentDeviceId?.let { putString("deviceId", it) }
  }

  private fun statusFor(transport: String): WritableMap = Arguments.createMap().apply {
    putBoolean("available", true)
    putString("transport", transport)
    putString("state", transportStates[transport] ?: STATE_IDLE)
    putString(
      "implementation",
      when (transport) {
        TRANSPORT_WIFI_DIRECT -> "wifi-direct-native"
        TRANSPORT_BLE -> "ble-native"
        else -> "bridge-foundation"
      },
    )
    if (transport == TRANSPORT_WIFI_DIRECT) {
      putBoolean("connected", connectionFormed)
      putMap("connection", connectionStatusMap())
    }
  }

  private fun rejectNotImplemented(
    operation: String,
    transport: String,
    promise: Promise,
    block: (WritableMap.() -> Unit)? = null,
  ) {
    val message = "ShadowNetComm.$operation is registered, but radio implementation is not installed yet"
    emitRequiredEvent(EVENT_ERROR, transport) {
      putString("operation", operation)
      putString("message", message)
      block?.invoke(this)
    }
    emitBridgeEvent(TYPE_STATE_CHANGED, transport) {
      putString("state", transportStates[transport] ?: STATE_IDLE)
    }
    promise.reject(ERROR_NOT_IMPLEMENTED, message)
  }

  private fun emitRequiredEvent(
    eventName: String,
    transport: String,
    block: (WritableMap.() -> Unit)? = null,
  ) {
    val payload = Arguments.createMap().apply {
      putString("type", eventName)
      putString("event", eventName)
      putString("transport", transport)
      putDouble("timestamp", System.currentTimeMillis().toDouble())
      block?.invoke(this)
    }
    emit(payload)
  }

  private fun emitBridgeEvent(
    type: String,
    transport: String,
    block: (WritableMap.() -> Unit)? = null,
  ) {
    val payload = Arguments.createMap().apply {
      putString("type", type)
      putString("transport", transport)
      putDouble("timestamp", System.currentTimeMillis().toDouble())
      block?.invoke(this)
    }
    emit(payload)
  }

  private fun emit(payload: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_CHANNEL, payload)
  }

  companion object {
    const val NAME = "ShadowNetComm"
    private const val TAG = "ShadowNetComm"
    private const val EVENT_CHANNEL = "ShadowNetCommEvent"
    private const val ERROR_NOT_IMPLEMENTED = "E_SHADOWNET_COMM_NOT_IMPLEMENTED"

    private const val TRANSPORT_WIFI_DIRECT = "wifi-direct"
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
    private const val TYPE_PACKET_DELIVERED = "packetDelivered"

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
    private const val EVENT_PACKET_RECEIVED = "PacketReceived"
    private const val EVENT_PACKET_SENT = "PacketSent"
    private const val EVENT_PACKET_DELIVERED = "PacketDelivered"
    private const val EVENT_PACKET_FAILED = "PacketFailed"
    private const val EVENT_ERROR = "Error"

    private const val REASON_UNSUPPORTED = "wifi-direct-unsupported"
    private const val REASON_DISABLED = "wifi-direct-disabled"
    private const val REASON_PERMISSION = "permission-denied"
    private const val REASON_TIMEOUT = "timeout"
    private const val REASON_CANCELLED = "cancelled"

    private const val ERROR_CONNECT = "E_SHADOWNET_CONNECT"
    private const val ERROR_SEND = "E_SHADOWNET_SEND"

    private const val TRANSPORT_ACK_KEY = "__ack"

    private const val REQUEST_PERMISSIONS = 0x5D01
    private const val DISCOVERY_REFRESH_MS = 60_000L
    private const val DISCOVERY_RETRY_MS = 5_000L
    private const val MAX_DISCOVERY_RETRIES = 6
    private const val CONNECT_TIMEOUT_MS = 30_000L
    private const val RECONNECT_DELAY_MS = 4_000L
    private const val MAX_RECONNECT = 3

    private const val MESSAGING_PORT = 8988
    private const val MAX_FRAME_BYTES = 1 shl 20 // 1 MiB per packet
    private const val SOCKET_CONNECT_TIMEOUT_MS = 5_000
    private const val CLIENT_CONNECT_ATTEMPTS = 10
    private const val CLIENT_RETRY_DELAY_MS = 1_000L
    private const val SEND_RETRIES = 2
    private const val SEND_RETRY_DELAY_MS = 400L
  }
}
