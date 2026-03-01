import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../app/screens/LoginScreen';
const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminLogin" component={LoginScreen} />
    </Stack.Navigator>
  );
}
