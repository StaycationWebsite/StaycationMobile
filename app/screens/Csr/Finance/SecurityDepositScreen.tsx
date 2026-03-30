import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import { bookingsService } from '../../../../services/bookingsService';

// ─── Types ────────────────────────────────────────────────────────────────────
type Deposit = {
  id: string;
  depositId: string;
  bookingId: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  amount: number;
  status: string;
  depositStatus: string;
  checkIn: string;
  checkOut: string;
  checkInRaw: string;
  checkOutRaw: string;
};

type DateFilterOption = 'All Dates' | "Today's Check-ins" | "Today's Check-outs" | 'Custom Range';
const DATE_FILTER_OPTIONS: DateFilterOption[] = ['All Dates', "Today's Check-ins", "Today's Check-outs", 'Custom Range'];
const TODAY_STR = new Date().toISOString().split('T')[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mapDepositStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'paid':
    case 'holding':  return 'Paid';
    case 'returned':
    case 'released': return 'Returned';
    case 'partial':  return 'Partial';
    case 'forfeited':
    case 'deducted': return 'Forfeited';
    default:         return 'Pending';
  }
}

function generateDepositId(bookingId: string): string {
  const clean = bookingId.replace(/\D/g, '').slice(-6).toUpperCase();
  return `DP-${clean || bookingId.slice(-6).toUpperCase()}`;
}

function mapApiDeposit(raw: any): Deposit {
  return {
    id: raw.id,
    depositId: generateDepositId(raw.booking_id ?? raw.id),
    bookingId: raw.booking_id ?? '',
    guest: `${raw.guest_first_name ?? ''} ${raw.guest_last_name ?? ''}`.trim(),
    email: raw.guest_email ?? '',
    phone: raw.guest_phone ?? '',
    room: raw.room_name ?? '',
    amount: parseFloat(raw.security_deposit ?? '0'),
    status: mapDepositStatus(raw.deposit_status ?? ''),
    depositStatus: raw.deposit_status ?? 'pending',
    checkIn: raw.check_in_date
      ? new Date(raw.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    checkOut: raw.check_out_date
      ? new Date(raw.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    checkInRaw: raw.check_in_date ? raw.check_in_date.slice(0, 10) : '',
    checkOutRaw: raw.check_out_date ? raw.check_out_date.slice(0, 10) : '',
  };
}

// ─── Status badge variant ─────────────────────────────────────────────────────
function statusVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'Paid':
    case 'Returned':  return 'success';
    case 'Partial':   return 'info';
    case 'Forfeited': return 'error';
    default:          return 'warning'; // Pending
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bg, iconColor }: {
  label: string; value: string | number; icon: string; bg: string; iconColor: string;
}) => (
  <View style={[styles.statCard, { backgroundColor: bg }]}>
    <View style={styles.statTop}>
      <Text style={styles.statLabel}>{label}</Text>
      <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SecurityDepositScreen() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [allBookingsCount, setAllBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [deductModal, setDeductModal] = useState<{ visible: boolean; id: string | null }>({ visible: false, id: null });
  const [deductNote, setDeductNote] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('All Dates');
  const [showDateModal, setShowDateModal] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const fetchDeposits = useCallback(async () => {
    try {
      const bookings = await bookingsService.getBookings();
      setAllBookingsCount(bookings.length);
      const depositBookings = bookings.filter(b => b.has_security_deposit);
      setDeposits(depositBookings.map(mapApiDeposit));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load deposits');
    }
  }, []);

  useEffect(() => { fetchDeposits().finally(() => setLoading(false)); }, [fetchDeposits]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeposits();
    setRefreshing(false);
  };

  const handleRelease = (id: string) => {
    Alert.alert('Release Deposit', 'Return the full security deposit to the guest?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Release', style: 'default',
        onPress: () => setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Returned' } : d)),
      },
    ]);
  };

  const handleDeductConfirm = () => {
    if (!deductAmount || isNaN(Number(deductAmount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid deduction amount.');
      return;
    }
    setDeposits(prev => prev.map(d =>
      d.id === deductModal.id
        ? { ...d, status: 'Forfeited', amount: d.amount - Number(deductAmount) }
        : d
    ));
    setDeductModal({ visible: false, id: null });
    setDeductNote('');
    setDeductAmount('');
    Alert.alert('Deduction Applied', `₱${Number(deductAmount).toLocaleString()} has been deducted.`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Computed stats ─────────────────────────────────────────────────────────
  const pendingCount = deposits.filter(d => d.status === 'Pending').length;
  const paidCount = deposits.filter(d => d.status === 'Paid').length;
  const totalHeldAmount = deposits
    .filter(d => d.status === 'Pending' || d.status === 'Paid')
    .reduce((s, d) => s + d.amount, 0);

  // ── Filter + search ────────────────────────────────────────────────────────
  const FILTERS = ['All', 'Pending', 'Paid', 'Returned', 'Partial', 'Forfeited'];
  const filtered = deposits.filter(d => {
    const matchFilter = activeFilter === 'All' || d.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.guest.toLowerCase().includes(q) ||
      d.depositId.toLowerCase().includes(q) ||
      d.bookingId.toLowerCase().includes(q) ||
      d.room.toLowerCase().includes(q);
    let matchDate = true;
    if (dateFilter === "Today's Check-ins") matchDate = d.checkInRaw === TODAY_STR;
    else if (dateFilter === "Today's Check-outs") matchDate = d.checkOutRaw === TODAY_STR;
    else if (dateFilter === 'Custom Range') {
      if (customStart) matchDate = d.checkInRaw >= customStart;
      if (matchDate && customEnd) matchDate = d.checkInRaw <= customEnd;
    }
    return matchFilter && matchSearch && matchDate;
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Security Deposits</Text>
          <Text style={styles.headerSubtitle}>{deposits.length} total deposits</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Bookings"
            value={allBookingsCount}
            icon="calendar-multiselect"
            bg="#1E293B"
            iconColor="rgba(255,255,255,0.5)"
          />
          <StatCard
            label="Pending Deposits"
            value={pendingCount}
            icon="clock-outline"
            bg="#D97706"
            iconColor="rgba(255,255,255,0.5)"
          />
          <StatCard
            label="Paid (Holding)"
            value={paidCount}
            icon="shield-check"
            bg="#7C3AED"
            iconColor="rgba(255,255,255,0.5)"
          />
          <StatCard
            label="Total Held Amount"
            value={`₱${totalHeldAmount.toLocaleString()}`}
            icon="cash"
            bg="#059669"
            iconColor="rgba(255,255,255,0.5)"
          />
        </View>

        {/* ── Search + Date Filter ─────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={Colors.gray[400]} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search guest, deposit ID..."
              placeholderTextColor={Colors.gray[400]}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.dateFilterBtn, dateFilter !== 'All Dates' && styles.dateFilterBtnActive]}
            onPress={() => setShowDateModal(true)}
          >
            <Feather name="calendar" size={14} color={dateFilter !== 'All Dates' ? Colors.brand.primary : Colors.gray[600]} />
            <Feather name="chevron-down" size={13} color={dateFilter !== 'All Dates' ? Colors.brand.primary : Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* ── Custom Range Inputs ──────────────────────────────────────────── */}
        {showCustomRange && (
          <View style={styles.customRangeRow}>
            <View style={styles.customRangeField}>
              <Text style={styles.customRangeLabel}>From (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.customRangeInput}
                placeholder="2026-03-01"
                placeholderTextColor={Colors.gray[400]}
                value={customStart}
                onChangeText={setCustomStart}
              />
            </View>
            <View style={styles.customRangeField}>
              <Text style={styles.customRangeLabel}>To (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.customRangeInput}
                placeholder="2026-03-31"
                placeholderTextColor={Colors.gray[400]}
                value={customEnd}
                onChangeText={setCustomEnd}
              />
            </View>
          </View>
        )}

        {/* ── Filter Chips ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Deposit Cards ────────────────────────────────────────────────── */}
        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="shield-off-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No deposits found</Text>
            </View>
          ) : filtered.map(deposit => (
            <View key={deposit.id} style={styles.depositCard}>
              {/* Card Top: Deposit ID + Status */}
              <View style={styles.cardTopRow}>
                <View style={styles.depositIdBadge}>
                  <MaterialCommunityIcons name="identifier" size={13} color={Colors.brand.primary} />
                  <Text style={styles.depositIdText}>{deposit.depositId}</Text>
                </View>
                <Badge label={deposit.status} variant={statusVariant(deposit.status)} size="sm" />
              </View>

              {/* Haven & Booking */}
              <View style={styles.havenRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.gray[500]} />
                <Text style={styles.havenText}>{deposit.room}</Text>
              </View>
              <Text style={styles.bookingIdText}>Booking ID: {deposit.bookingId}</Text>

              <View style={styles.divider} />

              {/* Guest Info */}
              <View style={styles.guestRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(deposit.guest[0] ?? '?').toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestName}>{deposit.guest}</Text>
                  {deposit.email ? (
                    <View style={styles.infoLine}>
                      <Feather name="mail" size={11} color={Colors.gray[400]} />
                      <Text style={styles.infoText} numberOfLines={1}>{deposit.email}</Text>
                    </View>
                  ) : null}
                  {deposit.phone ? (
                    <View style={styles.infoLine}>
                      <Feather name="phone" size={11} color={Colors.gray[400]} />
                      <Text style={styles.infoText}>{deposit.phone}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Amount */}
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Deposit</Text>
                  <Text style={[
                    styles.amountValue,
                    { color: deposit.amount === 0 ? Colors.gray[400] : Colors.brand.primary },
                  ]}>
                    ₱{deposit.amount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Dates */}
              <View style={styles.datesRow}>
                <View style={styles.dateCol}>
                  <View style={styles.dateDotRow}>
                    <View style={[styles.dateDot, { backgroundColor: Colors.green[500] }]} />
                    <Text style={styles.dateLabel}>Check-in</Text>
                  </View>
                  <Text style={styles.dateValue}>{deposit.checkIn}</Text>
                </View>
                <View style={styles.dateSep} />
                <View style={styles.dateCol}>
                  <View style={styles.dateDotRow}>
                    <View style={[styles.dateDot, { backgroundColor: Colors.red[500] }]} />
                    <Text style={styles.dateLabel}>Check-out</Text>
                  </View>
                  <Text style={styles.dateValue}>{deposit.checkOut}</Text>
                </View>
              </View>

              {/* Actions */}
              {deposit.status === 'Pending' || deposit.status === 'Paid' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.releaseBtn} onPress={() => handleRelease(deposit.id)}>
                    <Feather name="check-circle" size={15} color={Colors.white} />
                    <Text style={styles.releaseBtnText}>Release</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deductBtn}
                    onPress={() => { setDeductModal({ visible: true, id: deposit.id }); setDeductAmount(String(deposit.amount)); }}
                  >
                    <Feather name="alert-circle" size={15} color={Colors.red[500]} />
                    <Text style={styles.deductBtnText}>Deduct</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateModal(false)} />
        <View style={styles.dateDropdown}>
          <Text style={styles.dateDropdownTitle}>Filter by Date</Text>
          {DATE_FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.dateDropdownItem, dateFilter === opt && styles.dateDropdownItemActive]}
              onPress={() => {
                setDateFilter(opt);
                setShowDateModal(false);
                setShowCustomRange(opt === 'Custom Range');
                if (opt !== 'Custom Range') { setCustomStart(''); setCustomEnd(''); }
              }}
            >
              <Text style={[styles.dateDropdownItemText, dateFilter === opt && styles.dateDropdownItemTextActive]}>
                {opt}
              </Text>
              {dateFilter === opt && <Feather name="check" size={15} color={Colors.brand.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Deduct Modal */}
      <Modal visible={deductModal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDeductModal({ visible: false, id: null })} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Deduct from Deposit</Text>
          <Text style={styles.modalSub}>Enter the amount to deduct for damages or fees.</Text>

          <Text style={styles.inputLabel}>Deduction Amount (₱)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 1000"
            keyboardType="numeric"
            value={deductAmount}
            onChangeText={setDeductAmount}
            placeholderTextColor={Colors.gray[400]}
          />

          <Text style={styles.inputLabel}>Reason / Notes (optional)</Text>
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="e.g. Broken window, stained sheets..."
            multiline
            value={deductNote}
            onChangeText={setDeductNote}
            placeholderTextColor={Colors.gray[400]}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeductModal({ visible: false, id: null })}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleDeductConfirm}>
              <Text style={styles.applyBtnText}>Apply Deduction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },

  // Header
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },

  // Stat Cards (2x2 grid)
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 16, gap: 10,
  },
  statCard: {
    width: '47.5%', borderRadius: 14, padding: 14,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)', flexShrink: 1, marginRight: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.white },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },

  // Date Filter
  dateFilterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 2, gap: 8 },
  dateFilterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  dateFilterBtnActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primarySoft,
  },
  dateFilterText: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], flex: 1 },
  clearDateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8 },
  clearDateText: { fontSize: 12, color: Colors.gray[500] },
  customRangeRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 8 },
  customRangeField: { flex: 1 },
  customRangeLabel: { fontSize: 11, fontWeight: '600', color: Colors.gray[600], marginBottom: 4 },
  customRangeInput: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 13,
    color: Colors.gray[900], backgroundColor: Colors.white,
  },
  dateDropdown: {
    position: 'absolute', top: '40%', left: 16, right: 16,
    backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 8, paddingHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  dateDropdownTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[400], paddingHorizontal: 16, paddingVertical: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  dateDropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  dateDropdownItemActive: { backgroundColor: Colors.brand.primarySoft, borderRadius: 10, marginHorizontal: 4 },
  dateDropdownItemText: { fontSize: 15, fontWeight: '500', color: Colors.gray[800] },
  dateDropdownItemTextActive: { color: Colors.brand.primary, fontWeight: '700' },

  // Filters
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },

  // Content
  content: { paddingHorizontal: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },

  // Deposit Card
  depositCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  depositIdBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.brand.primarySoft, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  depositIdText: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary, letterSpacing: 0.5 },

  havenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  havenText: { fontSize: 13, fontWeight: '600', color: Colors.gray[800] },
  bookingIdText: { fontSize: 11, color: Colors.gray[500], marginBottom: 12 },

  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },

  guestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.brand.primary },
  guestName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900], marginBottom: 3 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  infoText: { fontSize: 11, color: Colors.gray[500], flex: 1 },

  amountBox: { alignItems: 'flex-end', minWidth: 70 },
  amountLabel: { fontSize: 10, color: Colors.gray[500], marginBottom: 2 },
  amountValue: { fontSize: 16, fontWeight: '800' },

  datesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateCol: { flex: 1 },
  dateDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  dateDot: { width: 7, height: 7, borderRadius: 4 },
  dateLabel: { fontSize: 11, color: Colors.gray[500] },
  dateValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  dateSep: { width: 1, height: 32, backgroundColor: Colors.gray[150] ?? Colors.gray[200], marginHorizontal: 12 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  releaseBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.green[500],
  },
  releaseBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  deductBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.red[100],
  },
  deductBtnText: { fontSize: 13, fontWeight: '700', color: Colors.red[500] },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 6 },
  modalSub: { fontSize: 13, color: Colors.gray[500], marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: Colors.gray[900], backgroundColor: Colors.gray[50], marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  applyBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.red[500], alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
