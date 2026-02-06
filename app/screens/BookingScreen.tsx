import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';

export default function BookingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking</Text>
      <Text style={styles.subtitle}>Manage your reservations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EFF6FF', // bg-blue-50 equivalent
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    fontFamily: Fonts.inter,
  },
});
