/**
 * AuthScreenLayout — shared shell for auth screens (login, register, forgot,
 * otp): optional back button, a title/subtitle header, a scrollable body that
 * avoids the keyboard, and an optional pinned footer.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {() => void} [props.onBack]
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { IconButton, ScreenWrapper, ScrollWrapper, Text } from '../../../components';

function AuthScreenLayout({ title, subtitle, onBack, footer, children }) {
  return (
    <ScreenWrapper animatedBackground={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {onBack ? (
          <View style={styles.backRow}>
            <IconButton icon="back" variant="glass" color="secondary" accessibilityLabel="Go back" onPress={onBack} />
          </View>
        ) : null}

        <ScrollWrapper contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text variant="displayM" color="primary">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="body" color="secondary" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </ScrollWrapper>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backRow: { paddingTop: spacing.sm },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl, gap: spacing.xs },
  subtitle: { maxWidth: 340 },
  footer: { paddingVertical: spacing.md },
});

export default AuthScreenLayout;
