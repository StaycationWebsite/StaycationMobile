import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

type Discount = {
  id: number; code: string; name: string; type: 'percentage' | 'fixed';
  value: number; minAmount: number | null; validUntil: string; status: string; usageCount: number;
};

const INITIAL_DISCOUNTS: Discount[] = [
  { id: 1, code: 'WELCOME2026', name: 'New Customer Welcome Discount', type: 'percentage', value: 15, minAmount: 5000, validUntil: 'Mar 31, 2026', status: 'Active', usageCount: 24 },
  { id: 2, code: 'LONGSTAY', name: 'Extended Stay Discount', type: 'percentage', value: 20, minAmount: 10000, validUntil: 'Dec 31, 2026', status: 'Active', usageCount: 12 },
  { id: 3, code: 'EARLYBIRD', name: 'Early Bird Special', type: 'fixed', value: 1000, minAmount: null, validUntil: 'Feb 28, 2026', status: 'Active', usageCount: 8 },
  { id: 4, code: 'SUMMER2025', name: 'Summer Promo', type: 'percentage', value: 25, minAmount: 8000, validUntil: 'Jan 31, 2026', status: 'Expired', usageCount: 156 },
];

const BLANK: Omit<Discount, 'id' | 'usageCount'> = {
  code: '', name: '', type: 'percentage', value: 0, minAmount: null, validUntil: '', status: 'Active',
};

export default function DiscountManagementScreen() {
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [modal, setModal] = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Discount | null }>({
    visible: false, mode: 'add', item: null,
  });
  const [form, setForm] = useState<typeof BLANK>(BLANK);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const openAdd = () => {
    setForm(BLANK);
    setModal({ visible: true, mode: 'add', item: null });
  };

  const openEdit = (item: Discount) => {
    setForm({ code: item.code, name: item.name, type: item.type, value: item.value, minAmount: item.minAmount, validUntil: item.validUntil, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim() || !form.value) {
      Alert.alert('Missing Fields', 'Please fill in Code, Name, and Value.');
      return;
    }
    if (modal.mode === 'add') {
      setDiscounts(prev => [...prev, { ...form, id: Date.now(), usageCount: 0 }]);
    } else {
      setDiscounts(prev => prev.map(d => d.id === modal.item?.id ? { ...d, ...form } : d));
    }
    setModal({ visible: false, mode: 'add', item: null });
  };

  const handleToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    Alert.alert(
      `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Discount`,
      `Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} this code?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d)) },
      ]
    );
  };

  const filtered = discounts.filter(d => activeFilter === 'All' || d.status === activeFilter);
  const activeCount = discounts.filter(d => d.status === 'Active').length;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discount Management</Text>
          <Text style={styles.headerSubtitle}>{activeCount} active codes</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <View style={styles.statsRow}>
          {[
            { icon: 'ticket-percent', color: Colors.brand.primary, value: discounts.length, label: 'Total Codes' },
            { icon: 'chart-line', color: Colors.green[500], value: discounts.reduce((s, d) => s + d.usageCount, 0), label: 'Total Usage' },
            { icon: 'currency-php', color: Colors.blue[500], value: '₱48K', label: 'Total Savings' },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <MaterialCommunityIcons name={s.icon as any} size={24} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.filterChips}>
          {['All', 'Active', 'Inactive', 'Expired'].map(f => (
            <TouchableOpacity key={f} style={[styles.chip, activeFilter === f && styles.chipActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="ticket-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} discounts</Text>
            </View>
          ) : filtered.map(discount => (
            <Card key={discount.id} style={styles.discountCard} variant="elevated">
              <View style={styles.discountHeader}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{discount.code}</Text>
                </View>
                <Badge
                  label={discount.status}
                  variant={discount.status === 'Active' ? 'success' : discount.status === 'Expired' ? 'error' : 'warning'}
                  size="sm"
                />
              </View>
              <Text style={styles.discountName}>{discount.name}</Text>
              <View style={styles.divider} />
              <View style={styles.discountDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name={discount.type === 'percentage' ? 'percent' : 'currency-php'} size={16} color={Colors.brand.primary} />
                  <Text style={styles.detailLabel}>Discount:</Text>
                  <Text style={styles.detailValue}>{discount.type === 'percentage' ? `${discount.value}%` : `₱${discount.value.toLocaleString()}`}</Text>
                </View>
                {discount.minAmount && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="cash-minus" size={16} color={Colors.gray[500]} />
                    <Text style={styles.detailLabel}>Min. Amount:</Text>
                    <Text style={styles.detailValue}>₱{discount.minAmount.toLocaleString()}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={16} color={Colors.gray[500]} />
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>{discount.validUntil}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="ticket-confirmation" size={16} color={Colors.blue[500]} />
                  <Text style={styles.detailLabel}>Used:</Text>
                  <Text style={styles.detailValue}>{discount.usageCount} times</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEdit(discount)}>
                  <Feather name="edit-2" size={16} color={Colors.brand.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                {discount.status !== 'Expired' && (
                  <TouchableOpacity style={styles.toggleButton} onPress={() => handleToggle(discount.id, discount.status)}>
                    <Feather name={discount.status === 'Active' ? 'eye-off' : 'eye'} size={16} color={Colors.gray[700]} />
                    <Text style={styles.toggleText}>{discount.status === 'Active' ? 'Deactivate' : 'Activate'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModal({ visible: false, mode: 'add', item: null })} />
        <ScrollView style={styles.modalSheet} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{modal.mode === 'add' ? 'Add Discount Code' : 'Edit Discount Code'}</Text>

          {[
            { label: 'Discount Code', key: 'code', placeholder: 'e.g. PROMO2026' },
            { label: 'Discount Name', key: 'name', placeholder: 'e.g. Summer Special' },
            { label: 'Valid Until', key: 'validUntil', placeholder: 'e.g. Dec 31, 2026' },
          ].map(field => (
            <View key={field.key} style={{ marginBottom: 14 }}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={String((form as any)[field.key] ?? '')}
                onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                autoCapitalize={field.key === 'code' ? 'characters' : 'words'}
              />
            </View>
          ))}

          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeRow}>
            {(['percentage', 'fixed'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                onPress={() => setForm(f => ({ ...f, type: t }))}
              >
                <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                  {t === 'percentage' ? '% Percentage' : '₱ Fixed Amount'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Value ({form.type === 'percentage' ? '%' : '₱'})</Text>
          <TextInput
            style={[styles.textInput, { marginBottom: 14 }]}
            placeholder={form.type === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
            placeholderTextColor={Colors.gray[400]}
            keyboardType="numeric"
            value={String(form.value || '')}
            onChangeText={v => setForm(f => ({ ...f, value: Number(v) || 0 }))}
          />

          <Text style={styles.inputLabel}>Min. Booking Amount (optional)</Text>
          <TextInput
            style={[styles.textInput, { marginBottom: 20 }]}
            placeholder="e.g. 5000"
            placeholderTextColor={Colors.gray[400]}
            keyboardType="numeric"
            value={String(form.minAmount || '')}
            onChangeText={v => setForm(f => ({ ...f, minAmount: v ? Number(v) : null }))}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal({ visible: false, mode: 'add', item: null })}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{modal.mode === 'add' ? 'Add Code' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[100] },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], marginTop: 6 },
  statLabel: { fontSize: 10, color: Colors.gray[500], marginTop: 2, textAlign: 'center' },
  filterChips: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },
  content: { padding: 20, gap: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },
  discountCard: { padding: 16 },
  discountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  codeBox: { backgroundColor: Colors.brand.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.brand.primaryLight, borderStyle: 'dashed' },
  codeText: { fontSize: 14, fontWeight: '700', color: Colors.brand.primaryDark, letterSpacing: 1 },
  discountName: { fontSize: 15, fontWeight: '600', color: Colors.gray[900], marginBottom: 12 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  discountDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 12, color: Colors.gray[600], minWidth: 90 },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  actionRow: { flexDirection: 'row', gap: 10 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primarySoft },
  editText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.gray[100] },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.gray[700] },
  modalOverlay: { flex: 0.35, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.gray[900], backgroundColor: Colors.gray[50] },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[200], alignItems: 'center', backgroundColor: Colors.gray[50] },
  typeBtnActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  typeBtnTextActive: { color: Colors.brand.primary },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});