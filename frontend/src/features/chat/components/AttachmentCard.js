/**
 * AttachmentCard — renders a structured attachment (location, resource, contact,
 * shelter, medical camp, volunteer) inside a message or the attachment picker.
 *
 * @param {object} props
 * @param {object} props.attachment { type, title, subtitle, coords }
 * @param {boolean} [props.onLight] render on an accent bubble (self message)
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, Text } from '../../../components';
import { ATTACHMENT_META } from '../constants';

function AttachmentCard({ attachment, onLight = false, onPress }) {
  if (!attachment) return null;
  const meta = ATTACHMENT_META[attachment.type] || ATTACHMENT_META.location;
  const Container = onPress ? Pressable : View;

  return (
    <Container onPress={onPress} style={[styles.card, onLight ? styles.onLight : styles.onDark]}>
      <View style={[styles.iconChip, onLight ? styles.chipLight : styles.chipDark]}>
        <Icon name={meta.icon} size="md" color={onLight ? 'inverse' : meta.tone} />
      </View>
      <View style={styles.body}>
        <Text variant="caption" color={onLight ? 'inverse' : 'muted'}>
          {meta.label}
        </Text>
        <Text variant="subtitle" color={onLight ? 'inverse' : 'primary'} numberOfLines={1}>
          {attachment.title}
        </Text>
        {attachment.subtitle ? (
          <Text variant="caption" color={onLight ? 'inverse' : 'secondary'} numberOfLines={1}>
            {attachment.subtitle}
          </Text>
        ) : null}
      </View>
      {attachment.type === 'location' ? (
        <Icon name="navigation" size="sm" color={onLight ? 'inverse' : 'secondary'} />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.m,
    borderWidth: 1,
  },
  onDark: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
  onLight: { backgroundColor: colors.overlay.white12, borderColor: colors.overlay.white16 },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDark: { backgroundColor: colors.surface },
  chipLight: { backgroundColor: colors.overlay.white16 },
  body: { flex: 1, gap: 1 },
});

export default AttachmentCard;
