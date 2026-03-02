import React, { useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { AppDispatch, RootState } from '../redux/store';
import { setThemeMode } from '../redux/slices/themeSlice';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';

export default function MeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const selectedThemeMode = useSelector((state: RootState) => state.theme.mode);
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const StatItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={22} color={theme.colors.primary} />
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
    color = theme.colors.textSecondary,
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
      <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'CSR';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => navigation.navigate('AdminTabs')}
            activeOpacity={0.8}
          >
            <Feather name="chevron-left" size={18} color={theme.colors.text} />
            <Text style={styles.backHomeText}>Home</Text>
          </TouchableOpacity>
        </View>
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

      {/* Appearance */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Appearance</Text>
        <View style={styles.themeSegmented}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              (selectedThemeMode === 'light' || selectedThemeMode === 'auto') && styles.themeOptionActive,
            ]}
            onPress={() => dispatch(setThemeMode('light'))}
            activeOpacity={0.8}
          >
            <Feather
              name="sun"
              size={16}
              color={
                selectedThemeMode === 'light' || selectedThemeMode === 'auto'
                  ? '#FFFFFF'
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.themeOptionText,
                (selectedThemeMode === 'light' || selectedThemeMode === 'auto') &&
                  styles.themeOptionTextActive,
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeOption, selectedThemeMode === 'dark' && styles.themeOptionActive]}
            onPress={() => dispatch(setThemeMode('dark'))}
            activeOpacity={0.8}
          >
            <Feather
              name="moon"
              size={16}
              color={selectedThemeMode === 'dark' ? '#FFFFFF' : theme.colors.textSecondary}
            />
            <Text
              style={[styles.themeOptionText, selectedThemeMode === 'dark' && styles.themeOptionTextActive]}
            >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
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
          color={theme.colors.error}
          isLast
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors: {
  primary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  borderLight: string;
  error: string;
}) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 52,
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
  headerTopRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  profileInfo: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarInitial: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.primary,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  roleBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
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
  statValue: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  menuContainer: {
    backgroundColor: colors.surface,
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
    color: colors.textTertiary,
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
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  themeSegmented: {
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  themeOptionActive: {
    backgroundColor: colors.primary,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeOptionTextActive: {
    color: '#FFFFFF',
  },
  versionText: { textAlign: 'center', color: colors.textTertiary, fontSize: 12, marginBottom: 16 },
});
