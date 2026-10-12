/**
 * ShadowNet — Icon registry.
 *
 * One curated, outline icon set (lucide) exposed through semantic names, so the
 * app references `icon="network"` rather than a library-specific component.
 * Swapping the underlying library later means changing only this file.
 *
 * lucide periodically renames icons; `pick()` resolves the first name that
 * exists in the installed version and falls back to a neutral glyph, so a rename
 * never crashes a screen.
 */
import * as Lucide from 'lucide-react-native';

const FALLBACK = Lucide.Circle;

/** First defined lucide component among the given names. */
function pick(...names) {
  for (const n of names) {
    if (Lucide[n]) return Lucide[n];
  }
  return FALLBACK;
}

export const ICONS = {
  // Navigation / chrome
  home: pick('House', 'Home'),
  menu: pick('Menu'),
  close: pick('X'),
  back: pick('ChevronLeft', 'ArrowLeft'),
  forward: pick('ChevronRight', 'ArrowRight'),
  chevronUp: pick('ChevronUp'),
  chevronDown: pick('ChevronDown'),
  chevronRight: pick('ChevronRight'),
  chevronLeft: pick('ChevronLeft'),
  search: pick('Search'),
  settings: pick('Settings'),
  filter: pick('SlidersHorizontal', 'Filter'),
  more: pick('EllipsisVertical', 'MoreVertical'),
  plus: pick('Plus'),
  minus: pick('Minus'),
  refresh: pick('RefreshCw'),
  edit: pick('Pencil', 'Edit'),
  trash: pick('Trash2', 'Trash'),
  check: pick('Check'),
  checkDouble: pick('CheckCheck', 'Check'),
  pinned: pick('Pin'),

  // Status
  success: pick('CircleCheck', 'CheckCircle', 'CheckCircle2'),
  warning: pick('TriangleAlert', 'AlertTriangle'),
  error: pick('CircleX', 'XCircle'),
  critical: pick('OctagonAlert', 'AlertOctagon'),
  info: pick('Info'),
  clock: pick('Clock'),

  // Network / mesh
  network: pick('Network'),
  mesh: pick('Waypoints', 'Share2'),
  nodes: pick('RadioTower', 'Radio'),
  wifi: pick('Wifi'),
  wifiOff: pick('WifiOff'),
  bluetooth: pick('Bluetooth'),
  signal: pick('Signal', 'Activity'),
  activity: pick('Activity'),
  radar: pick('Radar'),
  latency: pick('Gauge', 'Activity'),

  // Power
  battery: pick('Battery'),
  batteryCharging: pick('BatteryCharging'),
  batteryLow: pick('BatteryLow', 'BatteryWarning'),
  power: pick('Power', 'Zap'),
  zap: pick('Zap'),

  // Emergency
  sos: pick('Siren', 'TriangleAlert'),
  emergency: pick('Siren'),
  shield: pick('Shield'),
  shieldAlert: pick('ShieldAlert'),
  lifebuoy: pick('LifeBuoy'),
  target: pick('Target'),
  crosshair: pick('Crosshair'),
  fire: pick('Flame'),
  police: pick('Shield', 'ShieldCheck'),
  water: pick('Droplets', 'Droplet'),
  food: pick('Utensils', 'UtensilsCrossed'),
  medicine: pick('Pill', 'Cross'),
  blood: pick('Droplet', 'HeartPulse'),
  transport: pick('Truck', 'Bus'),
  doctor: pick('Stethoscope', 'UserRound'),
  rescue: pick('LifeBuoy'),
  phoneCall: pick('PhoneCall', 'Phone'),

  // Map / coordination
  map: pick('Map'),
  pin: pick('MapPin'),
  navigation: pick('Navigation', 'Navigation2'),
  route: pick('Route'),
  layers: pick('Layers'),
  shelter: pick('Tent', 'House', 'Home'),
  medical: pick('Cross', 'HeartPulse', 'Plus'),
  resource: pick('Package'),
  volunteer: pick('Users'),
  danger: pick('TriangleAlert', 'AlertTriangle'),

  // People / comms
  user: pick('User'),
  users: pick('Users'),
  bell: pick('Bell'),
  message: pick('MessageSquare'),
  send: pick('SendHorizontal', 'Send'),
  phone: pick('Phone'),

  // Accessibility / media
  mic: pick('Mic'),
  volume: pick('Volume2'),
  vibrate: pick('Vibrate'),
  eye: pick('Eye'),
  eyeOff: pick('EyeOff'),
  lock: pick('Lock'),

  // Relief network / map facilities
  wheelchair: pick('Accessibility', 'PersonStanding'),
  pet: pick('PawPrint', 'Dog'),
  baby: pick('Baby'),
  hygiene: pick('Sparkles', 'Droplets'),
  government: pick('Landmark', 'Building2'),
  ngo: pick('HeartHandshake', 'Heart'),
  community: pick('Users'),
  military: pick('Shield'),
  building: pick('Building2', 'Building'),
  locate: pick('LocateFixed', 'Crosshair'),
  zoomIn: pick('ZoomIn', 'Plus'),
  zoomOut: pick('ZoomOut', 'Minus'),
  star: pick('Star'),
  language: pick('Languages', 'Globe'),
  ai: pick('Sparkles', 'Zap'),

  // Generic
  dot: pick('Dot', 'Circle'),
  circle: pick('Circle'),
  download: pick('Download'),
  upload: pick('Upload'),
};

/** All valid semantic icon names (useful for validation / stories). */
export const ICON_NAMES = Object.keys(ICONS);

export default ICONS;
