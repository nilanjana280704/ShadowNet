/**
 * MapPreviewCard — the docked selection preview at the bottom of the map: a
 * compact ResourceCard for the selected entity with Details and Route actions.
 * Slides in when a marker is selected. Non-modal so the map stays visible.
 *
 * @param {object} props
 * @param {object} props.entity selected entity
 * @param {() => void} props.onDetails
 * @param {() => void} props.onRoute
 * @param {() => void} props.onClose
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { useSlideIn } from '../../../animations';
import { Button, IconButton } from '../../../components';
import { ReliefCategory } from '../constants';
import { ResourceService } from '../services';
import ResourceCard from './ResourceCard';

const NO_ROUTE = [ReliefCategory.DANGER, ReliefCategory.SOS, ReliefCategory.NODE];

function MapPreviewCard({ entity, onDetails, onRoute, onClose }) {
  const anim = useSlideIn({ from: 'bottom', distance: 32 });
  const routable = !NO_ROUTE.includes(entity.category);

  return (
    <Animated.View style={[styles.dock, anim]}>
      <View style={styles.closeRow}>
        <IconButton icon="close" size="sm" variant="glass" color="muted" accessibilityLabel="Close preview" onPress={onClose} />
      </View>
      <ResourceCard entity={entity} stats={ResourceService.statsFor(entity)} compact />
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Details" variant="ghost" icon="info" fullWidth onPress={onDetails} />
        </View>
        {routable ? (
          <View style={styles.action}>
            <Button label="Route" variant="primary" icon="route" fullWidth onPress={onRoute} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundAlt,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.floating,
  },
  closeRow: { position: 'absolute', right: spacing.sm, top: spacing.sm, zIndex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});

export default MapPreviewCard;
