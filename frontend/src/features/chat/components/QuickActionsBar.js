/**
 * QuickActionsBar — the in-conversation quick actions (send location, check in
 * safe, request help, share resources, broadcast emergency) as a row of tappable
 * chips. Emits an action key.
 *
 * @param {object} props
 * @param {(key:string) => void} props.onAction
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, Text } from '../../../components';

export const QUICK_ACTIONS = [
  { key: 'location', label: 'Send location', icon: 'pin', tone: 'info' },
  { key: 'checkin', label: 'Check in safe', icon: 'success', tone: 'success' },
  { key: 'help', label: 'Request help', icon: 'sos', tone: 'sos' },
  { key: 'resource', label: 'Share resources', icon: 'resource', tone: 'warning' },
  { key: 'broadcast', label: 'Broadcast', icon: 'emergency', tone: 'emergency' },
];

function QuickActionsBar({ onAction }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {QUICK_ACTIONS.map((a) => (
        <Pressable key={a.key} onPress={() => onAction(a.key)} accessibilityRole="button" accessibilityLabel={a.label} style={styles.chip}>
          <View style={styles.iconChip}>
            <Icon name={a.icon} size="sm" color={a.tone} />
          </View>
          <Text variant="caption" color="primary" numberOfLines={1}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 76,
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuickActionsBar;
