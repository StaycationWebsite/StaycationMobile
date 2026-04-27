import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Styles';

// Screens
import AdminDashboardScreen from '../app/screens/Admin/AdminDashboardScreen';
import RoomDetailsScreen from '../app/screens/Admin/Havens/RoomDetailsScreen';
import HavenScreen from '../app/screens/Admin/Havens/HavenScreen';
import MeScreen from '../app/screens/MeScreen';
import CreateBookingScreen from '../app/screens/Admin/Bookings/CreateBookingScreen';
import AddHavenScreen from '../app/screens/Admin/Havens/AddHavenScreen';
import GuestMessagesScreen from '../app/screens/Admin/Guest/GuestMessagesScreen';
import ReportsManagementScreen from '../app/screens/Admin/Reports/ReportsManagementScreen';
import MoreMenuScreen from '../app/screens/Admin/MoreMenuScreen';
import StaffManagementScreen from '../app/screens/Admin/Staff/StaffManagementScreen';
import ReviewsScreen from '../app/screens/Admin/Guest/ReviewsScreen';
import UserManagementScreen from '../app/screens/Admin/Staff/UserManagementScreen';
import PartnerManagementScreen from '../app/screens/Admin/Staff/PartnerManagementScreen';
import AuditLogsScreen from '../app/screens/Admin/Settings/AuditLogsScreen';
import SettingsScreen from '../app/screens/Admin/Settings/SettingsScreen';
import BlockedDatesScreen from '../app/screens/Admin/Bookings/BlockedDatesScreen';
import MaintenanceManagementScreen from '../app/screens/Admin/Operations/MaintenanceManagementScreen';
import CleaningManagementScreen from '../app/screens/Admin/Operations/CleaningManagementScreen';
import RevenueManagementScreen from '../app/screens/Admin/Operations/RevenueManagementScreen';
import PaymentMethodsScreen from '../app/screens/Admin/Operations/PaymentMethodsScreen';
import GuestAssistanceScreen from '../app/screens/Admin/Guest/GuestAssistanceScreen';
import AdminBookingCalendarScreen from '../app/screens/Admin/Bookings/AdminBookingCalender';
import AdminReservationsScreen from '../app/screens/Admin/Bookings/AdminReservationsScreen';

// Tab Navigators
import BookingsTabNavigator from './BookingsTabNavigator';

export type AdminTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  ManageHavens: undefined;
  Reports: undefined;
  More: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  RoomDetails: { haven: unknown };
  AddHaven: undefined;
  Profile: undefined;
  CreateBooking: undefined;
  GuestMessages: undefined;
  Staff: undefined;
  Reviews: undefined;
  Users: undefined;
  Partners: undefined;
  AuditLogs: undefined;
  Settings: undefined;
  BlockedDates: undefined;
  Maintenance: undefined;
  CleaningManagement: undefined;
  RevenueManagement: undefined;
  PaymentMethods: undefined;
  GuestAssistance: undefined;
  AnalyticsReports: undefined;
  BookingCalendar: undefined;
  Reservations: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

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
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
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
        name="ManageHavens"
        component={HavenScreen}
        options={{
          title: 'Havens',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-city-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsManagementScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
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

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      <Stack.Screen name="AddHaven" component={AddHavenScreen} />
      <Stack.Screen name="Profile" component={MeScreen} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="GuestMessages" component={GuestMessagesScreen} />
      <Stack.Screen name="Staff" component={StaffManagementScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Users" component={UserManagementScreen} />
      <Stack.Screen name="Partners" component={PartnerManagementScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="BlockedDates" component={BlockedDatesScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceManagementScreen} />
      <Stack.Screen name="CleaningManagement" component={CleaningManagementScreen} />
      <Stack.Screen name="RevenueManagement" component={RevenueManagementScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="GuestAssistance" component={GuestAssistanceScreen} />
      <Stack.Screen name="AnalyticsReports" component={ReportsManagementScreen} />
      <Stack.Screen name="BookingCalendar" component={AdminBookingCalendarScreen} />
      <Stack.Screen name="Reservations" component={AdminReservationsScreen} />
    </Stack.Navigator>
  );
}