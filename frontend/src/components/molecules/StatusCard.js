/**
 * StatusCard — a titled card headlining an operational state via a glowing
 * StatusIndicator, with an optional description and trailing value.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {'nominal'|'info'|'warning'|'critical'|'success'|'offline'} props.status
 * @param {string} [props.statusLabel] text beside the dot (e.g. 'ONLINE')
 * @param {string} [props.description]
 * @param {string} [props.icon] leading icon name
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { Icon, StatusIndicator, Text } from '../atoms';
import Card from './Card';

const STATUS_GLOW = {
  nominal: colors.glow.primary,
  info: colors.glow.secondary,
  warning: colors.glow.warning,
  critical: colors.glow.error,
  success: colors.glow.success,
  offline: undefined,
};

function StatusCard({ title, status, statusLabel, description, icon, onPress }) {
  return (
    <Card variant="surface" onPress={onPress} glowColor={STATUS_GLOW[status]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon ? <Icon name={icon} size="md" color="secondary" /> : null}
          <Text variant="title" color="primary">
            {title}
          </Text>
        </View>
        <StatusIndicator status={status} label={statusLabel} />
      </View>
      {description ? (
        <Text variant="bodySmall" color="secondary" style={styles.description}>
          {description}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  description: { marginTop: spacing.sm },
});

export default StatusCard;
