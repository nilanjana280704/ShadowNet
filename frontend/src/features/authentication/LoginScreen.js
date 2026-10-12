/**
 * LoginScreen — email/password sign-in with remember-me, forgot-password,
 * Google placeholder, validation, loading, and error states. All copy comes
 * from strings; all auth work goes through the auth thunks.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Button,
  Checkbox,
  Divider,
  ErrorCard,
  SocialButton,
  Text,
  TextField,
} from '../../components';
import { clearError, setRememberMe, showToast, signIn } from '../../redux';
import { strings } from '../../localization';
import { validateEmail, validatePassword } from '../../utils/validation';
import AuthScreenLayout from './components/AuthScreenLayout';

function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.auth.submitting);
  const authError = useSelector((s) => s.auth.error);
  const remember = useSelector((s) => s.session.rememberMe);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const onChange = (setter) => (value) => {
    setter(value);
    if (authError) dispatch(clearError());
  };

  const onSubmit = () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    dispatch(signIn({ email: email.trim(), password }));
  };

  const c = strings.login;

  return (
    <AuthScreenLayout
      title={c.title}
      subtitle={c.subtitle}
      footer={
        <View style={styles.footerRow}>
          <Text variant="bodySmall" color="secondary">
            {c.noAccount}{' '}
          </Text>
          <Text variant="button" color="accent" onPress={() => navigation.navigate('Register')} style={styles.link}>
            {c.register}
          </Text>
        </View>
      }
    >
      <View style={styles.form}>
        {authError ? <ErrorCard message={authError} onDismiss={() => dispatch(clearError())} /> : null}

        <TextField
          label={c.email}
          placeholder={c.emailPlaceholder}
          value={email}
          onChangeText={onChange(setEmail)}
          icon="user"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <TextField
          label={c.password}
          placeholder={c.passwordPlaceholder}
          value={password}
          onChangeText={onChange(setPassword)}
          icon="lock"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />

        <View style={styles.rowBetween}>
          <Checkbox checked={remember} onChange={(v) => dispatch(setRememberMe(v))} label={c.remember} />
          <Text variant="button" color="accent" onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
            {c.forgot}
          </Text>
        </View>

        <Button label={c.submit} fullWidth size="lg" loading={submitting} onPress={onSubmit} />

        <Divider label={strings.common.or} spacing={spacing.none} />

        <SocialButton
          label={c.google}
          monogram="G"
          onPress={() => dispatch(showToast({ message: c.google, severity: 'info' }))}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  link: { textTransform: 'none' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default LoginScreen;
