# ShadowNet — Design System

**Dark Tactical Interface.** ShadowNet is a mission-critical disaster
communication platform. The UI must communicate reliability, precision,
situational awareness, and security — software a responder trusts with their
life. It should read like an emergency command center, satellite control room,
or cyber-defense dashboard, **not** a consumer messaging app. Do not imitate
WhatsApp, Telegram, Discord, Signal, or Instagram.

This document is the canonical design language. The tokens below are implemented
in [`frontend/src/theme/`](../frontend/src/theme) and are the **single source of
truth** — every screen and component consumes them; never hard-code values.

> **Milestone 2 status:** the token system, animation system, icon system, and a
> full Atomic-Design component library are implemented under
> [`frontend/src/`](../frontend/src). See "Implementation map" at the end.

---

## Principles

1. **Every screen is operational.** Show state, not decoration. A screen at rest
   still communicates network health, coverage, and readiness.
2. **Information over ornament.** Animation exists to convey change (a node
   appears, a signal drops, an SOS transmits) — never for flourish.
3. **Legible under stress.** High contrast, large touch targets, unambiguous
   status color. Assume poor light, gloves, and urgency.
4. **Consistent tactical language.** Uppercase tracked labels, monospaced
   telemetry, hairline borders, glowing status dots — the same everywhere.
5. **Restraint.** Glassmorphism, gradients, and glow are used sparingly for
   emphasis and hierarchy, not on every surface.

---

## Color (`theme/colors.js`)

Back-to-front layering builds depth: `background.primary` → `secondary` →
`surface.card`, with glass panels floating above.

| Token | Value | Use |
| --- | --- | --- |
| `background.primary` | `#071018` | App background (command-center black) |
| `background.secondary` | `#0D1B2A` | Panel backdrop |
| `surface.card` | `#12263A` | Cards, raised surfaces |
| `surface.glass` | `rgba(18,38,58,0.55)` | Glass panels (over a blur) |
| `accent.primary` | `#00E5A8` | Primary accent — nominal / "go" |
| `accent.secondary` | `#00C2FF` | Data, links, scanning |
| `status.warning` | `#FFC857` | Warning |
| `status.critical` | `#FF4D4F` | Critical / alarm |
| `status.success` | `#4ADE80` | Success / acknowledged |
| `text.primary` | `#F8FAFC` | Primary text |
| `text.muted` | `#94A3B8` | Secondary text |
| `border.subtle` | `rgba(255,255,255,0.08)` | Hairlines, card edges |

Supporting ramps: `glow.*` (colored halos for indicators/beacons), `gradient.*`
(backdrop, accent sweep, critical wash, radar scan), and `signal[]`
(weak→strong ramp for bars, links, coverage).

**Status color is semantic and never repurposed:** green = nominal, cyan =
info/data, amber = warning, red = critical, muted = offline.

---

## Typography (`theme/typography.js`)

Bold, modern, information-dense. Minimal prose; large numeric indicators.
Three roles:

- **`display` — Chakra Petch** (bundled): a squared technical/HUD face for
  headings and tracked uppercase labels — the tactical voice.
- **`mono` — JetBrains Mono** (bundled): telemetry — large numeric readouts,
  coordinates, hop counts, latency, timestamps. Digits align in tabular
  displays.
- **`sans`** — platform system sans for body prose, kept minimal.

Scale: `display` (hero figures) · `h1`–`h3` · `body` / `bodyStrong` · `label`
(uppercase, tracked, for panel titles) · `caption` · `mono` (inline telemetry).

Fonts (both SIL Open Font License) live in `assets/fonts` and are linked into
the native projects via `react-native.config.js` + `npx react-native-asset`.
Because RN maps `fontWeight` to custom families inconsistently on Android, each
weight is referenced as its own family (e.g. `ChakraPetch-SemiBold`) rather than
a family + numeric weight.

---

## Spacing, Radii, Targets (`theme/spacing.js`)

4pt base grid: `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32`. Card radius
defaults to `radius.lg` (14). Touch targets: `hitTarget.min` 48, `comfortable`
56, `large` 72 — buttons stay large for gloved, high-stress use.

---

## Elevation & Glass (`theme/elevation.js`)

- `glass.panel` / `glass.raised` — translucent fill + hairline border + intended
  backdrop-blur radius. Use over a blurred backdrop, sparingly.
- `shadow.card` / `shadow.floating` — ambient depth.
- `glow(color, radius)` — colored halo for status dots, active mesh nodes, SOS
  beacons, and focus rings.

---

## Motion (`theme/motion.js`)

Functional and purpose-driven; smooth, never flashy. Durations `fast 160 →
deliberate 700`; easing curves as bezier specs.

| Pattern | Communicates |
| --- | --- |
| `loop.radarSweep` | Active coverage scan (dashboard / map) |
| `loop.ripple` | SOS beacon, node discovery |
| `loop.pulse` | "Live" / nominal status dot |
| `loop.scanLine` | Connection / discovery in progress |
| `loop.signalSettle` | Signal-strength change |

---

## Iconography

Outlined icons, consistent stroke width. No filled/cartoon icons. **No emojis.**

---

## Surface Patterns (applied in later milestones)

- **Dashboard** — a command center, not a home screen: network status, nearby
  devices, coverage radius, SOS status, battery/signal health, connected mesh
  nodes, recent alerts, resource availability — as live stat panels and gauges.
- **Maps** — a primary surface: offline tiles, shelters, safe zones, medical
  camps, resource centers, live mesh nodes, coverage, danger zones, rescue
  routes.
- **Chat** — not a WhatsApp clone: each message shows priority, delivery path,
  hop count, encryption status, delivery confidence, signal quality, timestamp,
  and connection source.
- **SOS** — one tap arms emergency mode: animated ripple, countdown, live
  beacon, transmission progress, acknowledgement indicators, broadcast status.
- **Analytics** — professional dashboards: coverage heatmap, node density,
  latency, mesh health, battery consumption, connection success, delivery rate.
- **Accessibility** — large buttons, high contrast, voice assistance / TTS,
  offline speech recognition, haptic feedback.

---

## Definition of Done (every screen)

- Uses only theme tokens — no literal colors, sizes, or font values.
- Communicates operational state at rest.
- Status colors used semantically; contrast passes for critical info.
- Touch targets ≥ `hitTarget.min`; animations are functional and interruptible.
- Reads as premium disaster-response software — "built for real response teams,
  not a college project."

---

## Implementation map (Milestone 2)

All under [`frontend/src/`](../frontend/src). Import from barrels, never deep paths.

### `theme/` — design tokens (single source of truth)
`colors.js` (brand, surfaces, text, borders, semantic status, network,
emergency, functional domains, overlays, tints, glows, signal ramp, gradients
list) · `typography.js` (Display/Heading/Title/Body/Button/Label/Badge/Telemetry
scale) · `spacing.js` (spacing + `radius` + `borderWidth` + `hitTarget`) ·
`shadows.js` (`shadows` small→modal, `elevation`, `glass`, `glow()`) ·
`gradients.js` · `opacity.js` · `zIndex.js` · `index.js`.

### `animations/` — motion system
`tokens.js` (duration + easing) · `presets.js` · `useReducedMotion` ·
`useEntrance` (fade/scale/slide) · `useLoops` (pulse, radar sweep, signal pulse,
ripple, node discovery, network scan, route flow) · `useShimmer` (shimmer +
skeleton pulse) · `usePressScale`. Every hook honors OS reduce-motion.

### `constants/` — `icons.js` (curated lucide registry via semantic names) ·
`layout.js` (icon/control/avatar sizes, screen metrics).

### `components/` — Atomic Design
- **atoms/**: Text, Icon, Button, IconButton, FAB, Badge, Chip, Divider, Avatar,
  Loader, Skeleton, ProgressBar, CircularProgress, StatusIndicator,
  SignalIndicator, BatteryIndicator, NetworkIndicator.
- **molecules/**: Card, GlassCard, StatusCard, NetworkCard, MetricCard,
  AlertCard, SectionHeader, TextField, SearchBar, Dropdown, ListItem,
  EmptyState, ErrorState, Toast, Snackbar.
- **organisms/**: Modal, BottomSheet.
- **layout/**: GradientContainer, SafeAreaWrapper, AnimatedBackground,
  ScreenWrapper, ScrollWrapper.
- **dashboard/**: MissionStatus, NetworkHealth, NearbyDevices, SOSStatus,
  CoverageRadius, Battery, Signal, Latency, NodeCount, RecentAlerts widgets.
- **map/**: MarkerBase + Node/Shelter/Danger/Volunteer/Resource/SOS markers,
  CoverageCircle, RouteLine, HeatmapLayer.

### `hooks/` — useTheme, useDisclosure, useToggle, useDebouncedValue.

### Icon library
lucide-react-native (outline) over react-native-svg, exposed only through
`constants/icons.js`. Adding these native modules means the next Android/iOS
build recompiles native code.

### Rules enforced
No hardcoded colors/typography/spacing anywhere outside `theme/` — the `Text`
and `Icon` atoms and the token resolvers (`utils/theme.js`) make tokens the only
path. Lint passes with the RN config; the full graph compiles via Metro.
