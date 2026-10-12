# ShadowNet

Offline-first emergency communication app for Android. ShadowNet lets nearby
phones discover each other and exchange messages directly over Wi-Fi Direct or
Bluetooth Low Energy, without relying on cellular data, Wi-Fi internet access,
or any backend server being reachable.

## Problem statement

During earthquakes, floods, storms, and other infrastructure outages, cell
towers and internet backhaul are often the first things to fail — exactly
when people most need to coordinate, check on each other, and reach help.
Standard chat apps stop working the moment the network does, because they
assume a server is always reachable. ShadowNet is built around the opposite
assumption: two phones that can still see each other over radio (Wi-Fi Direct
or Bluetooth) should be able to talk, even if neither has a working internet
connection.

## Key features

### Implemented and verified on physical hardware

- **Real nearby-device discovery.** The Android app uses `WifiP2pManager`
  (Wi-Fi Direct) and `BluetoothLeScanner`/GATT (BLE) directly through a custom
  native module — not a simulator. Verified end-to-end on two physical Android
  phones with mobile data disabled and only Wi-Fi + Bluetooth enabled: each
  phone discovered the other's real radio identity (MAC address / configured
  device name). A device is only ever shown after a genuine discovery event
  from the native layer; nothing is fabricated into the list.

### Implemented, exercised by native code, not independently re-verified end-to-end on hardware in the latest pass

- **Direct device-to-device connection** over Wi-Fi Direct (WPS PBC group
  formation) with automatic fallback to BLE when Wi-Fi Direct isn't available,
  via a priority-ordered `ConnectionManager`.
- **Messaging over the active connection** — Wi-Fi Direct uses a length-prefixed
  TCP socket opened over the P2P group; BLE uses GATT writes/notifications
  chunked to the negotiated MTU. Both report send/delivery/failure back into
  the same message pipeline the UI reads from.
- **SOS alerts, emergency broadcasts, and safety check-ins** are sent as
  distinct packet types (not generic chat) and are routed on the receiving
  phone into the emergency history / toast UI rather than the chat list.
- **Verified-identity exchange** — after a connection is established, phones
  exchange a small signed-in identity packet. Until that exchange succeeds, a
  discovered device is shown only as "Nearby device … not verified" with its
  raw radio name — the UI never presents an OS-level device/Bluetooth name as
  if it were a confirmed person.

### Partial / demo-grade

- **Volunteers, shelters, and medical-help lists** on the Nearby Help and Safety
  screens are static sample data, explicitly labeled "Sample data — not live"
  in the UI itself. They are not backed by any live service.
- **Network/relay health scoring and route recommendations** ("ShadowNet
  Intelligence") are deterministic, rule-based calculations over the app's own
  connection/signal data — not a trained model or external AI service.
- **Authentication** runs on a local mock provider (OTP flow against
  AsyncStorage). Firebase Auth packages are present and wired behind a config
  flag but are disabled by default.
- **Backend** (Express + MongoDB) is a working scaffold — it starts, connects
  to Mongo, and has JWT/Firebase-Admin dependencies in place — but the mobile
  app does not call it for anything; no network request library is used in
  `frontend/src`.

### Not implemented

- Multi-hop mesh relay. A broadcast or message currently reaches only the
  devices directly discovered and connected — there is no store-and-forward
  relaying through intermediate phones.
- Real end-to-end encryption. `EncryptionService` is an explicitly-labeled,
  reversible placeholder cipher, not production cryptography.
- A background/foreground service for sustained discovery while the app is
  backgrounded.

## Architecture

```
React Native screens (features/*)
        │  useCommunication() hook, plain Redux state
        ▼
Redux thunks (redux/thunks/*Bridge.js)
        │  the only path from UI to the engine
        ▼
CommunicationService  (single façade; UI never touches layers below this)
        │
CommunicationManager  (orchestrates discovery, connection, routing,
        │               encryption, message queue; emits normalized events)
        ├── DeviceDiscoveryService   (merges per-transport finds into one
        │                             registry; de-dupes by device id)
        ├── ConnectionManager        (priority fallthrough: Wi-Fi Direct → BLE)
        ├── RoutingService / MessageQueueService / RetryService
        │
TransportManager
        │
TransportFactory  ── selects REAL transports when the native module is
        │             linked and enabled, otherwise a mock simulator —
        │             nothing above this layer knows which one is active
        ▼
NativeWifiDirectTransport / NativeBleTransport  (JS)
        │  NativeEventEmitter over a single "ShadowNetCommEvent" channel
        ▼
ShadowNetCommModule.kt  (Android native module)
        ├── Wi-Fi Direct: WifiP2pManager discovery/connect + a TCP
        │   ServerSocket/Socket pair for messaging over the P2P group
        └── BleTransportEngine.kt: BLE central (scan/connect/write) and
            peripheral (advertise/GATT server/notify) roles
```

Every layer communicates through the same small set of events
(`deviceFound`, `deviceLost`, `connected`, `disconnected`, `message`,
`stateChanged`), so the mock simulator and the real native transports are
interchangeable from the UI's point of view — screens render whatever the
active transport reports, real or simulated, and a `TransportFactory.isNative()`
check gates the UI so simulated devices are never shown as if they were real
on a build where native transports are unavailable.

## Technology stack

**Frontend (`frontend/`)**
- React Native 0.86 (bare CLI, JavaScript — no Expo, no TypeScript)
- Redux Toolkit + React Redux for state
- React Navigation (bottom tabs + native stack)
- Jest + `react-test-renderer` for tests
- ESLint (`@react-native/eslint-config`)

**Android native (`frontend/android/`)**
- Kotlin native module (`ShadowNetCommModule`, `BleTransportEngine`) on top of
  `WifiP2pManager` and the platform Bluetooth LE APIs
- Gradle 9.3.1, compile/target SDK 36, min SDK 24

**Backend (`backend/`)**
- Express 5, Mongoose/MongoDB, JWT auth dependencies, Firebase Admin, Helmet
- Scaffold only — not called by the mobile app

## Project structure

```
ShadowNet/
├── frontend/           React Native app
│   ├── android/        Native Android project + Kotlin transport module
│   ├── src/
│   │   ├── communication/   Transport-agnostic mesh engine (this is the core)
│   │   ├── components/     Atomic-design UI library (atoms/molecules/organisms/...)
│   │   ├── features/       Screens, grouped by domain (chat, emergency, nearbyhelp, relief, ...)
│   │   ├── redux/           Slices + thunk "bridges" connecting services to state
│   │   ├── hooks/           Component-facing hooks (useCommunication, ...)
│   │   └── theme/           Design tokens (color, spacing, typography)
│   └── __tests__/      Jest suites (communication engine, discovery, chat, emergency, identity, ...)
├── backend/             Express/MongoDB API scaffold (not yet integrated with the app)
├── docs/                Early architecture/roadmap notes written before most of the
│                        current implementation — useful for history, not authoritative
├── shared/, scripts/, assets/   Scaffolded for future use; currently empty
└── README.md
```

## Setup and installation

### Prerequisites

- Windows 10/11
- Node.js ≥ 22.11 (frontend) / ≥ 20 (backend)
- A JDK compatible with Gradle 9.3.1 and Android Gradle Plugin, plus the
  Android SDK (compile/target SDK 36) and NDK `27.1.12297006`
- Two physical Android phones for any Wi-Fi Direct/BLE testing — Wi-Fi Direct
  and BLE peripheral/central mode cannot be exercised on the Android emulator

### Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Start Metro (JS bundler)

```bash
cd frontend
npm start
```

### Build and install the Android app

```bash
cd frontend
npm run android
```

or, to build the debug APK directly with Gradle:

```bash
cd frontend/android
./gradlew :app:assembleDebug
```

The APK is written to `frontend/android/app/build/outputs/apk/debug/`.

## Running the application

- With Metro running and a device/emulator connected, `npm run android` builds,
  installs, and launches the app, loading JS from Metro (`adb reverse tcp:8081
  tcp:8081` is required for a USB-connected physical device).
- To install a previously built debug APK without rebuilding:
  `adb install -r frontend/android/app/build/outputs/apk/debug/app-debug.apk`,
  then make sure `adb reverse tcp:8081 tcp:8081` is set and Metro is running
  before launching the app.

## Testing

From `frontend/`:

```bash
npm test          # Jest — all suites
npm run lint       # ESLint
```

From `backend/`:

```bash
npm run lint       # ESLint
npm test           # currently a stub — no backend tests exist yet
```

## Offline communication testing

Wi-Fi Direct and BLE cannot be tested on an emulator. To verify real
device-to-device discovery and messaging:

1. Build and install the debug APK on **two** physical Android phones (see
   above).
2. On both phones, disable mobile data and turn off/forget any shared Wi-Fi
   access point — the point is to prove the app works with **no internet
   path at all**. Leave the Wi-Fi radio and Bluetooth **on** (Wi-Fi Direct
   needs the Wi-Fi radio powered even without an AP connection).
3. Grant the app's runtime permissions on both phones: Nearby Wi-Fi devices
   (Android 13+) or Location (older versions) for Wi-Fi Direct discovery, and
   Bluetooth Scan/Advertise/Connect for BLE.
4. Open the **Nearby Help** tab on both phones and tap **Scan for devices**.
   Each phone should list the other device within a few seconds, labeled with
   its real radio name/MAC address and "not verified" (until a connection is
   made and identity is exchanged).
5. To inspect what's actually happening on the radio/native side while
   testing, tail the native and JS discovery logs:
   ```bash
   adb logcat | grep -iE "ShadowNetComm|ShadowNetBle|ShadowNetDiscovery"
   ```
6. Tap **Connect** on a discovered device to exercise Wi-Fi Direct group
   formation (accept the system pairing dialog on the other phone) or the BLE
   connect path if Wi-Fi Direct is unavailable, then send a message from the
   Messages tab to confirm delivery.

## Current limitations

- **Single-hop only.** Messages and broadcasts (including SOS) reach directly
  discovered/connected devices only; there is no multi-hop relay through
  intermediate phones.
- **No real encryption.** `EncryptionService` is an explicitly-labeled,
  reversible dev placeholder, not production cryptography.
- **Auth is a local mock.** Firebase Authentication is integrated behind a
  config flag but disabled by default; the app currently authenticates
  against a local mock OTP flow.
- **Backend is disconnected.** The Express/MongoDB API exists and runs, but
  the mobile app makes no network calls to it.
- **Volunteers/shelters/medical-help data is static**, and labeled as such in
  the UI — it is not sourced from any live service.
- **No background service.** Discovery and connections are not guaranteed to
  survive the app being backgrounded for an extended period; Android throttles
  BLE scanning in the background.
- **BLE device names aren't advertised** (the 128-bit service UUID fills most
  of the advertisement payload), so a BLE-discovered peer shows as its MAC
  address until a connection resolves its name.
- Connection, messaging, and SOS/broadcast delivery are implemented against a
  real native transport and exercised by native/JS code, but — unlike device
  discovery — have not been independently re-verified end-to-end on physical
  hardware in the most recent testing pass.

## Roadmap

Realistic next steps, roughly in priority order:

1. Hardware-verify the full connect → message → SOS/broadcast cycle on two
   phones (discovery is already verified; connection and delivery are not).
2. Replace the placeholder cipher with real end-to-end encryption
   (e.g. X25519 + XChaCha20) ahead of any real use.
3. Add store-and-forward multi-hop relaying so messages can reach devices
   beyond direct radio range.
4. Add a foreground service so discovery/connections can survive
   backgrounding.
5. Decide whether the backend is wired into the app (sync, backup, volunteer
   directory) or removed from the repository if it stays out of scope.
6. Replace the mock auth provider with real Firebase Authentication.

## Contributing

This is a personal/academic project. There is currently no formal
contribution process — open an issue or reach out directly before submitting
substantial changes.

## License

No license file is currently included in this repository. All rights are
reserved by the author unless a license is added.
