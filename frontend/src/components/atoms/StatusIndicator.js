/**
 * StatusIndicator — a glowing status dot with an optional label. The dot
 * breathes when `live` to signal an active/nominal state.
 *
 * @param {object} props
 * @param {'nominal'|'info'|'warning'|'critical'|'success'|'offline'} [props.status='nominal']
 * @param {string} [props.label] optional text after the dot
 * @param {boolean} [props.live=true] pulse the dot
 * @param {number} [props.size=10] dot diameter in dp
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, glow } from '../../theme';
import { usePulse } from '../../animations';
import Text from './Text';

const STATUS = {
  nominal: { color: colors.networkConnected, glow: colors.glow.primary, text: 'connected' },
  info: { color: colors.info, glow: colors.glow.secondary, text: 'info' },
  warning: { color: colors.warning, glow: colors.glow.warning, text: 'warning' },
  critical: { color: colors.critical, glow: colors.glow.error, text: 'critical' },
  success: { color: colors.success, glow: colors.glow.success, text: 'success' },
  offline: { color: colors.networkOffline, glow: colors.transparent, text: 'muted' },
};

function StatusIndicator({ status = 'nominal', label, live = true, size = 10 }) {
  const s = STATUS[status] || STATUS.nominal;
  const pulse = usePulse({ enabled: live && status !== 'offline' });

  return (
    <View style={styles.row}>
      <View style={styles.dotWrap}>
        <Animated.View
          style={[
            styles.dot,
            { width: size, height: size, backgroundColor: s.color },
            glow(s.glow, 8),
            live && status !== 'offline' ? pulse : null,
          ]}
        />
      </View>
      {label ? (
        <Text variant="label" color={s.text}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotWrap: { alignItems: 'center', justifyContent: 'center' },
  dot: { borderRadius: radius.circle },
});

export default StatusIndicator;
