/**
 * SOSScreen — the one-tap SOS flow. Idle shows the SOS button; tapping it
 * runs a cancelable countdown; then it broadcasts and shows real, live
 * delivery status (never scripted/fabricated — see sosSlice.messageIds +
 * selectSosProgress below). Two taps from anywhere to get help out.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Button,
  EmergencyBanner,
  IconButton,
  ScreenWrapper,
  ScrollWrapper,
  Text,
} from '../../components';
import { MessageState } from '../../communication';
import { armSOS, cancelSOS, initCommunication, initEmergency, resolveSOS } from '../../redux';
import { CountdownTimer, LiveStatusPanel, SOSButton } from './components';
import { SosStatus, SOS_COUNTDOWN_SECONDS } from './constants';

const DELIVERED_STATES = new Set([MessageState.DELIVERED, MessageState.ACKNOWLEDGED]);

/** Real delivery progress for this SOS, derived from the actual message states. */
export function selectSosProgress(state) {
  const ids = state.sos.messageIds || [];
  const total = ids.length;
  const devicesReached = ids.filter((id) => DELIVERED_STATES.has(state.messageQueue.byId[id]?.state)).length;
  return { total, devicesReached, percent: total > 0 ? Math.round((devicesReached / total) * 100) : 0 };
}

function SOSScreen({ navigation }) {
  const dispatch = useDispatch();
  const sos = useSelector((s) => s.sos);
  const progress = useSelector(selectSosProgress);
  const [elapsedS, setElapsedS] = useState(0);

  useEffect(() => {
    dispatch(initEmergency());
    dispatch(initCommunication());
  }, [dispatch]);

  const isArming = sos.status === SosStatus.ARMING;
  const isActive = sos.status === SosStatus.ACTIVE;

  // Real elapsed time since activation — not an estimate, not scripted.
  useEffect(() => {
    if (!isActive || !sos.activatedAt) {
      setElapsedS(0);
      return;
    }
    const tick = () => setElapsedS(Math.max(0, Math.round((Date.now() - sos.activatedAt) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, sos.activatedAt]);

  return (
    <ScreenWrapper padded={!isArming}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Emergency SOS
        </Text>
      </View>

      {isArming ? (
        <View style={styles.countdownArea}>
          <CountdownTimer seconds={sos.countdown} total={SOS_COUNTDOWN_SECONDS} onCancel={() => dispatch(cancelSOS())} />
        </View>
      ) : isActive ? (
        <ScrollWrapper contentContainerStyle={styles.content}>
          <EmergencyBanner
            title="SOS is active"
            message="Your alert is being sent to everyone nearby."
          />
          <View style={styles.section}>
            <LiveStatusPanel progress={progress} elapsedS={elapsedS} signalLevel={3} />
          </View>
          <Button label="I'm safe now — resolve" variant="ghost" icon="success" size="lg" fullWidth onPress={() => dispatch(resolveSOS())} style={styles.resolve} />
        </ScrollWrapper>
      ) : (
        <View style={styles.idleArea}>
          <SOSButton onPress={() => dispatch(armSOS())} />
          <Text variant="body" color="secondary" align="center" style={styles.reassure}>
            One tap sends your location and an alert to everyone nearby — even without internet.
          </Text>
          <Button label="Just check in safe instead" variant="ghost" icon="success" onPress={() => navigation.navigate('SafeCheckIn')} />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, paddingHorizontal: spacing.lg },
  idleArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingHorizontal: spacing.lg },
  reassure: { maxWidth: 320 },
  countdownArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  content: { paddingBottom: spacing.xxl, gap: spacing.md },
  section: { gap: spacing.xs },
  resolve: { marginTop: spacing.md },
});

export default SOSScreen;
