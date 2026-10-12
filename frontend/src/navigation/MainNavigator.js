/**
 * MainNavigator — the authenticated app: four clear destinations (Home,
 * Messages, Nearby Help, Safety) with the custom tab bar. Mounted by
 * RootNavigator once the user is authenticated and the profile is complete.
 * Profile is reachable via the Home header, not a tab, to keep navigation
 * minimal. The technical Network dashboard is not part of user navigation —
 * its one useful bit (plain-language connection status) lives on Home.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomTabBar from './BottomTabBar';
import ChatNavigator from './ChatNavigator';
import HomeNavigator from './EmergencyNavigator';
import NearbyHelpNavigator from './NearbyHelpNavigator';
import ReliefNavigator from './ReliefNavigator';
import ProfileScreen from '../features/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const renderTabBar = (props) => <BottomTabBar {...props} />;

function MainNavigator() {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Messages" component={ChatNavigator} />
      <Tab.Screen name="NearbyHelp" component={NearbyHelpNavigator} options={{ tabBarLabel: 'Nearby Help' }} />
      <Tab.Screen name="Safety" component={ReliefNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

export default MainNavigator;
