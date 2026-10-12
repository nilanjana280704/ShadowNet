/**
 * NetworkGraphPanel — the live mesh graph inside a titled glass panel with a
 * legend. Wraps the reusable NetworkGraph organism for the Network screen.
 *
 * @param {object} props
 * @param {Array} props.nodes graph nodes (see NetworkGraph)
 * @param {Array} [props.links] inter-node links
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { GlassCard, NetworkGraph, Text } from '../../../components';

const LEGEND = [
  { label: 'You', color: colors.primary },
  { label: 'Strong', color: colors.secondary },
  { label: 'Fair', color: colors.warning },
  { label: 'Weak', color: colors.error },
];

function NetworkGraphPanel({ nodes, links }) {
  return (
    <GlassCard padding="md">
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Live Mesh
        </Text>
        <Text variant="caption" color="muted">
          Updating in real time
        </Text>
      </View>
      <View style={styles.graph}>
        <NetworkGraph nodes={nodes} links={links} centerLabel="You" />
      </View>
      <View style={styles.legend}>
        {LEGEND.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text variant="caption" color="secondary">
              {l.label}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  graph: { height: 300, marginVertical: spacing.sm },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: radius.circle },
});

export default NetworkGraphPanel;
