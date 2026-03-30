import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import { cleaningService, CleaningTask } from '../../../../services/cleaningService';

type StatusFilter = 'All' | 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed';
type DateFilterOption = 'All Dates' | "Today's Check-ins" | "Today's Check-outs" | 'Custom Range';

const STATUS_FILTERS: StatusFilter[] = ['All', 'Unassigned', 'Assigned', 'In Progress', 'Completed'];
const DATE_FILTER_OPTIONS: DateFilterOption[] = ['All Dates', "Today's Check-ins", "Today's Check-outs", 'Custom Range'];
const TODAY_STR = new Date().toISOString().slice(0, 10);

function getDisplayStatus(task: CleaningTask): StatusFilter {
  switch (task.cleaning_status) {
    case 'pending':     return task.assigned_cleaner_id ? 'Assigned' : 'Unassigned';
    case 'assigned':    return 'Assigned';
    case 'in_progress': return 'In Progress';
    case 'completed':   return 'Completed';
    default:            return task.assigned_cleaner_id ? 'Assigned' : 'Unassigned';
  }
}

function statusVariant(s: string): 'warning' | 'info' | 'success' | 'error' | 'default' {
  switch (s) {
    case 'Unassigned':  return 'warning';
    case 'Assigned':    return 'info';
    case 'In Progress': return 'info';
    case 'Completed':   return 'success';
    default:            return 'default';
  }
}

export default function CleanersManagementScreen() {
  const [tasks, setTasks]               = useState<CleaningTask[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [search, setSearch]             = useState('');
  const [dateFilter, setDateFilter]     = useState<DateFilterOption>('All Dates');
  const [showDateModal, setShowDateModal] = useState(false);
  const [customStart, setCustomStart]   = useState('');
  const [customEnd, setCustomEnd]       = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const data = await cleaningService.getCleaningTasks();
      setTasks(data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchTasks().finally(() => setLoading(false)); }, [fetchTasks]);

  const onRefresh = async () => { setRefreshing(true); await fetchTasks(); setRefreshing(false); };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount      = tasks.length;
  const unassignedCount = tasks.filter(t => getDisplayStatus(t) === 'Unassigned').length;
  const assignedCount   = tasks.filter(t => getDisplayStatus(t) === 'Assigned').length;
  const inProgressCount = tasks.filter(t => getDisplayStatus(t) === 'In Progress').length;
  const completedCount  = tasks.filter(t => getDisplayStatus(t) === 'Completed').length;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    const ds = getDisplayStatus(t);
    const matchStatus = activeFilter === 'All' || ds === activeFilter;

    const q = search.toLowerCase();
    const cleanerName = `${t.cleaner_first_name ?? ''} ${t.cleaner_last_name ?? ''}`.trim().toLowerCase();
    const guestName   = `${t.guest_first_name ?? ''} ${t.guest_last_name ?? ''}`.trim().toLowerCase();
    const matchSearch = !q
      || t.booking_id?.toLowerCase().includes(q)
      || t.haven?.toLowerCase().includes(q)
      || guestName.includes(q)
      || cleanerName.includes(q);

    let matchDate = true;
    if (dateFilter === "Today's Check-ins") {
      matchDate = t.check_in_date?.slice(0, 10) === TODAY_STR;
    } else if (dateFilter === "Today's Check-outs") {
      matchDate = t.check_out_date?.slice(0, 10) === TODAY_STR;
    } else if (dateFilter === 'Custom Range' && customStart && customEnd) {
      const ci = t.check_in_date?.slice(0, 10) ?? '';
      matchDate = ci >= customStart && ci <= customEnd;
    }

    return matchStatus && matchSearch && matchDate;
  });

  function formatDate(dateStr: string, timeStr?: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const base = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    if (timeStr) return `${base} ${timeStr.slice(0, 5)}`;
    return base;
  }

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
              <MaterialCommunityIcons name="broom" size={20} color={Colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.heroTitle}>Cleaners Management</Text>
              <Text style={styles.heroSub}>{totalCount} cleaning task{totalCount !== 1 ? 's' : ''} total</Text>
            </View>
          </View>
        </View>

        {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={[styles.kpiCard, { backgroundColor: '#EA580C' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Total Tasks</Text>
              <MaterialCommunityIcons name="star-four-points-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{totalCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#6B7280' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Unassigned</Text>
              <MaterialCommunityIcons name="account-multiple-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{unassignedCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#7C3AED' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Assigned</Text>
              <MaterialCommunityIcons name="clipboard-list-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{assignedCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#D97706' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>In Progress</Text>
              <MaterialCommunityIcons name="clock-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{inProgressCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#16A34A' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Completed</Text>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{completedCount}</Text>
          </View>
        </ScrollView>

        {/* ── Search + Date Filter ─────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={Colors.gray[400]} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by booking ID, guest, haven, or cleaner..."
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
          {STATUS_FILTERS.map(f => {
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

        {/* ── Task Cards ───────────────────────────────────────────────────── */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="broom" size={52} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>
                {activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} cleaning tasks` : 'No cleaning tasks yet'}
              </Text>
            </View>
          ) : filtered.map(task => {
            const displayStatus = getDisplayStatus(task);
            const cleanerName = task.cleaner_first_name
              ? `${task.cleaner_first_name} ${task.cleaner_last_name ?? ''}`.trim()
              : null;
            const guestName = `${task.guest_first_name ?? ''} ${task.guest_last_name ?? ''}`.trim() || 'Unknown Guest';

            return (
              <View key={task.cleaning_id} style={styles.card}>

                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.bookingTag}>
                    <Feather name="hash" size={11} color={Colors.brand.primary} />
                    <Text style={styles.bookingTagText}>{task.booking_id}</Text>
                  </View>
                  <Badge label={displayStatus} variant={statusVariant(displayStatus)} size="sm" />
                </View>

                {/* Haven */}
                <View style={styles.havenRow}>
                  <Feather name="map-pin" size={13} color={Colors.gray[500]} />
                  <Text style={styles.havenText}>{task.haven || '—'}</Text>
                </View>

                <View style={styles.divider} />

                {/* Guest */}
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconWrap, { backgroundColor: Colors.brand.primarySoft }]}>
                    <Feather name="user" size={13} color={Colors.brand.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Guest</Text>
                    <Text style={styles.infoVal}>{guestName}</Text>
                    {task.guest_email ? <Text style={styles.infoSub}>{task.guest_email}</Text> : null}
                  </View>
                </View>

                {/* Check-in / Check-out */}
                <View style={styles.datesRow}>
                  <View style={styles.dateBlock}>
                    <View style={[styles.infoIconWrap, { backgroundColor: '#EDE9FE' }]}>
                      <MaterialCommunityIcons name="login" size={13} color="#7C3AED" />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Check-in</Text>
                      <Text style={styles.infoVal}>{formatDate(task.check_in_date, task.check_in_time)}</Text>
                    </View>
                  </View>
                  <View style={styles.dateBlock}>
                    <View style={[styles.infoIconWrap, { backgroundColor: '#FEF3C7' }]}>
                      <MaterialCommunityIcons name="logout" size={13} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Check-out</Text>
                      <Text style={styles.infoVal}>{formatDate(task.check_out_date, task.check_out_time)}</Text>
                    </View>
                  </View>
                </View>

                {/* Assigned cleaner */}
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconWrap, { backgroundColor: cleanerName ? Colors.green[100] : Colors.gray[100] }]}>
                    <MaterialCommunityIcons
                      name={cleanerName ? 'account-check' : 'account-off-outline'}
                      size={13}
                      color={cleanerName ? Colors.green[500] : Colors.gray[400]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Assigned Cleaner</Text>
                    <Text style={[styles.infoVal, !cleanerName && { color: Colors.gray[400] }]}>
                      {cleanerName || 'Not yet assigned'}
                    </Text>
                    {task.cleaner_employment_id ? (
                      <Text style={styles.infoSub}>ID: {task.cleaner_employment_id}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Cleaning times if available */}
                {(task.cleaning_time_in || task.cleaned_at) && (
                  <View style={styles.cleaningTimeRow}>
                    {task.cleaning_time_in && (
                      <View style={styles.cleaningTimePill}>
                        <MaterialCommunityIcons name="play-circle-outline" size={12} color={Colors.blue[500]} />
                        <Text style={styles.cleaningTimeText}>Started: {task.cleaning_time_in.slice(0, 5)}</Text>
                      </View>
                    )}
                    {task.cleaning_time_out && (
                      <View style={styles.cleaningTimePill}>
                        <MaterialCommunityIcons name="stop-circle-outline" size={12} color={Colors.green[500]} />
                        <Text style={styles.cleaningTimeText}>Ended: {task.cleaning_time_out.slice(0, 5)}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Date Filter Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowDateModal(false)}
        />
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

  // KPI — horizontal scroll (5 cards)
  kpiScroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, gap: 10 },
  kpiCard: { width: 130, borderRadius: 14, padding: 14 },
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
  bookingTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.brand.primarySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  bookingTagText: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary },

  havenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  havenText: { fontSize: 14, fontWeight: '600', color: Colors.gray[800] },

  divider: { height: 1, backgroundColor: Colors.gray[100], marginVertical: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 10, color: Colors.gray[400], fontWeight: '600', textTransform: 'uppercase' },
  infoVal:   { fontSize: 13, fontWeight: '700', color: Colors.gray[900], marginTop: 1 },
  infoSub:   { fontSize: 11, color: Colors.gray[400], marginTop: 1 },

  datesRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  dateBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },

  cleaningTimeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  cleaningTimePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gray[50], borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  cleaningTimeText: { fontSize: 11, color: Colors.gray[600], fontWeight: '600' },

  // Date modal
  overlay: { flex: 0.5, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200],
    alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  dateOptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: Colors.gray[50], borderWidth: 1, borderColor: Colors.gray[100],
  },
  dateOptBtnActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  dateOptText:       { fontSize: 14, fontWeight: '500', color: Colors.gray[700] },
  dateOptTextActive: { color: Colors.brand.primary, fontWeight: '600' },
});
