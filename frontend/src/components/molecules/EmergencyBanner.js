/**
 * EmergencyBanner — a prominent, glowing banner for active emergencies (SOS,
 * critical broadcast) with an optional action.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.icon='sos']
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing, glow } from '../../theme';
import { Button, Icon, Text } from '../atoms';

function EmergencyBanner({ title, message, icon = 'sos', actionLabel, onAction }) {
  return (
    <View style={[styles.banner, glow(colors.glow.sos, 16)]}>
      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Icon name={icon} size="md" color="onError" strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <Text variant="title" color="onError">
            {title}
          </Text>
          {message ? (
            <Text variant="bodySmall" color="onError" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="glass" fullWidth onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: spacing.md,
    borderRadius: radius.l,
    backgroundColor: colors.sos,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.overlay.white16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  message: { opacity: 0.9 },
  action: { marginTop: spacing.xs },
});

export default EmergencyBanner;
