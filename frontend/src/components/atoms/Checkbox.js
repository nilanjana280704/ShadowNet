/**
 * Checkbox — a labelled checkbox with an accessible tap target.
 *
 * @param {object} props
 * @param {boolean} props.checked
 * @param {(next:boolean) => void} props.onChange
 * @param {string} [props.label]
 * @param {React.ReactNode} [props.children] custom label content (e.g. links)
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Icon from './Icon';
import Text from './Text';

function Checkbox({ checked, onChange, label, children }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={styles.row}
      hitSlop={8}
    >
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxIdle]}>
        {checked ? <Icon name="check" size="xs" color="inverse" strokeWidth={3} /> : null}
      </View>
      {children ? (
        <View style={styles.labelWrap}>{children}</View>
      ) : label ? (
        <Text variant="bodySmall" color="secondary" style={styles.labelWrap}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  boxIdle: { borderColor: colors.borderStrong, backgroundColor: colors.surface },
  boxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  labelWrap: { flex: 1 },
});

export default Checkbox;
