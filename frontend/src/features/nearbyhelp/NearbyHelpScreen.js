/**
 * NearbyHelpScreen — "who is nearby and can help". Two plain-language halves:
 * people/devices you can reach directly, and the closest volunteers, shelters,
 * and medical help from the relief network. No networking/transport detail —
 * that lives entirely behind useCommunication.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { NearbyDevicesCard, ScreenWrapper, ScrollWrapper, SectionHeader, Text } from '../../components';
import { MedicalCard, ShelterCard, VolunteerCard } from '../relief/components';
import { TransportFactory } from '../../communication';
import { initCommunication, initRelief } from '../../redux';
import { useCommunication } from '../../hooks';

function NearbyHelpScreen({ navigation }) {
  const dispatch = useDispatch();
  const { devices, connections, discovering, toggleScan, connect, send } = useCommunication();
  const identities = useSelector((s) => s.verifiedPeers.byDeviceId);
  // Real device discovery only — never present the mock simulator's
  // fictional devices as if they were real nearby people.
  const isRealDiscovery = TransportFactory.isNative();
  const visibleDevices = isRealDiscovery ? devices : [];
  const shelters = useSelector((s) => s.shelter.ids.map((id) => s.shelter.byId[id]).slice(0, 3));
  const medical = useSelector((s) => s.medical.ids.map((id) => s.medical.byId[id]).slice(0, 3));
  const volunteers = useSelector((s) => s.volunteer.ids.map((id) => s.volunteer.byId[id]).slice(0, 3));

  useEffect(() => {
    dispatch(initCommunication());
    dispatch(initRelief());
  }, [dispatch]);

  const openDetails = (entityId) => navigation.navigate('ResourceDetails', { entityId });
  const message = (deviceId) => send(deviceId, "I'm nearby and need help.");

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text variant="headingL" color="primary">
          Nearby Help
        </Text>
        <Text variant="body" color="secondary">
          People, volunteers, and services close to you right now.
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {!isRealDiscovery ? (
            <Text variant="caption" color="muted" style={styles.notice}>
              Real nearby-device discovery isn't available on this build/device yet — no fictional
              devices are shown here.
            </Text>
          ) : null}
          <NearbyDevicesCard
            devices={visibleDevices}
            connections={connections}
            identities={identities}
            discovering={discovering}
            onToggleScan={toggleScan}
            onConnect={connect}
            onMessage={message}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="Volunteers"
            title="People who can help"
            actionIcon="forward"
            actionLabel="See all volunteers"
            onAction={() => navigation.navigate('VolunteerNetwork')}
          />
          <Text variant="caption" color="muted" style={styles.notice}>
            Sample data — not live. Real volunteer availability isn't connected yet.
          </Text>
          <View style={styles.list}>
            {volunteers.map((v) => (
              <VolunteerCard key={v.id} entity={v} onPress={() => openDetails(v.id)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="Shelters"
            title="Places to stay safe"
            actionIcon="forward"
            actionLabel="See all shelters"
            onAction={() => navigation.navigate('Shelters')}
          />
          <Text variant="caption" color="muted" style={styles.notice}>
            Sample data — not live. Real shelter capacity isn't connected yet.
          </Text>
          <View style={styles.list}>
            {shelters.map((s) => (
              <ShelterCard key={s.id} entity={s} onPress={() => openDetails(s.id)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="Medical"
            title="Medical help nearby"
            actionIcon="forward"
            actionLabel="See all medical help"
            onAction={() => navigation.navigate('MedicalAssistance')}
          />
          <Text variant="caption" color="muted" style={styles.notice}>
            Sample data — not live. Real medical-camp availability isn't connected yet.
          </Text>
          <View style={styles.list}>
            {medical.map((m) => (
              <MedicalCard key={m.id} entity={m} onPress={() => openDetails(m.id)} />
            ))}
          </View>
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.sm, gap: spacing.xxs },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
  notice: { marginBottom: spacing.xxs },
});

export default NearbyHelpScreen;
