import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

// ─── Mock Data ────────────────────────────────────────────────────────────────
type CleaningStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed';

interface CleaningTask {
  id: string;
  bookingId: string;
  haven: string;
  guest: string;
  email: string;
  checkIn: string;
  checkOut: string;
  assignedCleaner: string | null;
  status: CleaningStatus;
}

const MOCK_TASKS: CleaningTask[] = [
  {
    id: '1',
    bookingId: 'BK1776828698884',
    haven: 'Haven 1',
    guest: 'John Doe',
    email: 'csr@staycationhavenph.com',
    checkIn: 'Apr 22, 2026 02:00 PM',
    checkOut: 'Jul 23, 2026 11:00 AM',
    assignedCleaner: null,
    status: 'Unassigned',
  },
  {
    id: '2',
    bookingId: 'BK1774254762371',
    haven: 'Haven 8',
    guest: 'Sample Sample',
    email: 'jhayrcervantes0981@gmail.com',
    checkIn: 'May 13, 2026 02:00 PM',
    checkOut: 'May 22, 2026 11:00 AM',
    assignedCleaner: 'Joel Malupiton',
    status: 'Assigned',
  },
  {
    id: '3',
    bookingId: 'BK-1773290589114-XUMQ875HW',
    haven: 'Haven 1',
    guest: 'Joel Malupiton',
    email: 'jusper.anderson@gmail.com',
    checkIn: 'May 12, 2026 02:00 PM',
    checkOut: 'May 17, 2026 11:00 AM',
    assignedCleaner: 'Cleaner Staycation',
    status: 'Assigned',
  },
  {
    id: '4',
    bookingId: 'BK-1776154974648-3QAA5K68W',
    haven: 'Haven 3',
    guest: 'Joel Malupiton',
    email: 'jusper.anderson@gmail.com',
    checkIn: 'May 14, 2026 02:00 PM',
    checkOut: 'May 15, 2026 12:00 AM',
    assignedCleaner: null,
    status: 'Unassigned',
  },
  {
    id: '5',
    bookingId: 'BK1775973772988',
    haven: 'Haven 1',
    guest: 'd4vd fghx',
    email: 'd4vd2025@gmail.com',
    checkIn: 'Apr 30, 2026 02:00 PM',
    checkOut: 'Apr 30, 2026 12:00 AM',
    assignedCleaner: null,
    status: 'Unassigned',
  },
  {
    id: '6',
    bookingId: 'BK1774422273264',
    haven: 'Haven 3',
    guest: 'Test Test',
    email: 'test@gmail.com',
    checkIn: 'Apr 28, 2026 02:00 PM',
    checkOut: 'Apr 30, 2026 11:00 AM',
    assignedCleaner: 'Cleaner Staycation',
    status: 'Assigned',
  },
  {
    id: '7',
    bookingId: 'BK1771234567890',
    haven: 'Haven 2',
    guest: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    checkIn: 'May 1, 2026 02:00 PM',
    checkOut: 'May 3, 2026 11:00 AM',
    assignedCleaner: 'Juan Cruz',
    status: 'In Progress',
  },
  {
    id: '8',
    bookingId: 'BK1779876543210',
    haven: 'Haven 5',
    guest: 'Anna Reyes',
    email: 'anna.reyes@gmail.com',
    checkIn: 'Apr 25, 2026 02:00 PM',
    checkOut: 'Apr 27, 2026 11:00 AM',
    assignedCleaner: 'Liza Torres',
    status: 'Completed',
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<CleaningStatus, { color: string; bg: string; icon: string }> = {
  Unassigned:  { color: '#6B7280', bg: '#F3F4F6', icon: 'account-off-outline' },
  Assigned:    { color: '#3B82F6', bg: '#EFF6FF', icon: 'account-check-outline' },
  'In Progress':{ color: '#F59E0B', bg: '#FFFBEB', icon: 'progress-clock' },
  Completed:   { color: '#10B981', bg: '#ECFDF5', icon: 'check-circle-outline' },
};

const STAT_CARDS = [
  { label: 'Total Tasks',  key: 'total',      color: '#F97316', icon: 'star-four-points' },
  { label: 'Unassigned',   key: 'unassigned', color: '#6B7280', icon: 'account-off-outline' },
  { label: 'Assigned',     key: 'assigned',   color: '#6366F1', icon: 'clipboard-list-outline' },
  { label: 'In Progress',  key: 'inProgress', color: '#F59E0B', icon: 'progress-clock' },
  { label: 'Completed',    key: 'completed',  color: '#10B981', icon: 'check-circle-outline' },
];

const STATUS_FILTERS: Array<CleaningStatus | 'All'> = [
  'All', 'Unassigned', 'Assigned', 'In Progress', 'Completed',
];

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onPress }: { task: CleaningTask; onPress: () => void }) {
  const cfg = STATUS_CONFIG[task.status];
  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.75}>
      {/* Top row */}
      <View style={styles.taskCardHeader}>
        <Text style={styles.bookingId} numberOfLines={1}>{task.bookingId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{task.status}</Text>
        </View>
      </View>

      {/* Haven & Guest */}
      <View style={styles.taskRow}>
        <MaterialCommunityIcons name="home-city-outline" size={13} color={Colors.brand.primary} />
        <Text style={styles.taskHaven}>{task.haven}</Text>
        <Text style={styles.taskDot}>·</Text>
        <Text style={styles.taskGuest} numberOfLines={1}>{task.guest}</Text>
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateChip}>
          <MaterialCommunityIcons name="login" size={11} color={Colors.green[500]} />
          <Text style={[styles.dateText, { color: Colors.green[500] }]}>{task.checkIn}</Text>
        </View>
        <View style={styles.dateChip}>
          <MaterialCommunityIcons name="logout" size={11} color={Colors.red[500]} />
          <Text style={[styles.dateText, { color: Colors.red[500] }]}>{task.checkOut}</Text>
        </View>
      </View>

      {/* Cleaner */}
      <View style={styles.taskRow}>
        <MaterialCommunityIcons
          name={task.assignedCleaner ? 'account-outline' : 'account-off-outline'}
          size={13}
          color={task.assignedCleaner ? Colors.gray[700] : Colors.gray[400]}
        />
        <Text style={[styles.cleanerText, !task.assignedCleaner && { color: Colors.gray[400], fontStyle: 'italic' }]}>
          {task.assignedCleaner ?? 'Unassigned'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────
function TaskDetailModal({ task, onClose }: { task: CleaningTask; onClose: () => void }) {
  const cfg = STATUS_CONFIG[task.status];
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View style={[styles.modalStatusRow, { backgroundColor: cfg.bg }]}>
              <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
              <Text style={[styles.modalStatusLabel, { color: cfg.color }]}>{task.status}</Text>
            </View>

            {/* Details */}
            <View style={styles.modalSection}>
              <DetailRow icon="identifier" label="Booking ID" value={task.bookingId} />
              <DetailRow icon="home-city-outline" label="Haven" value={task.haven} />
              <DetailRow icon="account-outline" label="Guest" value={task.guest} />
              <DetailRow icon="email-outline" label="Email" value={task.email} />
              <DetailRow icon="login" label="Check-In" value={task.checkIn} valueColor={Colors.green[500]} />
              <DetailRow icon="logout" label="Check-Out" value={task.checkOut} valueColor={Colors.red[500]} />
              <DetailRow
                icon="broom"
                label="Cleaner"
                value={task.assignedCleaner ?? 'Unassigned'}
                valueColor={task.assignedCleaner ? Colors.gray[800] : Colors.gray[400]}
              />
            </View>

            {/* Actions */}
            {task.status === 'Unassigned' && (
              <TouchableOpacity style={styles.assignBtn}>
                <MaterialCommunityIcons name="account-plus-outline" size={18} color="#fff" />
                <Text style={styles.assignBtnText}>Assign Cleaner</Text>
              </TouchableOpacity>
            )}
            {task.status === 'Assigned' && (
              <TouchableOpacity style={[styles.assignBtn, { backgroundColor: Colors.yellow[500] }]}>
                <MaterialCommunityIcons name="progress-clock" size={18} color="#fff" />
                <Text style={styles.assignBtnText}>Mark In Progress</Text>
              </TouchableOpacity>
            )}
            {task.status === 'In Progress' && (
              <TouchableOpacity style={[styles.assignBtn, { backgroundColor: Colors.green[500] }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                <Text style={styles.assignBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({
  icon, label, value, valueColor,
}: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={15} color={Colors.brand.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CleaningManagementScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CleaningStatus | 'All'>('All');
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);

  const counts = {
    total:      MOCK_TASKS.length,
    unassigned: MOCK_TASKS.filter(t => t.status === 'Unassigned').length,
    assigned:   MOCK_TASKS.filter(t => t.status === 'Assigned').length,
    inProgress: MOCK_TASKS.filter(t => t.status === 'In Progress').length,
    completed:  MOCK_TASKS.filter(t => t.status === 'Completed').length,
  };

  const filtered = MOCK_TASKS.filter(t => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.bookingId.toLowerCase().includes(q) ||
      t.guest.toLowerCase().includes(q) ||
      t.haven.toLowerCase().includes(q) ||
      (t.assignedCleaner?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cleaning Management</Text>
          <Text style={styles.headerSub}>Assign and track post check-out cleaning tasks</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stat Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {STAT_CARDS.map(card => (
            <View key={card.key} style={[styles.statCard, { backgroundColor: card.color }]}>
              <View style={styles.statCardContent}>
                <View>
                  <Text style={styles.statLabel}>{card.label}</Text>
                  <Text style={styles.statValue}>
                    {counts[card.key as keyof typeof counts]}
                  </Text>
                </View>
                <MaterialCommunityIcons name={card.icon as any} size={32} color="rgba(255,255,255,0.35)" />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={Colors.gray[400]} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by booking ID, guest, haven, or cleaner..."
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

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f;
            const cfg = f !== 'All' ? STATUS_CONFIG[f] : null;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  active && { backgroundColor: cfg?.color ?? Colors.brand.primary, borderColor: cfg?.color ?? Colors.brand.primary },
                ]}
                onPress={() => setStatusFilter(f)}
                activeOpacity={0.7}
              >
                {cfg && (
                  <MaterialCommunityIcons
                    name={cfg.icon as any}
                    size={12}
                    color={active ? '#fff' : cfg.color}
                  />
                )}
                <Text style={[styles.filterText, active && { color: '#fff' }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            Showing <Text style={{ fontWeight: '700', color: Colors.gray[800] }}>{filtered.length}</Text> task{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Task List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="broom" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} onPress={() => setSelectedTask(task)} />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.gray[50] },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backBtn:        { paddingTop: 2 },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  headerSub:      { fontSize: 12, color: Colors.gray[500], marginTop: 2 },

  // Stats
  statsRow:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, gap: 10 },
  statCard:       { borderRadius: 14, padding: 14, width: 130, justifyContent: 'center' },
  statCardContent:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginBottom: 4 },
  statValue:      { fontSize: 28, fontWeight: '800', color: '#fff' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput:    { flex: 1, fontSize: 13, color: Colors.gray[800] },

  // Filters
  filtersRow:     { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  filterText:     { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },

  // Results
  resultsRow:     { paddingHorizontal: 16, paddingBottom: 8 },
  resultsText:    { fontSize: 12, color: Colors.gray[500] },

  // Task list
  taskList:       { paddingHorizontal: 16, gap: 10 },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    padding: 14,
    gap: 8,
  },
  taskCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  bookingId:      { fontSize: 11, fontWeight: '700', color: Colors.gray[500], flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText:     { fontSize: 11, fontWeight: '700' },
  taskRow:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  taskHaven:      { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  taskDot:        { fontSize: 12, color: Colors.gray[400] },
  taskGuest:      { fontSize: 13, color: Colors.gray[600], flex: 1 },
  datesRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray[50],
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dateText:       { fontSize: 11, fontWeight: '500' },
  cleanerText:    { fontSize: 12, color: Colors.gray[700], fontWeight: '500' },

  // Empty
  emptyState:     { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:      { fontSize: 14, color: Colors.gray[400] },

  // Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray[200],
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle:     { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalStatusLabel: { fontSize: 14, fontWeight: '700' },
  modalSection:   { gap: 12, marginBottom: 20 },
  detailRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  detailLabel:    { fontSize: 11, color: Colors.gray[500], marginBottom: 2 },
  detailValue:    { fontSize: 13, fontWeight: '600', color: Colors.gray[800] },

  // Assign button
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  assignBtnText:  { fontSize: 15, fontWeight: '700', color: '#fff' },
});