/**
 * ListItem — a standard row: optional leading icon/avatar, title + subtitle,
 * and a trailing value/chevron/custom node.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.icon] leading icon name
 * @param {string} [props.iconColor='secondary']
 * @param {React.ReactNode} [props.trailing] custom trailing content
 * @param {string} [props.value] simple trailing text value
 * @param {boolean} [props.chevron=false] show a forward chevron
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Icon, Text } from '../atoms';

function ListItem({
  title,
  subtitle,
  icon,
  iconColor = 'secondary',
  trailing,
  value,
  chevron = false,
  onPress,
}) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, onPress && pressed && styles.pressed]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size="md" color={iconColor} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="title" color="primary" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        trailing
      ) : value ? (
        <Text variant="telemetry" color="secondary">
          {value}
        </Text>
      ) : null}
      {chevron ? <Icon name="chevronRight" size="sm" color="muted" /> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.m,
  },
  pressed: { backgroundColor: colors.overlay.white04 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  body: { flex: 1, gap: 2 },
});

export default ListItem;
