/**
 * SafeCheckInScreen — one-tap status to family. Big preset buttons ("I'm safe",
 * "I'm injured", "I need help", "I'm trapped", "I'm moving"). One tap sends.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { IconButton, ScreenWrapper, ScrollWrapper, SectionHeader, StatusBadge, Text, Timestamp } from '../../components';
import { initEmergency, sendCheckIn } from '../../redux';
import { EmergencyCard, EmergencyTimeline } from './components';
import { CHECK_IN_MESSAGES } from './constants';

function SafeCheckInScreen({ navigation }) {
  const dispatch = useDispatch();
  const last = useSelector((s) => s.checkIn.last);
  const history = useSelector((s) => s.checkIn.history);

  useEffect(() => {
    dispatch(initEmergency());
  }, [dispatch]);

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Safe check-in
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        <Text variant="body" color="secondary">
          Let your family know how you are. One tap sends to everyone in your Family group.
        </Text>

        {last ? (
          <View style={styles.lastRow}>
            <StatusBadge tone={last.tone === 'success' ? 'success' : 'warning'} label={`Last: ${last.label}`} solid />
            <Timestamp date={last.at} relative />
          </View>
        ) : null}

        <View style={styles.list}>
          {CHECK_IN_MESSAGES.map((m) => (
            <EmergencyCard
              key={m.key}
              title={m.label}
              icon={m.icon}
              tone={m.tone}
              onPress={() => dispatch(sendCheckIn(m.key))}
            />
          ))}
        </View>

        {history.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Recent check-ins" />
            <EmergencyTimeline events={history.map((h) => ({ id: h.id, kind: 'check-in', title: h.label, detail: `Sent to ${h.audience}`, at: h.at }))} />
          </View>
        ) : null}
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  lastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { gap: spacing.sm },
  section: { gap: spacing.sm, marginTop: spacing.md },
});

export default SafeCheckInScreen;
