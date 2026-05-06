import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type Staff = {
  id: number; name: string; role: string; email: string; phone: string; status: string;
};

const ROLES = ['Owner', 'CSR', 'Cleaner', 'Partner'];

const INITIAL_STAFF: Staff[] = [
  { id: 1, name: 'Maria Santos',   role: 'Owner',   email: 'maria@staycation.ph',  phone: '+63 912 345 6789', status: 'Active' },
  { id: 2, name: 'Juan dela Cruz', role: 'CSR',     email: 'juan@staycation.ph',   phone: '+63 923 456 7890', status: 'Active' },
  { id: 3, name: 'Anna Reyes',     role: 'CSR',     email: 'anna@staycation.ph',   phone: '+63 934 567 8901', status: 'Active' },
  { id: 4, name: 'Carlo Mendoza',  role: 'Cleaner', email: 'carlo@staycation.ph',  phone: '+63 945 678 9012', status: 'Active' },
  { id: 5, name: 'Liza Gomez',     role: 'Cleaner', email: 'liza@staycation.ph',   phone: '+63 956 789 0123', status: 'Active' },
  { id: 6, name: 'Ryan Torres',    role: 'Cleaner', email: 'ryan@staycation.ph',   phone: '+63 967 890 1234', status: 'Inactive' },
  { id: 7, name: 'Ben Cruz',       role: 'Partner', email: 'ben@partner.ph',       phone: '+63 978 901 2345', status: 'Active' },
  { id: 8, name: 'Grace Tan',      role: 'CSR',     email: 'grace@staycation.ph',  phone: '+63 989 012 3456', status: 'Active' },
];

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Owner:   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  CSR:     { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  Cleaner: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  Partner: { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
};

const AVATAR_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6'];

const BLANK = { name: '', role: 'CSR', email: '', phone: '', status: 'Active' };

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export default function StaffManagementScreen() {
  const navigation = useNavigation<any>();
  const [staff, setStaff]           = useState(INITIAL_STAFF);
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [modal, setModal]           = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Staff | null }>({ visible: false, mode: 'add', item: null });
  const [form, setForm]             = useState<typeof BLANK>(BLANK);

  // Stat counts
  const activeCSR      = staff.filter(s => s.role === 'CSR'     && s.status === 'Active').length;
  const activeCleaners = staff.filter(s => s.role === 'Cleaner' && s.status === 'Active').length;
  const loggedOut      = staff.filter(s => s.status === 'Inactive').length;
  const totalStaff     = staff.length;

  const filtered = staff.filter(s => {
    const matchRole   = filterRole === 'All' || s.role === filterRole;
    const matchSearch = !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const openAdd  = () => { setForm(BLANK); setModal({ visible: true, mode: 'add', item: null }); };
  const openEdit = (item: Staff) => {
    setForm({ name: item.name, role: item.role, email: item.email, phone: item.phone, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };
  const closeModal = () => setModal({ visible: false, mode: 'add', item: null });

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Name and Email.');
      return;
    }
    if (modal.mode === 'add') {
      setStaff(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setStaff(prev => prev.map(s => s.id === modal.item?.id ? { ...s, ...form } : s));
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Remove Staff', 'Are you sure you want to remove this staff member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setStaff(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <Text style={styles.headerSub}>Monitor activity logs and manage your team efficiently</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={15} color="#fff" />
          <Text style={styles.addBtnText}>Add Employee</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Stat Cards ── */}
        <View style={styles.statsRow}>
          {([
            { label: 'ACTIVE\nCSR',      value: activeCSR,      bg: '#6366F1' },
            { label: 'ACTIVE\nCLEANERS', value: activeCleaners, bg: '#059669' },
            { label: 'LOGGED\nOUT',      value: loggedOut,      bg: '#F59E0B' },
            { label: 'TOTAL\nSTAFF',     value: totalStaff,     bg: '#EF4444' },
          ] as const).map(c => (
            <View key={c.label} style={[styles.statCard, { backgroundColor: c.bg }]}>
              <Text style={styles.statLabel}>{c.label}</Text>
              <Text style={styles.statValue}>{c.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Directory ── */}
        <View style={styles.section}>

          {/* Section title + search */}
          <View style={styles.dirHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color="#374151" />
              <Text style={styles.dirTitle}>Active Staff Directory</Text>
            </View>
            <Text style={styles.countBadge}>{filtered.length} members</Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={15} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Role filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {['All', ...ROLES].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, filterRole === r && styles.chipActive]}
                onPress={() => setFilterRole(r)}
              >
                <Text style={[styles.chipText, filterRole === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Staff Cards ── */}
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No staff found</Text>
            </View>
          ) : (
            filtered.map(member => {
              const rc = ROLE_COLORS[member.role] ?? { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
              const isActive = member.status === 'Active';
              return (
                <View key={member.id} style={styles.card}>
                  {/* Left accent bar */}
                  <View style={[styles.cardAccent, { backgroundColor: rc.dot }]} />

                  <View style={styles.cardInner}>
                    {/* Top row: avatar + info + role badge */}
                    <View style={styles.cardTop}>
                      <Avatar name={member.name} size={46} />

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Text style={styles.cardName}>{member.name}</Text>
                          <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                            <Text style={[styles.roleBadgeText, { color: rc.text }]}>{member.role}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardId}>ID: {String(member.id).padStart(4, '0')}</Text>
                      </View>

                      {/* Status pill top-right */}
                      <View style={[styles.statusPill, { backgroundColor: isActive ? '#D1FAE5' : '#F3F4F6' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#059669' : '#9CA3AF' }]} />
                        <Text style={[styles.statusText, { color: isActive ? '#065F46' : '#6B7280' }]}>
                          {member.status}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Bottom row: contact + actions */}
                    <View style={styles.cardBottom}>
                      <View style={{ flex: 1, gap: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Feather name="mail" size={12} color="#9CA3AF" />
                          <Text style={styles.cardContact} numberOfLines={1}>{member.email}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Feather name="phone" size={12} color="#9CA3AF" />
                          <Text style={styles.cardContact}>{member.phone}</Text>
                        </View>
                      </View>

                      <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(member)}>
                          <Feather name="edit-2" size={13} color="#6366F1" />
                          <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(member.id)}>
                          <Feather name="trash-2" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── Activity Feed shortcut ── */}
        <TouchableOpacity
          style={styles.activityBtn}
          onPress={() => navigation.navigate('StaffActivityFeed')}
        >
          <Ionicons name="pulse-outline" size={18} color="#6366F1" />
          <Text style={styles.activityBtnText}>View Staff Activity Feed</Text>
          <Feather name="arrow-right" size={16} color="#6366F1" />
        </TouchableOpacity>

      </ScrollView>

      {/* ── Add / Edit Modal ── */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal} />
        <ScrollView style={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{modal.mode === 'add' ? '+ Add Staff Member' : 'Edit Staff Member'}</Text>

          {([
            { label: 'Full Name', key: 'name',  placeholder: 'e.g. Juan dela Cruz', kb: 'default'       },
            { label: 'Email',     key: 'email', placeholder: 'staff@email.com',      kb: 'email-address' },
            { label: 'Phone',     key: 'phone', placeholder: '+63 900 000 0000',     kb: 'phone-pad'     },
          ] as const).map(field => (
            <View key={field.key} style={{ marginBottom: 16 }}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.textInput}
                value={(form as any)[field.key]}
                onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={field.kb as any}
              />
            </View>
          ))}

          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => {
              const rc = ROLE_COLORS[r];
              const active = form.role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, active && { backgroundColor: rc.bg, borderColor: rc.dot }]}
                  onPress={() => setForm(f => ({ ...f, role: r }))}
                >
                  {active && <View style={[styles.roleBtnDot, { backgroundColor: rc.dot }]} />}
                  <Text style={[styles.roleBtnText, active && { color: rc.text, fontWeight: '700' }]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{modal.mode === 'add' ? 'Add Staff' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F59E0B', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Stat cards
  statsRow: { flexDirection: 'row', padding: 14, gap: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, minHeight: 90, justifyContent: 'space-between' },
  statLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.3 },
  statValue: { fontSize: 30, fontWeight: '800', color: '#fff' },

  // Directory header section
  section: {
    backgroundColor: '#fff', marginHorizontal: 14,
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dirHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  dirTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  countBadge: {
    fontSize: 12, fontWeight: '600', color: '#6366F1',
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 14, marginBottom: 4,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  chipRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#4F46E5' },

  // Staff card list
  cardList: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    flexDirection: 'row', overflow: 'hidden',
  },
  cardAccent: { width: 4 },
  cardInner: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardId: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    marginLeft: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardContact: { fontSize: 12, color: '#6B7280', flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#6366F1' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },

  // Empty state
  emptyState: { padding: 48, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },

  // Activity feed button
  activityBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EEF2FF', marginHorizontal: 14, marginTop: 14,
    padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#C7D2FE',
  },
  activityBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#4F46E5' },

  // Modal
  overlay: { flex: 0.25, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB',
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  roleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  roleBtnDot: { width: 7, height: 7, borderRadius: 4 },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F59E0B', alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});