import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HavenScreen from '../app/screens/HavenScreen';
import AdminDashboardScreen from '../app/screens/AdminDashboardScreen';
import MeScreen from '../app/screens/MeScreen';
import RoomDetailsScreen from '../app/screens/RoomDetailsScreen';
import { Colors } from '../constants/Styles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminHavenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HavenMain" component={HavenScreen} />
      <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
    </Stack.Navigator>
  );
}

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.gray[600],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminHaven"
        component={AdminHavenStack}
        options={{
          title: 'Havens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    </Stack.Navigator>
  );
}
