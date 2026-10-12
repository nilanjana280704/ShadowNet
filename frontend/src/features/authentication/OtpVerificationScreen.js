/**
 * OtpVerificationScreen — a 6-digit code entry with a resend countdown. Wired to
 * verifyOtp. This is the entry point for phone verification; full phone-auth
 * (Firebase confirmation) lands in a later milestone, so on success here it
 * confirms and returns.
 *
 * Route params: { target?: string } — a masked destination shown to the user.
 */
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { colors, radius, spacing } from '../../theme';
import { AUTH_CONFIG } from '../../config';
import { Button, ErrorCard, Text } from '../../components';
import { clearError, showToast, verifyOtp } from '../../redux';
import { strings, format } from '../../localization';
import { validateOtp } from '../../utils/validation';
import AuthScreenLayout from './components/AuthScreenLayout';

const LEN = AUTH_CONFIG.otpLength;

function OtpVerificationScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.auth.submitting);
  const authError = useSelector((s) => s.auth.error);

  const inputRef = useRef(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(AUTH_CONFIG.otpResendSeconds);

  const target = route?.params?.target || '+1 ••• ••• 1234';

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const onChange = (value) => {
    setCode(value.replace(/[^0-9]/g, '').slice(0, LEN));
    if (error) setError(null);
    if (authError) dispatch(clearError());
  };

  const onVerify = async () => {
    const otpError = validateOtp(code, LEN);
    setError(otpError);
    if (otpError) return;
    const result = await dispatch(verifyOtp({ code }));
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(showToast({ message: strings.otp.verified, severity: 'success' }));
      navigation.goBack();
    }
  };

  const onResend = () => {
    if (seconds > 0) return;
    setSeconds(AUTH_CONFIG.otpResendSeconds);
    dispatch(showToast({ message: strings.otp.resend, severity: 'info' }));
  };

  const c = strings.otp;

  return (
    <AuthScreenLayout title={c.title} subtitle={format(c.subtitle, { target })} onBack={() => navigation.goBack()}>
      <View style={styles.form}>
        {authError ? <ErrorCard message={authError} onDismiss={() => dispatch(clearError())} /> : null}

        <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: LEN }).map((_, i) => {
            const active = i === code.length;
            return (
              <View key={i} style={[styles.box, active ? styles.boxActive : styles.boxIdle]}>
                <Text variant="headingM" color="primary">
                  {code[i] || ''}
                </Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            maxLength={LEN}
            autoFocus
            style={styles.hiddenInput}
            caretHidden
          />
        </Pressable>

        {error ? (
          <Text variant="caption" color="error" align="center">
            {error}
          </Text>
        ) : null}

        <Button label={c.submit} fullWidth size="lg" loading={submitting} onPress={onVerify} />

        <Pressable onPress={onResend} disabled={seconds > 0} style={styles.resend}>
          <Text variant="button" color={seconds > 0 ? 'muted' : 'accent'} style={styles.resendText}>
            {seconds > 0 ? format(c.resendIn, { seconds }) : c.resend}
          </Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: radius.m,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxIdle: { borderColor: colors.border },
  boxActive: { borderColor: colors.primary },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  resend: { alignSelf: 'center' },
  resendText: { textTransform: 'none' },
});

export default OtpVerificationScreen;
