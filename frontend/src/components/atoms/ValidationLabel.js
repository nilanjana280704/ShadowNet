/**
 * ValidationLabel — a small inline message under a field or in a rules list,
 * with a tone-matched icon. Used for validation feedback and password rules.
 *
 * @param {object} props
 * @param {string} props.message
 * @param {'error'|'success'|'muted'} [props.tone='error']
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import Icon from './Icon';
import Text from './Text';

const TONE = {
  error: { icon: 'error', color: 'error' },
  success: { icon: 'success', color: 'success' },
  muted: { icon: 'info', color: 'muted' },
};

function ValidationLabel({ message, tone = 'error' }) {
  const t = TONE[tone] || TONE.error;
  if (!message) return null;
  return (
    <View style={styles.row}>
      <Icon name={t.icon} size="xs" color={t.color} />
      <Text variant="caption" color={t.color} style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  text: { flex: 1 },
});

export default ValidationLabel;
