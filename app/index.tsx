import React from 'react';
import { useAuth } from './hooks/useAuth';
import TabNavigator from './navigation/TabNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import MeScreen from './screens/MeScreen';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
}
