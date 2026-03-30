import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import { deliverablesService, DeliverableRecord } from '../../../../services/deliverablesService';

type StatusFilter = 'All' | 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled' | 'Refunded';
type DateFilterOption = 'All Dates' | "Today's Check-ins" | "Today's Check-outs" | 'Custom Range';

const FILTERS: StatusFilter[] = ['All', 'Pending', 'Preparing', 'Delivered', 'Cancelled', 'Refunded'];
const DATE_FILTER_OPTIONS: DateFilterOption[] = ['All Dates', "Today's Check-ins", "Today's Check-outs", 'Custom Range'];
const TODAY_STR = new Date().toISOString().slice(0, 10);

function statusVariant(status: string): 'warning' | 'info' | 'success' | 'error' | 'default' {
  switch (status?.toLowerCase()) {
    case 'pending':   return 'warning';
    case 'preparing': return 'info';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'refunded':  return 'default';
    default:          return 'default';
  }
}

function capitalize(s: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function DeliverablesManagementScreen() {
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [search, setSearch]             = useState('');
  const [actionTarget, setActionTarget] = useState<DeliverableRecord | null>(null);
  const [dateFilter, setDateFilter]     = useState<DateFilterOption>('All Dates');
  const [showDateModal, setShowDateModal] = useState(false);
  const [customStart, setCustomStart]   = useState('');
  const [customEnd, setCustomEnd]       = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const fetchDeliverables = useCallback(async () => {
    try {
      const data = await deliverablesService.getAllDeliverables();
      setDeliverables(data);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load deliverables');
    }
  }, []);

  useEffect(() => { fetchDeliverables().finally(() => setLoading(false)); }, [fetchDeliverables]);

  const onRefresh = async () => { setRefreshing(true); await fetchDeliverables(); setRefreshing(false); };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount     = deliverables.length;
  const pendingCount   = deliverables.filter(d => d.overall_status?.toLowerCase() === 'pending').length;
  const preparingCount = deliverables.filter(d => d.overall_status?.toLowerCase() === 'preparing').length;
  const deliveredCount = deliverables.filter(d => d.overall_status?.toLowerCase() === 'delivered').length;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = deliverables.filter(d => {
    const matchStatus = activeFilter === 'All' || d.overall_status?.toLowerCase() === activeFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q
      || d.deliverable_id?.toLowerCase().includes(q)
      || d.guest?.toLowerCase().includes(q)
      || d.haven?.toLowerCase().includes(q)
      || d.booking_id?.toLowerCase().includes(q);

    let matchDate = true;
    if (dateFilter === "Today's Check-ins") {
      matchDate = d.checkin_date?.slice(0, 10) === TODAY_STR;
    } else if (dateFilter === "Today's Check-outs") {
      matchDate = d.checkout_date?.slice(0, 10) === TODAY_STR;
    } else if (dateFilter === 'Custom Range' && customStart && customEnd) {
      const ci = d.checkin_date?.slice(0, 10) ?? '';
      matchDate = ci >= customStart && ci <= customEnd;
    }

    return matchStatus && matchSearch && matchDate;
  });

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusAction = async (record: DeliverableRecord, action: 'preparing' | 'delivered' | 'cancelled' | 'refunded') => {
    try {
      if (action === 'delivered' || action === 'cancelled' || action === 'refunded') {
        await deliverablesService.performAction(record.id, action);
      } else {
        await deliverablesService.updateStatus(record.id, action);
      }
      setDeliverables(prev => prev.map(d =>
        d.id === record.id ? { ...d, overall_status: capitalize(action) } : d
      ));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update status');
    }
    setActionTarget(null);
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

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color={Colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.heroTitle}>Deliverables</Text>
              <Text style={styles.heroSub}>{totalCount} total order{totalCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: '#7C3AED' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Total</Text>
              <MaterialCommunityIcons name="package-variant" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{totalCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#D97706' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Pending</Text>
              <MaterialCommunityIcons name="clock-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{pendingCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#2563EB' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Preparing</Text>
              <MaterialCommunityIcons name="progress-wrench" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{preparingCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#16A34A' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Delivered</Text>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{deliveredCount}</Text>
          </View>
        </View>

        {/* ── Search + Date Filter ─────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={Colors.gray[400]} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ID, guest, or haven..."
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
          <TouchableOpacity
            style={[styles.dateFilterBtn, dateFilter !== 'All Dates' && styles.dateFilterBtnActive]}
            onPress={() => setShowDateModal(true)}
          >
            <Feather name="calendar" size={15} color={dateFilter !== 'All Dates' ? Colors.brand.primary : Colors.gray[500]} />
            <Feather name="chevron-down" size={13} color={dateFilter !== 'All Dates' ? Colors.brand.primary : Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Custom range inputs */}
        {dateFilter === 'Custom Range' && (
          <View style={styles.customRangeRow}>
            <TextInput
              style={styles.customRangeInput}
              placeholder="Start (YYYY-MM-DD)"
              placeholderTextColor={Colors.gray[400]}
              value={customStart}
              onChangeText={setCustomStart}
            />
            <Text style={{ color: Colors.gray[400], fontSize: 13 }}>–</Text>
            <TextInput
              style={styles.customRangeInput}
              placeholder="End (YYYY-MM-DD)"
              placeholderTextColor={Colors.gray[400]}
              value={customEnd}
              onChangeText={setCustomEnd}
            />
          </View>
        )}

        {/* ── Filter Chips ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Cards ────────────────────────────────────────────────────────── */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant-closed" size={52} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No deliverables found</Text>
              <Text style={styles.emptyText}>
                {activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} deliverables` : 'No deliverable orders yet'}
              </Text>
            </View>
          ) : filtered.map(d => (
            <View key={d.id} style={styles.card}>

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.idTag}>
                  <MaterialCommunityIcons name="package-variant" size={12} color={Colors.brand.primary} />
                  <Text style={styles.idTagText}>{d.deliverable_id || 'DL-???'}</Text>
                </View>
                <Badge
                  label={capitalize(d.overall_status)}
                  variant={statusVariant(d.overall_status)}
                  size="sm"
                />
              </View>

              {/* Haven & Booking */}
              <View style={styles.havenRow}>
                <Feather name="map-pin" size={13} color={Colors.gray[500]} />
                <Text style={styles.havenText}>{d.haven}{d.tower ? ` · ${d.tower}` : ''}</Text>
              </View>
              <View style={styles.bookingRow}>
                <Feather name="hash" size={11} color={Colors.gray[400]} />
                <Text style={styles.bookingText}>{d.booking_id}</Text>
              </View>

              <View style={styles.divider} />

              {/* Guest info */}
              <View style={styles.guestSection}>
                <View style={styles.guestAvatar}>
                  <Text style={styles.guestAvatarText}>{(d.guest || 'G')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestName}>{d.guest || 'Unknown Guest'}</Text>
                  {d.guest_email ? <Text style={styles.guestDetail}>{d.guest_email}</Text> : null}
                  {d.guest_phone ? <Text style={styles.guestDetail}>{d.guest_phone}</Text> : null}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Items */}
              <Text style={styles.itemsHeader}>Items Ordered</Text>
              {(d.items || []).map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>Qty: {item.quantity} · {item.formatted_price || `₱${item.price}`}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemTotal}>{item.formatted_total || `₱${item.total_price}`}</Text>
                    <Badge label={capitalize(item.status)} variant={statusVariant(item.status)} size="sm" />
                  </View>
                </View>
              ))}

              {/* Grand total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{d.formatted_grand_total || `₱${d.grand_total}`}</Text>
              </View>

              {/* Action button */}
              {d.overall_status?.toLowerCase() !== 'delivered' &&
               d.overall_status?.toLowerCase() !== 'cancelled' &&
               d.overall_status?.toLowerCase() !== 'refunded' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setActionTarget(d)}
                >
                  <Feather name="zap" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Update Status</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Date Filter Modal ────────────────────────────────────────────────── */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowDateModal(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Filter by Date</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {DATE_FILTER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.dateOptBtn, dateFilter === opt && styles.dateOptBtnActive]}
                onPress={() => {
                  setDateFilter(opt);
                  setShowCustomRange(opt === 'Custom Range');
                  setShowDateModal(false);
                }}
              >
                <Text style={[styles.dateOptText, dateFilter === opt && styles.dateOptTextActive]}>{opt}</Text>
                {dateFilter === opt && <Feather name="check" size={15} color={Colors.brand.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Status Action Modal ───────────────────────────────────────────────── */}
      <Modal visible={actionTarget !== null} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setActionTarget(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Update Status</Text>
          {actionTarget && (
            <Text style={styles.sheetSub}>{actionTarget.deliverable_id} · {actionTarget.guest}</Text>
          )}

          <View style={styles.sheetActions}>
            {actionTarget?.overall_status?.toLowerCase() === 'pending' && (
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => actionTarget && handleStatusAction(actionTarget, 'preparing')}
              >
                <MaterialCommunityIcons name="progress-wrench" size={16} color={Colors.white} />
                <Text style={styles.sheetBtnText}>Mark as Preparing</Text>
              </TouchableOpacity>
            )}
            {(actionTarget?.overall_status?.toLowerCase() === 'pending' ||
              actionTarget?.overall_status?.toLowerCase() === 'preparing') && (
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: '#16A34A' }]}
                onPress={() => actionTarget && handleStatusAction(actionTarget, 'delivered')}
              >
                <MaterialCommunityIcons name="check-circle-outline" size={16} color={Colors.white} />
                <Text style={styles.sheetBtnText}>Mark as Delivered</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => actionTarget && handleStatusAction(actionTarget, 'cancelled')}
            >
              <Feather name="x-circle" size={16} color={Colors.white} />
              <Text style={styles.sheetBtnText}>Cancel Deliverable</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActionTarget(null)}>
              <Text style={styles.cancelBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 18,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  heroSub:   { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  kpiCard: { width: '47.5%', borderRadius: 14, padding: 14 },
  kpiRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: Colors.white },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2, gap: 8 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },
  dateFilterBtn: {
    width: 44, height: 44, borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[200],
  },
  dateFilterBtnActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  customRangeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 8,
  },
  customRangeInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: Colors.gray[900],
    backgroundColor: Colors.white,
  },
  dateOptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: Colors.gray[50], borderWidth: 1, borderColor: Colors.gray[100],
  },
  dateOptBtnActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  dateOptText: { fontSize: 14, fontWeight: '500', color: Colors.gray[700] },
  dateOptTextActive: { color: Colors.brand.primary, fontWeight: '600' },

  // Chips
  chipRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText:       { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },

  // List
  list: { paddingHorizontal: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 56, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[700] },
  emptyText:  { fontSize: 13, color: Colors.gray[400], textAlign: 'center' },

  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  idTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.brand.primarySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  idTagText: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary, letterSpacing: 0.8 },

  havenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  havenText: { fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  bookingText: { fontSize: 11, color: Colors.gray[400] },

  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },

  // Guest
  guestSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  guestAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  guestAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.brand.primary },
  guestName:   { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },
  guestDetail: { fontSize: 11, color: Colors.gray[400], marginTop: 1 },

  // Items
  itemsHeader: { fontSize: 11, fontWeight: '700', color: Colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 13, fontWeight: '600', color: Colors.gray[800] },
  itemMeta: { fontSize: 11, color: Colors.gray[400], marginTop: 1 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemTotal: { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.gray[100], marginBottom: 12,
  },
  totalLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray[500] },
  totalValue: { fontSize: 15, fontWeight: '800', color: Colors.gray[900] },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primary,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },

  // Modal
  overlay: { flex: 0.4, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200],
    alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  sheetSub:   { fontSize: 13, color: Colors.gray[400], marginBottom: 20 },
  sheetActions: { gap: 10 },
  sheetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
  },
  sheetBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
});
