import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Styles';
import { useAuth } from '../hooks/useAuth';

export default function MeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const StatItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={22} color={Colors.brand.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuItem = ({
    icon,
    label,
    onPress,
    isLast = false,
    color = Colors.gray[700],
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    isLast?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={Colors.gray[400]} />
    </TouchableOpacity>
  );

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'CSR';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() ?? 'A'}
                </Text>
              </View>
            )}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Staycation User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem icon="home-city-outline" label="Total Havens" value="8" />
        <StatItem icon="calendar-check-outline" label="Bookings" value="24" />
        <StatItem icon="star-outline" label="Avg Rating" value="4.8" />
      </View>

      {/* Management Menu */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Management</Text>
        <MenuItem icon="home" label="Manage Havens" onPress={() => {}} />
        <MenuItem icon="calendar" label="Booking Overview" onPress={() => {}} />
        <MenuItem icon="users" label="User Accounts" onPress={() => {}} />
        <MenuItem icon="settings" label="System Settings" onPress={() => {}} isLast />
      </View>

      {/* Account Menu */}
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

      <Text style={styles.versionText}>Version 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
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
  profileInfo: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  avatarInitial: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  roleBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.gray[900], marginBottom: 4 },
  userEmail: { fontSize: 13, color: Colors.gray[500] },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: { marginBottom: 6 },
  statValue: { fontSize: 17, fontWeight: 'bold', color: Colors.gray[900] },
  statLabel: { fontSize: 10, color: Colors.gray[500], textAlign: 'center', marginTop: 2 },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  versionText: { textAlign: 'center', color: Colors.gray[400], fontSize: 12, marginBottom: 16 },
});
