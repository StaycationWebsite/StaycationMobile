import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';

type Status   = 'open' | 'in-progress' | 'resolved';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface MaintenanceRequest {
  id: string;
  shortId: string;
  haven: string;
  issue: string;
  status: Status;
  priority: Priority;
  reportedBy: string;
  location: string;
  assignedTo: string;
  type: string;
  date: string;
}

const MOCK_DATA: MaintenanceRequest[] = [
  { id: '1', shortId: '60c926fb', haven: 'Haven 1', issue: 'May nakasilip',          status: 'open',        priority: 'high',   reportedBy: 'Joel Malupiton',      location: 'CR',            assignedTo: 'Unassigned', type: 'maintenance', date: '3/6/2026'  },
  { id: '2', shortId: '43a9eb88', haven: 'Haven 3', issue: 'Test test test test',     status: 'open',        priority: 'urgent', reportedBy: 'Cleaner Staycation',  location: 'Cleaner Area',  assignedTo: 'Unassigned', type: 'plumbing',    date: '1/15/2026' },
  { id: '3', shortId: '3e3845de', haven: 'Unknown',  issue: 'Report submitted',       status: 'open',        priority: 'low',    reportedBy: 'Cleaner Staycation',  location: 'Report',        assignedTo: 'Unassigned', type: 'maintenance', date: '1/15/2026' },
  { id: '4', shortId: 'a1b2c3d4', haven: 'Haven 2', issue: 'AC unit not cooling',    status: 'in-progress', priority: 'high',   reportedBy: 'Maria Santos',        location: 'Bedroom',       assignedTo: 'Juan Cruz',  type: 'electrical',  date: '3/5/2026'  },
  { id: '5', shortId: 'e5f6g7h8', haven: 'Haven 5', issue: 'Water heater broken',    status: 'in-progress', priority: 'medium', reportedBy: 'Admin',               location: 'Bathroom',      assignedTo: 'Pedro Reyes',type: 'plumbing',    date: '3/4/2026'  },
  { id: '6', shortId: 'i9j0k1l2', haven: 'Haven 4', issue: 'Broken window latch',   status: 'resolved',    priority: 'low',    reportedBy: 'Guest Feedback',      location: 'Living Room',   assignedTo: 'Ana Lima',   type: 'carpentry',   date: '3/1/2026'  },
  { id: '7', shortId: 'm3n4o5p6', haven: 'Haven 1', issue: 'Ceiling light flickering',status: 'resolved',   priority: 'medium', reportedBy: 'Cleaner Staycation',  location: 'Kitchen',       assignedTo: 'Luis Gomez', type: 'electrical',  date: '2/28/2026' },
];

const STAFF = ['Unassigned', 'Juan Cruz', 'Pedro Reyes', 'Ana Lima', 'Luis Gomez', 'Maria Santos'];

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
  'open':        { label: 'Open',        color: '#D97706', bg: '#FEF3C7' },
  'in-progress': { label: 'In Progress', color: '#D97706', bg: '#FEF9C3' },
  'resolved':    { label: 'Resolved',    color: '#16A34A', bg: '#DCFCE7' },
};

const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: '#16A34A', bg: '#DCFCE7' },
  medium: { label: 'Medium', color: '#2563EB', bg: '#DBEAFE' },
  high:   { label: 'High',   color: '#EA580C', bg: '#FFEDD5' },
  urgent: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2' },
};

const TYPE_ICONS: Record<string, string> = {
  maintenance: 'wrench',
  plumbing:    'pipe',
  electrical:  'lightning-bolt',
  carpentry:   'hammer',
};

// ─── Module-level RequestCard ────────────────────────────────────────────────
const RequestCard = ({
  item, onAssign, onView, onDelete,
}: {
  item: MaintenanceRequest;
  onAssign: (item: MaintenanceRequest) => void;
  onView:   (item: MaintenanceRequest) => void;
  onDelete: (id: string) => void;
}) => {
  const sc = STATUS_CFG[item.status];
  const pc = PRIORITY_CFG[item.priority];
  const typeIcon = TYPE_ICONS[item.type] || 'wrench';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <MaterialCommunityIcons name={typeIcon as any} size={20} color={Colors.brand.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardIssue} numberOfLines={2}>{item.issue}</Text>
          <Text style={styles.cardMeta}>{item.shortId} · {item.haven}</Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end' }}>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.badgeText, { color: pc.color }]}>{pc.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Feather name="user" size={13} color={Colors.gray[400]} />
          <Text style={styles.detailText}>{item.reportedBy}</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={13} color={Colors.gray[400]} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account-hard-hat" size={13} color={Colors.gray[400]} />
          <Text style={[styles.detailText, item.assignedTo === 'Unassigned' && { color: Colors.red[500] }]}>
            {item.assignedTo}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={13} color={Colors.gray[400]} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.assignBtn} onPress={() => onAssign(item)}>
          <MaterialCommunityIcons name="account-plus-outline" size={14} color="#2563EB" />
          <Text style={styles.assignBtnText}>Assign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBtn} onPress={() => onView(item)}>
          <Feather name="eye" size={14} color={Colors.brand.primary} />
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Feather name="trash-2" size={14} color={Colors.red[500]} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function MaintenanceManagementScreen() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(MOCK_DATA);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter]     = useState<'all' | Status>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  // Assign modal
  const [assignItem, setAssignItem]   = useState<MaintenanceRequest | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');

  // View modal
  const [viewItem, setViewItem] = useState<MaintenanceRequest | null>(null);

  const countOf = (s: Status) => requests.filter(r => r.status === s).length;

  const filtered = requests.filter(r => {
    const statusOk   = statusFilter   === 'all' || r.status   === statusFilter;
    const priorityOk = priorityFilter === 'all' || r.priority === priorityFilter;
    const q = search.toLowerCase();
    const searchOk = q === '' ||
      r.shortId.toLowerCase().includes(q) ||
      r.haven.toLowerCase().includes(q)   ||
      r.issue.toLowerCase().includes(q)   ||
      r.location.toLowerCase().includes(q)||
      r.reportedBy.toLowerCase().includes(q)||
      r.type.toLowerCase().includes(q);
    return statusOk && priorityOk && searchOk;
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Request', 'Remove this maintenance request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setRequests(prev => prev.filter(r => r.id !== id)) },
    ]);
  };

  const handleAssignSave = () => {
    if (!selectedStaff) { Alert.alert('Select staff'); return; }
    setRequests(prev => prev.map(r =>
      r.id === assignItem!.id
        ? { ...r, assignedTo: selectedStaff, status: selectedStaff === 'Unassigned' ? 'open' : 'in-progress' }
        : r
    ));
    setAssignItem(null);
  };

  const STAT_CARDS = [
    { label: 'Total',       value: requests.length, color: '#2563EB', bg: '#DBEAFE', icon: 'clipboard-list-outline' as const },
    { label: 'Open',        value: countOf('open'),        color: '#EA580C', bg: '#FFEDD5', icon: 'alert-circle-outline' as const },
    { label: 'In Progress', value: countOf('in-progress'), color: '#D97706', bg: '#FEF3C7', icon: 'progress-clock' as const },
    { label: 'Resolved',    value: countOf('resolved'),    color: '#16A34A', bg: '#DCFCE7', icon: 'check-circle-outline' as const },
  ];

  return (
    <View style={styles.container}>
      {/* Stat Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContent}>
        {STAT_CARDS.map(c => (
          <View key={c.label} style={[styles.statCard, { backgroundColor: c.bg }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>{c.label}</Text>
              <Text style={[styles.statValue, { color: c.color }]}>{c.value}</Text>
            </View>
            <MaterialCommunityIcons name={c.icon} size={32} color={c.color} style={{ opacity: 0.35 }} />
          </View>
        ))}
      </ScrollView>

      {/* Search + Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, haven, issue, location..."
            placeholderTextColor={Colors.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {(['all', 'open', 'in-progress', 'resolved'] as const).map(s => {
            const active = statusFilter === s;
            const cfg = s !== 'all' ? STATUS_CFG[s] : null;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, active && (cfg ? { backgroundColor: cfg.bg, borderColor: cfg.color, borderWidth: 1 } : { backgroundColor: Colors.brand.primary })]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, active && (cfg ? { color: cfg.color } : { color: Colors.white })]}>
                  {s === 'all' ? 'All Status' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={styles.chipDivider} />
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map(p => {
            const active = priorityFilter === p;
            const cfg = p !== 'all' ? PRIORITY_CFG[p] : null;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.chip, active && (cfg ? { backgroundColor: cfg.bg, borderColor: cfg.color, borderWidth: 1 } : { backgroundColor: Colors.brand.primary })]}
                onPress={() => setPriorityFilter(p)}
              >
                <Text style={[styles.chipText, active && (cfg ? { color: cfg.color } : { color: Colors.white })]}>
                  {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} Request{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wrench-outline" size={52} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Requests Found</Text>
            <Text style={styles.emptyText}>No maintenance requests match your filters.</Text>
          </View>
        ) : (
          filtered.map(item => (
            <RequestCard
              key={item.id}
              item={item}
              onAssign={i => { setAssignItem(i); setSelectedStaff(i.assignedTo); }}
              onView={setViewItem}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      {/* Assign Modal */}
      <Modal visible={assignItem !== null} transparent animationType="slide" onRequestClose={() => setAssignItem(null)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setAssignItem(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Assign Staff</Text>
                <Text style={styles.sheetSub}>{assignItem?.issue}</Text>
              </View>
              <TouchableOpacity onPress={() => setAssignItem(null)}>
                <Feather name="x" size={22} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {STAFF.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.staffOption, selectedStaff === s && styles.staffOptionActive]}
                  onPress={() => setSelectedStaff(s)}
                >
                  <View style={styles.staffAvatar}>
                    <Text style={styles.staffAvatarText}>{s[0]}</Text>
                  </View>
                  <Text style={[styles.staffName, selectedStaff === s && { color: Colors.brand.primary, fontWeight: '700' }]}>{s}</Text>
                  {selectedStaff === s && <Feather name="check" size={18} color={Colors.brand.primary} />}
                </TouchableOpacity>
              ))}
              <View style={{ height: 12 }} />
            </ScrollView>
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAssignItem(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAssignSave}>
                <Text style={styles.saveBtnText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Details Modal */}
      <Modal visible={viewItem !== null} transparent animationType="slide" onRequestClose={() => setViewItem(null)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setViewItem(null)} />
          <View style={styles.sheet}>
            {viewItem && (() => {
              const sc = STATUS_CFG[viewItem.status];
              const pc = PRIORITY_CFG[viewItem.priority];
              return (
                <>
                  <View style={styles.sheetHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetTitle}>Request Details</Text>
                      <Text style={styles.sheetSub}>{viewItem.shortId}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setViewItem(null)}>
                      <Feather name="x" size={22} color={Colors.gray[600]} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                      <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: pc.bg }]}>
                        <Text style={[styles.badgeText, { color: pc.color }]}>{pc.label} Priority</Text>
                      </View>
                    </View>
                    {[
                      { label: 'Issue',       value: viewItem.issue       },
                      { label: 'Haven',       value: viewItem.haven       },
                      { label: 'Location',    value: viewItem.location    },
                      { label: 'Type',        value: viewItem.type        },
                      { label: 'Reported By', value: viewItem.reportedBy  },
                      { label: 'Assigned To', value: viewItem.assignedTo  },
                      { label: 'Date',        value: viewItem.date        },
                    ].map(row => (
                      <View key={row.label} style={styles.detailRow}>
                        <Text style={styles.detailRowLabel}>{row.label}</Text>
                        <Text style={[styles.detailRowValue, row.label === 'Assigned To' && row.value === 'Unassigned' && { color: Colors.red[500] }]}>
                          {row.value}
                        </Text>
                      </View>
                    ))}
                    <View style={{ height: 8 }} />
                    <TouchableOpacity
                      style={[styles.saveBtn, { marginTop: 8 }]}
                      onPress={() => {
                        setAssignItem(viewItem);
                        setSelectedStaff(viewItem.assignedTo);
                        setViewItem(null);
                      }}
                    >
                      <MaterialCommunityIcons name="account-plus-outline" size={16} color={Colors.white} />
                      <Text style={styles.saveBtnText}>Assign Staff</Text>
                    </TouchableOpacity>
                    <View style={{ height: 12 }} />
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  // Stats
  statsScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], maxHeight: 90 },
  statsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10, alignItems: 'center' },
  statCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, minWidth: 120, height: 68, gap: 10 },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.gray[600], marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '800' },
  // Filters
  filterSection: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray[50], borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10, borderWidth: 1, borderColor: Colors.gray[100], marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  chipsRow: { flexDirection: 'row', gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },
  chipDivider: { width: 1, backgroundColor: Colors.gray[200], marginHorizontal: 4 },
  // Count
  countRow: { paddingHorizontal: 20, paddingVertical: 8 },
  countText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  // Card
  card: { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  cardIssue: { fontSize: 14, fontWeight: '700', color: Colors.gray[900], flex: 1 },
  cardMeta: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 12, color: Colors.gray[600], fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#DBEAFE' },
  assignBtnText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.brand.primarySoft },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: Colors.red[500] },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[700] },
  emptyText: { fontSize: 14, color: Colors.gray[500], textAlign: 'center' },
  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  sheetSub: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  staffOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  staffOptionActive: { backgroundColor: Colors.brand.primarySoft, borderRadius: 10, paddingHorizontal: 10 },
  staffAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  staffAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.brand.primary },
  staffName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  detailRowLabel: { fontSize: 13, color: Colors.gray[500] },
  detailRowValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900], flex: 1, textAlign: 'right' },
  sheetFooter: { flexDirection: 'row', gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[200] },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.brand.primary },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
