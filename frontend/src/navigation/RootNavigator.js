/**
 * RootNavigator — the top-level flow gate and protected-route boundary.
 *
 * On launch it bootstraps auth (restore session, load profile, onboarding flag),
 * then renders exactly one destination based on state:
 *   restoring        -> SplashScreen
 *   not onboarded    -> OnboardingScreen
 *   unauthenticated  -> AuthNavigator
 *   no profile yet   -> ProfileSetupScreen
 *   ready            -> MainNavigator (tabs)
 *
 * Auth screens are simply absent from the tree once authenticated, so there are
 * no protected routes to guard imperatively.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../theme';
import { bootstrapApp } from '../redux';
import { OnboardingScreen, ProfileSetupScreen, SplashScreen } from '../features/authentication';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import UiHost from './UiHost';

const RootStack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundAlt,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
};

function RootNavigator() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const onboarded = useSelector((s) => s.session.onboarded);
  const profileComplete = useSelector((s) => s.profile.complete);

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

  let content;
  if (status === 'restoring') {
    content = <SplashScreen />;
  } else if (!onboarded) {
    content = <OnboardingScreen />;
  } else {
    content = (
      <NavigationContainer theme={navTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {status === 'authenticated' ? (
            profileComplete ? (
              <RootStack.Screen name="Main" component={MainNavigator} />
            ) : (
              <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            )
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <View style={styles.flex}>
      {content}
      <UiHost />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default RootNavigator;
