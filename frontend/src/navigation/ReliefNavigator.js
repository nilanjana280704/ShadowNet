/**
 * ReliefNavigator — the Relief Network stack behind the Resources tab. The
 * full-screen Resource Map is the root; every category (safe zones, shelters,
 * medical, food & water, volunteers, relief centers, danger zones) is the same
 * shared list screen configured per route; details is the leaf.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ResourceMapScreen from '../features/relief/ResourceMapScreen';
import ResourceListScreen from '../features/relief/ResourceListScreen';
import ResourceDetailsScreen from '../features/relief/ResourceDetailsScreen';

const Stack = createNativeStackNavigator();

function ReliefNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ResourceMap" component={ResourceMapScreen} />
      <Stack.Screen name="SafeZones" component={ResourceListScreen} initialParams={{ category: 'safe' }} />
      <Stack.Screen name="Shelters" component={ResourceListScreen} initialParams={{ category: 'shelter' }} />
      <Stack.Screen name="MedicalAssistance" component={ResourceListScreen} initialParams={{ category: 'medical' }} />
      <Stack.Screen name="FoodWater" component={ResourceListScreen} initialParams={{ category: 'foodwater' }} />
      <Stack.Screen name="VolunteerNetwork" component={ResourceListScreen} initialParams={{ category: 'volunteer' }} />
      <Stack.Screen name="ReliefCenters" component={ResourceListScreen} initialParams={{ category: 'relief' }} />
      <Stack.Screen name="DangerZones" component={ResourceListScreen} initialParams={{ category: 'danger' }} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
    </Stack.Navigator>
  );
}

export default ReliefNavigator;
