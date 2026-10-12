# ShadowNet — Roadmap

Milestone-driven delivery. Each milestone ships production-quality, reviewed code.

## ✅ Milestone 1 — Project Initialization (current)

- Monorepo folder structure (frontend, backend, shared, firmware, docs, assets, scripts)
- React Native CLI app scaffolded with Redux Toolkit, React Navigation,
  Axios, AsyncStorage, Firebase, BLE, and permissions dependencies installed
- Express backend scaffolded with MongoDB/Mongoose, dotenv, JWT, Helmet,
  Morgan, CORS
- Base documentation

## Milestone 2 — Authentication & Profiles

- Firebase Authentication integration (phone/email)
- Backend JWT issuance, refresh, and middleware
- User model, profile CRUD, offline credential caching
- Navigation shell (auth stack ↔ app tabs)

## Milestone 3 — Core Chat (Online)

- Chat data model, REST + Firestore sync
- Conversation and message UI, Redux slices
- FCM push notifications

## Milestone 4 — Offline Storage & Sync Engine

- AsyncStorage persistence layer and outbox queue
- Conflict-resolution and sync orchestration
- Connectivity detection and background sync

## Milestone 5 — Mesh Networking (Wi-Fi Direct + BLE)

- Transport abstraction interface
- Peer discovery, pairing, session management
- Multi-hop routing and store-and-forward relay

## Milestone 6 — Emergency Suite

- SOS beacon with transport prioritization
- Emergency broadcast + alerts ingestion
- Offline maps with shelters and danger zones

## Milestone 7 — LoRa Integration (descoped)

This milestone was permanently descoped: the project committed to a
software-only Wi-Fi Direct/BLE mesh with no dedicated LoRa hardware. The
`firmware/` directory and the mock `LoRaTransport` were removed accordingly.

## Milestone 8 — Coordination Tools

- Resources, volunteers, missing persons modules
- Analytics dashboards

## Milestone 9 — Accessibility, Localization, AI

- Accessibility modes, i18n rollout
- On-device AI triage/summarization

## Milestone 10 — Hardening & Release

- Security audit, load tests, battery profiling
- E2E test suite, CI/CD, store releases
