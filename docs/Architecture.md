# ShadowNet — Architecture

ShadowNet is an offline-first disaster communication platform. Devices form a local
mesh (Wi-Fi Direct, BLE, LoRa) when infrastructure is down, and synchronize with the
cloud backend (Express + MongoDB + Firebase) whenever connectivity returns.

## High-Level Topology

```
┌────────────────────────────  Field (offline)  ────────────────────────────┐
│                                                                           │
│   Phone A ── BLE ── Phone B ── Wi-Fi Direct ── Phone C ── LoRa ── Node    │
│      │                                                          (firmware)│
│      └── AsyncStorage (offline queue: messages, SOS, locations)           │
│                                                                           │
└──────────────────────────────┬────────────────────────────────────────────┘
                               │  (connectivity restored)
                               ▼
┌────────────────────────────  Cloud  ──────────────────────────────────────┐
│  Express API ── MongoDB (Mongoose)                                        │
│  Firebase Auth ── JWT session tokens                                      │
│  Firestore (real-time sync) ── FCM (push alerts)                          │
└────────────────────────────────────────────────────────────────────────────┘
```

## Repository Layout

| Path        | Responsibility                                                      |
| ----------- | ------------------------------------------------------------------- |
| `frontend/` | React Native CLI app (JavaScript, Redux Toolkit, React Navigation) |
| `backend/`  | Express REST API, MongoDB via Mongoose, JWT + Firebase Admin        |
| `shared/`   | Protocol definitions, schemas, and constants shared across tiers    |
| `docs/`     | Architecture, features, roadmap, and installation documentation     |
| `assets/`   | Design assets (images, fonts, icons) shared across the project      |
| `scripts/`  | Development, build, and deployment automation                       |

## Frontend Architecture (`frontend/src/`)

Feature-first structure: each domain lives in `features/<name>` and owns its own
components, hooks, slice, and services. Cross-cutting infrastructure lives at the
`src/` root.

| Folder                     | Responsibility                                                       |
| -------------------------- | -------------------------------------------------------------------- |
| `features/authentication`  | Firebase Auth + JWT session flows                                    |
| `features/chat`            | Peer-to-peer and cloud chat                                          |
| `features/mesh`            | Mesh topology management (peer discovery, links, health)             |
| `features/routing`         | Multi-hop message routing over the mesh                              |
| `features/communication`   | Unified send/receive pipeline across transports                      |
| `features/analytics`       | Usage and network analytics                                          |
| `features/sos`             | Emergency SOS beacons and acknowledgement                            |
| `features/broadcast`       | One-to-many emergency broadcasts                                     |
| `features/maps`            | Offline maps, shelters, danger zones                                 |
| `features/resources`       | Resource (food/water/medical) listings and requests                  |
| `features/volunteers`      | Volunteer registration and coordination                              |
| `features/missing-persons` | Missing person reports and matching                                  |
| `features/alerts`          | Government/NGO alert ingestion and display                           |
| `features/accessibility`   | Accessibility modes (voice, haptics, large text)                     |
| `features/profile`         | User profile management                                              |
| `features/settings`        | App preferences                                                      |
| `features/ai`              | On-device AI assistance (triage, summarization)                      |
| `networking/wifi-direct`   | Wi-Fi Direct transport adapter                                       |
| `networking/ble`           | Bluetooth Low Energy transport adapter                               |
| `networking/lora`          | LoRa abstraction layer (bridges to firmware devices)                 |
| `storage/`                 | AsyncStorage wrappers, offline queue, persistence                    |
| `redux/`                   | Store configuration and feature slices                               |
| `navigation/`              | React Navigation stacks/tabs                                         |
| `services/`                | API clients (Axios), Firebase services                               |
| `components/`              | Shared presentational components                                     |
| `hooks/`                   | Shared custom hooks                                                  |
| `utils/`                   | Pure helper functions                                                |
| `constants/`               | App-wide constants and enums                                         |
| `config/`                  | Environment/app configuration                                        |
| `theme/`                   | Colors, typography, spacing tokens                                   |
| `permissions/`             | Runtime permission orchestration (location, Bluetooth, nearby)       |
| `localization/`            | i18n resources                                                       |

## Backend Architecture (`backend/`)

| Path               | Responsibility                                                  |
| ------------------ | ---------------------------------------------------------------|
| `server.js`        | Process entry: env load, DB connect, HTTP listen, shutdown      |
| `src/app.js`       | Express app: Helmet, CORS, Morgan, JSON parsing, error handling |
| `src/config/`      | Environment access (`env.js`) and Mongoose connection (`db.js`) |
| `src/modules/*`    | Feature modules — each will own routes/controller/service/model |
| `src/middleware/`  | Auth (JWT verify), validation, rate limiting                    |
| `src/models/`      | Shared Mongoose models                                          |
| `src/routes/`      | Top-level router composition                                    |
| `src/controllers/` | Shared/legacy controllers (module-local preferred)              |
| `src/services/`    | Cross-module services (FCM dispatch, Firestore sync)            |
| `src/sockets/`     | Real-time gateways (future WebSocket layer)                     |
| `src/jobs/`        | Scheduled/background jobs                                       |
| `src/validations/` | Request schema validation                                       |
| `src/utils/`       | Helpers (token signing, pagination, responses)                  |
| `src/constants/`   | Shared enums and constants                                      |
| `tests/`           | API test suites                                                 |

## Key Architectural Decisions

1. **Offline-first**: every user action is written to AsyncStorage first, then
   synced opportunistically. The cloud is an enhancement, never a requirement.
2. **Transport abstraction**: Wi-Fi Direct, BLE, and LoRa implement a common
   transport interface in `frontend/src/networking/`, so routing and features are
   transport-agnostic.
3. **Feature-first modules** on both tiers keep domains independently evolvable.
4. **Dual auth**: Firebase Authentication for identity; backend issues short-lived
   JWTs for API authorization so the API works without Firebase reachability.
5. **Shared protocol definitions** in `shared/` prevent drift between the app,
   backend, and firmware message formats.
