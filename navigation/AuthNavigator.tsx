import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingAuthScreen from '../app/screens/LandingAuthScreen';
import { Colors } from '../constants/Styles';

export type AuthStackParamList = {
  Landing: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.white },
        contentStyle: { flex: 1, backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen name="Landing" component={LandingAuthScreen} />
    </Stack.Navigator>
  );
}
