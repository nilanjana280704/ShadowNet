/**
 * Dropdown — single-select control. Tapping opens a themed options overlay.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {Array<{label:string,value:any}>} props.options
 * @param {any} props.value currently selected value
 * @param {(value:any) => void} props.onChange
 * @param {string} [props.placeholder='Select']
 * @param {boolean} [props.disabled]
 */
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { controlHeight } from '../../constants/layout';
import { Icon, Text } from '../atoms';

function Dropdown({ label, options = [], value, onChange, placeholder = 'Select', disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const choose = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color="muted">
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.control, open && styles.controlOpen, disabled && styles.disabled]}
      >
        <Text variant="body" color={selected ? 'primary' : 'muted'} numberOfLines={1} style={styles.value}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size="sm" color="muted" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => choose(opt.value)}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <Text variant="body" color={isSelected ? 'accent' : 'primary'}>
                    {opt.label}
                  </Text>
                  {isSelected ? <Icon name="check" size="sm" color="accent" /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: controlHeight.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
  },
  controlOpen: { borderColor: colors.primary },
  disabled: { opacity: 0.45 },
  value: { flex: 1, marginRight: spacing.sm },
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', padding: spacing.xl },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.xs,
    ...shadows.modal,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionPressed: { backgroundColor: colors.overlay.white04 },
});

export default Dropdown;
