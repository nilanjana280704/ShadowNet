/**
 * EmergencyHistoryScreen — a unified timeline of past SOS activations,
 * broadcasts, responses, and safe check-ins.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { EmptyState, IconButton, ScreenWrapper, ScrollWrapper, Text } from '../../components';
import { initEmergency } from '../../redux';
import { EmergencyTimeline } from './components';
import { HistoryKind } from './constants';

function EmergencyHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.emergency.history);
  const checkIns = useSelector((s) => s.checkIn.history);
  const broadcasts = useSelector((s) => s.broadcast.history);

  useEffect(() => {
    dispatch(initEmergency());
  }, [dispatch]);

  const events = useMemo(() => {
    const merged = [
      ...history,
      ...checkIns.map((c) => ({ id: c.id, kind: HistoryKind.CHECK_IN, title: `Check-in · ${c.label}`, detail: `Sent to ${c.audience}`, at: c.at })),
      ...broadcasts.map((b) => ({
        id: b.id,
        kind: HistoryKind.BROADCAST,
        title: `Broadcast · ${b.title}`,
        detail: b.sentTo > 0 ? `Sent to ${b.sentTo} nearby device${b.sentTo === 1 ? '' : 's'}` : 'Received nearby',
        at: b.at,
      })),
    ];
    const seen = new Set();
    return merged
      .filter((e) => (seen.has(e.id) ? false : seen.add(e.id)))
      .sort((a, b) => b.at - a.at);
  }, [history, checkIns, broadcasts]);

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Emergency history
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {events.length === 0 ? (
          <EmptyState icon="clock" title="No history yet" message="Your SOS, broadcasts, and check-ins will appear here." />
        ) : (
          <EmergencyTimeline events={events} />
        )}
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
});

export default EmergencyHistoryScreen;
