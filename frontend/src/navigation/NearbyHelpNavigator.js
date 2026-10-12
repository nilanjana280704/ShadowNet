/**
 * NearbyHelpNavigator — the stack behind the Nearby Help tab. Root is a
 * plain-language "who can help me" screen (nearby people/devices plus the
 * closest volunteers/shelters/medical); category lists and details reuse the
 * same relief-network screens the Safety tab's map uses.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NearbyHelpScreen from '../features/nearbyhelp/NearbyHelpScreen';
import ResourceListScreen from '../features/relief/ResourceListScreen';
import ResourceDetailsScreen from '../features/relief/ResourceDetailsScreen';

const Stack = createNativeStackNavigator();

function NearbyHelpNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="NearbyHelpMain" component={NearbyHelpScreen} />
      <Stack.Screen name="Shelters" component={ResourceListScreen} initialParams={{ category: 'shelter' }} />
      <Stack.Screen name="MedicalAssistance" component={ResourceListScreen} initialParams={{ category: 'medical' }} />
      <Stack.Screen name="VolunteerNetwork" component={ResourceListScreen} initialParams={{ category: 'volunteer' }} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
    </Stack.Navigator>
  );
}

export default NearbyHelpNavigator;
