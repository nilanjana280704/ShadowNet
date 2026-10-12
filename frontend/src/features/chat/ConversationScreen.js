/**
 * ConversationScreen — the message thread. Shows a status header (who, proximity,
 * transport), an emergency/offline/retry banner when relevant, the message list
 * (bubbles + special message cards), quick actions, and the composer. Every self
 * message shows exactly where it stands via its DeliveryBadge.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { colors, spacing } from '../../theme';
import {
  EmergencyBanner,
  IconButton,
  OfflineBanner,
  SignalChip,
  Text,
} from '../../components';
import { retryChatMessage, sendBroadcast, sendChatMessage, showToast } from '../../redux';
import { useCommunication, useDisclosure } from '../../hooks';
import { MessagePriority } from '../../communication';
import { AttachmentService } from './services';
import { ChatBubble, ChatComposer, MessageCard, QuickActionsBar, RetryBanner } from './components';
import { DeliveryState, MessageType } from './constants';

const SPECIAL_TYPES = [
  MessageType.SOS,
  MessageType.BROADCAST,
  MessageType.SYSTEM,
  MessageType.RESOURCE_REQUEST,
  MessageType.VOLUNTEER_REQUEST,
  MessageType.SAFE_CHECKIN,
];

function ConversationScreen({ navigation, route }) {
  const { conversationId } = route.params;
  const dispatch = useDispatch();
  const { networkState } = useCommunication();
  const conversation = useSelector((s) => s.chat.byId[conversationId]);
  const bucket = useSelector((s) => s.message.byConversation[conversationId]);
  const queue = useSelector((s) => s.queue);
  const quick = useDisclosure(false);
  const listRef = useRef(null);
  const [text, setText] = useState('');

  const messages = useMemo(() => (bucket ? bucket.ids.map((id) => bucket.byId[id]) : []), [bucket]);
  const isGroup = conversation?.type === 'group';
  const isOffline = conversation?.proximity === 'offline';
  const failed = messages.filter((m) => m.self && m.delivery === DeliveryState.FAILED);
  const sos = messages.find((m) => m.type === MessageType.SOS && !m.self);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 150);
    return () => clearTimeout(t);
  }, [messages.length]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    dispatch(sendChatMessage(conversationId, { text: body }));
    setText('');
  };

  const onQuick = (key) => {
    quick.close();
    switch (key) {
      case 'location':
        dispatch(sendChatMessage(conversationId, {
          type: MessageType.LOCATION,
          text: 'Shared a location',
          attachment: AttachmentService.location({ title: 'My location', subtitle: 'Live · shared now', coords: '28.61, 77.20' }),
        }));
        break;
      case 'checkin':
        dispatch(sendChatMessage(conversationId, { type: MessageType.SAFE_CHECKIN, text: "I'm safe." }));
        break;
      case 'help':
        dispatch(sendChatMessage(conversationId, { type: MessageType.SOS, text: 'I need help. Please respond.', priority: MessagePriority.EMERGENCY }));
        break;
      case 'resource':
        dispatch(sendChatMessage(conversationId, {
          type: MessageType.RESOURCE_REQUEST,
          text: 'Requesting supplies.',
          attachment: AttachmentService.resource({ title: 'Water & food', subtitle: 'Requested' }),
        }));
        break;
      case 'broadcast':
        dispatch(sendBroadcast({ title: 'Emergency broadcast', message: text.trim() || 'Emergency near me', severity: 'critical', area: 'Nearby' }));
        dispatch(showToast({ message: 'Broadcast sent to everyone nearby', severity: 'warning' }));
        break;
      default:
        break;
    }
  };

  const renderItem = ({ item }) => {
    if (SPECIAL_TYPES.includes(item.type)) {
      return <MessageCard message={item} showAuthor={isGroup} />;
    }
    return <ChatBubble message={item} showAuthor={isGroup} entering />;
  };

  return (
    <View style={styles.screen}>
      {/* Status header */}
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <View style={styles.headerBody}>
          <Text variant="headingS" color="primary" numberOfLines={1}>
            {conversation?.name}
          </Text>
          <Text variant="caption" color="muted">
            {isGroup ? 'Group' : 'Direct'} · encrypted
          </Text>
        </View>
        <SignalChip level={conversation?.signalLevel} proximity={conversation?.proximity} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.banners}>
            {sos ? (
              <EmergencyBanner
                title="Emergency nearby"
                message={sos.text}
                actionLabel="Respond"
                onAction={() => dispatch(showToast({ message: 'Responders notified', severity: 'success' }))}
              />
            ) : null}
            {isOffline ? (
              <OfflineBanner queued={queue.count} estimate={queue.estimate} transportLabel="LoRa" nearby={networkState.deviceCount} />
            ) : null}
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {failed.length > 0 ? (
          <View style={styles.retry}>
            <RetryBanner count={failed.length} onRetry={() => failed.forEach((m) => dispatch(retryChatMessage(m)))} />
          </View>
        ) : null}
        {quick.isOpen ? <QuickActionsBar onAction={onQuick} /> : null}
        <ChatComposer value={text} onChangeText={setText} onSend={send} onQuickActions={quick.toggle} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  headerBody: { flex: 1, gap: 1 },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xxs },
  banners: { gap: spacing.sm, marginBottom: spacing.sm },
  retry: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
});

export default ConversationScreen;
