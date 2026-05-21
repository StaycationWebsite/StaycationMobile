import React from 'react';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import HavenScreen from '../app/screens/User/HavenScreen';
import RoomDetailsScreen from '../app/screens/User/RoomDetailsScreen';
import MeScreen from '../app/screens/User/MeScreen';
import WishlistScreen from '../app/screens/User/WishlistScreen';
import GuestBookingsScreen from '../app/screens/User/GuestBookingsScreen';
import BookingFlowScreen from '../app/screens/User/BookingFlowScreen';
import { GuestColors } from '../constants/Styles';

export type GuestHavenStackParamList = {
  BrowseHavens: undefined;
  RoomDetails: { haven: Record<string, unknown> };
  BookingFlow: { haven: Record<string, unknown> };
};

export type GuestTabParamList = {
  Haven: NavigatorScreenParams<GuestHavenStackParamList>;
  Wishlist: undefined;
  Bookings: undefined;
  Profile: undefined;
};

/** Guest app root (bottom tabs + nested haven stack). */
export type UserStackParamList = GuestTabParamList;

const HavenStack = createNativeStackNavigator<GuestHavenStackParamList>();
const Tab = createBottomTabNavigator<GuestTabParamList>();

function HavenStackNavigator() {
  return (
    <HavenStack.Navigator initialRouteName="BrowseHavens" screenOptions={{ headerShown: false }}>
      <HavenStack.Screen name="BrowseHavens" component={HavenScreen} />
      <HavenStack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      <HavenStack.Screen name="BookingFlow" component={BookingFlowScreen} />
    </HavenStack.Navigator>
  );
}

export default function UserNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      initialRouteName="Haven"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GuestColors.gold,
        tabBarInactiveTintColor: '#2C2C2C',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',
          paddingTop: 6,
          paddingBottom: bottomInset + 6,
          minHeight: 52 + bottomInset + 6,
          height: undefined,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Haven"
        component={HavenStackNavigator}
        options={{
          tabBarLabel: 'Haven',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={GuestBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
