/**
 * Snackbar — bottom transient message with an optional inline action. Slides up
 * from the bottom; auto-dismisses unless an action is present.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} props.message
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 * @param {number} [props.duration=4000] auto-dismiss delay (0 = sticky)
 * @param {() => void} [props.onDismiss]
 */
import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing, zIndex } from '../../theme';
import { useSlideIn } from '../../animations';
import { Text } from '../atoms';

function Snackbar({ visible, message, actionLabel, onAction, duration = 4000, onDismiss }) {
  const anim = useSlideIn({ from: 'bottom', enabled: visible });

  useEffect(() => {
    if (!visible || !duration) return undefined;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, anim]} pointerEvents="box-none">
      <View style={styles.bar}>
        <Text variant="bodySmall" color="primary" style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Text variant="button" color="accent" onPress={onAction} style={styles.action}>
            {actionLabel}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: zIndex.toast,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    ...shadows.floating,
  },
  message: { flex: 1 },
  action: { textTransform: 'uppercase' },
});

export default Snackbar;
