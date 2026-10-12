/**
 * MetricCard — a single telemetry stat tile: label, large numeric value, unit,
 * an accent side-bar, and an optional trend delta. The dashboard's building
 * block.
 *
 * @param {object} props
 * @param {string} props.label metric name
 * @param {string|number} props.value the reading
 * @param {string} [props.unit] unit suffix (e.g. 'MS', 'KM', '%')
 * @param {string} [props.icon] optional icon name
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'telemetry'|'analytics'} [props.tone='primary']
 * @param {number} [props.trend] signed delta; colored up(+)/down(-)
 * @param {string} [props.trendLabel] context for the trend (e.g. 'vs 1h')
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { Icon, Text } from '../atoms';
import Card from './Card';

const TONE_TEXT = {
  primary: 'accent',
  secondary: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  telemetry: 'telemetry',
  analytics: 'analytics',
};

const TONE_BAR = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  telemetry: colors.telemetry,
  analytics: colors.analytics,
};

function MetricCard({
  label,
  value,
  unit,
  icon,
  tone = 'primary',
  trend,
  trendLabel,
  onPress,
  style,
}) {
  const hasTrend = typeof trend === 'number';
  const trendColor = trend > 0 ? 'success' : trend < 0 ? 'error' : 'muted';

  return (
    <Card variant="surface" padding="md" onPress={onPress} style={[styles.card, style]}>
      <View style={[styles.bar, { backgroundColor: TONE_BAR[tone] }]} />
      <View style={styles.header}>
        <Text variant="label" color="muted">
          {label}
        </Text>
        {icon ? <Icon name={icon} size="sm" color={TONE_TEXT[tone]} /> : null}
      </View>
      <View style={styles.valueRow}>
        <Text variant="telemetryL" color={TONE_TEXT[tone]}>
          {value}
        </Text>
        {unit ? (
          <Text variant="telemetrySmall" color="muted" style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>
      {hasTrend ? (
        <View style={styles.trendRow}>
          <Icon name={trend >= 0 ? 'chevronUp' : 'chevronDown'} size="xs" color={trendColor} />
          <Text variant="telemetrySmall" color={trendColor}>
            {Math.abs(trend)}
            {unit === '%' ? '%' : ''}
          </Text>
          {trendLabel ? (
            <Text variant="caption" color="muted">
              {trendLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xxs, marginTop: spacing.xs },
  unit: { marginBottom: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: spacing.xs },
});

export default MetricCard;
