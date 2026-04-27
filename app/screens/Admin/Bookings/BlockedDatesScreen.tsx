import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../../constants/Styles';
import { API_CONFIG } from '../../../../constants/config';

interface BlockedDate {
  id: string;
  havenId: string;
  havenName: string;
  tower: string;
  floor: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'active' | 'inactive';
}

interface Haven {
  id: string;
  name: string;
}

interface ApiBlockedDate {
  id: string;
  haven_id: string;
  from_date: string;
  to_date: string;
  reason: string | null;
  status: string;
  haven_name: string;
  tower: string;
  floor: string;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function diffDays(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export default function BlockedDatesScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries]           = useState<BlockedDate[]>([]);
  const [havens, setHavens]             = useState<Haven[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [havenFilter, setHavenFilter]   = useState('All Havens');
  const [havenFilterOpen, setHavenFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<BlockedDate | null>(null);

  // Form fields
  const [havenId, setHavenId]         = useState('');
  const [fromDate, setFromDate]       = useState<Date>(new Date());
  const [toDate, setToDate]           = useState<Date>(new Date(Date.now() + 86400000));
  const [reason, setReason]           = useState('');
  const [formStatus, setFormStatus]   = useState<'active' | 'inactive'>('active');

  // Picker visibility
  const [havenOpen, setHavenOpen]     = useState(false);
  const [showFrom, setShowFrom]       = useState(false);
  const [showTo, setShowTo]           = useState(false);

  useEffect(() => {
    fetchBlockedDates();
    fetchHavens();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.BLOCKED_DATES_API, { credentials: 'include' });
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: BlockedDate[] = json.data.map((item: ApiBlockedDate) => ({
          id: item.id,
          havenId: item.haven_id,
          havenName: item.haven_name,
          tower: item.tower,
          floor: item.floor,
          fromDate: new Date(item.from_date),
          toDate: new Date(item.to_date),
          reason: item.reason ?? '',
          status: item.status === 'active' ? 'active' : 'inactive',
        }));
        setEntries(mapped);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
      Alert.alert('Error', 'Failed to load blocked dates.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHavens = async () => {
    try {
      const response = await fetch(API_CONFIG.HAVEN_API);
      const json = await response.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped: Haven[] = json.data.map((h: any) => ({
          id: h.uuid_id,
          name: h.haven_name,
        }));
        setHavens(mapped);
      }
    } catch (error) {
      console.error('Error fetching havens:', error);
    }
  };

  const now = new Date();
  const havenNames = ['All Havens', ...Array.from(new Set(entries.map(e => e.havenName)))];

  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (havenFilter !== 'All Havens' && e.havenName !== havenFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !e.havenName.toLowerCase().includes(q) &&
        !e.reason.toLowerCase().includes(q) &&
        !e.tower.toLowerCase().includes(q) &&
        !e.floor.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const stats = {
    total: entries.length,
    active: entries.filter(e => e.status === 'active').length,
    expired: entries.filter(e => e.toDate < now).length,
    havensAffected: new Set(entries.map(e => e.havenId)).size,
  };

  const openAdd = () => {
    setEditing(null);
    setHavenId('');
    setFromDate(new Date());
    setToDate(new Date(Date.now() + 86400000));
    setReason('');
    setFormStatus('active');
    setHavenOpen(false);
    setModalOpen(true);
  };

  const openEdit = (item: BlockedDate) => {
    setEditing(item);
    setHavenId(item.havenId);
    setFromDate(item.fromDate);
    setToDate(item.toDate);
    setReason(item.reason);
    setFormStatus(item.status);
    setHavenOpen(false);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Blocked Date', 'Remove this blocked period?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${API_CONFIG.BLOCKED_DATES_API}/${id}`, {
              method: 'DELETE',
              credentials: 'include',
            });
            setEntries(prev => prev.filter(e => e.id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete. Please try again.');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!havenId) { Alert.alert('Error', 'Please select a haven.'); return; }
    if (fromDate >= toDate) { Alert.alert('Error', 'From date must be before to date.'); return; }

    const haven = havens.find(h => h.id === havenId)!;
    const body = {
      haven_id: havenId,
      from_date: fromDate.toISOString().split('T')[0],
      to_date: toDate.toISOString().split('T')[0],
      reason: reason || null,
      status: formStatus,
    };

    try {
      if (editing) {
        await fetch(`${API_CONFIG.BLOCKED_DATES_API}/${editing.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setEntries(prev => prev.map(e =>
          e.id === editing.id
            ? { ...e, havenId, havenName: haven.name, fromDate, toDate, reason, status: formStatus }
            : e
        ));
      } else {
        const res = await fetch(API_CONFIG.BLOCKED_DATES_API, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        const newId = json.data?.id ?? Date.now().toString();
        setEntries(prev => [...prev, {
          id: newId,
          havenId, havenName: haven.name, tower: '', floor: '',
          fromDate, toDate, reason, status: formStatus,
        }]);
      }
      setModalOpen(false);
      fetchBlockedDates();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Blocked Dates</Text>
          <Text style={styles.headerSub}>Manage unavailable periods</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Sticky search + filter bar */}
        <View style={styles.stickyBar}>
          {/* Search */}
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={Colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by haven, reason, tower, floor..."
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={15} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdowns */}
          <View style={styles.dropdownRow}>
            {/* Haven filter */}
            <View style={{ flex: 1, zIndex: havenFilterOpen ? 20 : 1 }}>
              <TouchableOpacity
                style={styles.dropdownPill}
                onPress={() => { setHavenFilterOpen(v => !v); setStatusFilterOpen(false); }}
              >
                <Text style={styles.dropdownPillText} numberOfLines={1}>{havenFilter}</Text>
                <Feather name={havenFilterOpen ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
              </TouchableOpacity>
              {havenFilterOpen && (
                <View style={styles.dropdownMenu}>
                  {havenNames.map(n => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.dropdownItem, havenFilter === n && styles.dropdownItemActive]}
                      onPress={() => { setHavenFilter(n); setHavenFilterOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, havenFilter === n && styles.dropdownItemTextActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Status filter */}
            <View style={{ flex: 1, zIndex: statusFilterOpen ? 20 : 1 }}>
              <TouchableOpacity
                style={styles.dropdownPill}
                onPress={() => { setStatusFilterOpen(v => !v); setHavenFilterOpen(false); }}
              >
                <Text style={styles.dropdownPillText}>
                  {statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                </Text>
                <Feather name={statusFilterOpen ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
              </TouchableOpacity>
              {statusFilterOpen && (
                <View style={styles.dropdownMenu}>
                  {(['all', 'active', 'inactive'] as const).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.dropdownItem, statusFilter === s && styles.dropdownItemActive]}
                      onPress={() => { setStatusFilter(s); setStatusFilterOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, statusFilter === s && styles.dropdownItemTextActive]}>
                        {s === 'all' ? 'All Status' : s === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Refresh */}
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchBlockedDates}>
              <Feather name="refresh-cw" size={15} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listContent}>
          {/* KPI Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { label: 'Total Blocked', value: stats.total, color: Colors.blue[500], icon: 'calendar-remove-outline' },
              { label: 'Active', value: stats.active, color: '#F97316', icon: 'clock-outline' },
              { label: 'Expired', value: stats.expired, color: Colors.green[500], icon: 'check-circle-outline' },
              { label: 'Havens Affected', value: stats.havensAffected, color: Colors.purple[500], icon: 'office-building-outline' },
            ].map(({ label, value, color, icon }) => (
              <View key={label} style={[styles.kpiCard, { backgroundColor: color }]}>
                <Text style={styles.kpiLabel}>{label}</Text>
                <Text style={styles.kpiValue}>{value}</Text>
                <MaterialCommunityIcons name={icon as any} size={28} color="rgba(255,255,255,0.4)" style={styles.kpiIcon} />
              </View>
            ))}
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity style={styles.addBlockBtn} onPress={openAdd}>
            <Feather name="plus" size={16} color={Colors.white} />
            <Text style={styles.addBlockBtnText}>Add Blocked Date</Text>
          </TouchableOpacity>

          {/* List */}
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.brand.primary} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={52} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Blocked Dates</Text>
              <Text style={styles.emptyText}>Tap + to block a date range for a haven.</Text>
            </View>
          ) : filtered.map(item => {
              const days = diffDays(item.fromDate, item.toDate);
              const isActive = item.status === 'active';
              const isExpired = item.toDate < now;
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconBox}>
                      <Text style={styles.cardInitial}>{item.havenName[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardHaven}>{item.havenName}</Text>
                      {(item.tower || item.floor) && (
                        <Text style={styles.cardMeta}>
                          {[item.tower, item.floor].filter(Boolean).join(' • ')}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#F3F4F6' }]}>
                      <Text style={[styles.statusText, { color: isActive ? '#16A34A' : '#6B7280' }]}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  {/* Date + Reason + Period row */}
                  <View style={styles.cardInfoGrid}>
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoLabel}>From Date</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="calendar" size={12} color={Colors.gray[400]} />
                        <Text style={styles.cardInfoValue}>{fmtDate(item.fromDate)}</Text>
                      </View>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoLabel}>To Date</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="calendar" size={12} color={Colors.gray[400]} />
                        <Text style={styles.cardInfoValue}>{fmtDate(item.toDate)}</Text>
                      </View>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoLabel}>Reason</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={1}>{item.reason || '–'}</Text>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <Text style={styles.cardInfoLabel}>Period</Text>
                      <View style={[styles.periodBadge, { backgroundColor: isExpired ? '#F3F4F6' : '#DCFCE7' }]}>
                        <Text style={[styles.periodText, { color: isExpired ? '#6B7280' : '#16A34A' }]}>
                          {isExpired ? 'Expired' : 'Ongoing'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.cardDays}>{days} day{days !== 1 ? 's' : ''} blocked</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <Feather name="edit-2" size={14} color={Colors.brand.primary} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                      <Feather name="trash-2" size={14} color={Colors.red[500]} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          }
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setModalOpen(false)} />
          <View style={styles.sheet}>
            {/* Modal Header */}
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: editing ? '#DBEAFE' : Colors.brand.primarySoft }]}>
                <Feather name={editing ? 'edit-2' : 'plus'} size={18} color={editing ? '#2563EB' : Colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{editing ? 'Edit Blocked Date' : 'Add Blocked Date'}</Text>
                <Text style={styles.sheetSub}>{editing ? 'Update blocked period' : 'Block a new date range'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Feather name="x" size={22} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Haven */}
              <Text style={styles.fieldLabel}>Haven <Text style={{ color: Colors.red[500] }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setHavenOpen(v => !v)}>
                <Text style={[styles.selectText, !havenId && { color: Colors.gray[400] }]}>
                  {havenId ? havens.find(h => h.id === havenId)?.name : 'Select a haven'}
                </Text>
                <Feather name={havenOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray[500]} />
              </TouchableOpacity>
              {havenOpen && (
                <View style={styles.optionList}>
                  {havens.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.optionItem, havenId === h.id && styles.optionItemActive]}
                      onPress={() => { setHavenId(h.id); setHavenOpen(false); }}
                    >
                      <Text style={[styles.optionText, havenId === h.id && { color: Colors.brand.primary, fontWeight: '700' }]}>
                        {h.name}
                      </Text>
                      {havenId === h.id && <Feather name="check" size={16} color={Colors.brand.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* From Date */}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>From Date <Text style={{ color: Colors.red[500] }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setShowFrom(true)}>
                <Feather name="calendar" size={16} color={Colors.gray[500]} />
                <Text style={styles.selectText}>{fmtDate(fromDate)}</Text>
              </TouchableOpacity>
              {showFrom && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_, d) => { setShowFrom(false); if (d) setFromDate(d); }}
                />
              )}

              {/* To Date */}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>To Date <Text style={{ color: Colors.red[500] }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setShowTo(true)}>
                <Feather name="calendar" size={16} color={Colors.gray[500]} />
                <Text style={styles.selectText}>{fmtDate(toDate)}</Text>
              </TouchableOpacity>
              {showTo && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  minimumDate={fromDate}
                  onChange={(_, d) => { setShowTo(false); if (d) setToDate(d); }}
                />
              )}

              {/* Selected period preview */}
              {fromDate < toDate && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Selected Period</Text>
                  <Text style={styles.previewValue}>
                    {fmtDate(fromDate)} – {fmtDate(toDate)}
                  </Text>
                  <Text style={styles.previewDays}>{diffDays(fromDate, toDate)} days</Text>
                </View>
              )}

              {/* Reason */}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                Reason <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Maintenance, Renovation, Private event..."
                placeholderTextColor={Colors.gray[400]}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Status */}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Status <Text style={{ color: Colors.red[500] }}>*</Text></Text>
              <View style={styles.toggleRow}>
                {(['active', 'inactive'] as const).map(s => {
                  const active = formStatus === s;
                  const color = s === 'active' ? '#16A34A' : '#6B7280';
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.toggleBtn, active && { backgroundColor: s === 'active' ? '#DCFCE7' : '#F3F4F6', borderColor: color }]}
                      onPress={() => setFormStatus(s)}
                    >
                      <Text style={[styles.toggleText, active && { color, fontWeight: '700' }]}>
                        {s === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  headerSub: { fontSize: 13, color: Colors.gray[500], marginTop: 1 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  // Filter
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.white },
  filterCount: { marginLeft: 'auto', fontSize: 12, color: Colors.gray[500], fontWeight: '600' },
  // List
  listContent: { padding: 16, gap: 12, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[700] },
  emptyText: { fontSize: 14, color: Colors.gray[500], textAlign: 'center', paddingHorizontal: 20 },
  // Card
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  cardHaven: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  cardRange: { fontSize: 13, color: Colors.gray[600], marginTop: 2 },
  cardDays: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  reasonText: { fontSize: 13, color: Colors.gray[500], flex: 1 },
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.brand.primarySoft },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: Colors.red[500] },
  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', minHeight: 300 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  sheetSub: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  // Form
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 6 },
  optional: { fontSize: 12, color: Colors.gray[400], fontWeight: '400' },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.gray[50], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: Colors.gray[200] },
  selectText: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  optionList: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray[200], marginTop: 4, overflow: 'hidden' },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  optionItemActive: { backgroundColor: Colors.brand.primarySoft },
  optionText: { fontSize: 14, color: Colors.gray[800] },
  previewBox: { marginTop: 12, backgroundColor: '#DBEAFE', borderRadius: 10, padding: 12 },
  previewLabel: { fontSize: 11, fontWeight: '600', color: '#2563EB', marginBottom: 4 },
  previewValue: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  previewDays: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  textArea: { backgroundColor: Colors.gray[50], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.gray[900], borderWidth: 1, borderColor: Colors.gray[200], minHeight: 80 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.gray[50], borderWidth: 1, borderColor: Colors.gray[200] },
  toggleText: { fontSize: 14, fontWeight: '600', color: Colors.gray[600] },
  sheetFooter: { flexDirection: 'row', gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[200] },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.brand.primary },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  // Sticky bar
  stickyBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.gray[50], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.gray[200] },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },
  dropdownRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  dropdownPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray[100], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  dropdownPillText: { fontSize: 11, fontWeight: '600', color: Colors.gray[700], flex: 1 },
  dropdownMenu: { position: 'absolute', top: 38, left: 0, right: 0, backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray[200], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10, maxHeight: 180, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: Colors.brand.primarySoft },
  dropdownItemText: { fontSize: 12, color: Colors.gray[700] },
  dropdownItemTextActive: { color: Colors.brand.primaryDark, fontWeight: '700' },
  refreshBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center' },
  // KPI
  kpiScroll: { gap: 10, paddingBottom: 4 },
  kpiCard: { width: 130, borderRadius: 14, padding: 14, overflow: 'hidden' },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  kpiValue: { fontSize: 26, fontWeight: '800', color: Colors.white },
  kpiIcon: { position: 'absolute', bottom: 8, right: 8 },
  // Add button
  addBlockBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.brand.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, alignSelf: 'flex-start' },
  addBlockBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  // Card updates
  cardInitial: { fontSize: 16, fontWeight: '800', color: Colors.red[500] },
  cardMeta: { fontSize: 11, color: Colors.gray[500], marginTop: 1 },
  cardInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 10 },
  cardInfoItem: { width: '45%', gap: 3 },
  cardInfoLabel: { fontSize: 10, color: Colors.gray[400], fontWeight: '600', textTransform: 'uppercase' },
  cardInfoValue: { fontSize: 12, color: Colors.gray[800], fontWeight: '500' },
  periodBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  periodText: { fontSize: 11, fontWeight: '700' },
});
