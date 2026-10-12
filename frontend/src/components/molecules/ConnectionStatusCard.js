/**
 * ConnectionStatusCard — the home screen's reassurance panel. Uses plain
 * language ("You're connected") and three simple stats. No technical jargon;
 * the engineering detail lives on the Network screen.
 *
 * @param {object} props
 * @param {boolean} [props.connected=true]
 * @param {number} [props.nearbyDevices=0] people/devices reachable nearby
 * @param {string} [props.coverage] friendly coverage text (e.g. '2.4 km around you')
 * @param {'Strong'|'Good'|'Weak'} [props.signal='Strong']
 * @param {boolean} [props.ready=true] communication ready
 * @param {() => void} [props.onPress] open the Network screen for details
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AnimatedCounter, Divider, Icon, StatusIndicator, Text } from '../atoms';
import { GradientContainer } from '../layout';

function Stat({ icon, value, label, tone = 'accent' }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size="sm" color={tone} />
      <View>
        {typeof value === 'number' ? (
          <AnimatedCounter value={value} variant="headingS" color="primary" />
        ) : (
          <Text variant="headingS" color="primary">
            {value}
          </Text>
        )}
        <Text variant="caption" color="muted">
          {label}
        </Text>
      </View>
    </View>
  );
}

function ConnectionStatusCard({
  connected = true,
  nearbyDevices = 0,
  coverage = 'Nearby',
  signal = 'Strong',
  ready = true,
  onPress,
}) {
  const Container = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} style={styles.wrap}>
      <GradientContainer gradient="surface" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headline}>
            <StatusIndicator status={connected ? 'nominal' : 'offline'} live={connected} size={12} />
            <Text variant="headingM" color="primary">
              {connected ? "You're connected" : 'Reconnecting…'}
            </Text>
          </View>
          {onPress ? <Icon name="chevronRight" size="md" color="muted" /> : null}
        </View>

        <Text variant="bodySmall" color="secondary" style={styles.reassure}>
          {connected
            ? 'You can chat and send an SOS even without internet.'
            : "Hang tight — we're finding people near you."}
        </Text>

        <Divider spacing={spacing.md} />

        <View style={styles.stats}>
          <Stat icon="users" value={nearbyDevices} label="People nearby" tone="accent" />
          <Stat icon="pin" value={coverage} label="Coverage" tone="info" />
          <Stat icon="signal" value={signal} label="Signal" tone={signal === 'Weak' ? 'warning' : 'success'} />
        </View>

        {ready ? (
          <View style={styles.ready}>
            <Icon name="success" size="sm" color="success" />
            <Text variant="bodySmall" color="success">
              Communication ready
            </Text>
          </View>
        ) : null}
      </GradientContainer>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  reassure: { marginTop: spacing.xs },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  ready: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
});

export default ConnectionStatusCard;
