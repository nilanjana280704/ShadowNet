/**
 * SplashScreen — the first frame. An animated ShadowNet mark, the tagline, and
 * a minimal loading indicator while the app restores the session. Shown by
 * RootNavigator while auth status is 'restoring'.
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, glow } from '../../theme';
import { useFadeIn, usePulse, useScaleIn } from '../../animations';
import { Icon, Loader, Text } from '../../components';
import { strings } from '../../localization';

function SplashScreen() {
  const logoIn = useScaleIn({ from: 0.8 });
  const pulse = usePulse();
  const textIn = useFadeIn({ delay: 200 });

  return (
    <View style={styles.screen}>
      <View style={styles.center}>
        <Animated.View style={[styles.logo, logoIn]}>
          <Animated.View style={[styles.halo, pulse]} />
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringInner]} />
          <View style={[styles.core, glow(colors.glow.primary, 24)]}>
            <Icon name="radar" size="xxl" color="inverse" strokeWidth={1.6} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, textIn]}>
          <Text variant="displayL" color="primary" style={styles.name}>
            {strings.app.name}
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.tagline}>
            {strings.app.tagline}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Loader size="small" color="accent" label={strings.session.securing} />
      </View>
    </View>
  );
}

const LOGO = 160;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  logo: { width: LOGO, height: LOGO, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: LOGO,
    height: LOGO,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
  ring: { position: 'absolute', borderRadius: radius.circle, borderWidth: 1, borderColor: colors.border },
  ringOuter: { width: LOGO, height: LOGO },
  ringInner: { width: LOGO * 0.66, height: LOGO * 0.66, borderColor: colors.borderStrong },
  core: {
    width: 88,
    height: 88,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: spacing.sm },
  name: { letterSpacing: 3 },
  tagline: { maxWidth: 300 },
  footer: { paddingBottom: spacing.xxl },
});

export default SplashScreen;
