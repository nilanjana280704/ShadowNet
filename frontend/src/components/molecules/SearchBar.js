/**
 * SearchBar — search input with a leading search icon and a clear button.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(text: string) => void} props.onChangeText
 * @param {string} [props.placeholder='Search']
 * @param {() => void} [props.onClear]
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, type } from '../../theme';
import { controlHeight } from '../../constants/layout';
import { Icon, IconButton } from '../atoms';

function SearchBar({ value, onChangeText, placeholder = 'Search', onClear }) {
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.field, { borderColor: focused ? colors.primary : colors.border }]}>
      <Icon name="search" size="sm" color={focused ? 'accent' : 'muted'} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        style={styles.input}
      />
      {value?.length ? (
        <IconButton
          icon="close"
          size="sm"
          color="muted"
          accessibilityLabel="Clear search"
          onPress={handleClear}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: controlHeight.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    ...type.body,
  },
});

export default SearchBar;
