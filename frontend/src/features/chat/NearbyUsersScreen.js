/**
 * NearbyUsersScreen — live discovery from the communication engine, reused for
 * messaging. Scan to find people/services, then message or connect. Integrates
 * directly with the M5 engine via useCommunication + NearbyDevicesCard.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import { IconButton, NearbyDevicesCard, NetworkBanner, ScreenWrapper, ScrollWrapper, Text } from '../../components';
import { TransportFactory } from '../../communication';
import { startConversationWith } from '../../redux';
import { useCommunication } from '../../hooks';

function NearbyUsersScreen({ navigation }) {
  const dispatch = useDispatch();
  const { devices, connections, discovering, networkState, initialize, toggleScan, connect } = useCommunication();
  const identities = useSelector((s) => s.verifiedPeers.byDeviceId);
  // Real device discovery only — never present the mock simulator's
  // fictional devices as if they were real nearby people.
  const isRealDiscovery = TransportFactory.isNative();
  const visibleDevices = isRealDiscovery ? devices : [];

  useEffect(() => {
    initialize();
  }, [initialize]);

  const message = (deviceId) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;
    // Never label a conversation with the raw device/radio name — only a
    // verified identity, or a neutral placeholder.
    const name = identities[device.id]?.displayName || 'Nearby device';
    const id = dispatch(startConversationWith({ id: device.id, deviceId: device.id, name, level: device.level }));
    navigation.navigate('Conversation', { conversationId: id });
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Nearby users
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <NetworkBanner
            online={networkState.online}
            activeTransport={networkState.activeTransport}
            coverageM={networkState.coverageM}
            deviceCount={networkState.deviceCount}
          />
        </View>
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
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingBottom: spacing.xxl },
  section: { marginTop: spacing.md },
  notice: { marginBottom: spacing.xxs },
});

export default NearbyUsersScreen;
