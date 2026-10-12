/**
 * DiscoveryLoader — an animated scanning indicator (expanding rings around a
 * radar icon) with a caption. Shown while the engine is discovering devices.
 *
 * @param {object} props
 * @param {string} [props.label='Scanning nearby…']
 * @param {boolean} [props.active=true]
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { useRipple } from '../../animations';
import Icon from './Icon';
import Text from './Text';

function DiscoveryLoader({ label = 'Scanning nearby…', active = true }) {
  const rings = useRipple({ enabled: active, count: 3, maxScale: 2.8 });
  return (
    <View style={styles.wrap}>
      <View style={styles.radar}>
        {rings.map((r, i) => (
          <Animated.View key={i} style={[styles.ring, r]} />
        ))}
        <View style={styles.core}>
          <Icon name="radar" size="md" color="inverse" strokeWidth={2} />
        </View>
      </View>
      {label ? (
        <Text variant="bodySmall" color="secondary" align="center">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  radar: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  core: {
    width: 44,
    height: 44,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DiscoveryLoader;
