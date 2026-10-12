/**
 * EmergencyCenterScreen — the heart of Crisis Mode. Shows the emergency status,
 * a prominent SOS entry, the connection state, quick help, a mini emergency map,
 * nearby volunteers/shelters/medical, and recent broadcasts. Built for speed.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Card,
  NetworkBanner,
  ScreenWrapper,
  ScrollWrapper,
  SectionHeader,
  StatusBadge,
  Text,
} from '../../components';
import { initCommunication, initEmergency, sendEmergencyBroadcast } from '../../redux';
import { useCommunication } from '../../hooks';
import {
  EmergencyCard,
  EmergencyMapPreview,
  MedicalCard,
  QuickHelpGrid,
  ShelterCard,
  VolunteerCard,
} from './components';
import { EMERGENCY_STATUS_META, QUICK_HELP } from './constants';
import { EmergencyService } from './services';

function EmergencyCenterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { networkState } = useCommunication();
  const sosStatus = useSelector((s) => s.sos.status);
  const volunteers = useSelector((s) => s.emergency.volunteers);
  const shelters = useSelector((s) => s.emergency.shelters);
  const medical = useSelector((s) => s.emergency.medical);
  const dangerZones = useSelector((s) => s.emergency.dangerZones);
  const broadcasts = useSelector((s) => s.broadcast.history);

  useEffect(() => {
    dispatch(initEmergency());
    dispatch(initCommunication());
  }, [dispatch]);

  const status = EMERGENCY_STATUS_META[EmergencyService.deriveStatus({ sosStatus, activeAlerts: 0 })];

  const openMessage = () => navigation.navigate('Messages', { screen: 'ChatList' });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text variant="label" color="accent">
            Crisis Mode
          </Text>
          <Text variant="headingL" color="primary">
            Emergency Center
          </Text>
        </View>
        <StatusBadge tone={status.status} label={status.label} solid />
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        <EmergencyCard
          title="Send SOS"
          subtitle="Alert everyone nearby in one tap"
          icon="sos"
          tone="sos"
          onPress={() => navigation.navigate('SOS')}
        />

        <View style={styles.section}>
          <NetworkBanner
            online={networkState.online}
            activeTransport={networkState.activeTransport}
            coverageM={networkState.coverageM}
            deviceCount={networkState.deviceCount}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick help" />
          <QuickHelpGrid items={QUICK_HELP} onSelect={(key) => dispatch(sendEmergencyBroadcast(key))} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Around you"
            actionIcon="map"
            actionLabel="Open full map"
            onAction={() => navigation.navigate('Safety', { screen: 'ResourceMap' })}
          />
          <Text variant="caption" color="muted">
            Sample data — the map preview, volunteers, shelters, and medical camps below are not
            live information.
          </Text>
          <EmergencyMapPreview
            shelters={shelters}
            medical={medical}
            volunteers={volunteers}
            dangerZones={dangerZones}
            onOpen={() => navigation.navigate('Safety', { screen: 'ResourceMap' })}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Nearby volunteers" />
          <View style={styles.list}>
            {volunteers.map((v) => (
              <VolunteerCard key={v.id} volunteer={v} onMessage={openMessage} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Nearby shelters" />
          <View style={styles.list}>
            {shelters.map((s) => (
              <ShelterCard key={s.id} shelter={s} onNavigate={() => {}} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Medical camps" />
          <View style={styles.list}>
            {medical.map((m) => (
              <MedicalCard key={m.id} camp={m} onNavigate={() => {}} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recent broadcasts" actionIcon="forward" actionLabel="All broadcasts" onAction={() => navigation.navigate('EmergencyBroadcast')} />
          <View style={styles.list}>
            {broadcasts.slice(0, 3).map((b) => (
              <Card key={b.id} variant="surface" padding="md">
                <Text variant="title" color="primary">
                  {b.title}
                </Text>
                <Text variant="bodySmall" color="secondary" numberOfLines={1}>
                  {b.area} · {b.sentTo > 0 ? `sent to ${b.sentTo} nearby device${b.sentTo === 1 ? '' : 's'}` : 'received nearby'}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
});

export default EmergencyCenterScreen;
