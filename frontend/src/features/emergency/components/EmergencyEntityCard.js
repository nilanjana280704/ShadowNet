/**
 * EmergencyEntityCard — the shared card for nearby entities (volunteers, medical
 * camps, shelters). Icon + title/subtitle, a metrics row, a status badge, and
 * optional actions. Volunteer/Medical/Shelter cards are thin presets over this.
 *
 * @param {object} props
 * @param {string} props.icon
 * @param {string} [props.tone='accent']
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {Array<{label:string,value:string}>} [props.metrics]
 * @param {{tone:string,label:string}} [props.status]
 * @param {React.ReactNode} [props.actions]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, StatusBadge, Text } from '../../../components';

function EmergencyEntityCard({ icon, tone = 'accent', title, subtitle, metrics = [], status, actions }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconChip}>
          <Icon name={icon} size="md" color={tone} />
        </View>
        <View style={styles.identity}>
          <Text variant="title" color="primary" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {status ? <StatusBadge tone={status.tone} label={status.label} /> : null}
      </View>

      {metrics.length > 0 ? (
        <View style={styles.metrics}>
          {metrics.map((m) => (
            <View key={m.label} style={styles.metric}>
              <Text variant="telemetry" color="primary">
                {m.value}
              </Text>
              <Text variant="caption" color="muted">
                {m.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: 2 },
  metrics: { flexDirection: 'row', gap: spacing.xl },
  metric: { gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});

export default EmergencyEntityCard;
