/**
 * InsightsCard — a compact glass panel of plain-language intelligence rows
 * ("Nearest shelter has capacity", "Network quality is excellent"). Feed it
 * insights from utils/insights.generateInsights; renders nothing when empty.
 *
 * @param {object} props
 * @param {Array<{id:string,icon:string,tone:string,text:string}>} props.insights
 * @param {string} [props.title='Insights']
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Icon, Text } from '../atoms';
import GlassCard from './GlassCard';

function InsightsCard({ insights = [], title = 'Insights' }) {
  if (insights.length === 0) return null;
  return (
    <GlassCard padding="md">
      <View style={styles.header}>
        <Icon name="ai" size="sm" color="accent" />
        <Text variant="label" color="accent">
          {title}
        </Text>
      </View>
      <View style={styles.rows}>
        {insights.map((insight) => (
          <View key={insight.id} style={styles.row}>
            <View style={styles.iconChip}>
              <Icon name={insight.icon} size="sm" color={insight.tone} />
            </View>
            <Text variant="bodySmall" color="primary" style={styles.text}>
              {insight.text}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  rows: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: radius.s,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});

export default InsightsCard;
