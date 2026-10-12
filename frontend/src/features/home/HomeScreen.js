/**
 * HomeScreen — the consumer home. Friendly, calm, and immediately answers:
 * am I connected, can I send an SOS, can I reach people, where is help nearby.
 * Composition only — connection status and insights are driven by the live
 * engine health score and relief data; the rest is mock content.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  ConnectionStatusCard,
  GreetingHeader,
  InsightsCard,
  PrimaryActionCard,
  ScreenWrapper,
  ScrollWrapper,
  SecondaryActionTile,
  SectionHeader,
} from '../../components';
import { initCommunication, initRelief } from '../../redux';
import { generateInsights, resolveDisplayName } from '../../utils';
import { primaryActions, secondaryActions, todayLabel, unreadCount } from './mockData';

/** Split an array into rows of `size` for grid layout. */
function chunk(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

/** Plain-language coverage distance, or '—' when there's genuinely nothing to report. */
function formatCoverage(m) {
  if (!m) return '—';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const networkState = useSelector((s) => s.networkState);
  const shelters = useSelector((s) => s.shelter.ids.map((id) => s.shelter.byId[id]));
  const medical = useSelector((s) => s.medical.ids.map((id) => s.medical.byId[id]));
  const volunteers = useSelector((s) => s.volunteer.ids.map((id) => s.volunteer.byId[id]));
  const queuedMessages = useSelector((s) => s.queue.count);
  const authUser = useSelector((s) => s.auth.user);
  const profile = useSelector((s) => s.profile.data);
  const displayName = resolveDisplayName({ profile, authUser });

  useEffect(() => {
    dispatch(initCommunication());
    dispatch(initRelief());
  }, [dispatch]);

  // Connection status is entirely real — no fabricated fallback. If the
  // engine hasn't confirmed a connection, this honestly says so rather than
  // defaulting to "connected".
  const liveStatus = useMemo(
    () => ({
      connected: networkState.online,
      nearbyDevices: networkState.deviceCount || 0,
      coverage: formatCoverage(networkState.coverageM),
      signal: networkState.online ? networkState.health.label : 'No signal',
      ready: networkState.online,
    }),
    [networkState]
  );

  const insights = useMemo(
    () =>
      generateInsights({
        shelters,
        medical,
        volunteers,
        health: networkState.online ? networkState.health : null,
        queuedMessages,
      }),
    [shelters, medical, volunteers, networkState, queuedMessages]
  );

  const handlePrimary = (key) => {
    if (key === 'message') navigation?.navigate('Messages');
    else if (key === 'sos') navigation?.navigate('SOS');
    else if (key === 'nearbyHelp') navigation?.navigate('NearbyHelp');
    else if (key === 'safety') navigation?.navigate('Safety');
  };
  const handleSecondary = (key) => {
    if (key === 'requestHelp') navigation?.navigate('EmergencyCenter');
    else if (key === 'broadcast') navigation?.navigate('EmergencyBroadcast');
    else if (key === 'contacts') navigation?.navigate('EmergencyContacts');
    else if (key === 'checkin') navigation?.navigate('SafeCheckIn');
    else if (key === 'missing') navigation?.navigate('Safety');
    else if (key === 'updates') navigation?.navigate('EmergencyHistory');
  };

  const [sos, ...otherPrimary] = primaryActions;
  const secondaryRows = chunk(secondaryActions, 2);

  return (
    <ScreenWrapper animatedBackground={false}>
      <ScrollWrapper contentContainerStyle={styles.content}>
        <GreetingHeader
          name={displayName}
          date={todayLabel()}
          unreadCount={unreadCount}
          onSettings={() => navigation?.navigate('Profile')}
          onProfile={() => navigation?.navigate('Profile')}
        />

        <View style={styles.section}>
          <ConnectionStatusCard {...liveStatus} onPress={() => navigation?.navigate('NearbyHelp')} />
        </View>

        {insights.length > 0 ? (
          <View style={styles.section}>
            <InsightsCard insights={insights} title="ShadowNet Intelligence" />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="What do you need?" />
          <View style={styles.stack}>
            <PrimaryActionCard
              title={sos.title}
              subtitle={sos.subtitle}
              icon={sos.icon}
              variant="danger"
              onPress={() => handlePrimary(sos.key)}
            />
            {otherPrimary.map((a) => (
              <PrimaryActionCard
                key={a.key}
                title={a.title}
                subtitle={a.subtitle}
                icon={a.icon}
                tone={a.tone}
                onPress={() => handlePrimary(a.key)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="More help" />
          <View style={styles.grid}>
            {secondaryRows.map((row, i) => (
              <View key={`row-${i}`} style={styles.gridRow}>
                {row.map((a) => (
                  <SecondaryActionTile
                    key={a.key}
                    title={a.title}
                    icon={a.icon}
                    tone={a.tone}
                    onPress={() => handleSecondary(a.key)}
                  />
                ))}
                {row.length < 2 ? <View style={styles.gridSpacer} /> : null}
              </View>
            ))}
          </View>
        </View>

      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  section: { marginTop: spacing.xl },
  stack: { gap: spacing.sm },
  grid: { gap: spacing.sm },
  gridRow: { flexDirection: 'row', gap: spacing.sm },
  gridSpacer: { flex: 1 },
});

export default HomeScreen;
