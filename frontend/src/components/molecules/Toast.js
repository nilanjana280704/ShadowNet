/**
 * Toast — transient status message that slides in from the top and
 * auto-dismisses. Presentational + controlled: the parent owns `visible` and
 * receives `onDismiss` when the timer elapses.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {'info'|'success'|'warning'|'critical'} [props.severity='info']
 * @param {string} props.message
 * @param {number} [props.duration=3000] auto-dismiss delay in ms (0 = sticky)
 * @param {() => void} [props.onDismiss]
 */
import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing, zIndex } from '../../theme';
import { useSlideIn } from '../../animations';
import { Icon, Text } from '../atoms';

const SEVERITY = {
  info: { color: colors.info, text: 'info', icon: 'info' },
  success: { color: colors.success, text: 'success', icon: 'success' },
  warning: { color: colors.warning, text: 'warning', icon: 'warning' },
  critical: { color: colors.critical, text: 'critical', icon: 'critical' },
};

function Toast({ visible, severity = 'info', message, duration = 3000, onDismiss }) {
  const anim = useSlideIn({ from: 'top', enabled: visible });

  useEffect(() => {
    if (!visible || !duration) return undefined;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;
  const s = SEVERITY[severity] || SEVERITY.info;

  return (
    <Animated.View style={[styles.container, anim]} pointerEvents="box-none">
      <View style={[styles.toast, { borderLeftColor: s.color }]}>
        <Icon name={s.icon} size="sm" color={s.text} />
        <Text variant="bodySmall" color="primary" style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: zIndex.toast,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderLeftWidth: 3,
    backgroundColor: colors.surfaceElevated,
    ...shadows.floating,
  },
  message: { flex: 1 },
});

export default Toast;
