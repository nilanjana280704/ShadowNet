/**
 * HomeNavigator — the stack behind the Home tab. Root is the redesigned Home
 * screen (the app's emergency center: SOS, status, and quick actions); SOS
 * and the rest of Crisis Mode's secondary screens (broadcast, safe check-in,
 * contacts, history, the detailed request-help hub) are one tap deeper.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../features/home/HomeScreen';
import SOSScreen from '../features/emergency/SOSScreen';
import EmergencyCenterScreen from '../features/emergency/EmergencyCenterScreen';
import EmergencyBroadcastScreen from '../features/emergency/EmergencyBroadcastScreen';
import SafeCheckInScreen from '../features/emergency/SafeCheckInScreen';
import EmergencyContactsScreen from '../features/emergency/EmergencyContactsScreen';
import EmergencyHistoryScreen from '../features/emergency/EmergencyHistoryScreen';

const Stack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="EmergencyCenter" component={EmergencyCenterScreen} />
      <Stack.Screen name="EmergencyBroadcast" component={EmergencyBroadcastScreen} />
      <Stack.Screen name="SafeCheckIn" component={SafeCheckInScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="EmergencyHistory" component={EmergencyHistoryScreen} />
    </Stack.Navigator>
  );
}

export default HomeNavigator;
