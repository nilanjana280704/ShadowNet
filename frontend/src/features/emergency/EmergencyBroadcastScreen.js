/**
 * EmergencyBroadcastScreen — request help from everyone nearby. Tap a preset
 * need (water, food, medicine, shelter, rescue, blood, transport, doctor) to
 * send instantly, or write a custom request.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Button,
  IconButton,
  ScreenWrapper,
  ScrollWrapper,
  SectionHeader,
  Text,
  TextField,
} from '../../components';
import { initEmergency, sendEmergencyBroadcast } from '../../redux';
import { BroadcastCard, EmergencyTimeline } from './components';
import { BROADCAST_NEEDS } from './constants';

function chunk(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function EmergencyBroadcastScreen({ navigation }) {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.broadcast.history);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    dispatch(initEmergency());
  }, [dispatch]);

  const sendCustom = () => {
    if (!custom.trim()) return;
    dispatch(sendEmergencyBroadcast({ title: 'Custom request', message: custom.trim(), tone: 'warning' }));
    setCustom('');
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Emergency broadcast
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        <Text variant="body" color="secondary">
          Tap what you need — it goes out to everyone nearby immediately.
        </Text>

        <View style={styles.grid}>
          {chunk(BROADCAST_NEEDS, 2).map((row, i) => (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((need) => (
                <BroadcastCard key={need.key} need={need} onPress={(key) => dispatch(sendEmergencyBroadcast(key))} />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Custom request" />
          <TextField placeholder="Describe what you need" value={custom} onChangeText={setCustom} icon="emergency" multiline />
          <Button label="Send broadcast" variant="danger" icon="emergency" fullWidth onPress={sendCustom} style={styles.send} />
        </View>

        {history.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Recent broadcasts" />
            <EmergencyTimeline events={history.map((b) => ({ id: b.id, kind: 'broadcast', title: b.title, detail: b.sentTo > 0 ? `${b.area} · sent to ${b.sentTo} nearby device${b.sentTo === 1 ? '' : 's'}` : `${b.area} · received nearby`, at: b.at }))} />
          </View>
        ) : null}
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  section: { gap: spacing.sm, marginTop: spacing.md },
  send: { marginTop: spacing.sm },
});

export default EmergencyBroadcastScreen;
