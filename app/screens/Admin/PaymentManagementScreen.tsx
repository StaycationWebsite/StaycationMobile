import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

const INITIAL_PAYMENTS = [
  { id: 1, guest: 'John Doe', room: 'Haven 101', amount: 12500, method: 'GCash', status: 'Pending', date: 'Today, 2:30 PM' },
  { id: 2, guest: 'Sarah Smith', room: 'Haven 205', amount: 15000, method: 'Bank Transfer', status: 'Paid', date: 'Today, 1:15 PM' },
  { id: 3, guest: 'Mike Johnson', room: 'Haven 103', amount: 10800, method: 'Credit Card', status: 'Paid', date: 'Yesterday' },
  { id: 4, guest: 'Emily Davis', room: 'Haven 302', amount: 18000, method: 'PayMaya', status: 'Pending', date: 'Today, 3:45 PM' },
];

const FILTER_OPTIONS = ['All', 'Pending', 'Paid', 'Failed'];

export default function PaymentManagementScreen() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleConfirm = (id: number) => {
    Alert.alert('Confirm Payment', 'Mark this payment as paid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', style: 'default',
        onPress: () => setPayments(prev =>
          prev.map(p => p.id === id ? { ...p, status: 'Paid', date: 'Just now' } : p)
        ),
      },
    ]);
  };

  const handleDecline = (id: number) => {
    Alert.alert('Decline Payment', 'Are you sure you want to decline this payment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline', style: 'destructive',
        onPress: () => setPayments(prev =>
          prev.map(p => p.id === id ? { ...p, status: 'Failed', date: 'Just now' } : p)
        ),
      },
    ]);
  };

  const filtered = payments.filter(p => activeFilter === 'All' || p.status === activeFilter);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'amount' ? b.amount - a.amount : 0
  );

  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalCompleted = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Payment Management</Text>
          <Text style={styles.headerSubtitle}>Track all transactions</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Feather name="filter" size={18} color={Colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <StatCard icon="cash" label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} color={Colors.brand.primary} />
          <StatCard icon="clock-outline" label="Pending" value={`₱${totalPending.toLocaleString()}`} color={Colors.yellow[500]} />
          <StatCard icon="check-circle" label="Completed" value={`₱${totalCompleted.toLocaleString()}`} color={Colors.green[500]} />
        </ScrollView>

        <View style={styles.filterChips}>
          {FILTER_OPTIONS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {sorted.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} payments</Text>
            </View>
          ) : sorted.map(payment => (
            <Card key={payment.id} style={styles.paymentCard} variant="elevated">
              <View style={styles.paymentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestName}>{payment.guest}</Text>
                  <Text style={styles.roomText}>{payment.room}</Text>
                </View>
                <Badge
                  label={payment.status}
                  variant={payment.status === 'Paid' ? 'success' : payment.status === 'Pending' ? 'warning' : 'error'}
                  size="sm"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="currency-php" size={18} color={Colors.brand.primary} />
                  <Text style={styles.amountText}>₱{payment.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="credit-card-outline" size={14} color={Colors.gray[500]} />
                  <Text style={styles.metaText}>{payment.method}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{payment.date}</Text>
                </View>
              </View>
              {payment.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(payment.id)}>
                    <Feather name="check" size={16} color={Colors.white} />
                    <Text style={styles.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(payment.id)}>
                    <Feather name="x" size={16} color={Colors.red[500]} />
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter & Sort</Text>

          <Text style={styles.modalSection}>Sort By</Text>
          {(['date', 'amount'] as const).map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.modalOption}
              onPress={() => { setSortBy(opt); setFilterModalVisible(false); }}
            >
              <Text style={[styles.modalOptionText, sortBy === opt && { color: Colors.brand.primary, fontWeight: '700' }]}>
                {opt === 'date' ? 'Date (newest)' : 'Amount (highest)'}
              </Text>
              {sortBy === opt && <Feather name="check" size={16} color={Colors.brand.primary} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.modalClose} onPress={() => setFilterModalVisible(false)}>
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  filterButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  statsScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  statCard: {
    width: 140, backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[100],
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.gray[500], textAlign: 'center' },
  filterChips: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },
  content: { padding: 20, gap: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },
  paymentCard: { padding: 16 },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  guestName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  roomText: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  paymentDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountText: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.gray[600] },
  metaDot: { fontSize: 12, color: Colors.gray[400] },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  confirmButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.green[500],
  },
  confirmText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  declineButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.red[100],
  },
  declineText: { fontSize: 13, fontWeight: '600', color: Colors.red[500] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 20 },
  modalSection: { fontSize: 12, fontWeight: '600', color: Colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  modalOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[50],
  },
  modalOptionText: { fontSize: 15, color: Colors.gray[700] },
  modalClose: {
    marginTop: 20, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.brand.primary, alignItems: 'center',
  },
  modalCloseText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});