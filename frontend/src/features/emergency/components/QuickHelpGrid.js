/**
 * QuickHelpGrid — a 2-column grid of large quick-help tiles (Medical, Police,
 * Fire, Volunteer, Shelter, Food, Water, Transport).
 *
 * @param {object} props
 * @param {Array<{key,label,icon,tone}>} props.items
 * @param {(key:string) => void} props.onSelect
 * @param {string} [props.selectedKey]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import EmergencyTile from './EmergencyTile';

function chunk(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function QuickHelpGrid({ items, onSelect, selectedKey }) {
  return (
    <View style={styles.grid}>
      {chunk(items, 2).map((row, i) => (
        <View key={`row-${i}`} style={styles.row}>
          {row.map((item) => (
            <EmergencyTile
              key={item.key}
              label={item.label}
              icon={item.icon}
              tone={item.tone}
              selected={selectedKey === item.key}
              onPress={() => onSelect(item.key)}
            />
          ))}
          {row.length < 2 ? <View style={styles.spacer} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  spacer: { flex: 1 },
});

export default QuickHelpGrid;
