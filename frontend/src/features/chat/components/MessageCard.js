/**
 * MessageCard — a full-width card for special message types (SOS, broadcast,
 * resource/volunteer request, safe check-in, system). Severity-coded with an
 * icon, priority stripe, and the same delivery/transport footer as bubbles.
 *
 * @param {object} props
 * @param {object} props.message
 * @param {boolean} [props.showAuthor]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { resolveColor } from '../../../utils/theme';
import { Badge, Icon, Text, Timestamp, TransportChip } from '../../../components';
import { MESSAGE_TYPE_META, PRIORITY_META } from '../constants';
import AttachmentCard from './AttachmentCard';
import DeliveryBadge from './DeliveryBadge';

function MessageCard({ message, showAuthor = false }) {
  const meta = MESSAGE_TYPE_META[message.type] || MESSAGE_TYPE_META.system;
  const tint = resolveColor(meta.tone, colors.primary);
  const priority = PRIORITY_META[message.priority];

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { borderColor: tint }]}>
        <View style={[styles.stripe, { backgroundColor: tint }]} />
        <View style={styles.header}>
          <View style={[styles.iconChip, { backgroundColor: colors.surfaceElevated }]}>
            <Icon name={meta.icon} size="md" color={meta.tone} />
          </View>
          <View style={styles.headerText}>
            <Text variant="label" color={meta.tone}>
              {meta.label}
            </Text>
            {showAuthor && !message.self ? (
              <Text variant="caption" color="muted">
                {message.authorName}
              </Text>
            ) : null}
          </View>
          {priority ? <Badge label={priority.label} tone={priority.tone} /> : null}
        </View>

        {message.text ? (
          <Text variant="bodyLarge" color="primary" style={styles.body}>
            {message.text}
          </Text>
        ) : null}

        {message.attachment ? <AttachmentCard attachment={message.attachment} /> : null}

        <View style={styles.footer}>
          {message.transport ? <TransportChip transport={message.transport} compact /> : null}
          <Timestamp date={message.createdAt} color="muted" />
          {message.self ? <DeliveryBadge state={message.delivery} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: spacing.xs },
  card: {
    borderRadius: radius.l,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingLeft: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconChip: { width: 40, height: 40, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center' },
  headerText: { gap: 1 },
  body: {},
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
});

export default MessageCard;
