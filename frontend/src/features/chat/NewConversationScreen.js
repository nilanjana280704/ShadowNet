/**
 * NewConversationScreen — start a direct message. Search users, pick from nearby
 * people, or tap a recent search. Selecting a person opens (or creates) a
 * conversation.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { spacing } from '../../theme';
import {
  Chip,
  IconButton,
  ListItem,
  ScreenWrapper,
  ScrollWrapper,
  SearchBar,
  SectionHeader,
  SignalIndicator,
  Text,
} from '../../components';
import { startConversationWith } from '../../redux';
import { nearbyUsers, recentSearches } from './mockData';

const KIND_ICON = { family: 'user', volunteer: 'volunteer', rescue: 'shield', medical: 'medical' };

function NewConversationScreen({ navigation }) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');

  const filtered = nearbyUsers.filter((u) => u.name.toLowerCase().includes(query.trim().toLowerCase()));

  const start = (user) => {
    const id = dispatch(startConversationWith(user));
    navigation.replace('Conversation', { conversationId: id });
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          New message
        </Text>
      </View>

      <View style={styles.search}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search people" />
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {recentSearches.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Recent searches" />
            <View style={styles.chips}>
              {recentSearches.map((r) => (
                <Chip key={r} label={r} onPress={() => setQuery(r)} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="People nearby" />
          {filtered.map((u) => (
            <ListItem
              key={u.id}
              icon={KIND_ICON[u.kind] || 'user'}
              iconColor="accent"
              title={u.name}
              subtitle={`${u.distanceM} m away`}
              trailing={<SignalIndicator level={u.signalLevel} />}
              onPress={() => start(u)}
            />
          ))}
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  search: { marginTop: spacing.md },
  content: { paddingBottom: spacing.xxl },
  section: { marginTop: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});

export default NewConversationScreen;
