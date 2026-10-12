/**
 * QueueBadge — a small pill showing how many messages are waiting to send.
 * Renders nothing when the queue is empty.
 *
 * @param {object} props
 * @param {number} props.count
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, Text } from '../../../components';

function QueueBadge({ count }) {
  if (!count) return null;
  return (
    <View style={styles.pill}>
      <Icon name="clock" size="xs" color="warning" />
      <Text variant="caption" color="warning">
        {count} waiting
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.tint.warningBg,
    borderWidth: 1,
    borderColor: colors.tint.warningBorder,
  },
});

export default QueueBadge;
