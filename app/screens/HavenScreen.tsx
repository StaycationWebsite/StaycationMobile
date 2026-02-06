import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import SearchModal from '../components/SearchModal';

export default function HavenScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = () => {
    // Handle search action
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSearch={handleSearch}
      />
      <View style={styles.topSection}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/haven_logo.png')}
            style={styles.logo}
          />
          <View style={styles.appNameContainer}>
            <Text style={styles.appName}>taycation Haven</Text>
            <Text style={styles.appNameExponent}>PH</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.findRoomsButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="search" size={18} color={Colors.white} style={styles.buttonIcon} />
          <Text style={styles.findRoomsButtonText}>Find Rooms</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.mainTitle}>Find Your Perfect</Text>
        <Text style={styles.highlightedText}>Staycation</Text>
        <View style={styles.dot} />
        <Text style={styles.description}>
          Discover our premium havens with world-class amenities. Short stays, extended stays, or your perfect getaway - all at your fingertips.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Premium Havens</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  topSection: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: -20,
    marginTop: -60,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
  appNameExponent: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginLeft: 2,
    marginTop: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 30,
  },
  findRoomsButton: {
    width: '100%',
    backgroundColor: Colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 10,
  },
  findRoomsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: Fonts.poppins,
  },
  buttonDropdownIcon: {
    marginLeft: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  highlightedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    fontFamily: Fonts.inter,
    lineHeight: 22,
    marginHorizontal: 10,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
});
