/**
 * ErrorState — centered failure placeholder with a retry action.
 *
 * @param {object} props
 * @param {string} [props.title='Something went wrong']
 * @param {string} [props.message]
 * @param {string} [props.retryLabel='Retry']
 * @param {() => void} [props.onRetry]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Button, Icon, Text } from '../atoms';

function ErrorState({ title = 'Something went wrong', message, retryLabel = 'Retry', onRetry }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Icon name="error" size="xl" color="error" />
      </View>
      <Text variant="headingS" color="primary" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="secondary" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button label={retryLabel} variant="ghost" icon="refresh" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: radius.circle,
    borderWidth: 1,
    borderColor: colors.tint.errorBorder,
    backgroundColor: colors.overlay.error08,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  message: { maxWidth: 280 },
  action: { marginTop: spacing.md },
});

export default ErrorState;
