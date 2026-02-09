import React from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import { useAuth } from '../../hooks/useAuth';

export default function MeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: 'destructive' }
      ]
    );
  };

  const AdminStat = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.brand.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuItem = ({ icon, label, onPress, isLast = false, color = Colors.gray[700] }: { 
    icon: any, 
    label: string, 
    onPress: () => void, 
    isLast?: boolean,
    color?: string
  }) => (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && styles.menuItemLast]} 
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <Feather name="chevron-right" size={18} color={Colors.gray[500]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header / Profile Section */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0] || user?.email?.[0] || 'A'}
                </Text>
              </View>
            )}
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Staycation Admin'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@staycationhavenph.com'}</Text>
        </View>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsRow}>
        <AdminStat icon="home-city-outline" label="Total Havens" value="8" />
        <AdminStat icon="calendar-check-outline" label="Bookings" value="24" />
        <AdminStat icon="star-outline" label="Avg Rating" value="4.8" />
      </View>

      {/* Admin Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Management</Text>
        <MenuItem icon="home" label="Manage Havens" onPress={() => {}} />
        <MenuItem icon="calendar" label="Booking Overview" onPress={() => {}} />
        <MenuItem icon="users" label="User Accounts" onPress={() => {}} />
        <MenuItem icon="settings" label="System Settings" onPress={() => {}} isLast />
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        <MenuItem icon="user" label="Edit Profile" onPress={() => {}} />
        <MenuItem icon="bell" label="Notifications" onPress={() => {}} />
        <MenuItem 
          icon="log-out" 
          label="Sign Out" 
          onPress={handleLogout} 
          color={Colors.red[500]}
          isLast 
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.0 (Admin Build)</Text>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  adminBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Fonts.inter,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontSize: 12,
    fontFamily: Fonts.inter,
    marginBottom: 16,
  },
  bottomSpace: {
    height: 40,
  },
});