/**
 * RecentAlertsWidget — a short feed of the latest alerts.
 *
 * @param {object} props
 * @param {Array<{id:string,severity?:string,title:string,message?:string,timestamp?:string}>} props.alerts
 * @param {(alert:object) => void} [props.onSelect]
 * @param {() => void} [props.onSeeAll]
 * @param {number} [props.limit=3]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { AlertCard, EmptyState, SectionHeader } from '../molecules';

function RecentAlertsWidget({ alerts = [], onSelect, onSeeAll, limit = 3 }) {
  const shown = alerts.slice(0, limit);
  return (
    <View>
      <SectionHeader
        eyebrow="Feed"
        title="Recent Alerts"
        actionIcon={onSeeAll ? 'forward' : undefined}
        onAction={onSeeAll}
        actionLabel="See all alerts"
      />
      {shown.length === 0 ? (
        <EmptyState icon="bell" title="No active alerts" message="You're all clear for now." />
      ) : (
        <View style={styles.list}>
          {shown.map((a) => (
            <AlertCard
              key={a.id}
              severity={a.severity}
              title={a.title}
              message={a.message}
              timestamp={a.timestamp}
              onPress={onSelect ? () => onSelect(a) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});

export default RecentAlertsWidget;
