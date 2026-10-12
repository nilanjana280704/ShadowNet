/**
 * UnreadBadge — a circular unread count. Renders nothing at zero; caps at 99+.
 *
 * @param {object} props
 * @param {number} props.count
 * @param {'primary'|'emergency'} [props.tone='primary']
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';
import Text from './Text';

function UnreadBadge({ count, tone = 'primary' }) {
  if (!count) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <View style={[styles.badge, tone === 'emergency' ? styles.emergency : styles.primary]}>
      <Text variant="badge" color={tone === 'emergency' ? 'onError' : 'inverse'}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  emergency: { backgroundColor: colors.sos },
});

export default UnreadBadge;
