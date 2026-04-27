import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type PartnerStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive';

interface Partner {
  id: number;
  name: string;
  type: string;
  phone: string;
  email: string;
  commission: string;
  status: PartnerStatus;
}

const PARTNER_TYPES = ['Hotel', 'Restaurant', 'Spa', 'Gym', 'Laundry', 'Cleaning', 'Maintenance', 'Catering', 'Security', 'Transportation'];

const INITIAL_PARTNERS: Partner[] = [
  { id: 1, name: 'Partner Sample',    type: 'Hotel',      phone: '09123456789', email: 'partner@gmail.com',      commission: '10.00', status: 'Pending' },
  { id: 2, name: 'GreenClean Co.',    type: 'Cleaning',   phone: '09171234567', email: 'greenclean@partner.ph',  commission: '8.50',  status: 'Active' },
  { id: 3, name: 'RelaxSpa Center',   type: 'Spa',        phone: '09182345678', email: 'relax@spa.ph',           commission: '12.00', status: 'Active' },
  { id: 4, name: 'QuickLaundry',      type: 'Laundry',    phone: '09193456789', email: 'quick@laundry.ph',       commission: '7.00',  status: 'Suspended' },
  { id: 5, name: 'SafeGuard Inc.',    type: 'Security',   phone: '09204567890', email: 'safeguard@partner.ph',   commission: '9.00',  status: 'Inactive' },
];

const STATUS_COLORS: Record<PartnerStatus, { bg: string; text: string; dot: string }> = {
  Active:    { bg: Colors.green[100],  text: Colors.green[500], dot: Colors.green[500] },
  Pending:   { bg: Colors.yellow[100], text: '#92400E',         dot: Colors.yellow[500] },
  Suspended: { bg: Colors.red[100],    text: Colors.red[500],   dot: Colors.red[500] },
  Inactive:  { bg: Colors.gray[100],   text: Colors.gray[500],  dot: Colors.gray[400] },
};

const STATUS_GUIDE = [
  { status: 'Active',    desc: 'Partner is verified and can offer services' },
  { status: 'Pending',   desc: 'Awaiting verification and approval' },
  { status: 'Suspended', desc: 'Partner account is temporarily disabled' },
  { status: 'Inactive',  desc: 'Partner account is no longer active' },
];

const ADD_STEPS = [
  { step: 1, title: 'Click Add Partner',     desc: 'Use the "+ Add Partner" button in the toolbar' },
  { step: 2, title: 'Fill Partner Details',  desc: 'Enter email, phone, name and other information' },
  { step: 3, title: 'Set Commission Rate',   desc: 'Define commission percentage for services' },
  { step: 4, title: 'Save & Verify',         desc: 'Submit then approve the partner status' },
];

const TYPE_ICONS: Record<string, string> = {
  Hotel: 'office-building', Restaurant: 'silverware-fork-knife', Spa: 'spa-outline',
  Gym: 'dumbbell', Laundry: 'washing-machine', Cleaning: 'broom',
  Maintenance: 'wrench', Catering: 'food', Security: 'shield-check', Transportation: 'car',
};

const BLANK_FORM = { name: '', type: 'Hotel', phone: '', email: '', commission: '', status: 'Pending' as PartnerStatus };

export default function PartnerManagementScreen() {
  const navigation = useNavigation<any>();
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Partner | null }>({ visible: false, mode: 'add', item: null });
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [typeOpen, setTypeOpen] = useState(false);

  const stats = {
    total:     partners.length,
    active:    partners.filter(p => p.status === 'Active').length,
    pending:   partners.filter(p => p.status === 'Pending').length,
    suspended: partners.filter(p => p.status === 'Suspended').length,
  };

  const filtered = partners.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q);
    const matchStatus = statusFilter === 'All Status' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm({ ...BLANK_FORM }); setModal({ visible: true, mode: 'add', item: null }); };
  const openEdit = (item: Partner) => {
    setForm({ name: item.name, type: item.type, phone: item.phone, email: item.email, commission: item.commission, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };
  const closeModal = () => setModal({ visible: false, mode: 'add', item: null });

  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Missing Fields', 'Please enter partner name.'); return; }
    if (modal.mode === 'add') {
      setPartners(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setPartners(prev => prev.map(p => p.id === modal.item?.id ? { ...p, ...form } : p));
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Remove Partner', 'Remove this partner from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPartners(prev => prev.filter(p => p.id !== id)) },
    ]);
  };

  const changeStatus = (id: number, current: PartnerStatus) => {
    const options = (['Active', 'Pending', 'Suspended', 'Inactive'] as PartnerStatus[]).filter(s => s !== current);
    Alert.alert('Change Status', 'Set partner status to:', [
      ...options.map(s => ({ text: s, onPress: () => setPartners(prev => prev.map(p => p.id === id ? { ...p, status: s } : p)) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Partner Management</Text>
          <Text style={s.headerSub}>Manage partners and their services</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.kpiScroll}>
          {[
            { label: 'Total Partners', value: stats.total,     color: '#818CF8', icon: 'handshake-outline' },
            { label: 'Active',         value: stats.active,    color: Colors.green[500], icon: 'eye-outline' },
            { label: 'Pending',        value: stats.pending,   color: Colors.yellow[500], icon: 'clock-outline' },
            { label: 'Suspended',      value: stats.suspended, color: Colors.red[500],  icon: 'alert-outline' },
          ].map(({ label, value, color, icon }) => (
            <View key={label} style={[s.kpiCard, { backgroundColor: color }]}>
              <Text style={s.kpiLabel}>{label}</Text>
              <Text style={s.kpiValue}>{value}</Text>
              <MaterialCommunityIcons name={icon as any} size={36} color="rgba(255,255,255,0.25)" style={s.kpiIcon} />
            </View>
          ))}
        </ScrollView>

        {/* Partner Status Guide */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Partner Status Guide</Text>
          <View style={s.guideGrid}>
            {STATUS_GUIDE.map(({ status, desc }) => {
              const c = STATUS_COLORS[status as PartnerStatus];
              return (
                <View key={status} style={s.guideItem}>
                  <View style={s.guideItemTop}>
                    <View style={[s.guideDot, { backgroundColor: c.dot }]} />
                    <Text style={[s.guideStatus, { color: c.text }]}>{status}</Text>
                  </View>
                  <Text style={s.guideDesc}>{desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* How to Add Partners */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How to Add Partners</Text>
          <View style={s.stepsGrid}>
            {ADD_STEPS.map(({ step, title, desc }) => (
              <View key={step} style={s.stepItem}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{step}</Text>
                </View>
                <Text style={s.stepTitle}>{title}</Text>
                <Text style={s.stepDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search + Add + Filter */}
        <View style={s.toolbarSection}>
          <View style={s.searchRow}>
            <View style={s.searchBox}>
              <Feather name="search" size={14} color={Colors.gray[400]} />
              <TextInput
                style={s.searchInput}
                placeholder="Search by name, email, or phone..."
                placeholderTextColor={Colors.gray[400]}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={14} color={Colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={s.refreshBtn} onPress={() => {}}>
              <Feather name="refresh-cw" size={14} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={s.addFilterRow}>
            <TouchableOpacity style={s.addBtn} onPress={openAdd}>
              <Feather name="plus" size={15} color={Colors.white} />
              <Text style={s.addBtnText}>Add Partner</Text>
            </TouchableOpacity>

            {/* Status filter */}
            <View style={{ zIndex: filterOpen ? 20 : 1 }}>
              <TouchableOpacity style={s.filterPill} onPress={() => setFilterOpen(v => !v)}>
                <Text style={s.filterPillText}>{statusFilter}</Text>
                <Feather name={filterOpen ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
              </TouchableOpacity>
              {filterOpen && (
                <View style={s.dropdown}>
                  {['All Status', 'Active', 'Pending', 'Suspended', 'Inactive'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[s.dropdownItem, statusFilter === opt && s.dropdownItemActive]}
                      onPress={() => { setStatusFilter(opt); setFilterOpen(false); }}
                    >
                      <Text style={[s.dropdownText, statusFilter === opt && { color: Colors.brand.primary, fontWeight: '700' }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Partner List */}
        <View style={s.listContent}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="handshake-outline" size={48} color={Colors.gray[300]} />
              <Text style={s.emptyText}>No partners found</Text>
            </View>
          ) : filtered.map(partner => {
            const sc = STATUS_COLORS[partner.status];
            const icon = TYPE_ICONS[partner.type] ?? 'briefcase-outline';
            return (
              <View key={partner.id} style={s.card}>
                {/* Top */}
                <View style={s.cardTop}>
                  <View style={s.partnerIcon}>
                    <MaterialCommunityIcons name={icon as any} size={22} color={Colors.brand.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.partnerName}>{partner.name}</Text>
                    <Text style={s.partnerType}>{partner.type}</Text>
                  </View>
                  <View style={s.cardActions}>
                    <TouchableOpacity style={s.editBtn} onPress={() => openEdit(partner)}>
                      <Feather name="edit-2" size={14} color={Colors.blue[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(partner.id)}>
                      <Feather name="trash-2" size={14} color={Colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info grid */}
                <View style={s.infoGrid}>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>EMAIL</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="mail" size={11} color={Colors.gray[400]} />
                      <Text style={s.infoValue} numberOfLines={1}>{partner.email}</Text>
                    </View>
                  </View>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>PHONE</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="phone" size={11} color={Colors.gray[400]} />
                      <Text style={s.infoValue}>{partner.phone}</Text>
                    </View>
                  </View>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>TYPE</Text>
                    <Text style={s.infoValue}>{partner.type}</Text>
                  </View>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>COMMISSION</Text>
                    <Text style={[s.infoValue, { fontWeight: '700', color: Colors.gray[900] }]}>{partner.commission}%</Text>
                  </View>
                </View>

                {/* Status row */}
                <View style={s.statusRow}>
                  <Text style={s.infoLabel}>STATUS</Text>
                  <TouchableOpacity
                    style={[s.statusBadge, { backgroundColor: sc.bg }]}
                    onPress={() => changeStatus(partner.id, partner.status)}
                  >
                    <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                    <Text style={[s.statusText, { color: sc.text }]}>{partner.status}</Text>
                    <Feather name="chevron-down" size={11} color={sc.text} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={closeModal} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{modal.mode === 'add' ? 'Add Partner' : 'Edit Partner'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={20} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Partner / Company Name', key: 'name',       placeholder: 'e.g. Partner Sample' },
                { label: 'Phone Number',           key: 'phone',      placeholder: '09123456789' },
                { label: 'Email Address',          key: 'email',      placeholder: 'partner@email.com' },
                { label: 'Commission Rate (%)',    key: 'commission', placeholder: 'e.g. 10.00' },
              ].map(f => (
                <View key={f.key} style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={s.textInput}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(ff => ({ ...ff, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.gray[400]}
                    keyboardType={f.key === 'commission' ? 'numeric' : 'default'}
                  />
                </View>
              ))}

              {/* Type picker */}
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Partner Type</Text>
                <TouchableOpacity style={s.textInput} onPress={() => setTypeOpen(v => !v)}>
                  <Text style={{ fontSize: 14, color: form.type ? Colors.gray[900] : Colors.gray[400] }}>{form.type || 'Select type'}</Text>
                </TouchableOpacity>
                {typeOpen && (
                  <View style={s.typeDropdown}>
                    {PARTNER_TYPES.map(t => (
                      <TouchableOpacity key={t} style={[s.typeOption, form.type === t && { backgroundColor: Colors.brand.primarySoft }]}
                        onPress={() => { setForm(f => ({ ...f, type: t })); setTypeOpen(false); }}>
                        <Text style={[s.typeOptionText, form.type === t && { color: Colors.brand.primary, fontWeight: '700' }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Status selector */}
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Status</Text>
                <View style={s.statusBtns}>
                  {(['Active', 'Pending', 'Suspended', 'Inactive'] as PartnerStatus[]).map(st => {
                    const c = STATUS_COLORS[st];
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[s.statusBtn, form.status === st && { backgroundColor: c.bg, borderColor: c.dot }]}
                        onPress={() => setForm(f => ({ ...f, status: st }))}
                      >
                        <View style={[s.statusDot, { backgroundColor: c.dot }]} />
                        <Text style={[s.statusBtnText, form.status === st && { color: c.text }]}>{st}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={s.modalBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={closeModal}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                  <Text style={s.saveText}>{modal.mode === 'add' ? 'Add Partner' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  headerSub:   { fontSize: 12, color: Colors.gray[500], marginTop: 1 },
  // KPI
  kpiScroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  kpiCard:   { width: 140, borderRadius: 16, padding: 16, overflow: 'hidden' },
  kpiLabel:  { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  kpiValue:  { fontSize: 28, fontWeight: '800', color: Colors.white },
  kpiIcon:   { position: 'absolute', bottom: 8, right: 8 },
  // Sections
  section: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.white, borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900], marginBottom: 14 },
  // Status Guide
  guideGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  guideItem: { width: '47%', gap: 4 },
  guideItemTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideDot: { width: 9, height: 9, borderRadius: 5 },
  guideStatus: { fontSize: 13, fontWeight: '700' },
  guideDesc: { fontSize: 11, color: Colors.gray[500], lineHeight: 16 },
  // Steps
  stepsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stepItem: { width: '47%', gap: 6 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '800', color: Colors.white },
  stepTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },
  stepDesc: { fontSize: 11, color: Colors.gray[500], lineHeight: 16 },
  // Toolbar
  toolbarSection: { paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },
  refreshBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[200], justifyContent: 'center', alignItems: 'center' },
  addFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.brand.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.white, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  filterPillText: { fontSize: 12, fontWeight: '600', color: Colors.gray[700] },
  dropdown: {
    position: 'absolute', top: 44, right: 0, width: 160,
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 10, overflow: 'hidden',
  },
  dropdownItem:       { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: Colors.brand.primarySoft },
  dropdownText:       { fontSize: 13, color: Colors.gray[700] },
  // List
  listContent: { paddingHorizontal: 16, gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15, color: Colors.gray[500], fontWeight: '600' },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  partnerName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  partnerType: { fontSize: 11, color: Colors.gray[500], marginTop: 1 },
  cardActions: { flexDirection: 'row', gap: 6 },
  editBtn:   { width: 32, height: 32, borderRadius: 8, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.red[100], justifyContent: 'center', alignItems: 'center' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem: { width: '47%', gap: 3 },
  infoLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.5 },
  infoValue: { fontSize: 12, color: Colors.gray[700] },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  // Modal
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray[600], marginBottom: 6 },
  textInput: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.gray[900], backgroundColor: Colors.gray[50],
  },
  typeDropdown: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[200], marginTop: 4, overflow: 'hidden' },
  typeOption: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  typeOptionText: { fontSize: 14, color: Colors.gray[800] },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.gray[50] },
  statusBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.gray[200] },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: Colors.brand.primary },
  saveText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
