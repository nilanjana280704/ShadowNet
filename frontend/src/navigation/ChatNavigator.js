/**
 * ChatNavigator — the messaging stack behind the Chat tab: the conversation
 * list, a thread, new conversation, nearby users, groups, and broadcast history.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../features/chat/ChatListScreen';
import ConversationScreen from '../features/chat/ConversationScreen';
import NewConversationScreen from '../features/chat/NewConversationScreen';
import NearbyUsersScreen from '../features/chat/NearbyUsersScreen';
import GroupCommunicationScreen from '../features/chat/GroupCommunicationScreen';
import BroadcastHistoryScreen from '../features/chat/BroadcastHistoryScreen';

const Stack = createNativeStackNavigator();

function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="NewConversation" component={NewConversationScreen} />
      <Stack.Screen name="NearbyUsers" component={NearbyUsersScreen} />
      <Stack.Screen name="GroupCommunication" component={GroupCommunicationScreen} />
      <Stack.Screen name="BroadcastHistory" component={BroadcastHistoryScreen} />
    </Stack.Navigator>
  );
}

export default ChatNavigator;
