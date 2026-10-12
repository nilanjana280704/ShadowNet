# ShadowNet — Features

Planned feature set. No features are implemented in Milestone 1; this document is
the canonical scope reference for subsequent milestones.

## Core Communication

- **Offline mesh messaging** — device-to-device chat over Wi-Fi Direct and BLE with
  multi-hop routing when peers are out of direct range.
- **LoRa long-range fallback** — text-size payloads relayed through LoRa nodes and
  gateways for kilometer-scale reach.
- **Store-and-forward** — messages queue in AsyncStorage and hop opportunistically
  until delivered; delivery receipts propagate back through the mesh.
- **Cloud sync** — conversations and reports sync to MongoDB/Firestore when any
  device in the mesh regains internet, acting as a bridge for the group.

## Emergency

- **SOS beacon** — one-tap distress signal with location, broadcast on every
  available transport and prioritized by the routing layer.
- **Emergency broadcast** — authority-issued one-to-many announcements with
  severity levels, delivered via FCM online and mesh flooding offline.
- **Alerts** — government/NGO alert feeds (weather, evacuation, aftershock)
  cached for offline display.

## Coordination

- **Offline maps** — pre-downloaded map tiles with shelters, medical points,
  danger zones, and live peer positions.
- **Resource exchange** — post and request food, water, medicine, and shelter
  capacity; matched locally first, then cloud-wide.
- **Volunteer coordination** — registration, skill tagging, task assignment.
- **Missing persons** — reports with photos, mesh-propagated, matched
  against sightings on-device and in the cloud.

## Platform

- **Authentication** — Firebase Auth identity + backend-issued JWTs; offline
  grace mode with cached credentials.
- **Profiles & settings** — user identity, emergency contacts, preferences.
- **Accessibility** — voice guidance, haptic alerts, high-contrast and large-text
  modes, low-literacy iconography.
- **Localization** — multi-language UI for regional deployment.
- **Analytics** — network health, delivery rates, coverage mapping (privacy-safe).
- **AI assistance** — on-device triage suggestions and message summarization for
  bandwidth-constrained links.
