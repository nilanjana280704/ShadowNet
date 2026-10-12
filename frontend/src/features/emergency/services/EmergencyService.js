/**
 * EmergencyService — aggregation helpers for the Emergency Center: overall
 * status derivation and simple distance/eta formatting shared by entity cards.
 */
import { EmergencyStatus, SosStatus } from '../constants';

export const EmergencyService = {
  /** Overall emergency status from SOS + active alerts. */
  deriveStatus({ sosStatus, activeAlerts = 0 }) {
    if (sosStatus === SosStatus.ACTIVE || sosStatus === SosStatus.ARMING) return EmergencyStatus.CRITICAL;
    if (activeAlerts > 0) return EmergencyStatus.ALERT;
    return EmergencyStatus.NOMINAL;
  },

  formatDistance(m) {
    if (m == null) return '—';
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  },

  formatEta(min) {
    if (min == null) return null;
    return `${min} min away`;
  },
};

export default EmergencyService;
