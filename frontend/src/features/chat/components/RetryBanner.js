/**
 * RetryBanner — appears above the composer when a message failed, offering an
 * immediate retry.
 *
 * @param {object} props
 * @param {number} [props.count=1] failed message count
 * @param {() => void} props.onRetry
 * @param {() => void} [props.onDismiss]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, Text } from '../../../components';

function RetryBanner({ count = 1, onRetry, onDismiss }) {
  return (
    <View style={styles.banner}>
      <Icon name="error" size="sm" color="error" />
      <Text variant="bodySmall" color="primary" style={styles.text}>
        {count > 1 ? `${count} messages didn't send` : "Message didn't send"}
      </Text>
      <Text variant="button" color="accent" onPress={onRetry} style={styles.retry}>
        Retry
      </Text>
      {onDismiss ? (
        <Text variant="button" color="muted" onPress={onDismiss} style={styles.retry}>
          Dismiss
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.tint.errorBorder,
    backgroundColor: colors.tint.errorBg,
  },
  text: { flex: 1 },
  retry: { textTransform: 'none' },
});

export default RetryBanner;
