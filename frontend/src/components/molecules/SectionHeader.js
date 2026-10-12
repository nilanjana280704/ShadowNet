/**
 * SectionHeader — a titled section break with optional eyebrow label and a
 * trailing action.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.eyebrow] small uppercase label above the title
 * @param {string} [props.actionIcon] trailing IconButton icon name
 * @param {() => void} [props.onAction]
 * @param {string} [props.actionLabel] a11y label for the action
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { IconButton, Text } from '../atoms';

function SectionHeader({ title, eyebrow, actionIcon, onAction, actionLabel = 'Section action' }) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        {eyebrow ? (
          <Text variant="label" color="accent">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="headingS" color="primary">
          {title}
        </Text>
      </View>
      {actionIcon ? (
        <IconButton icon={actionIcon} onPress={onAction} accessibilityLabel={actionLabel} size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textCol: { gap: spacing.xxs, flexShrink: 1 },
});

export default SectionHeader;
