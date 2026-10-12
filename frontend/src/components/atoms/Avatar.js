/**
 * Avatar — user/entity identity chip showing initials or an icon, with an
 * optional network-status ring.
 *
 * @param {object} props
 * @param {string} [props.name] used to derive initials
 * @param {string} [props.icon] icon name to show instead of initials
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {'connected'|'weak'|'offline'} [props.status] status ring color
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';
import { avatarSize } from '../../constants/layout';
import Icon from './Icon';
import Text from './Text';

const STATUS_COLOR = {
  connected: colors.networkConnected,
  weak: colors.networkWeak,
  offline: colors.networkOffline,
};

const TEXT_VARIANT = { sm: 'caption', md: 'title', lg: 'headingM', xl: 'headingL' };

function initials(name) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function Avatar({ name, icon, size = 'md', status }) {
  const dim = avatarSize[size];
  const ringColor = status ? STATUS_COLOR[status] : colors.border;

  return (
    <View
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: radius.circle, borderColor: ringColor },
      ]}
    >
      {icon ? (
        <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} color="secondary" />
      ) : (
        <Text variant={TEXT_VARIANT[size]} color="primary">
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
  },
});

export default Avatar;
