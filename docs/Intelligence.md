# ShadowNet — AI-Assisted Intelligence

Milestone 9 made ShadowNet smarter without making it larger: six rule-based
intelligence features embedded in the **existing** services, slices, and
components. No new screens, no parallel AI services, no duplicated cards.

Every function below is a deliberate **ML seam**: a pure, well-typed signature
whose rule-based body can be replaced by a learned model without touching any
caller.

| # | Feature | Where the logic lives | Surfaces | Future ML replacement |
| - | ------- | --------------------- | -------- | --------------------- |
| 1 | Smart route recommendation | `features/relief/services/RoutingService.recommend()` — scores each planned route on safety (danger zones/road blocks already priced into `route.safety`), speed, communication coverage, and destination availability; flags one `recommended` | Route cards on the Resource Map show a **Recommended** badge and preselect the winner; kinds read *Fastest / Safest / Balanced* | A learned ranker trained on which routes users actually complete, conditioned on hazard type and time of day |
| 2 | Smart resource recommendation | `features/relief/services/ResourceService.recommendForYou()` — proximity + availability + free capacity + verification, with a per-category diversity cap | **“Recommended for you”** strip docked on the Resource Map while nothing is selected (reuses `ResourceCard`) | A personalized recommender using user context (family size, medical needs), demand signals, and freshness |
| 3 | Network health score | `communication/core/metrics.networkHealthScore()` — devices, coverage, transport quality, online; graded Excellent/Good/Fair/Poor. Computed inside `CommunicationManager.getNetworkState()` so it flows through the existing NETWORK_STATE event into `networkState.health` | Home connection card (signal reads the grade), Network screen banner badge | A model over real session telemetry: delivery success rate, latency variance, link churn |
| 4 | Smart battery mode | `utils/insights.batteryRecommendation()` — fires when battery ≤ 35%, network health is fair/poor, or SOS is active | An `AlertCard` (reused, not duplicated) in the Network screen's *Coverage & health* section | An on-device policy learned from battery drain curves per transport |
| 5 | Priority message classification | `features/chat/services/MessageFormatter.classifyPriority()` — SOS → Critical, broadcast/resource/volunteer requests → High, chat → Normal, check-ins/system → Low; applied as the default in `createMessage` | Priority badges inside chat bubbles and message cards (`PRIORITY_META`; Normal renders nothing) | A text classifier scoring urgency from message content, not just type |
| 6 | AI insights | `utils/insights.generateInsights()` — nearest open shelter with capacity, nearest medical camp, available volunteers within 1 km, network quality, queued messages | **“ShadowNet Intelligence”** glass card on the Home dashboard (`InsightsCard` molecule) | An insight selector ranked by user relevance and situation (e.g. prioritize medical when a check-in said “injured”) |

## Architectural notes

- **Extended, not duplicated**: `RoutingService`, `ResourceService`,
  `MessageFormatter`, and the engine's `metrics` gained one method each. The
  only new modules are `utils/insights.js` (pure helpers, not a service) and
  the `InsightsCard` molecule (a genuinely new presentation shape).
- **Redux**: no new slices. `networkState` gained a `health` field that rides
  the existing NETWORK_STATE event; route recommendation reuses `maps.routes`.
- **Data flow**: all scoring is pure and synchronous over state the app already
  holds — deterministic, testable (`__tests__/intelligence.test.js`), and free
  of network calls, which matters offline.
