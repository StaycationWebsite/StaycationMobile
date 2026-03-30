import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Styles';

// Screens
import DashboardScreen from '../app/screens/Csr/DashboardScreen';
import MeScreen from '../app/screens/MeScreen';
import CreateBookingScreen from '../app/screens/Admin/Bookings/CreateBookingScreen';
import GuestMessagesScreen from '../app/screens/Admin/Guest/GuestMessagesScreen';
import SettingsScreen from '../app/screens/Admin/Settings/SettingsScreen';

// Tab Navigators
import CsrBookingsTabNavigator from './CsrBookingsTabNavigator';
import FinanceTabNavigator from './FinanceTabNavigator';
import OperationsTabNavigator from './OperationsTabNavigator';

export type CsrTabParamList = {
  CsrDashboard: undefined;
  CsrBookings: undefined;
  CsrFinance: undefined;
  CsrOperations: undefined;
  CsrProfile: undefined;
};

export type CsrStackParamList = {
  CsrTabs: undefined;
  CsrCreateBooking: undefined;
  CsrMessages: undefined;
  CsrSettings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CsrTabParamList>();
const Stack = createNativeStackNavigator<CsrStackParamList>();

function CsrTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[100],
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom, 8),
        },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="CsrDashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CsrBookings"
        component={CsrBookingsTabNavigator}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CsrFinance"
        component={FinanceTabNavigator}
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CsrOperations"
        component={OperationsTabNavigator}
        options={{
          title: 'Operations',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CsrProfile"
        component={MeScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function CsrNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CsrTabs" component={CsrTabs} />
      <Stack.Screen name="CsrCreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="CsrMessages" component={GuestMessagesScreen} />
      <Stack.Screen name="CsrSettings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={MeScreen} />
    </Stack.Navigator>
  );
}
