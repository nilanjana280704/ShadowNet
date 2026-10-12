/**
 * AvatarPicker — a tappable profile photo control showing the current photo (or
 * initials) with a camera badge. Wiring to an image library lands later; here it
 * just invokes onPress.
 *
 * @param {object} props
 * @param {string} [props.name] for initials fallback
 * @param {string} [props.uri] selected image URI
 * @param {string} [props.label] helper text under the avatar
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { avatarSize } from '../../constants/layout';
import { Avatar, Icon, Text } from '../atoms';

function AvatarPicker({ name, uri, label, onPress }) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label || 'Add profile photo'}
        style={styles.target}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <Avatar name={name} size="xl" />
        )}
        <View style={styles.badge}>
          <Icon name="plus" size="sm" color="inverse" strokeWidth={2.4} />
        </View>
      </Pressable>
      {label ? (
        <Text variant="caption" color="muted">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm },
  target: { width: avatarSize.xl, height: avatarSize.xl },
  image: { width: avatarSize.xl, height: avatarSize.xl, borderRadius: radius.circle },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
});

export default AvatarPicker;
