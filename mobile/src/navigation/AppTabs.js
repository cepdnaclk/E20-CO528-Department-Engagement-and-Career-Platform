import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/FeedScreen';
import JobsScreen from '../screens/JobsScreen';
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f23', borderBottomWidth: 0, shadowOpacity: 0, elevation: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#0f0f23', borderTopColor: 'rgba(255,255,255,0.1)', borderTopWidth: 1, paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#8892b0',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Feed', tabBarIcon: () => null, headerTitle: '📰 Feed' }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: 'Jobs', tabBarIcon: () => null, headerTitle: '💼 Jobs' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: 'Events', tabBarIcon: () => null, headerTitle: '📅 Events' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: () => null, headerTitle: '👤 Profile' }} />
    </Tab.Navigator>
  );
}
