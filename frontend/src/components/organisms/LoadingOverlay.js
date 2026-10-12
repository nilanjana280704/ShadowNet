/**
 * LoadingOverlay — a full-screen blocking overlay with a spinner and message,
 * for auth actions (signing in, securing session). Controlled via `visible`.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} [props.message]
 */
import React from 'react';
import { Modal as RNModal, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { Loader, Text } from '../atoms';

function LoadingOverlay({ visible, message }) {
  return (
    <RNModal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Loader size="large" color="accent" />
          {message ? (
            <Text variant="bodySmall" color="secondary" align="center">
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    minWidth: 160,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    ...shadows.modal,
  },
});

export default LoadingOverlay;
