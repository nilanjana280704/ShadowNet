/**
 * NetworkScreen — the technical showcase. A premium visualization of the mesh
 * beneath the app: live graph, communication layers, transmission stats,
 * coverage, health, and diagnostics. Composition only; data is mock.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  AlertCard,
  BatteryWidget,
  Card,
  CommunicationStatus,
  CoverageRadiusWidget,
  Icon,
  LatencyWidget,
  ListItem,
  MetricCard,
  NearbyDevicesCard,
  NetworkBanner,
  NetworkHealthWidget,
  ScreenWrapper,
  ScrollWrapper,
  SectionHeader,
  SignalWidget,
  Text,
} from '../../components';
import { showToast } from '../../redux';
import { useCommunication } from '../../hooks';
import { batteryRecommendation } from '../../utils';
import { SosStatus } from '../emergency/constants';
import CommLayerCard from './components/CommLayerCard';
import NetworkGraphPanel from './components/NetworkGraphPanel';
import {
  commLayers,
  diagnostics,
  meshLinks,
  meshNodes,
  networkHealth,
  transmission,
} from './mockData';

const DIAG_ICON = { success: 'success', warning: 'warning', error: 'error' };

function Cell({ children }) {
  return <View style={styles.cell}>{children}</View>;
}

function NetworkScreen() {
  const dispatch = useDispatch();
  const {
    discovering,
    devices,
    connections,
    networkState,
    initialize,
    toggleScan,
    connect,
    send,
  } = useCommunication();
  const sosActive = useSelector((s) => s.sos.status === SosStatus.ACTIVE);

  // Smart battery mode — rule-based recommendation (see utils/insights).
  const batteryAdvice = useMemo(
    () =>
      batteryRecommendation({
        batteryLevel: networkHealth.battery,
        healthGrade: networkState.health?.grade,
        sosActive,
      }),
    [networkState.health, sosActive]
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const onMessage = (deviceId) => {
    send(deviceId, 'Test message from ShadowNet');
    dispatch(showToast({ message: 'Message queued for delivery', severity: 'info' }));
  };

  return (
    <ScreenWrapper>
      <ScrollWrapper contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headingL" color="primary">
            Network
          </Text>
          <Text variant="body" color="secondary">
            How your local network is doing right now.
          </Text>
        </View>

        <View style={styles.section}>
          <NetworkBanner
            online={networkState.online}
            activeTransport={networkState.activeTransport}
            coverageM={networkState.coverageM}
            deviceCount={networkState.deviceCount}
            health={networkState.health}
          />
        </View>

        <View style={styles.section}>
          <NetworkGraphPanel nodes={meshNodes} links={meshLinks} />
        </View>

        <View style={styles.section}>
          <NearbyDevicesCard
            devices={devices}
            connections={connections}
            discovering={discovering}
            onToggleScan={toggleScan}
            onConnect={connect}
            onMessage={onMessage}
          />
        </View>

        <View style={styles.section}>
          <CommunicationStatus
            transports={networkState.transports}
            connectedCount={networkState.connectedCount}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Communication layers" />
          <View style={styles.stack}>
            {commLayers.map((l) => (
              <CommLayerCard
                key={l.key}
                name={l.name}
                icon={l.icon}
                status={l.status}
                signalLevel={l.signalLevel}
                latency={l.latency}
                range={l.range}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Transmission" />
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <Cell>
                <MetricCard label="Success rate" value={transmission.successRate} unit="%" icon="activity" tone="success" />
              </Cell>
              <Cell>
                <LatencyWidget latencyMs={transmission.latencyMs} trend={-6} />
              </Cell>
            </View>
            <View style={styles.gridRow}>
              <Cell>
                <MetricCard label="Hop count" value={transmission.hopCount} icon="route" tone="primary" />
              </Cell>
              <Cell>
                <MetricCard label="Packets sent" value={transmission.packets} icon="send" tone="telemetry" />
              </Cell>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Coverage & health" />
          <View style={styles.stack}>
            {batteryAdvice ? (
              <AlertCard severity={batteryAdvice.severity} title={batteryAdvice.title} message={batteryAdvice.message} />
            ) : null}
            <NetworkHealthWidget health={networkHealth.meshHealth} nodeCount={networkHealth.nodeCount} />
            <CoverageRadiusWidget radiusKm={networkHealth.coverageKm} nodesInRange={networkHealth.nodeCount} />
            <View style={styles.gridRow}>
              <Cell>
                <BatteryWidget level={networkHealth.battery} charging={networkHealth.charging} />
              </Cell>
              <Cell>
                <SignalWidget level={4} rssi={-58} />
              </Cell>
            </View>
            <View style={styles.gridRow}>
              <Cell>
                <MetricCard label="Packet loss" value={networkHealth.packetLoss} unit="%" icon="activity" tone="warning" />
              </Cell>
              <Cell>
                <MetricCard label="Node density" value={networkHealth.nodeDensity} icon="nodes" tone="secondary" />
              </Cell>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Diagnostics" />
          <Card variant="surface" padding="sm">
            {diagnostics.map((d) => (
              <ListItem
                key={d.id}
                icon={DIAG_ICON[d.status]}
                iconColor={d.status}
                title={d.label}
                trailing={
                  <View style={styles.diagValue}>
                    <Text variant="telemetry" color={d.status === 'warning' ? 'warning' : 'secondary'}>
                      {d.value}
                    </Text>
                    <Icon name={d.status === 'success' ? 'success' : 'warning'} size="sm" color={d.status} />
                  </View>
                }
              />
            ))}
          </Card>
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  header: { gap: spacing.xxs, marginBottom: spacing.md },
  section: { marginTop: spacing.xl },
  stack: { gap: spacing.sm },
  grid: { gap: spacing.sm },
  gridRow: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
  diagValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export default NetworkScreen;
