/**
 * EmptyState — centered placeholder for empty lists/screens, with an optional
 * primary action.
 *
 * @param {object} props
 * @param {string} [props.icon='info'] icon name
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Button, Icon, Text } from '../atoms';

function EmptyState({ icon = 'info', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Icon name={icon} size="xl" color="muted" />
      </View>
      <Text variant="headingS" color="primary" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="secondary" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="ghost" onPress={onAction} style={styles.action} />
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  message: { maxWidth: 280 },
  action: { marginTop: spacing.md },
});

export default EmptyState;
