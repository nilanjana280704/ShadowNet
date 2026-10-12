/**
 * SOSButton — the app's primary emergency action. A clear, unmistakable
 * circular red button that triggers the SOS flow in one tap. Sized for a
 * stressed, one-handed press — dominant through size and color contrast
 * alone, not decorative glow or motion.
 *
 * @param {object} props
 * @param {() => void} props.onPress
 * @param {string} [props.label='SOS']
 * @param {string} [props.hint='Tap to send help']
 * @param {number} [props.size=188]
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, glow } from '../../../theme';
import { usePressScale, useRipple } from '../../../animations';
import { Icon, Text } from '../../../components';

function SOSButton({ onPress, label = 'SOS', hint = 'Tap to send help', size = 188 }) {
  const rings = useRipple({ count: 1, maxScale: 1.35 });
  const press = usePressScale({ to: 0.96 });

  return (
    <View style={[styles.area, { width: size * 1.35, height: size * 1.35 }]}>
      {rings.map((r, i) => (
        <Animated.View key={i} style={[styles.ring, { width: size, height: size }, r]} />
      ))}
      <Animated.View style={[glow(colors.glow.sos, 14), press.style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send SOS. Sends an emergency alert to everyone nearby."
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={[styles.button, { width: size, height: size }]}
        >
          <Icon name="sos" size={44} color="onError" strokeWidth={2} />
          <Text variant="displayL" color="onError" style={styles.label}>
            {label}
          </Text>
          <Text variant="bodySmall" color="onError" style={styles.hint}>
            {hint}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: radius.circle, borderWidth: 2, borderColor: colors.sos },
  button: {
    borderRadius: radius.circle,
    backgroundColor: colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: { letterSpacing: 4 },
  hint: { opacity: 0.9 },
});

export default SOSButton;
