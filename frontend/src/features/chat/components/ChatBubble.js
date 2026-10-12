/**
 * ChatBubble — a text/location message bubble. Self messages align right on an
 * accent surface; incoming align left on a card surface. The footer always shows
 * the time, encryption lock, transport, and (for self) the delivery state — the
 * emergency-first "where is my message" answer. Not a messenger clone.
 *
 * @param {object} props
 * @param {object} props.message
 * @param {boolean} [props.showAuthor] show the author name (groups)
 * @param {boolean} [props.entering] play an entrance animation
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { useFadeIn } from '../../../animations';
import { Badge, Icon, Text, Timestamp, TransportChip } from '../../../components';
import { PRIORITY_META } from '../constants';
import AttachmentCard from './AttachmentCard';
import DeliveryBadge from './DeliveryBadge';

function ChatBubble({ message, showAuthor = false, entering = false }) {
  const anim = useFadeIn({ enabled: entering, distance: 8 });
  const self = message.self;
  const priority = PRIORITY_META[message.priority];

  return (
    <Animated.View style={[styles.row, self ? styles.rowSelf : styles.rowOther, entering ? anim : null]}>
      <View style={[styles.bubble, self ? styles.bubbleSelf : styles.bubbleOther]}>
        {showAuthor && !self ? (
          <Text variant="caption" color="accent" style={styles.author}>
            {message.authorName}
          </Text>
        ) : null}

        {message.text ? (
          <Text variant="body" color={self ? 'inverse' : 'primary'}>
            {message.text}
          </Text>
        ) : null}

        {message.attachment ? (
          <View style={styles.attachment}>
            <AttachmentCard attachment={message.attachment} onLight={self} />
          </View>
        ) : null}

        <View style={styles.footer}>
          {priority ? <Badge label={priority.label} tone={priority.tone} /> : null}
          {message.encrypted ? (
            <Icon name="lock" size="xs" color={self ? 'inverse' : 'muted'} />
          ) : null}
          {message.transport ? <TransportChip transport={message.transport} compact /> : null}
          <Timestamp date={message.createdAt} color={self ? 'inverse' : 'muted'} />
          {self ? <DeliveryBadge state={message.delivery} showLabel={false} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: spacing.xxs },
  rowSelf: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radius.l,
    borderWidth: 1,
    gap: spacing.xs,
  },
  bubbleSelf: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primary,
    borderBottomRightRadius: radius.xs,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.xs,
  },
  author: { marginBottom: 2 },
  attachment: { marginTop: spacing.xxs },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs, flexWrap: 'wrap' },
});

export default ChatBubble;
