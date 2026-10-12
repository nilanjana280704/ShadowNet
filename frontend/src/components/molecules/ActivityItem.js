/**
 * ActivityItem — a single entry in the Live Activity feed: a category icon on a
 * connecting timeline rail, a title/description, and a relative time.
 *
 * @param {object} props
 * @param {'alert'|'broadcast'|'volunteer'|'message'|'device'} [props.type='message']
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.time] relative time (e.g. '2m')
 * @param {boolean} [props.first] hide the rail above the dot
 * @param {boolean} [props.last] hide the rail below the dot
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Icon, Text } from '../atoms';

const TYPE = {
  alert: { icon: 'warning', color: 'warning' },
  broadcast: { icon: 'emergency', color: 'emergency' },
  volunteer: { icon: 'volunteer', color: 'info' },
  message: { icon: 'message', color: 'accent' },
  device: { icon: 'nodes', color: 'connected' },
};

function ActivityItem({ type = 'message', title, description, time, first = false, last = false }) {
  const t = TYPE[type] || TYPE.message;
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.line, first && styles.hidden]} />
        <View style={styles.dotWrap}>
          <Icon name={t.icon} size="sm" color={t.color} />
        </View>
        <View style={[styles.line, last && styles.hidden]} />
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text variant="subtitle" color="primary" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {time ? (
            <Text variant="caption" color="muted">
              {time}
            </Text>
          ) : null}
        </View>
        {description ? (
          <Text variant="bodySmall" color="secondary" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 40 },
  line: { width: 2, flex: 1, backgroundColor: colors.divider, minHeight: spacing.xs },
  hidden: { backgroundColor: colors.transparent },
  dotWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, paddingBottom: spacing.lg, gap: spacing.xxs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  title: { flex: 1 },
});

export default ActivityItem;
