/**
 * BottomSheet — a sheet that slides up from the bottom over a scrim, with a
 * drag handle and optional title. Tap-scrim or back to dismiss.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} [props.title]
 * @param {() => void} props.onClose
 * @param {boolean} [props.dismissable=true]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { Modal as RNModal, Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { useSlideIn } from '../../animations';
import { Text } from '../atoms';

function BottomSheet({ visible, title, onClose, dismissable = true, children }) {
  const anim = useSlideIn({ from: 'bottom', distance: 48, enabled: visible });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onClose : undefined}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissable ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        />
        <Animated.View style={[styles.sheet, anim]}>
          <View style={styles.handle} />
          {title ? (
            <Text variant="headingS" color="primary" style={styles.title}>
              {title}
            </Text>
          ) : null}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    ...shadows.modal,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.md },
  content: { gap: spacing.sm },
});

export default BottomSheet;
