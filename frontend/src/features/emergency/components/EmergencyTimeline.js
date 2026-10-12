/**
 * EmergencyTimeline — a vertical timeline of past emergency events (SOS,
 * broadcasts, responses, check-ins) with kind icons and timestamps.
 *
 * @param {object} props
 * @param {Array<{id,kind,title,detail,at}>} props.events
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, Text, Timestamp } from '../../../components';
import { HistoryKind } from '../constants';

const KIND = {
  [HistoryKind.SOS]: { icon: 'sos', color: 'sos' },
  [HistoryKind.BROADCAST]: { icon: 'emergency', color: 'emergency' },
  [HistoryKind.RESPONSE]: { icon: 'volunteer', color: 'info' },
  [HistoryKind.CHECK_IN]: { icon: 'success', color: 'success' },
};

function EmergencyTimeline({ events = [] }) {
  return (
    <View>
      {events.map((event, i) => {
        const meta = KIND[event.kind] || KIND[HistoryKind.RESPONSE];
        const last = i === events.length - 1;
        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.rail}>
              <View style={styles.dot}>
                <Icon name={meta.icon} size="sm" color={meta.color} />
              </View>
              {!last ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.body}>
              <View style={styles.header}>
                <Text variant="subtitle" color="primary" style={styles.title} numberOfLines={1}>
                  {event.title}
                </Text>
                <Timestamp date={event.at} relative />
              </View>
              {event.detail ? (
                <Text variant="bodySmall" color="secondary">
                  {event.detail}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 40 },
  dot: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, backgroundColor: colors.divider, minHeight: spacing.sm },
  body: { flex: 1, paddingBottom: spacing.lg, gap: spacing.xxs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1 },
});

export default EmergencyTimeline;
