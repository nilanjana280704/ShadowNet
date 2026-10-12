/**
 * Milestone 1 wiring checks — verifies core libraries initialize,
 * without creating any app screens.
 *
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { store } from '../src/redux/store';

test('Redux store is configured', () => {
  const state = store.getState();
  expect(state.auth.status).toBe('restoring');
  expect(state.profile.complete).toBe(false);
  expect(state.session.onboarded).toBe(false);
  expect(state.ui.overlayVisible).toBe(false);
});

test('React Navigation initializes', async () => {
  const Stack = createNativeStackNavigator();
  const Placeholder = () => <Text>placeholder</Text>;

  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Placeholder" component={Placeholder} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
  });
});
