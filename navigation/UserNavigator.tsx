import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HavenScreen from '../app/screens/User/HavenScreen';
import RoomDetailsScreen from '../app/screens/User/RoomDetailsScreen';
import MeScreen from '../app/screens/User/MeScreen';

export type UserStackParamList = {
  BrowseHavens: undefined;
  RoomDetails: { haven: Record<string, unknown> };
  GuestMe: undefined;
};

const Stack = createNativeStackNavigator<UserStackParamList>();

export default function UserNavigator() {
  return (
    <Stack.Navigator initialRouteName="BrowseHavens" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseHavens" component={HavenScreen} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
      <Stack.Screen name="GuestMe" component={MeScreen} />
    </Stack.Navigator>
  );
}
