/**
 * SOSStatusWidget — emergency posture panel. Shows whether SOS is armed and
 * offers the arm/disarm action. Glows red when active.
 *
 * @param {object} props
 * @param {boolean} props.armed SOS currently transmitting
 * @param {number} [props.acknowledgements] acks received while armed
 * @param {() => void} props.onToggle
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { Button, Icon, StatusIndicator, Text } from '../atoms';
import { Card } from '../molecules';

function SOSStatusWidget({ armed, acknowledgements = 0, onToggle }) {
  return (
    <Card variant="surface" glowColor={armed ? colors.glow.sos : undefined}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="sos" size="md" color={armed ? 'sos' : 'secondary'} />
          <Text variant="title" color="primary">
            SOS Beacon
          </Text>
        </View>
        <StatusIndicator
          status={armed ? 'critical' : 'offline'}
          label={armed ? 'TRANSMITTING' : 'STANDBY'}
          live={armed}
        />
      </View>

      {armed ? (
        <Text variant="bodySmall" color="secondary" style={styles.ack}>
          {acknowledgements} acknowledgement{acknowledgements === 1 ? '' : 's'} received
        </Text>
      ) : null}

      <Button
        label={armed ? 'Disarm SOS' : 'Arm SOS'}
        variant={armed ? 'danger' : 'ghost'}
        icon="sos"
        fullWidth
        onPress={onToggle}
        style={styles.action}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ack: { marginTop: spacing.sm },
  action: { marginTop: spacing.md },
});

export default SOSStatusWidget;
