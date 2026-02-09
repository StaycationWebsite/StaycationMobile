import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HavenScreen from '../app/screens/HavenScreen';
import LoginScreen from '../app/screens/LoginScreen';
import RoomDetailsScreen from '../app/screens/RoomDetailsScreen';
import { Colors } from '../constants/Styles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PublicHavenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HavenMain" component={HavenScreen} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function AuthNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.gray[600],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="PublicHaven"
        component={PublicHavenStack}
        options={{
          title: 'Haven',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LoginTab"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-in-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}