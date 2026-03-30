import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import { paymentsService, PaymentMethod } from '../../../../services/paymentsService';

const FILTER_OPTIONS = ['All', 'Down payment pending', 'Down payment approved', 'Full payment pending', 'Full payment approved', 'Rejected'];

const filterTabColors: Record<string, { bg: string; text: string }> = {
  'All':                    { bg: Colors.brand.primarySoft, text: Colors.brand.primaryDark },
  'Down payment pending':   { bg: Colors.yellow[100],       text: '#92400E' },
  'Down payment approved':  { bg: Colors.green[100],        text: Colors.green[500] },
  'Full payment pending':   { bg: Colors.blue[100],         text: Colors.blue[600] },
  'Full payment approved':  { bg: Colors.green[100],        text: Colors.green[500] },
  'Rejected':               { bg: Colors.red[100],          text: Colors.red[500] },
};

function mapPaymentStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'pending_down_payment':   return 'Down payment pending';
    case 'approved_down_payment':  return 'Down payment approved';
    case 'pending_full_payment':   return 'Full payment pending';
    case 'approved_full_payment':
    case 'fully_paid':             return 'Full payment approved';
    case 'rejected':               return 'Rejected';
    default:                       return 'Down payment pending';
  }
}

type Payment = {
  id: string; bookingId: string; guest: string; amount: number; amountPaid: number;
  remainingBalance: number; method: string; status: string; date: string;
  checkIn: string; checkOut: string; proofUrl: string | null;
};

function mapApiPayment(raw: any): Payment {
  return {
    id: raw.id,
    bookingId: raw.booking_id,
    guest: `${raw.guest_first_name ?? ''} ${raw.guest_last_name ?? ''}`.trim() || raw.guest_email,
    amount: parseFloat(raw.total_amount ?? '0'),
    amountPaid: parseFloat(raw.amount_paid ?? '0'),
    remainingBalance: parseFloat(raw.remaining_balance ?? '0'),
    method: raw.payment_method ?? '',
    status: mapPaymentStatus(raw.payment_status ?? ''),
    date: raw.created_at ? new Date(raw.created_at).toLocaleDateString() : '',
    checkIn: raw.check_in_date ? new Date(raw.check_in_date).toLocaleDateString() : '',
    checkOut: raw.check_out_date ? new Date(raw.check_out_date).toLocaleDateString() : '',
    proofUrl: raw.payment_proof_url ?? null,
  };
}

export default function PaymentManagementScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [rawPayments, methods] = await Promise.all([
        paymentsService.getBookingPayments(),
        paymentsService.getPaymentMethods(),
      ]);
      setPayments(rawPayments.map(mapApiPayment));
      setPaymentMethods(methods);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load payments');
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleConfirm = (id: string) => {
    Alert.alert('Approve Payment', 'Approve this down payment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', style: 'default',
        onPress: async () => {
          try {
            await paymentsService.updatePaymentMethod(id, { payment_status: 'approved_down_payment' });
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to approve payment');
          }
        },
      },
    ]);
  };

  const handleDecline = (id: string) => {
    Alert.alert('Reject Payment', 'Are you sure you want to reject this payment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            await paymentsService.updatePaymentMethod(id, { payment_status: 'rejected' });
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reject payment');
          }
        },
      },
    ]);
  };

  const filtered = payments
    .filter(p => activeFilter === 'All' || p.status === activeFilter)
    .filter(p => !searchQuery || p.guest.toLowerCase().includes(searchQuery.toLowerCase()) || p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()));
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'amount' ? b.amount - a.amount : new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const kpiCards = [
    { label: 'Total Payments',          value: payments.length,                                                                  cardStyle: styles.kpiGreen,  icon: 'currency-php' },
    { label: 'Down Payment Approved',   value: payments.filter(p => p.status === 'Down payment approved').length,               cardStyle: styles.kpiTeal,   icon: 'check-circle-outline' },
    { label: 'Down Payment Pending',    value: payments.filter(p => p.status === 'Down payment pending').length,                 cardStyle: styles.kpiYellow, icon: 'clock-outline' },
    { label: 'Rejected',                value: payments.filter(p => p.status === 'Rejected').length,                            cardStyle: styles.kpiRed,    icon: 'close-circle-outline' },
  ] as const;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* ── Dark Hero Banner ──────────────────────────────────── */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Payments Management</Text>
        <Text style={styles.heroSubtitle}>Review and manage payment submissions</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* ── KPI Cards 2×2 ─────────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          {kpiCards.map(item => (
            <View key={item.label} style={[styles.kpiCard, item.cardStyle]}>
              <Text style={styles.kpiLabel}>{item.label}</Text>
              <View style={styles.kpiRow}>
                <Text style={styles.kpiValue}>{item.value}</Text>
                <MaterialCommunityIcons name={item.icon as any} size={28} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          ))}
        </View>

        {/* ── Search & Filter Bar ───────────────────────────────── */}
        <View style={styles.searchBar}>
          <View style={styles.searchInput}>
            <Feather name="search" size={15} color={Colors.gray[400]} />
            <TextInput
              style={styles.searchText}
              placeholder="Search by booking ID or guest name..."
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Feather name="filter" size={16} color={Colors.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusDropdown} onPress={() => setFilterModalVisible(true)}>
            <Text style={styles.statusDropdownText}>{activeFilter === 'All' ? 'All Status' : activeFilter}</Text>
            <Feather name="chevron-down" size={13} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>

        {/* ── Filter Chips ──────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {FILTER_OPTIONS.map(f => {
            const active = activeFilter === f;
            const colors = filterTabColors[f];
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && { backgroundColor: colors.bg }]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, active && { color: colors.text }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                  <Text style={styles.roomText}>{payment.bookingId}</Text>
                </View>
                <Badge
                  label={payment.status}
                  variant={payment.status.includes('approved') ? 'success' : payment.status.includes('pending') ? 'warning' : 'error'}
                  size="sm"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="currency-php" size={18} color={Colors.brand.primary} />
                  <Text style={styles.amountText}>₱{payment.amountPaid.toLocaleString()}</Text>
                  <Text style={styles.metaText}> / ₱{payment.amount.toLocaleString()} total</Text>
                </View>
                {payment.remainingBalance > 0 && (
                  <Text style={[styles.metaText, { color: Colors.yellow[500] }]}>
                    ₱{payment.remainingBalance.toLocaleString()} remaining
                  </Text>
                )}
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="credit-card-outline" size={14} color={Colors.gray[500]} />
                  <Text style={styles.metaText}>
                    {paymentMethods.find(m => m.payment_method === payment.method)?.payment_name ?? payment.method}
                  </Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{payment.checkIn} – {payment.checkOut}</Text>
                </View>
              </View>
              {payment.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(payment.id)}>
                    <Feather name="check" size={16} color={Colors.white} />
                    <Text style={styles.confirmText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(payment.id)}>
                    <Feather name="x" size={16} color={Colors.red[500]} />
                    <Text style={styles.declineText}>Reject</Text>
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

  // Hero
  heroBanner: {
    backgroundColor: Colors.gray[800],
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
  },
  heroTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  heroSubtitle: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },

  // KPI Grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  kpiCard: { width: '47%', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  kpiGreen:  { backgroundColor: '#10B981' },
  kpiTeal:   { backgroundColor: '#22C55E' },
  kpiYellow: { backgroundColor: '#F59E0B' },
  kpiRed:    { backgroundColor: '#EF4444' },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  kpiRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  kpiValue: { fontSize: 26, fontWeight: '800', color: Colors.white, lineHeight: 30 },

  // Search bar
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  searchInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchText: { flex: 1, fontSize: 12, color: Colors.gray[800] },
  filterButton: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  statusDropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  statusDropdownText: { fontSize: 12, fontWeight: '600', color: Colors.gray[700] },

  filterChips: { paddingHorizontal: 16, gap: 8, marginTop: 8, marginBottom: 4, flexDirection: 'row' },
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