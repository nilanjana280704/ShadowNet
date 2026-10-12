/**
 * BroadcastHistoryScreen — past emergency broadcasts with the real number of
 * nearby devices they were sent to, plus a composer (bottom sheet) to send a
 * new broadcast to everyone nearby.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  AlertCard,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  IconButton,
  ScreenWrapper,
  ScrollWrapper,
  Text,
  TextField,
} from '../../components';
import { sendBroadcast, showToast } from '../../redux';
import { useDisclosure } from '../../hooks';
import { relativeTime } from '../../utils/time';

const SEVERITIES = [
  { key: 'info', label: 'Info' },
  { key: 'warning', label: 'Warning' },
  { key: 'critical', label: 'Critical' },
];

function BroadcastHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.broadcast.history);
  const composer = useDisclosure(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');

  const submit = () => {
    if (!title.trim() || !message.trim()) return;
    dispatch(sendBroadcast({ title: title.trim(), message: message.trim(), severity, area: 'Nearby' }));
    dispatch(showToast({ message: 'Broadcast sent to everyone nearby', severity: 'warning' }));
    setTitle('');
    setMessage('');
    composer.close();
  };

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
          <Text variant="headingM" color="primary">
            Broadcasts
          </Text>
        </View>
        <IconButton icon="emergency" variant="glass" color="emergency" accessibilityLabel="New broadcast" onPress={composer.open} />
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <EmptyState icon="emergency" title="No broadcasts yet" message="Emergency broadcasts you send or receive will appear here." />
        ) : (
          history.map((b) => (
            <AlertCard
              key={b.id}
              severity={b.severity}
              title={b.title}
              message={`${b.message}\n${b.area} · ${b.sentTo > 0 ? `sent to ${b.sentTo} nearby device${b.sentTo === 1 ? '' : 's'}` : 'received nearby'}`}
              timestamp={relativeTime(b.at)}
            />
          ))
        )}
      </ScrollWrapper>

      <BottomSheet visible={composer.isOpen} title="New broadcast" onClose={composer.close}>
        <TextField label="Title" placeholder="e.g. Flash flood warning" value={title} onChangeText={setTitle} icon="emergency" />
        <TextField label="Message" placeholder="What should people nearby know?" value={message} onChangeText={setMessage} multiline />
        <View style={styles.severity}>
          {SEVERITIES.map((s) => (
            <Chip key={s.key} label={s.label} selected={severity === s.key} onPress={() => setSeverity(s.key)} />
          ))}
        </View>
        <Button label="Send broadcast" variant="danger" icon="emergency" fullWidth onPress={submit} style={styles.send} />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  content: { paddingBottom: spacing.xxl, paddingTop: spacing.md, gap: spacing.sm },
  severity: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  send: { marginTop: spacing.sm },
});

export default BroadcastHistoryScreen;
