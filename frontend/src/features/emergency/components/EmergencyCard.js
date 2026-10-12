/**
 * EmergencyCard — a large, high-contrast action card for the Emergency Center.
 * Icon chip, title, subtitle, and a forward affordance. Big tap target.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} props.icon
 * @param {string} [props.tone='accent'] accent color token
 * @param {string} [props.badge] optional right-aligned value (e.g. a count)
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { usePressScale } from '../../../animations';
import { Icon, Text } from '../../../components';

function EmergencyCard({ title, subtitle, icon, tone = 'accent', badge, onPress }) {
  const press = usePressScale({ to: 0.97 });
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={styles.card}
      >
        <View style={styles.iconChip}>
          <Icon name={icon} size="lg" color={tone} strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <Text variant="headingS" color="primary">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" color="secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge != null ? (
          <Text variant="telemetryL" color={tone}>
            {badge}
          </Text>
        ) : (
          <Icon name="chevronRight" size="md" color="muted" />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: 88,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: radius.l,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
});

export default EmergencyCard;
