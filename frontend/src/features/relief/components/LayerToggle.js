/**
 * LayerToggle — the floating map-layers control. A compact glass button that
 * expands into a panel of toggleable layers (with a "Soon" badge on
 * placeholders like Traffic).
 *
 * @param {object} props
 * @param {Record<string, boolean>} props.layers
 * @param {(key:string) => void} props.onToggle
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { Badge, Icon, IconButton, Text } from '../../../components';
import { MAP_LAYERS } from '../constants';

function LayerToggle({ layers, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      {open ? (
        <View style={styles.panel}>
          <Text variant="label" color="muted" style={styles.panelTitle}>
            Map layers
          </Text>
          {MAP_LAYERS.map((layer) => {
            const on = Boolean(layers[layer.key]);
            return (
              <Pressable
                key={layer.key}
                accessibilityRole="switch"
                accessibilityState={{ checked: on, disabled: layer.disabled }}
                accessibilityLabel={`${layer.label} layer`}
                disabled={layer.disabled}
                onPress={() => onToggle(layer.key)}
                style={[styles.row, layer.disabled && styles.rowDisabled]}
              >
                <Icon name={layer.icon} size="sm" color={on && !layer.disabled ? 'accent' : 'muted'} />
                <Text variant="bodySmall" color={on && !layer.disabled ? 'primary' : 'muted'} style={styles.rowLabel}>
                  {layer.label}
                </Text>
                {layer.disabled ? (
                  <Badge label="Soon" tone="neutral" />
                ) : (
                  <View style={[styles.pip, on ? styles.pipOn : styles.pipOff]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <IconButton
        icon="layers"
        variant="glass"
        color={open ? 'accent' : 'secondary'}
        accessibilityLabel={open ? 'Close map layers' : 'Open map layers'}
        onPress={() => setOpen((v) => !v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-end', gap: spacing.sm },
  panel: {
    minWidth: 190,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...shadows.floating,
  },
  panelTitle: { marginBottom: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  rowDisabled: { opacity: 0.6 },
  rowLabel: { flex: 1 },
  pip: { width: 10, height: 10, borderRadius: radius.circle },
  pipOn: { backgroundColor: colors.primary },
  pipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
});

export default LayerToggle;
