# ShadowNet — Communication Engine

The communication engine is the networking backbone that lets ShadowNet work when
infrastructure fails. It is transport-agnostic: features never touch a radio API.
Today it runs on a **mock simulator** (no real Wi-Fi Direct/BLE yet); native
transports drop in later without changing anything above the transport layer.

Location: [`frontend/src/communication/`](../frontend/src/communication). Public
API: import only from `src/communication` (and its exported constants).

## Layered architecture

```
UI (screens / widgets)
        │  useCommunication (hook) → Redux thunks
        ▼
CommunicationService        ← the only public entry point (singleton facade)
        ▼
CommunicationManager        ← orchestrates the sub-services, derives network state
        ▼
 ┌───────────────┬───────────────┬───────────────┬───────────────┐
 │ Discovery     │ Connection    │ Routing       │ Messages       │
 │ Service       │ Manager       │ Service/Engine│ QueueService   │
 └───────────────┴───────────────┴───────────────┴───────────────┘
        ▼
TransportManager            ← owns transports, unifies their events
        ▼
Transports (ITransport):  Wi-Fi Direct · Bluetooth LE · LoRa
        ▼
NetworkSimulator            ← stands in for real radios (mock world)
```

Each layer depends only on the layer below **through an abstraction**
(dependency inversion). Events flow upward via a tiny `EventEmitter`; commands
flow downward through method calls. No feature imports a transport.

## Transport layer (the pluggability seam)

Every transport implements the same `ITransport` contract:
`initialize · startDiscovery · stopDiscovery · connect · disconnect · send ·
getStatus · on/off`. `BaseTransport` provides identity, the state machine, and
event emission; `MockTransport` implements the contract against the simulator;
`WifiDirectTransport` / `BleTransport` extend it and differ only by metadata
(priority, range, throughput, latency, reliability). LoRa was removed from the
active transport registry — this project permanently descoped LoRa/firmware
hardware in favor of a software-only Wi-Fi Direct/BLE mesh.

`TransportFactory` builds transports from a registry and validates conformance
(`assertTransport`). **To add a transport or replace a mock with a real native
module, register it in the factory** — nothing else changes. A real transport
extends `BaseTransport` directly and implements the six operations against the
platform APIs.

## Discovery, connection, routing, messaging

- **DeviceDiscoveryService** merges per-transport discovery into one device
  registry. A device reachable on several transports is one entry that tracks all
  reachable transports and its **best** one (priority, then signal). Emits
  found/updated/lost.
- **ConnectionManager** owns the connection lifecycle: connect with per-transport
  **retries + timeout**, **transport switching** (falls through Wi-Fi → BLE →
  LoRa), state tracking, and **auto-reconnect** on unexpected drops.
- **RoutingEngine** scores each candidate transport by priority, signal,
  reliability, and latency (`routeScore` in `core/metrics`), preferring Wi-Fi
  Direct → BLE → LoRa, and returns a route (with `hops`, ready for multi-hop
  mesh). **RoutingService** caches the last route per device and emits changes.
- **MessageQueueService** orchestrates delivery end to end:
  `queue → encrypt → route → ensure connection → send → deliver/ack`, moving
  failures to a **retry queue** under `RetryService`'s exponential backoff.
  Messages carry their own state, priority, timestamps, attempts, encryption
  flag, delivery confidence, and route.

## Security

`EncryptionService` is the encryption seam and marks the message `encrypted`
flag. **The current implementation is a reversible dev placeholder (keyed XOR),
NOT secure.** Production replaces it with real end-to-end crypto (e.g. libsodium)
behind the same `encrypt()/decrypt()` interface — callers don't change.

## Offline storage

`commStorage` persists the engine snapshot (known devices, connections, last
routes, network state, message history, queued messages, pending retries) to
AsyncStorage, debounced from the Redux bridge, for restore after restart.

## Redux integration

Six slices mirror engine state as plain data: `communication` (engine flags),
`nearbyDevices`, `connections`, `routing`, `messageQueue`, `networkState`. The
`commBridge` thunks are the only path UI uses to drive the engine
(`initCommunication`, `startDiscovery`, `connectDevice`, `sendMessage`, …); the
bridge subscribes engine events to slice actions. Components read state through
the `useCommunication` hook — **no networking logic lives in components**.

## Reusable UI widgets

`DeviceCard`, `NearbyDevicesCard`, `NetworkBanner`, `CommunicationStatus`,
`DiscoveryLoader`, `ConnectionStatusBadge` (plus reused `SignalIndicator`,
`StatusIndicator`, `BatteryIndicator`). All presentational and token-driven; the
Network screen wires them to the engine via `useCommunication`.

## Preparing for real native integration

1. Implement `WifiDirectTransport` / `BleTransport` against `react-native-wifi-p2p`
   / `react-native-ble-plx`, extending `BaseTransport`.
2. Register them in `TransportFactory` (swap the mock constructors).
3. Delete/disable `NetworkSimulator` injection.

The managers, routing, message pipeline, Redux, and UI remain untouched — that is
the point of the abstraction.
