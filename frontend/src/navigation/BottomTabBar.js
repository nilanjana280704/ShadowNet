/**
 * BottomTabBar — the app's custom bottom navigation. Replaces the default React
 * Navigation tab bar with a tactical glass bar: outline icons, an active accent
 * glow, and safe-area padding. Large tap targets for one-handed use.
 *
 * Receives the standard { state, descriptors, navigation } from
 * @react-navigation/bottom-tabs via `tabBar`.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '../theme';
import { Icon, Text } from '../components';

// Route name -> semantic icon. Route names are the source of truth.
const TAB_ICON = {
  Home: 'home',
  Messages: 'message',
  NearbyHelp: 'users',
  Safety: 'shield',
};

// Profile is reachable from the Home header, not a permanent tab — hidden
// here since this custom tab bar renders every route unless filtered.
const HIDDEN_TABS = ['Profile'];

function BottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => !HIDDEN_TABS.includes(route.name));

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || spacing.sm }]}>
      {visibleRoutes.map((route) => {
        const index = state.routes.indexOf(route);
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const focused = state.index === index;
        const tint = focused ? 'accent' : 'muted';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={TAB_ICON[route.name] || 'circle'} size="md" color={tint} />
            </View>
            <Text variant="caption" color={tint} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.large,
  },
  tab: { flex: 1, alignItems: 'center', gap: spacing.xxs, paddingVertical: spacing.xxs },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.overlay.primary16 },
});

export default BottomTabBar;
