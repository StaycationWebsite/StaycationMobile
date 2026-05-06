import React, { useState, useEffect, useMemo } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput, 
  Alert, 
  Modal, 
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/lib/hooks/useTheme';
import { API_CONFIG } from '@constants/config';

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
  const { theme } = useTheme();
  const [entries, setEntries] = useState<BlockedDate[]>([]);
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlockedDate | null>(null);

  // Form fields
  const [havenId, setHavenId] = useState('');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [reason, setReason] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Picker visibility
  const [havenOpen, setHavenOpen] = useState(false);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

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

  const filtered = entries.filter(e => statusFilter === 'all' || e.status === statusFilter);

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
    if (!havenId) { 
      Alert.alert('Error', 'Please select a haven.'); 
      return; 
    }
    if (fromDate >= toDate) { 
      Alert.alert('Error', 'From date must be before to date.'); 
      return; 
    }

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
          headers: { 
            'Content-Type': 'application/json' 
          },
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
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        const newId = json.data?.id ?? Date.now().toString();
        setEntries(prev => [...prev, {
          id: newId,
          havenId, 
          havenName: haven.name, 
          tower: '', 
          floor: '',
          fromDate, 
          toDate, 
          reason, 
          status: formStatus,
        }]);
      }
      setModalOpen(false);
      fetchBlockedDates();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerSub: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceSecondary,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.surface,
    },
    filterCount: {
      marginLeft: 'auto',
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
      gap: 12,
      paddingBottom: 32,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 10,
    },
    cardIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.errorBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardHaven: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    cardRange: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    cardDays: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    reasonText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryLight,
    },
    editBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.errorBg,
    },
    deleteBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.error,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    overlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '90%',
      minHeight: 300,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    sheetIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: editing ? theme.colors.primary + '20' : theme.colors.primaryLight,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    sheetSub: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 6,
    },
    optional: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      fontWeight: '400',
    },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    selectText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    optionList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      marginTop: 4,
      overflow: 'hidden',
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    optionItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    previewBox: {
      marginTop: 12,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 10,
      padding: 12,
    },
    previewLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    previewValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    previewDays: {
      fontSize: 12,
      color: theme.colors.primary,
      marginTop: 2,
    },
    textArea: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      minHeight: 80,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    sheetFooter: {
      flexDirection: 'row',
      gap: 10,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    saveBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.surface,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Blocked Dates</Text>
          <Text style={styles.headerSub}>Manage unavailable periods</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'inactive'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.filterCount}>{filtered.length} period{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-remove-outline" size={52} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Blocked Dates</Text>
            <Text style={styles.emptyText}>Tap + to block a date range for a haven.</Text>
          </View>
        ) : filtered.map(item => {
            const days = diffDays(item.fromDate, item.toDate);
            const isActive = item.status === 'active';
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIconBox}>
                    <MaterialCommunityIcons name="calendar-remove" size={20} color={theme.colors.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardHaven}>{item.havenName}</Text>
                    <Text style={styles.cardRange}>
                      {fmtDate(item.fromDate)} → {fmtDate(item.toDate)}
                    </Text>
                    <Text style={styles.cardDays}>{days} day{days !== 1 ? 's' : ''} blocked</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : theme.colors.surfaceSecondary }]}>
                    <Text style={[styles.statusText, { color: isActive ? '#16A34A' : theme.colors.textTertiary }]}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                {item.reason !== '' && (
                  <View style={styles.reasonRow}>
                    <Feather name="info" size={13} color={theme.colors.textTertiary} />
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  </View>
                )}

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Feather name="edit-2" size={14} color={theme.colors.primary} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Feather name="trash-2" size={14} color={theme.colors.error} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        }
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setModalOpen(false)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: editing ? theme.colors.primary + '20' : theme.colors.primaryLight }]}>
                <Feather name={editing ? 'edit-2' : 'plus'} size={18} color={editing ? theme.colors.primary : theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{editing ? 'Edit Blocked Date' : 'Add Blocked Date'}</Text>
                <Text style={styles.sheetSub}>{editing ? 'Update blocked period' : 'Block a date range'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Feather name="x" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Haven <Text style={{ color: theme.colors.error }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setHavenOpen(v => !v)}>
                <Text style={[styles.selectText, !havenId && { color: theme.colors.textTertiary }]}>
                  {havenId ? havens.find(h => h.id === havenId)?.name : 'Select a haven'}
                </Text>
                <Feather name={havenOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
              {havenOpen && (
                <View style={styles.optionList}>
                  {havens.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.optionItem, havenId === h.id && styles.optionItemActive]}
                      onPress={() => { 
                        setHavenId(h.id); 
                        setHavenOpen(false); 
                      }}
                    >
                      <Text style={[styles.optionText, havenId === h.id && { color: theme.colors.primary, fontWeight: '700' }]}>
                        {h.name}
                      </Text>
                      {havenId === h.id && <Feather name="check" size={16} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>From Date <Text style={{ color: theme.colors.error }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setShowFrom(true)}>
                <Feather name="calendar" size={16} color={theme.colors.textTertiary} />
                <Text style={styles.selectText}>{fmtDate(fromDate)}</Text>
              </TouchableOpacity>
              {showFrom && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_, d) => { 
                    setShowFrom(false); 
                    if (d) setFromDate(d); 
                  }}
                />
              )}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>To Date <Text style={{ color: theme.colors.error }}>*</Text></Text>
              <TouchableOpacity style={styles.selectRow} onPress={() => setShowTo(true)}>
                <Feather name="calendar" size={16} color={theme.colors.textTertiary} />
                <Text style={styles.selectText}>{fmtDate(toDate)}</Text>
              </TouchableOpacity>
              {showTo && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  minimumDate={fromDate}
                  onChange={(_, d) => { 
                    setShowTo(false); 
                    if (d) setToDate(d); 
                  }}
                />
              )}

              {fromDate < toDate && (
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Selected Period</Text>
                  <Text style={styles.previewValue}>
                    {fmtDate(fromDate)} – {fmtDate(toDate)}
                  </Text>
                  <Text style={styles.previewDays}>{diffDays(fromDate, toDate)} days</Text>
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                Reason <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Maintenance, Renovation, Private event..."
                placeholderTextColor={theme.colors.textTertiary}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Status <Text style={{ color: theme.colors.error }}>*</Text></Text>
              <View style={styles.toggleRow}>
                {(['active', 'inactive'] as const).map(s => {
                  const active = formStatus === s;
                  const color = s === 'active' ? '#16A34A' : theme.colors.textTertiary;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.toggleBtn, 
                        active && { 
                          backgroundColor: s === 'active' ? '#DCFCE7' : theme.colors.surfaceSecondary, 
                          borderColor: color 
                        }
                      ]}
                      onPress={() => setFormStatus(s)}
                    >
                      <Text style={[
                        styles.toggleText, 
                        active && { color, fontWeight: '700' }
                      ]}>
                        {s === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

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

