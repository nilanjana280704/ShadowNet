/**
 * ChatComposer — the message input row: an attach/quick-action button, a
 * growing text field, and a send button. Presentational; state and handlers are
 * injected.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(t:string) => void} props.onChangeText
 * @param {() => void} props.onSend
 * @param {() => void} props.onQuickActions
 * @param {boolean} [props.disabled]
 */
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, type } from '../../../theme';
import { IconButton } from '../../../components';

function ChatComposer({ value, onChangeText, onSend, onQuickActions, disabled = false }) {
  const canSend = value.trim().length > 0 && !disabled;
  return (
    <View style={styles.bar}>
      <IconButton icon="plus" variant="glass" color="secondary" accessibilityLabel="Quick actions" onPress={onQuickActions} />
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
      </View>
      <IconButton
        icon="send"
        variant={canSend ? 'solid' : 'ghost'}
        color={canSend ? 'accent' : 'muted'}
        accessibilityLabel="Send message"
        disabled={!canSend}
        onPress={onSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  field: {
    flex: 1,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    ...type.body,
  },
});

export default ChatComposer;
