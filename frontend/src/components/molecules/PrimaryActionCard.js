/**
 * PrimaryActionCard — a large, friendly action card for the home screen's main
 * choices (SOS, Offline Chat, Broadcast, Safe Zones). Two looks:
 *  - variant "danger": bold filled red, glowing — for the SOS action.
 *  - variant "surface": soft card with a colored icon chip — calmer actions.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle] friendly one-line explanation
 * @param {string} props.icon icon name (constants/icons)
 * @param {'danger'|'surface'} [props.variant='surface']
 * @param {string} [props.tone='accent'] icon/accent color token (surface variant)
 * @param {() => void} props.onPress
 * @param {string} props.accessibilityLabel
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing, glow } from '../../theme';
import { usePressScale } from '../../animations';
import { Icon, Text } from '../atoms';

function PrimaryActionCard({
  title,
  subtitle,
  icon,
  variant = 'surface',
  tone = 'accent',
  onPress,
  accessibilityLabel,
  style,
}) {
  const press = usePressScale({ to: 0.97 });
  const isDanger = variant === 'danger';

  return (
    <Animated.View style={[styles.wrap, isDanger && glow(colors.glow.sos, 20), press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.card, isDanger ? styles.danger : styles.surface]}
      >
        <View style={[styles.iconChip, isDanger ? styles.iconChipDanger : styles.iconChipSurface]}>
          <Icon name={icon} size="lg" color={isDanger ? 'onError' : tone} strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <Text variant="headingS" color={isDanger ? 'onError' : 'primary'}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" color={isDanger ? 'onError' : 'secondary'} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Icon name="chevronRight" size="md" color={isDanger ? 'onError' : 'muted'} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 88,
  },
  danger: { backgroundColor: colors.sos, borderColor: colors.sos, ...shadows.large },
  surface: { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.medium },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: radius.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipSurface: { backgroundColor: colors.surfaceElevated },
  iconChipDanger: { backgroundColor: colors.overlay.white16 },
  body: { flex: 1, gap: spacing.xxs },
  subtitle: { opacity: 0.9 },
});

export default PrimaryActionCard;
