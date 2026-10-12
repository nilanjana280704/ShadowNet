/**
 * ForgotPasswordScreen — request a password reset link, then a confirmation
 * state. Never reveals whether an account exists (the service always resolves).
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { Button, EmptyState, ErrorCard, TextField } from '../../components';
import { clearError, resetPassword } from '../../redux';
import { strings, format } from '../../localization';
import { validateEmail } from '../../utils/validation';
import AuthScreenLayout from './components/AuthScreenLayout';

function ForgotPasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.auth.submitting);
  const authError = useSelector((s) => s.auth.error);

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;
    const result = await dispatch(resetPassword(email.trim()));
    if (resetPassword.fulfilled.match(result)) setSent(true);
  };

  const c = strings.forgot;

  if (sent) {
    return (
      <AuthScreenLayout title={c.sentTitle} onBack={() => navigation.navigate('Login')}>
        <EmptyState
          icon="message"
          title={c.sentTitle}
          message={format(c.sentBody, { email: email.trim() })}
          actionLabel={c.done}
          onAction={() => navigation.navigate('Login')}
        />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout title={c.title} subtitle={c.subtitle} onBack={() => navigation.goBack()}>
      <View style={styles.form}>
        {authError ? <ErrorCard message={authError} onDismiss={() => dispatch(clearError())} /> : null}
        <TextField
          label={c.email}
          placeholder={c.emailPlaceholder}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError(null);
          }}
          icon="user"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
        />
        <Button label={c.submit} fullWidth size="lg" loading={submitting} onPress={onSubmit} />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});

export default ForgotPasswordScreen;
