/**
 * GreetingHeader — the friendly home top bar: a time-aware greeting, the user's
 * name and date, plus quick access to notifications, settings, and profile.
 *
 * @param {object} props
 * @param {string} props.name user's first name
 * @param {string} [props.date] formatted date string
 * @param {number} [props.unreadCount=0] notification badge count
 * @param {() => void} [props.onNotifications]
 * @param {() => void} [props.onSettings]
 * @param {() => void} [props.onProfile]
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { Avatar, Badge, IconButton, Text } from '../atoms';

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function GreetingHeader({ name, date, unreadCount = 0, onNotifications, onSettings, onProfile }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="bodySmall" color="secondary">
          {greetingFor()}
        </Text>
        <Text variant="headingL" color="primary" numberOfLines={1}>
          {name}
        </Text>
        {date ? (
          <Text variant="caption" color="muted">
            {date}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <View>
          <IconButton
            icon="bell"
            variant="glass"
            color="secondary"
            accessibilityLabel="Notifications"
            onPress={onNotifications}
          />
          {unreadCount > 0 ? (
            <View style={styles.badge} pointerEvents="none">
              <Badge label={unreadCount} tone="error" />
            </View>
          ) : null}
        </View>
        <IconButton
          icon="settings"
          variant="glass"
          color="secondary"
          accessibilityLabel="Settings"
          onPress={onSettings}
        />
        <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel="Profile">
          <Avatar name={name} size="md" status="connected" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  left: { flexShrink: 1, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { position: 'absolute', top: -4, right: -4 },
});

export default GreetingHeader;
