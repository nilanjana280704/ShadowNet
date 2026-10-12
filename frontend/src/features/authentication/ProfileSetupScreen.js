/**
 * ProfileSetupScreen — collects the safety profile shown to responders (photo,
 * name, emergency contact, blood group, medical notes, home location, language,
 * notification preference). Saving marks the profile complete and routes home.
 */
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { colors, spacing } from '../../theme';
import {
  AvatarPicker,
  Button,
  Dropdown,
  Text,
  TextField,
} from '../../components';
import { saveProfile } from '../../redux';
import { strings } from '../../localization';
import { validateName, validateRequired } from '../../utils/validation';
import AuthScreenLayout from './components/AuthScreenLayout';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((v) => ({ label: v, value: v }));
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'Arabic'].map((v) => ({ label: v, value: v }));

function ProfileSetupScreen() {
  const dispatch = useDispatch();
  const saving = useSelector((s) => s.profile.saving);
  const user = useSelector((s) => s.auth.user);

  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    emergencyContact: '',
    bloodGroup: null,
    medical: '',
    homeLocation: '',
    language: 'English',
    notifications: true,
    photoUri: null,
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const persist = (validate) => {
    if (validate) {
      const nextErrors = {
        fullName: validateName(form.fullName),
        emergencyContact: validateRequired(form.emergencyContact),
      };
      setErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) return;
    }
    dispatch(saveProfile(form));
  };

  const c = strings.profile;

  return (
    <AuthScreenLayout
      title={c.title}
      subtitle={c.subtitle}
      footer={
        <View style={styles.footer}>
          <Button label={c.submit} fullWidth size="lg" loading={saving} onPress={() => persist(true)} />
          <Text variant="button" color="muted" onPress={() => persist(false)} align="center" style={styles.skip}>
            {c.skip}
          </Text>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.avatar}>
          <AvatarPicker name={form.fullName} uri={form.photoUri} label={c.photo} onPress={() => {}} />
        </View>

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
          label={c.emergencyContact}
          placeholder={c.emergencyContactPlaceholder}
          value={form.emergencyContact}
          onChangeText={setField('emergencyContact')}
          icon="phone"
          error={errors.emergencyContact}
        />
        <Dropdown
          label={c.bloodGroup}
          placeholder={c.bloodGroupPlaceholder}
          options={BLOOD_GROUPS}
          value={form.bloodGroup}
          onChange={setField('bloodGroup')}
        />
        <TextField
          label={c.medical}
          placeholder={c.medicalPlaceholder}
          value={form.medical}
          onChangeText={setField('medical')}
          icon="shield"
          multiline
        />
        <TextField
          label={c.homeLocation}
          placeholder={c.homeLocationPlaceholder}
          value={form.homeLocation}
          onChangeText={setField('homeLocation')}
          icon="pin"
        />
        <Dropdown
          label={c.language}
          options={LANGUAGES}
          value={form.language}
          onChange={setField('language')}
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text variant="title" color="primary">
              {c.notifications}
            </Text>
            <Text variant="caption" color="muted">
              {c.notificationsHint}
            </Text>
          </View>
          <Switch
            value={form.notifications}
            onValueChange={setField('notifications')}
            trackColor={{ true: colors.primary, false: colors.surfaceElevated }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  avatar: { alignItems: 'center', marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  toggleText: { flex: 1, gap: 2 },
  footer: { gap: spacing.md },
  skip: { textTransform: 'none' },
});

export default ProfileSetupScreen;
