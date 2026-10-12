/**
 * Modal — centered dialog over a scrim. Themed header with optional close, a
 * content area, and an optional actions row.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} [props.title]
 * @param {() => void} props.onClose
 * @param {boolean} [props.dismissable=true] tap-scrim / back to close
 * @param {React.ReactNode} [props.actions] footer actions (e.g. Buttons)
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { Modal as RNModal, Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { useScaleIn } from '../../animations';
import { IconButton, Text } from '../atoms';

function Modal({ visible, title, onClose, dismissable = true, actions, children }) {
  const anim = useScaleIn({ enabled: visible });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onClose : undefined}
    >
      <Pressable
        style={styles.backdrop}
        onPress={dismissable ? onClose : undefined}
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
      >
        <Animated.View style={anim}>
          {/* Stop propagation so taps inside the card don't dismiss. */}
          <Pressable onPress={() => {}} style={styles.card}>
            {(title || dismissable) && (
              <View style={styles.header}>
                <Text variant="headingS" color="primary" style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                {dismissable ? (
                  <IconButton icon="close" size="sm" color="muted" accessibilityLabel="Close" onPress={onClose} />
                ) : null}
              </View>
            )}
            <View style={styles.content}>{children}</View>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </Pressable>
        </Animated.View>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    ...shadows.modal,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { flex: 1 },
  content: { gap: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg },
});

export default Modal;
