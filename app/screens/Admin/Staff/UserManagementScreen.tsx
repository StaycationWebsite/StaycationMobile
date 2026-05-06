import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type RegistrationMethod = 'Haven' | 'Google' | 'Facebook';
type UserRole = 'Guest' | 'Admin';

interface UserRecord {
  id: string;
  shortId: string;
  name: string;
  email: string;
  role: UserRole;
  registeredVia: RegistrationMethod;
  lastLogin: string;
}

const USERS: UserRecord[] = [
  { id: '6394183c-...', shortId: '6394183c...', name: 'Garett Becker',       email: 'benzaldehydeee@gmail.com',    role: 'Guest', registeredVia: 'Haven',    lastLogin: 'Mar 25, 2026, 02:12 PM' },
  { id: '135bcf2e-...', shortId: '135bcf2e...', name: 'Fabeliña, Shayne R.', email: 'fabelinashayne@gmail.com',    role: 'Guest', registeredVia: 'Google',   lastLogin: 'Mar 18, 2026, 07:24 PM' },
  { id: '2b46c559-...', shortId: '2b46c559...', name: 'Wakatush Sedai',      email: 'wakatushsedai@gmail.com',     role: 'Guest', registeredVia: 'Google',   lastLogin: 'Mar 2, 2026, 01:21 PM' },
  { id: 'b6df84a5-...', shortId: 'b6df84a5...', name: 'Bryan Babar',         email: 'brybabar2003@gmail.com',      role: 'Guest', registeredVia: 'Google',   lastLogin: 'Feb 18, 2026, 02:10 PM' },
  { id: '00af1d7-...',  shortId: '00af1d7....',  name: 'Jeric John Achas',   email: 'johnjimachas@gmail.com',      role: 'Guest', registeredVia: 'Haven',    lastLogin: 'Feb 13, 2026, 10:04 AM' },
  { id: '1d63b41e-...', shortId: '1d63b41e...', name: 'Jeric John Achas',    email: 'johnjimachas1@gmail.com',     role: 'Guest', registeredVia: 'Haven',    lastLogin: 'Feb 6, 2026, 10:38 AM' },
  { id: 'c68552b2-...', shortId: 'c68552b2...', name: 'Jerry Musico',        email: 'jerrypangalawanatomusico@gmail.com', role: 'Guest', registeredVia: 'Google', lastLogin: 'Apr 12, 2026, 09:58 PM' },
  { id: 'aa12345-...',  shortId: 'aa12345....',  name: 'Maria Santos',       email: 'mariasantos@gmail.com',       role: 'Guest', registeredVia: 'Haven',    lastLogin: 'Apr 10, 2026, 11:00 AM' },
  { id: 'bb67890-...',  shortId: 'bb67890....',  name: 'Carlos Reyes',       email: 'carlosreyes@gmail.com',       role: 'Guest', registeredVia: 'Google',   lastLogin: 'Apr 8, 2026, 03:45 PM' },
  { id: 'cc11223-...',  shortId: 'cc11223....',  name: 'Ana Lim',            email: 'analim@facebook.com',         role: 'Guest', registeredVia: 'Facebook', lastLogin: 'Apr 5, 2026, 08:20 AM' },
];

const REG_COLORS: Record<RegistrationMethod, { bg: string; text: string }> = {
  Haven:    { bg: '#FEF9C3', text: Colors.brand.primary },
  Google:   { bg: '#FEE2E2', text: '#DC2626' },
  Facebook: { bg: '#EDE9FE', text: '#7C3AED' },
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  Guest: { bg: Colors.green[100],  text: Colors.green[500] },
  Admin: { bg: '#DBEAFE',          text: Colors.blue[600] },
};

export default function UserManagementScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('All Roles');
  const [regFilter, setRegFilter]         = useState('All Registration');
  const [roleOpen, setRoleOpen]           = useState(false);
  const [regOpen, setRegOpen]             = useState(false);

  const totalUsers   = USERS.length;
  const havenGuest   = USERS.filter(u => u.registeredVia === 'Haven').length;
  const googleCount  = USERS.filter(u => u.registeredVia === 'Google').length;
  const facebookCount = USERS.filter(u => u.registeredVia === 'Facebook').length;

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchReg  = regFilter === 'All Registration' || u.registeredVia === regFilter;
    return matchSearch && matchRole && matchReg;
  });

  const handleEdit   = (u: UserRecord) => Alert.alert('Edit User', `Edit ${u.name}?`);
  const handleDelete = (u: UserRecord) => Alert.alert('Delete User', `Remove ${u.name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {} },
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSub}>Manage all registered users and their roles</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          {[
            { label: 'Total Users',  value: totalUsers,    color: Colors.blue[500],   icon: 'account-group-outline' },
            { label: 'Haven/Guest',  value: havenGuest,    color: '#F97316',           icon: 'office-building-outline' },
            { label: 'Google',       value: googleCount,   color: Colors.red[500],    icon: 'google' },
            { label: 'Facebook',     value: facebookCount, color: '#818CF8',           icon: 'facebook' },
          ].map(({ label, value, color, icon }) => (
            <View key={label} style={[styles.kpiCard, { backgroundColor: color }]}>
              <Text style={styles.kpiLabel}>{label}</Text>
              <Text style={styles.kpiValue}>{value}</Text>
              <MaterialCommunityIcons name={icon as any} size={36} color="rgba(255,255,255,0.25)" style={styles.kpiIcon} />
            </View>
          ))}
        </ScrollView>

        {/* Search + Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={Colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor={Colors.gray[400]}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={15} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            {/* Role filter */}
            <View style={{ flex: 1, zIndex: roleOpen ? 20 : 1 }}>
              <TouchableOpacity style={styles.filterPill} onPress={() => { setRoleOpen(v => !v); setRegOpen(false); }}>
                <Text style={styles.filterPillText} numberOfLines={1}>{roleFilter}</Text>
                <Feather name={roleOpen ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
              </TouchableOpacity>
              {roleOpen && (
                <View style={styles.dropdown}>
                  {['All Roles', 'Guest', 'Admin'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.dropdownItem, roleFilter === opt && styles.dropdownItemActive]}
                      onPress={() => { setRoleFilter(opt); setRoleOpen(false); }}>
                      <Text style={[styles.dropdownText, roleFilter === opt && { color: Colors.brand.primary, fontWeight: '700' }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Registration filter */}
            <View style={{ flex: 1, zIndex: regOpen ? 20 : 1 }}>
              <TouchableOpacity style={styles.filterPill} onPress={() => { setRegOpen(v => !v); setRoleOpen(false); }}>
                <Text style={styles.filterPillText} numberOfLines={1}>{regFilter}</Text>
                <Feather name={regOpen ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
              </TouchableOpacity>
              {regOpen && (
                <View style={styles.dropdown}>
                  {['All Registration', 'Haven', 'Google', 'Facebook'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.dropdownItem, regFilter === opt && styles.dropdownItemActive]}
                      onPress={() => { setRegFilter(opt); setRegOpen(false); }}>
                      <Text style={[styles.dropdownText, regFilter === opt && { color: Colors.brand.primary, fontWeight: '700' }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <Text style={styles.resultCount}>{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</Text>
        </View>

        {/* User List */}
        <View style={styles.listContent}>
          {filtered.map(user => {
            const rc = REG_COLORS[user.registeredVia];
            const rl = ROLE_COLORS[user.role];
            return (
              <View key={user.id} style={styles.userCard}>
                {/* Top row */}
                <View style={styles.userTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userId}>ID: {user.shortId}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(user)}>
                      <Feather name="edit-2" size={14} color={Colors.blue[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(user)}>
                      <Feather name="trash-2" size={14} color={Colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>EMAIL</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="mail" size={11} color={Colors.gray[400]} />
                      <Text style={styles.infoValue} numberOfLines={1}>{user.email}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ROLE</Text>
                    <View style={[styles.badge, { backgroundColor: rl.bg }]}>
                      <Text style={[styles.badgeText, { color: rl.text }]}>{user.role}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>REGISTERED VIA</Text>
                    <View style={[styles.badge, { backgroundColor: rc.bg }]}>
                      <Text style={[styles.badgeText, { color: rc.text }]}>{user.registeredVia}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>LAST LOGIN</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="clock" size={11} color={Colors.gray[400]} />
                      <Text style={styles.infoValue} numberOfLines={1}>{user.lastLogin}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  headerSub:   { fontSize: 12, color: Colors.gray[500], marginTop: 1 },
  // KPI
  kpiScroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  kpiCard: { width: 140, borderRadius: 16, padding: 16, overflow: 'hidden' },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: '800', color: Colors.white },
  kpiIcon:  { position: 'absolute', bottom: 8, right: 8 },
  // Search + filters
  searchSection: { paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 9, gap: 4,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  filterPillText: { fontSize: 11, fontWeight: '600', color: Colors.gray[700], flex: 1 },
  dropdown: {
    position: 'absolute', top: 40, left: 0, right: 0,
    backgroundColor: Colors.white, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.gray[200],
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 10,
    overflow: 'hidden',
  },
  dropdownItem:       { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: Colors.brand.primarySoft },
  dropdownText:       { fontSize: 12, color: Colors.gray[700] },
  resultCount: { fontSize: 12, color: Colors.gray[500], fontWeight: '600' },
  // List
  listContent: { paddingHorizontal: 16, gap: 10 },
  userCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    gap: 12,
  },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.brand.primary },
  userName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  userId:   { fontSize: 10, color: Colors.gray[400], marginTop: 1 },
  userActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center',
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem: { width: '47%', gap: 4 },
  infoLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.5 },
  infoValue: { fontSize: 11, color: Colors.gray[700] },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
