/**
 * ChatListScreen — the messaging home: search, filters, offline banner, a nearby
 * users strip, pinned conversations, and the conversation list. Emergency-first,
 * not a messenger clone.
 */
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Chip,
  IconButton,
  OfflineBanner,
  ScreenWrapper,
  ScrollWrapper,
  SearchBar,
  SectionHeader,
  Text,
} from '../../components';
import { filterSet, initChat, initCommunication, openConversation, querySet } from '../../redux';
import { useCommunication } from '../../hooks';
import { ConversationService, ConversationFilter } from './services';
import { ConversationTile } from './components';
import { nearbyUsers } from './mockData';
import NearbyUserChip from './components/NearbyUserChip';

const FILTERS = [
  { key: ConversationFilter.ALL, label: 'All' },
  { key: ConversationFilter.UNREAD, label: 'Unread' },
  { key: ConversationFilter.NEARBY, label: 'Nearby' },
  { key: ConversationFilter.PINNED, label: 'Pinned' },
  { key: ConversationFilter.EMERGENCY, label: 'Emergency' },
];

function ChatListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { networkState } = useCommunication();
  const byId = useSelector((s) => s.chat.byId);
  const ids = useSelector((s) => s.chat.ids);
  const filter = useSelector((s) => s.chat.filter);
  const query = useSelector((s) => s.chat.query);
  const queue = useSelector((s) => s.queue);

  useEffect(() => {
    dispatch(initChat());
    dispatch(initCommunication());
  }, [dispatch]);

  const all = useMemo(() => ids.map((id) => byId[id]).filter(Boolean), [ids, byId]);
  const visible = useMemo(() => {
    const searched = ConversationService.search(all, query);
    return ConversationService.sort(ConversationService.filter(searched, filter));
  }, [all, query, filter]);

  const pinned = visible.filter((c) => c.pinned);
  const rest = visible.filter((c) => !c.pinned);

  const open = (conversationId) => {
    dispatch(openConversation(conversationId));
    navigation.navigate('Conversation', { conversationId });
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <Text variant="headingL" color="primary">
          Messages
        </Text>
        <View style={styles.headerActions}>
          <IconButton icon="emergency" variant="glass" color="secondary" accessibilityLabel="Broadcast history" onPress={() => navigation.navigate('BroadcastHistory')} />
          <IconButton icon="plus" variant="glass" color="accent" accessibilityLabel="New conversation" onPress={() => navigation.navigate('NewConversation')} />
        </View>
      </View>

      <View style={styles.search}>
        <SearchBar value={query} onChangeText={(v) => dispatch(querySet(v))} placeholder="Search people and messages" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => dispatch(filterSet(f.key))} />
        ))}
      </ScrollView>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {!networkState.online ? (
          <View style={styles.section}>
            <OfflineBanner
              queued={queue.count}
              estimate={queue.estimate}
              nearby={networkState.deviceCount}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="Nearby now"
            actionIcon="forward"
            actionLabel="See nearby users"
            onAction={() => navigation.navigate('NearbyUsers')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyRow}>
            {nearbyUsers.map((u) => (
              <NearbyUserChip key={u.id} user={u} onPress={() => navigation.navigate('NewConversation')} />
            ))}
          </ScrollView>
        </View>

        {pinned.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Pinned" />
            {pinned.map((c) => (
              <ConversationTile key={c.id} conversation={c} onPress={() => open(c.id)} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Conversations" />
          {rest.map((c) => (
            <ConversationTile key={c.id} conversation={c} onPress={() => open(c.id)} />
          ))}
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  search: { marginTop: spacing.md },
  filters: { gap: spacing.sm, paddingVertical: spacing.md },
  content: { paddingBottom: spacing.xxl },
  section: { marginTop: spacing.md },
  nearbyRow: { gap: spacing.md, paddingVertical: spacing.xs },
});

export default ChatListScreen;
