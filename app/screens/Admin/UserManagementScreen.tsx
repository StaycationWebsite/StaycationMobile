import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const USERS = [
  { id: 1, name: 'John Doe',      email: 'john@email.com',   phone: '+63 912 111 1111', bookings: 3, totalSpent: 37500, status: 'Active',   joined: 'Jan 5, 2026' },
  { id: 2, name: 'Sarah Smith',   email: 'sarah@email.com',  phone: '+63 923 222 2222', bookings: 5, totalSpent: 62000, status: 'Active',   joined: 'Dec 12, 2025' },
  { id: 3, name: 'Mike Johnson',  email: 'mike@email.com',   phone: '+63 934 333 3333', bookings: 2, totalSpent: 21600, status: 'Active',   joined: 'Nov 20, 2025' },
  { id: 4, name: 'Emily Davis',   email: 'emily@email.com',  phone: '+63 945 444 4444', bookings: 4, totalSpent: 54000, status: 'Active',   joined: 'Oct 8, 2025' },
  { id: 5, name: 'Carlos Reyes',  email: 'carlos@email.com', phone: '+63 956 555 5555', bookings: 1, totalSpent: 8000,  status: 'Inactive', joined: 'Sep 3, 2025' },
  { id: 6, name: 'Jess Tan',      email: 'jess@email.com',   phone: '+63 967 666 6666', bookings: 7, totalSpent: 89000, status: 'Active',   joined: 'Aug 15, 2025' },
  { id: 7, name: 'Mark Lee',      email: 'mark@email.com',   phone: '+63 978 777 7777', bookings: 0, totalSpent: 0,     status: 'Banned',   joined: 'Jul 1, 2025' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Active:   { bg: Colors.green[100],  text: Colors.green[500] },
  Inactive: { bg: Colors.gray[100],   text: Colors.gray[600] },
  Banned:   { bg: Colors.red[100],    text: Colors.red[500] },
};

export default function UserManagementScreen() {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: number, currentStatus: string) => {
    const options = ['Active', 'Inactive', 'Banned'].filter(s => s !== currentStatus);
    Alert.alert('Change Status', `Set user status to:`, [
      ...options.map(s => ({
        text: s,
        onPress: () => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: s } : u)),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: users.length, color: Colors.brand.primary },
          { label: 'Active', value: users.filter(u => u.status === 'Active').length, color: Colors.green[500] },
          { label: 'Inactive', value: users.filter(u => u.status === 'Inactive').length, color: Colors.gray[500] },
          { label: 'Banned', value: users.filter(u => u.status === 'Banned').length, color: Colors.red[500] },
        ].map(s => (
          <View key={s.label} style={styles.statBox}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={Colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 10 }}>
        {['All', 'Active', 'Inactive', 'Banned'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filterStatus === f && { backgroundColor: Colors.brand.primarySoft }]} onPress={() => setFilterStatus(f)}>
            <Text style={[styles.chipText, filterStatus === f && { color: Colors.brand.primaryDark }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(user => {
          const sc = statusColors[user.status];
          return (
            <View key={user.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <TouchableOpacity
                      style={[styles.statusBadge, { backgroundColor: sc.bg }]}
                      onPress={() => handleStatusChange(user.id, user.status)}
                    >
                      <Text style={[styles.statusText, { color: sc.text }]}>{user.status}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
              </View>
              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="calendar-check" size={14} color={Colors.gray[500]} />
                  <Text style={styles.statItemText}>{user.bookings} bookings</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="currency-php" size={14} color={Colors.brand.primary} />
                  <Text style={[styles.statItemText, { color: Colors.brand.primary, fontWeight: '700' }]}>₱{user.totalSpent.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="calendar-plus" size={14} color={Colors.gray[400]} />
                  <Text style={styles.statItemText}>{user.joined}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], gap: 0 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
    marginHorizontal: 20, marginTop: 14, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  filterBar: { backgroundColor: Colors.white, marginTop: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], height: 54 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  list: { padding: 20, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.gray[100] },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  userName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  userEmail: { fontSize: 12, color: Colors.gray[500] },
  userPhone: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  cardStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statItemText: { fontSize: 12, color: Colors.gray[600] },
});
