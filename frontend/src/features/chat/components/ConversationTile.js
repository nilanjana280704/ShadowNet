/**
 * ConversationTile — a chat-list row: avatar/group glyph, name, pin, last-message
 * preview, time, unread count, and proximity/signal. Emergency groups get a
 * subtle emphasis.
 *
 * @param {object} props
 * @param {object} props.conversation
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Avatar, Icon, SignalChip, Text, Timestamp, UnreadBadge } from '../../../components';
import { ConversationType, GROUP_META, GroupType } from '../constants';

function ConversationTile({ conversation, onPress }) {
  const isGroup = conversation.type === ConversationType.GROUP;
  const group = isGroup ? GROUP_META[conversation.groupType] : null;
  const isEmergency = conversation.groupType === GroupType.EMERGENCY;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {isGroup ? (
        <View style={[styles.groupChip, isEmergency && styles.emergencyChip]}>
          <Icon name={group?.icon || 'users'} size="md" color={group?.tone || 'secondary'} />
        </View>
      ) : (
        <Avatar name={conversation.name} size="md" status={conversation.proximity === 'nearby' ? 'connected' : undefined} />
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          {conversation.pinned ? <Icon name="pinned" size="xs" color="muted" /> : null}
          <Text variant="title" color="primary" numberOfLines={1} style={styles.name}>
            {conversation.name}
          </Text>
        </View>
        <Text variant="bodySmall" color="secondary" numberOfLines={1}>
          {conversation.lastPreview || 'Tap to start the conversation'}
        </Text>
      </View>

      <View style={styles.meta}>
        <Timestamp date={conversation.lastMessageAt} relative />
        <View style={styles.metaBottom}>
          <SignalChip level={conversation.signalLevel} proximity={conversation.proximity} />
          <UnreadBadge count={conversation.unread} tone={isEmergency ? 'emergency' : 'primary'} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.m,
  },
  pressed: { backgroundColor: colors.overlay.white04 },
  groupChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyChip: { backgroundColor: colors.tint.errorBg },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
  meta: { alignItems: 'flex-end', gap: spacing.xs },
  metaBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export default ConversationTile;
