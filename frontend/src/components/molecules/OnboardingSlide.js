/**
 * OnboardingSlide — one full-width onboarding page: a decorative illustration
 * (concentric rings + a glowing icon, no external asset needed), a title, and a
 * body. Reusable for any intro flow.
 *
 * @param {object} props
 * @param {string} props.icon icon name for the illustration
 * @param {string} props.title
 * @param {string} props.body
 * @param {string} [props.tone='accent'] accent color token for the glow/icon
 * @param {number} [props.width] slide width (for a paged ScrollView)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing, glow } from '../../theme';
import { resolveColor } from '../../utils/theme';
import { Icon, Text } from '../atoms';

function OnboardingSlide({ icon, title, body, tone = 'accent', width }) {
  const tint = resolveColor(tone, colors.primary);
  return (
    <View style={[styles.slide, width ? { width } : null]}>
      <View style={styles.art}>
        <View style={[styles.ringOuter, { borderColor: colors.border }]} />
        <View style={[styles.ringInner, { borderColor: colors.borderStrong }]} />
        <View style={[styles.iconChip, { backgroundColor: colors.surface }, glow(tint, 24)]}>
          <Icon name={icon} size="xxl" color={tone} strokeWidth={1.5} />
        </View>
      </View>
      <Text variant="headingL" color="primary" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.body}>
        {body}
      </Text>
    </View>
  );
}

const RING = 240;

const styles = StyleSheet.create({
  slide: { alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  art: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  ringOuter: { position: 'absolute', width: RING, height: RING, borderRadius: radius.circle, borderWidth: 1 },
  ringInner: { position: 'absolute', width: RING * 0.66, height: RING * 0.66, borderRadius: radius.circle, borderWidth: 1 },
  iconChip: {
    width: 96,
    height: 96,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  title: { maxWidth: 320 },
  body: { maxWidth: 320 },
});

export default OnboardingSlide;
