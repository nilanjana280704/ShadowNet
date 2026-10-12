/**
 * TextField — labelled text input with focus, error, helper, and optional
 * leading icon / password reveal.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} props.value
 * @param {(text: string) => void} props.onChangeText
 * @param {string} [props.placeholder]
 * @param {string} [props.icon] leading icon name
 * @param {boolean} [props.secureTextEntry] password field with reveal toggle
 * @param {string} [props.error] error message (also colors the border)
 * @param {string} [props.helper] helper text below the field
 * @param {boolean} [props.disabled]
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, type } from '../../theme';
import { controlHeight } from '../../constants/layout';
import { Icon, IconButton, Text } from '../atoms';

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  error,
  helper,
  disabled = false,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color="muted">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          { borderColor },
          disabled && styles.disabled,
        ]}
      >
        {icon ? <Icon name={icon} size="sm" color={focused ? 'accent' : 'muted'} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          {...rest}
        />
        {secureTextEntry ? (
          <IconButton
            icon={hidden ? 'eye' : 'eyeOff'}
            size="sm"
            color="muted"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
          />
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color="error">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" color="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: controlHeight.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    ...type.body,
  },
  disabled: { opacity: 0.45 },
});

export default TextField;
