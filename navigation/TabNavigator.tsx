import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HavenScreen from '../app/screens/HavenScreen';
import AdminDashboardScreen from '../app/screens/Admin/AdminDashboardScreen';
import MeScreen from '../app/screens/MeScreen';
import RoomDetailsScreen from '../app/screens/RoomDetailsScreen';

const Stack = createNativeStackNavigator();

export default function TabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageHavens" component={HavenScreen} />
      <Stack.Screen name="AdminProfile" component={MeScreen} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
    </Stack.Navigator>
  );
}

