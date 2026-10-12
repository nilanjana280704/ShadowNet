/**
 * AlertCard — a severity-coded alert row: icon, title, message, timestamp, and
 * a colored severity stripe.
 *
 * @param {object} props
 * @param {'info'|'success'|'warning'|'critical'|'emergency'} [props.severity='info']
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.timestamp] e.g. '14:07Z'
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { Icon, Text } from '../atoms';
import Card from './Card';

const SEVERITY = {
  info: { color: colors.info, text: 'info', icon: 'info' },
  success: { color: colors.success, text: 'success', icon: 'success' },
  warning: { color: colors.warning, text: 'warning', icon: 'warning' },
  critical: { color: colors.critical, text: 'critical', icon: 'critical' },
  emergency: { color: colors.emergency, text: 'emergency', icon: 'sos' },
};

function AlertCard({ severity = 'info', title, message, timestamp, onPress }) {
  const s = SEVERITY[severity] || SEVERITY.info;
  return (
    <Card variant="surface" padding="md" onPress={onPress} style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: s.color }]} />
      <View style={styles.row}>
        <Icon name={s.icon} size="md" color={s.text} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="title" color="primary" style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {timestamp ? (
              <Text variant="telemetrySmall" color="muted">
                {timestamp}
              </Text>
            ) : null}
          </View>
          {message ? (
            <Text variant="bodySmall" color="secondary" numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  row: { flexDirection: 'row', gap: spacing.sm, paddingLeft: spacing.xs },
  body: { flex: 1, gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  title: { flexShrink: 1 },
});

export default AlertCard;
