import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const LOGS = [
  { id: 1,  action: 'Booking Created',    user: 'Juan dela Cruz',  target: 'Booking #B-2026-045',     time: 'Today, 10:32 AM', type: 'booking',  icon: 'calendar-plus' },
  { id: 2,  action: 'Payment Confirmed',  user: 'Anna Reyes',      target: 'Payment ₱15,000 – Sarah', time: 'Today, 10:15 AM', type: 'payment',  icon: 'cash-check' },
  { id: 3,  action: 'Booking Cancelled',  user: 'Juan dela Cruz',  target: 'Booking #B-2026-039',     time: 'Today, 9:50 AM',  type: 'cancel',   icon: 'calendar-remove' },
  { id: 4,  action: 'Haven Updated',      user: 'Maria Santos',    target: 'Haven 302 – Rate changed', time: 'Today, 9:20 AM',  type: 'haven',    icon: 'home-edit-outline' },
  { id: 5,  action: 'Staff Added',        user: 'Maria Santos',    target: 'Grace Tan (CSR)',          time: 'Today, 8:45 AM',  type: 'staff',    icon: 'account-plus' },
  { id: 6,  action: 'Login',              user: 'Maria Santos',    target: 'Admin Portal',             time: 'Today, 8:30 AM',  type: 'auth',     icon: 'login' },
  { id: 7,  action: 'Discount Added',     user: 'Maria Santos',    target: 'WELCOME2026 – 15%',        time: 'Yesterday, 5:00 PM', type: 'discount', icon: 'ticket-percent' },
  { id: 8,  action: 'Check-in Recorded', user: 'Grace Tan',       target: 'John Doe – Haven 101',    time: 'Yesterday, 3:00 PM', type: 'booking', icon: 'login-variant' },
  { id: 9,  action: 'Deposit Released',   user: 'Anna Reyes',      target: 'Sarah Smith – ₱5,000',    time: 'Yesterday, 1:30 PM', type: 'payment', icon: 'shield-check-outline' },
  { id: 10, action: 'Haven Added',        user: 'Maria Santos',    target: 'Haven 105 – Tower A',     time: 'Yesterday, 10:00 AM', type: 'haven',  icon: 'home-plus-outline' },
  { id: 11, action: 'Review Replied',     user: 'Juan dela Cruz',  target: 'Mike Johnson\'s review',  time: 'Feb 28, 4:00 PM', type: 'review',  icon: 'reply-outline' },
  { id: 12, action: 'User Banned',        user: 'Maria Santos',    target: 'Mark Lee',                time: 'Feb 27, 2:00 PM', type: 'user',    icon: 'account-cancel-outline' },
];

const typeColors: Record<string, { color: string; bg: string }> = {
  booking:  { color: Colors.blue[500],         bg: Colors.blue[100] },
  payment:  { color: Colors.green[500],         bg: Colors.green[100] },
  cancel:   { color: Colors.red[500],           bg: Colors.red[100] },
  haven:    { color: Colors.brand.primary,      bg: Colors.brand.primarySoft },
  staff:    { color: Colors.purple[500],        bg: Colors.purple[500] + '18' },
  auth:     { color: Colors.gray[600],          bg: Colors.gray[100] },
  discount: { color: Colors.yellow[500],        bg: Colors.yellow[100] },
  review:   { color: Colors.brand.primaryDark,  bg: Colors.brand.primarySoft },
  user:     { color: Colors.red[500],           bg: Colors.red[100] },
};

const FILTER_OPTIONS = ['All', 'Bookings', 'Payments', 'Havens', 'Staff', 'Auth'];
const filterMap: Record<string, string[]> = {
  All: [], Bookings: ['booking', 'cancel'], Payments: ['payment'], Havens: ['haven'], Staff: ['staff'], Auth: ['auth'],
};

export default function AuditLogsScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? LOGS
    : LOGS.filter(l => filterMap[filter]?.includes(l.type));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 10, alignItems: 'center' }}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && { backgroundColor: Colors.brand.primarySoft }]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && { color: Colors.brand.primaryDark }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.countText}>{filtered.length} log entries</Text>
        {filtered.map((log, idx) => {
          const tc = typeColors[log.type] ?? { color: Colors.gray[600], bg: Colors.gray[100] };
          const isLast = idx === filtered.length - 1;
          return (
            <View key={log.id} style={styles.logRow}>
              {/* Timeline line */}
              <View style={styles.timelineCol}>
                <View style={[styles.dot, { backgroundColor: tc.color }]} />
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={[styles.logCard, isLast && { marginBottom: 0 }]}>
                <View style={styles.logTop}>
                  <View style={[styles.logIcon, { backgroundColor: tc.bg }]}>
                    <MaterialCommunityIcons name={log.icon as any} size={16} color={tc.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logAction}>{log.action}</Text>
                    <Text style={styles.logTarget} numberOfLines={1}>{log.target}</Text>
                  </View>
                  <Text style={styles.logTime}>{log.time}</Text>
                </View>
                <View style={styles.logUser}>
                  <MaterialCommunityIcons name="account-outline" size={12} color={Colors.gray[400]} />
                  <Text style={styles.logUserText}>{log.user}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  filterBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], height: 54 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  list: { padding: 20, paddingTop: 16 },
  countText: { fontSize: 12, color: Colors.gray[500], fontWeight: '600', marginBottom: 16 },
  logRow: { flexDirection: 'row', gap: 12 },
  timelineCol: { alignItems: 'center', width: 16, paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  line: { width: 2, flex: 1, backgroundColor: Colors.gray[100], marginTop: 4, minHeight: 40 },
  logCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.gray[100] },
  logTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  logIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  logAction: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  logTarget: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  logTime: { fontSize: 11, color: Colors.gray[400], flexShrink: 0 },
  logUser: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logUserText: { fontSize: 11, color: Colors.gray[400] },
});
