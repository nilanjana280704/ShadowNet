/**
 * GroupCommunicationScreen — the group hub: community, family, volunteer team,
 * emergency team, and neighbourhood groups. Tapping a group opens its
 * conversation (or confirms it's ready).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { colors, radius, spacing } from '../../theme';
import { Card, Icon, IconButton, ScreenWrapper, ScrollWrapper, StatusIndicator, Text } from '../../components';
import { openConversation, showToast } from '../../redux';
import { GROUP_META } from './constants';
import { groups } from './mockData';

// Groups that map to a seeded conversation open directly.
const GROUP_TO_CONVERSATION = {
  'g-family': 'c-family',
  'g-volunteers': 'c-volunteers',
  'g-neighbourhood': 'c-neighbourhood',
};

function GroupCommunicationScreen({ navigation }) {
  const dispatch = useDispatch();

  const open = (group) => {
    const conversationId = GROUP_TO_CONVERSATION[group.id];
    if (conversationId) {
      dispatch(openConversation(conversationId));
      navigation.navigate('Conversation', { conversationId });
    } else {
      dispatch(showToast({ message: `${group.name} is ready`, severity: 'info' }));
    }
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Groups
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {groups.map((group) => {
          const meta = GROUP_META[group.groupType];
          return (
            <Card key={group.id} variant="surface" padding="md" onPress={() => open(group)} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconChip}>
                  <Icon name={meta.icon} size="md" color={meta.tone} />
                </View>
                <View style={styles.body}>
                  <Text variant="title" color="primary">
                    {group.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {meta.label} · {group.members} members
                  </Text>
                </View>
                <StatusIndicator status={group.active ? 'nominal' : 'offline'} live={group.active} />
              </View>
            </Card>
          );
        })}
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingBottom: spacing.xxl, paddingTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  body: { flex: 1, gap: 2 },
});

export default GroupCommunicationScreen;
