/**
 * MarkerBase — the shared map marker: a circular icon badge with a pointer and
 * an optional pulsing halo. Domain markers (Node/Shelter/Danger/…) compose this
 * with preset icon + color. Presentational; position it on a map with absolute
 * layout in the consuming screen.
 *
 * @param {object} props
 * @param {string} props.icon icon name (constants/icons)
 * @param {string} [props.color='primary'] semantic color for the badge
 * @param {number} [props.size=36] badge diameter in dp
 * @param {boolean} [props.pulse=false] show an expanding halo (live markers)
 * @param {boolean} [props.selected=false] emphasized ring
 * @param {string} [props.label] optional caption under the marker
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '../../theme';
import { resolveColor } from '../../utils/theme';
import { useRipple } from '../../animations';
import { Icon, Text } from '../atoms';

function MarkerBase({ icon, color = 'primary', size = 36, pulse = false, selected = false, label }) {
  const rings = useRipple({ enabled: pulse, count: 2, maxScale: 2.6 });
  const tint = resolveColor(color, colors.primary);

  return (
    <View style={styles.wrap}>
      <View style={[styles.badgeArea, { width: size * 2, height: size * 2 }]}>
        {pulse
          ? rings.map((r, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.ring,
                  { width: size, height: size, borderColor: tint, borderRadius: radius.circle },
                  r,
                ]}
              />
            ))
          : null}
        <View
          style={[
            styles.badge,
            {
              width: size,
              height: size,
              borderRadius: radius.circle,
              backgroundColor: tint,
              borderColor: selected ? colors.textPrimary : colors.transparent,
            },
          ]}
        >
          <Icon name={icon} size={size >= 36 ? 'md' : 'sm'} color="inverse" strokeWidth={2} />
        </View>
        <View style={[styles.pointer, { borderTopColor: tint }]} />
      </View>
      {label ? (
        <Text variant="telemetrySmall" color="primary" align="center" style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  badgeArea: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1.5 },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...shadows.medium,
  },
  pointer: {
    position: 'absolute',
    bottom: '50%',
    marginBottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
  },
  label: { marginTop: 2 },
});

export default MarkerBase;
