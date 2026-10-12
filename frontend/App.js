/**
 * ShadowNet — application root.
 * Wires global providers (Redux, SafeArea, GestureHandler) and mounts the
 * navigation shell. Screens live under src/features; the design system under
 * src/components and src/theme.
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { store } from './src/redux/store';
import { colors } from './src/theme';
import { RootNavigator } from './src/navigation';

function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

export default App;
