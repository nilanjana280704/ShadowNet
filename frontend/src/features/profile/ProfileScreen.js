/**
 * ProfileScreen — the user's profile and safety setup. Presentational only;
 * rows are non-functional placeholders wired up in later milestones.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { Avatar, Button, Card, Divider, IconButton, ListItem, ScreenWrapper, ScrollWrapper, Text } from '../../components';
import { signOut } from '../../redux';
import { strings } from '../../localization';
import { resolveDisplayName } from '../../utils';

const SETUP = [
  { key: 'contacts', icon: 'phone', title: 'Emergency contacts', subtitle: '5 people', tone: 'accent' },
  { key: 'places', icon: 'pin', title: 'Saved places', subtitle: '3 locations', tone: 'info' },
  { key: 'maps', icon: 'map', title: 'Offline maps', subtitle: '2 downloaded', tone: 'success' },
  { key: 'mode', icon: 'shield', title: 'Emergency mode', subtitle: 'Off', tone: 'warning' },
];

const GENERAL = [
  { key: 'settings', icon: 'settings', title: 'Settings' },
  { key: 'privacy', icon: 'lock', title: 'Privacy & security' },
  { key: 'about', icon: 'info', title: 'About ShadowNet' },
];

function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);
  const profile = useSelector((s) => s.profile.data);
  const displayName = resolveDisplayName({ profile, authUser });

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton
          icon="back"
          variant="ghost"
          color="secondary"
          accessibilityLabel="Back"
          onPress={() => navigation?.navigate('Home')}
        />
        <Text variant="headingM" color="primary">
          Profile
        </Text>
      </View>
      <ScrollWrapper contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Avatar name={displayName} size="xl" status="connected" />
          <Text variant="headingL" color="primary">
            {displayName}
          </Text>
          <Text variant="bodySmall" color="secondary">
            Ready for emergencies
          </Text>
        </View>

        <Card variant="surface" padding="sm" style={styles.group}>
          {SETUP.map((item, i) => (
            <View key={item.key}>
              {i > 0 ? <Divider spacing={spacing.xxs} /> : null}
              <ListItem
                icon={item.icon}
                iconColor={item.tone}
                title={item.title}
                subtitle={item.subtitle}
                chevron
              />
            </View>
          ))}
        </Card>

        <Card variant="surface" padding="sm" style={styles.group}>
          {GENERAL.map((item, i) => (
            <View key={item.key}>
              {i > 0 ? <Divider spacing={spacing.xxs} /> : null}
              <ListItem icon={item.icon} iconColor="secondary" title={item.title} chevron />
            </View>
          ))}
        </Card>

        <Button
          label={strings.session.logout}
          variant="ghost"
          icon="power"
          fullWidth
          onPress={() => dispatch(signOut())}
          style={styles.logout}
        />
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  identity: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  group: { marginTop: spacing.lg },
  logout: { marginTop: spacing.xl },
});

export default ProfileScreen;
