import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

// ─── Types ────────────────────────────────────────────────────────────────────
type DelivStatus = 'Pending' | 'In Progress' | 'Completed';
type Priority    = 'High' | 'Medium' | 'Low';

interface Deliverable {
  id: number;
  room: string;
  items: string[];
  requestedBy: string;
  status: DelivStatus;
  dueTime: string;
  priority: Priority;
  assignedTo: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HAVEN_OPTIONS   = ['Haven 101', 'Haven 103', 'Haven 205', 'Haven 302'];
const PRIORITY_OPTIONS: Priority[]    = ['High', 'Medium', 'Low'];
const STATUS_OPTIONS: DelivStatus[]   = ['Pending', 'In Progress', 'Completed'];
const DUE_OPTIONS     = ['Within 30 mins', 'Within 1 hour', 'Within 2 hours', 'Today'];
const FILTER_TABS     = ['All', 'Pending', 'In Progress'];

const STAFF_LIST = [
  { id: 's1', name: 'Maria Santos',    role: 'Housekeeper',  available: true  },
  { id: 's2', name: 'Juan Dela Cruz',  role: 'Bellboy',      available: true  },
  { id: 's3', name: 'Elena Rodriguez', role: 'Housekeeper',  available: false },
  { id: 's4', name: 'Carlo Reyes',     role: 'Room Service', available: true  },
  { id: 's5', name: 'Ana Mendoza',     role: 'Bellboy',      available: true  },
];

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  High:   { bg: Colors.red[100],    text: Colors.red[500]    },
  Medium: { bg: Colors.yellow[100], text: '#92400E'          },
  Low:    { bg: Colors.gray[100],   text: Colors.gray[600]   },
};

const INITIAL_DELIVERABLES: Deliverable[] = [
  { id: 1, room: 'Haven 101', items: ['2x Extra Towels', '1x Pillow', '1x Blanket'],
    requestedBy: 'John Doe',    status: 'Pending',     dueTime: 'Within 30 mins', priority: 'High',   assignedTo: null },
  { id: 2, room: 'Haven 205', items: ['Room Service Tray', 'Coffee Maker'],
    requestedBy: 'Sarah Smith', status: 'In Progress', dueTime: 'Within 1 hour',  priority: 'Medium', assignedTo: 'Maria Santos' },
  { id: 3, room: 'Haven 103', items: ['Extra Hangers', 'Iron & Board'],
    requestedBy: 'Mike Johnson',status: 'Completed',   dueTime: 'Completed 10m ago', priority: 'Low', assignedTo: 'Juan Dela Cruz' },
];

const emptyForm = {
  room: HAVEN_OPTIONS[0],
  requestedBy: '',
  itemInput: '',
  items: [] as string[],
  priority: 'Medium' as Priority,
  dueTime: DUE_OPTIONS[0],
  status: 'Pending' as DelivStatus,
};

// ─── Reusable form pieces ─────────────────────────────────────────────────────
const SelectorRow = ({ label, options, value, onChange, colorMap }: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void; colorMap?: Record<string, { bg: string; text: string }>;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
      {options.map(opt => {
        const active = value === opt;
        const cm = colorMap?.[opt];
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.selectorChip,
              active && (cm ? { backgroundColor: cm.bg, borderColor: cm.text } : styles.selectorChipActive),
            ]}
            onPress={() => onChange(opt)}
          >
            <Text style={[
              styles.selectorChipText,
              active && (cm ? { color: cm.text } : styles.selectorChipTextActive),
            ]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DeliverablesManagementScreen() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(INITIAL_DELIVERABLES);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing]     = useState(false);

  // Modal modes
  const [addModalVisible, setAddModalVisible]       = useState(false);
  const [assignModalTarget, setAssignModalTarget]   = useState<Deliverable | null>(null);

  // Add form state
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Helpers ──────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const filtered = activeFilter === 'All'
    ? deliverables
    : deliverables.filter(d => d.status === activeFilter);

  const pendingCount = deliverables.filter(d => d.status !== 'Completed').length;

  const setField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  // ── Add item tag ──────────────────────────────────────────────
  const addItem = () => {
    const trimmed = form.itemInput.trim();
    if (!trimmed) return;
    setField('items', [...form.items, trimmed]);
    setField('itemInput', '');
  };

  const removeItem = (idx: number) =>
    setField('items', form.items.filter((_: string, i: number) => i !== idx));

  // ── Validate & submit add form ────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.requestedBy.trim()) e.requestedBy = 'Guest name is required';
    if (form.items.length === 0)  e.items       = 'Add at least one item';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const newDel: Deliverable = {
      id: Date.now(),
      room: form.room,
      items: form.items,
      requestedBy: form.requestedBy.trim(),
      status: form.status,
      dueTime: form.dueTime,
      priority: form.priority,
      assignedTo: null,
    };
    setDeliverables(prev => [newDel, ...prev]);
    setAddModalVisible(false);
    setForm(emptyForm);
    setErrors({});
  };

  const closeAdd = () => {
    setAddModalVisible(false);
    setForm(emptyForm);
    setErrors({});
  };

  // ── Assign staff ──────────────────────────────────────────────
  const handleAssign = (staff: typeof STAFF_LIST[0]) => {
    if (!staff.available) return;
    setDeliverables(prev => prev.map(d =>
      d.id === assignModalTarget?.id
        ? { ...d, assignedTo: staff.name, status: 'In Progress' }
        : d
    ));
    setAssignModalTarget(null);
  };

  // ── Deliverable Card ──────────────────────────────────────────
  const DeliverableCard = ({ d }: { d: Deliverable }) => {
    const pc = priorityColors[d.priority];
    return (
      <Card style={styles.deliverableCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomText}>{d.room}</Text>
            <Text style={styles.requestedByText}>Requested by {d.requestedBy}</Text>
          </View>
          <Badge
            label={d.status}
            variant={d.status === 'Pending' ? 'warning' : d.status === 'In Progress' ? 'info' : 'success'}
            size="sm"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsList}>
          {d.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <MaterialCommunityIcons name="checkbox-blank-circle" size={6} color={Colors.brand.primary} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.gray[500]} />
            <Text style={styles.metaText}>{d.dueTime}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.priorityText, { color: pc.text }]}>{d.priority} Priority</Text>
          </View>
        </View>

        {/* Assigned staff row */}
        {d.assignedTo && (
          <View style={styles.assignedRow}>
            <View style={styles.assignedAvatar}>
              <Text style={styles.assignedAvatarText}>{d.assignedTo[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignedName}>{d.assignedTo}</Text>
              <Text style={styles.assignedLabel}>Assigned Staff</Text>
            </View>
            <TouchableOpacity
              style={styles.reassignBtn}
              onPress={() => setAssignModalTarget(d)}
            >
              <Feather name="refresh-cw" size={13} color={Colors.brand.primary} />
              <Text style={styles.reassignText}>Reassign</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Assign button for pending / unassigned */}
        {!d.assignedTo && d.status !== 'Completed' && (
          <TouchableOpacity style={styles.assignButton} onPress={() => setAssignModalTarget(d)}>
            <Feather name="user-check" size={16} color={Colors.white} />
            <Text style={styles.assignText}>Assign Staff</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Deliverables</Text>
          <Text style={styles.headerSubtitle}>{pendingCount} pending requests</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          {(['Pending','In Progress','Completed'] as DelivStatus[]).map((s, i) => (
            <View key={s} style={styles.statBox}>
              <MaterialCommunityIcons
                name={s === 'Pending' ? 'package-variant' : s === 'In Progress' ? 'truck-fast' : 'check-circle'}
                size={20}
                color={s === 'Pending' ? Colors.yellow[500] : s === 'In Progress' ? Colors.blue[500] : Colors.green[500]}
              />
              <Text style={styles.statValue}>{deliverables.filter(d => d.status === s).length}</Text>
              <Text style={styles.statLabel}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Filter chips */}
        <View style={styles.filterChips}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.chip, activeFilter === tab && styles.chipActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.chipText, activeFilter === tab && styles.chipTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {filtered.length === 0
            ? <View style={styles.emptyState}>
                <MaterialCommunityIcons name="package-variant-closed" size={44} color={Colors.gray[300]} />
                <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter : ''} deliverables</Text>
              </View>
            : filtered.map(d => <DeliverableCard key={d.id} d={d} />)
          }
        </View>
      </ScrollView>

      {/* ── Add Deliverable Modal ──────────────────────────────── */}
      <Modal visible={addModalVisible} animationType="slide" transparent onRequestClose={closeAdd}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeAdd} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>New Deliverable Request</Text>
                <Text style={styles.sheetSubtitle}>Add a guest room request</Text>
              </View>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={closeAdd}>
                <Feather name="x" size={18} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>

              {/* Room */}
              <SelectorRow label="Haven / Room" options={HAVEN_OPTIONS} value={form.room} onChange={v => setField('room', v)} />

              {/* Requested by */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Requested By (Guest)</Text>
                <View style={[styles.inputWrapper, errors.requestedBy && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Juan dela Cruz"
                    placeholderTextColor={Colors.gray[400]}
                    value={form.requestedBy}
                    onChangeText={v => setField('requestedBy', v)}
                  />
                </View>
                {errors.requestedBy ? <Text style={styles.errorText}>{errors.requestedBy}</Text> : null}
              </View>

              {/* Items */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Items to Deliver</Text>
                <View style={styles.itemInputRow}>
                  <View style={[styles.inputWrapper, { flex: 1 }, errors.items && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 2x Extra Towels"
                      placeholderTextColor={Colors.gray[400]}
                      value={form.itemInput}
                      onChangeText={v => setField('itemInput', v)}
                      onSubmitEditing={addItem}
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                    <Feather name="plus" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
                {errors.items ? <Text style={styles.errorText}>{errors.items}</Text> : null}
                {form.items.length > 0 && (
                  <View style={styles.tagsList}>
                    {form.items.map((item: string, i: number) => (
                      <View key={i} style={styles.tag}>
                        <MaterialCommunityIcons name="checkbox-blank-circle" size={6} color={Colors.brand.primary} />
                        <Text style={styles.tagText}>{item}</Text>
                        <TouchableOpacity onPress={() => removeItem(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Feather name="x" size={12} color={Colors.gray[500]} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Priority */}
              <SelectorRow
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onChange={v => setField('priority', v)}
                colorMap={priorityColors}
              />

              {/* Due time */}
              <SelectorRow label="Due Time" options={DUE_OPTIONS} value={form.dueTime} onChange={v => setField('dueTime', v)} />

              {/* Status */}
              <SelectorRow label="Status" options={STATUS_OPTIONS} value={form.status} onChange={v => setField('status', v)} />

              {/* Preview */}
              {form.requestedBy.trim() && form.items.length > 0 && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Preview</Text>
                  <View style={styles.previewHeader}>
                    <Text style={styles.previewRoom}>{form.room}</Text>
                    <View style={[styles.previewPriority, { backgroundColor: priorityColors[form.priority].bg }]}>
                      <Text style={[styles.previewPriorityText, { color: priorityColors[form.priority].text }]}>
                        {form.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.previewBy}>Requested by {form.requestedBy}</Text>
                  {form.items.map((it: string, i: number) => (
                    <View key={i} style={styles.itemRow}>
                      <MaterialCommunityIcons name="checkbox-blank-circle" size={6} color={Colors.brand.primary} />
                      <Text style={styles.itemText}>{it}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeAdd}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <MaterialCommunityIcons name="package-variant-plus" size={18} color={Colors.white} />
                <Text style={styles.submitBtnText}>Add Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Assign Staff Modal ─────────────────────────────────── */}
      <Modal visible={assignModalTarget !== null} animationType="slide" transparent onRequestClose={() => setAssignModalTarget(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAssignModalTarget(null)} />
          <View style={[styles.bottomSheet, { maxHeight: '70%' }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Assign Staff</Text>
                <Text style={styles.sheetSubtitle}>
                  {assignModalTarget?.room} · {assignModalTarget?.priority} Priority
                </Text>
              </View>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setAssignModalTarget(null)}>
                <Feather name="x" size={18} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.staffList}>
              <Text style={styles.staffSectionLabel}>Available Staff</Text>
              {STAFF_LIST.map(staff => (
                <TouchableOpacity
                  key={staff.id}
                  style={[
                    styles.staffCard,
                    !staff.available && styles.staffCardDisabled,
                    assignModalTarget?.assignedTo === staff.name && styles.staffCardSelected,
                  ]}
                  onPress={() => handleAssign(staff)}
                  activeOpacity={staff.available ? 0.75 : 1}
                >
                  <View style={[
                    styles.staffAvatar,
                    { backgroundColor: staff.available ? Colors.brand.primarySoft : Colors.gray[100] },
                  ]}>
                    <Text style={[
                      styles.staffAvatarText,
                      { color: staff.available ? Colors.brand.primary : Colors.gray[400] },
                    ]}>
                      {staff.name[0]}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.staffName, !staff.available && { color: Colors.gray[400] }]}>
                      {staff.name}
                    </Text>
                    <Text style={styles.staffRole}>{staff.role}</Text>
                  </View>

                  <View style={[
                    styles.availBadge,
                    { backgroundColor: staff.available ? Colors.green[100] : Colors.gray[100] },
                  ]}>
                    <View style={[
                      styles.availDot,
                      { backgroundColor: staff.available ? Colors.green[500] : Colors.gray[400] },
                    ]} />
                    <Text style={[
                      styles.availText,
                      { color: staff.available ? Colors.green[500] : Colors.gray[400] },
                    ]}>
                      {staff.available ? 'Available' : 'Busy'}
                    </Text>
                  </View>

                  {assignModalTarget?.assignedTo === staff.name && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.brand.primary} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  addButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[100],
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginTop: 6 },
  statLabel: { fontSize: 10, color: Colors.gray[500], marginTop: 2 },

  filterChips: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },

  content: { padding: 20, gap: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },

  // Deliverable card
  deliverableCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  roomText: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  requestedByText: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  itemsList: { gap: 8, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemText: { fontSize: 13, color: Colors.gray[700] },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.gray[600] },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: '700' },

  // Assigned staff strip
  assignedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.brand.primarySoft, borderRadius: 12, padding: 10, marginBottom: 4,
  },
  assignedAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center',
  },
  assignedAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  assignedName: { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },
  assignedLabel: { fontSize: 10, color: Colors.gray[500], marginTop: 1 },
  reassignBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.brand.primaryLight,
  },
  reassignText: { fontSize: 11, fontWeight: '700', color: Colors.brand.primary },

  assignButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.brand.primary,
  },
  assignText: { fontSize: 13, fontWeight: '600', color: Colors.white },

  // Modal shared
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '92%', paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[300],
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  sheetSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  sheetCloseBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  sheetContent: { paddingHorizontal: 24, paddingTop: 20, gap: 18 },

  // Form fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700] },
  inputWrapper: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12,
    backgroundColor: Colors.gray[50], paddingHorizontal: 14, height: 48, justifyContent: 'center',
  },
  inputError: { borderColor: Colors.red[500] },
  input: { fontSize: 14, color: Colors.gray[900] },
  errorText: { fontSize: 11, color: Colors.red[500], marginTop: 2 },

  // Item tag input
  itemInputRow: { flexDirection: 'row', gap: 10 },
  addItemBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.brand.primarySoft, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.brand.primaryLight,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: Colors.brand.primaryDark },

  // Selector chips
  selectorRow: { gap: 8, paddingVertical: 2 },
  selectorChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.gray[100], borderWidth: 1, borderColor: Colors.gray[200],
  },
  selectorChipActive: { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary },
  selectorChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  selectorChipTextActive: { color: Colors.brand.primaryDark },

  // Preview card
  previewCard: {
    backgroundColor: Colors.brand.primarySoft, borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: Colors.brand.primaryLight,
  },
  previewTitle: { fontSize: 11, fontWeight: '700', color: Colors.brand.primaryDark, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewRoom: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  previewPriority: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  previewPriorityText: { fontSize: 11, fontWeight: '700' },
  previewBy: { fontSize: 12, color: Colors.gray[500] },

  // Sheet actions
  sheetActions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  cancelBtn: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100],
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  submitBtn: {
    flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // Staff list (assign modal)
  staffList: { paddingHorizontal: 24, paddingTop: 16, gap: 10 },
  staffSectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.gray[400],
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  staffCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  staffCardDisabled: { opacity: 0.5 },
  staffCardSelected: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  staffAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  staffAvatarText: { fontSize: 18, fontWeight: '700' },
  staffName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  staffRole: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 11, fontWeight: '700' },
});