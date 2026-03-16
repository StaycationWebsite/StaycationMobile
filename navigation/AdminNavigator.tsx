import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Styles';

// Screens
import AdminDashboardScreen from '../app/screens/Admin/AdminDashboardScreen';
import BookingsTabNavigator from './BookingsTabNavigator';
import FinanceTabNavigator from './FinanceTabNavigator';
import OperationsTabNavigator from './OperationsTabNavigator';
import RoomDetailsScreen from '../app/screens/Admin/RoomDetailsScreen';
import HavenScreen from '../app/screens/Admin/HavenScreen';
import MeScreen from '../app/screens/MeScreen';
import CreateBookingScreen from '../app/screens/Admin/CreateBookingScreen';
import AddHavenScreen from '../app/screens/Admin/AddHavenScreen';
import GuestMessagesScreen from '../app/screens/Admin/GuestMessagesScreen';
import ReportsManagementScreen from '../app/screens/Admin/ReportsManagementScreen';
import MoreMenuScreen from '../app/screens/Admin/MoreMenuScreen';
import StaffManagementScreen from '../app/screens/Admin/StaffManagementScreen';
import ReviewsScreen from '../app/screens/Admin/ReviewsScreen';
import UserManagementScreen from '../app/screens/Admin/UserManagementScreen';
import PartnerManagementScreen from '../app/screens/Admin/PartnerManagementScreen';
import AuditLogsScreen from '../app/screens/Admin/AuditLogsScreen';
import SettingsScreen from '../app/screens/Admin/SettingsScreen';
import BlockedDatesScreen from '../app/screens/Admin/BlockedDatesScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Finance: undefined;
  Operations: undefined;
  More: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  RoomDetails: { haven: unknown };
  ManageHavens: undefined;
  Profile: undefined;
  CreateBooking: undefined;
  AddHaven: undefined;
  GuestMessages: undefined;
  Reports: undefined;
  Staff: undefined;
  Reviews: undefined;
  Users: undefined;
  Partners: undefined;
  AuditLogs: undefined;
  Settings: undefined;
  BlockedDates: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

function AdminTabs() {
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
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsTabNavigator}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceTabNavigator}
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Operations"
        component={OperationsTabNavigator}
        options={{
          title: 'Operations',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreMenuScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      <Stack.Screen name="ManageHavens" component={HavenScreen} />
      <Stack.Screen name="Profile" component={MeScreen} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="AddHaven" component={AddHavenScreen} />
      <Stack.Screen name="GuestMessages" component={GuestMessagesScreen} />
      <Stack.Screen name="Reports" component={ReportsManagementScreen} />
      <Stack.Screen name="Staff" component={StaffManagementScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Users" component={UserManagementScreen} />
      <Stack.Screen name="Partners" component={PartnerManagementScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="BlockedDates" component={BlockedDatesScreen} />
    </Stack.Navigator>
  );
}
