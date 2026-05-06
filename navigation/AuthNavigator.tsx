import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingAuthScreen from '../app/screens/LandingAuthScreen';

export type AuthStackParamList = {
  Landing: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingAuthScreen} />
    </Stack.Navigator>
  );
}
