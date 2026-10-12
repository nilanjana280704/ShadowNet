/**
 * RegisterScreen — create an account with full name, email, phone, password +
 * confirmation, and terms acceptance. Includes a live password-strength meter,
 * per-field validation, loading, and error states. On success the user is
 * authenticated and routed to profile setup.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Button,
  Checkbox,
  ErrorCard,
  ProgressBar,
  Text,
  TextField,
} from '../../components';
import { clearError, signUp } from '../../redux';
import { strings } from '../../localization';
import {
  passwordStrength,
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateAccepted,
} from '../../utils/validation';
import AuthScreenLayout from './components/AuthScreenLayout';

const STRENGTH_TONE = ['error', 'warning', 'info', 'success'];

function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.auth.submitting);
  const authError = useSelector((s) => s.auth.error);

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (authError) dispatch(clearError());
  };

  const onSubmit = () => {
    const nextErrors = {
      fullName: validateName(form.fullName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.confirm, form.password),
      terms: validateAccepted(accepted),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    dispatch(
      signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
    );
  };

  const c = strings.register;
  const strength = passwordStrength(form.password);

  return (
    <AuthScreenLayout
      title={c.title}
      subtitle={c.subtitle}
      onBack={() => navigation.goBack()}
      footer={
        <View style={styles.footerRow}>
          <Text variant="bodySmall" color="secondary">
            {c.haveAccount}{' '}
          </Text>
          <Text variant="button" color="accent" onPress={() => navigation.navigate('Login')} style={styles.link}>
            {c.login}
          </Text>
        </View>
      }
    >
      <View style={styles.form}>
        {authError ? <ErrorCard message={authError} onDismiss={() => dispatch(clearError())} /> : null}

        <TextField
          label={c.fullName}
          placeholder={c.fullNamePlaceholder}
          value={form.fullName}
          onChangeText={setField('fullName')}
          icon="user"
          autoCapitalize="words"
          error={errors.fullName}
        />
        <TextField
          label={c.email}
          placeholder={c.emailPlaceholder}
          value={form.email}
          onChangeText={setField('email')}
          icon="user"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <TextField
          label={c.phone}
          placeholder={c.phonePlaceholder}
          value={form.phone}
          onChangeText={setField('phone')}
          icon="phone"
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <View style={styles.passwordBlock}>
          <TextField
            label={c.password}
            placeholder={c.passwordPlaceholder}
            value={form.password}
            onChangeText={setField('password')}
            icon="lock"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />
          {form.password.length > 0 ? (
            <ProgressBar
              value={(strength.score + 1) / 4}
              tone={STRENGTH_TONE[strength.score]}
              label={strength.label}
            />
          ) : null}
        </View>
        <TextField
          label={c.confirmPassword}
          placeholder={c.confirmPlaceholder}
          value={form.confirm}
          onChangeText={setField('confirm')}
          icon="lock"
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirm}
        />

        <Checkbox checked={accepted} onChange={setAccepted}>
          <Text variant="bodySmall" color="secondary">
            {c.acceptTerms}
          </Text>
        </Checkbox>
        {errors.terms ? (
          <Text variant="caption" color="error">
            {errors.terms}
          </Text>
        ) : null}

        <Button label={c.submit} fullWidth size="lg" loading={submitting} onPress={onSubmit} />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  passwordBlock: { gap: spacing.sm },
  link: { textTransform: 'none' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default RegisterScreen;
