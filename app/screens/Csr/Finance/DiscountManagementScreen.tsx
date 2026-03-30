import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import { discountsService } from '../../../../services/discountsService';
import { API_CONFIG } from '../../../../constants/config';

type Discount = {
  id: number; code: string; name: string; type: 'percentage' | 'fixed';
  value: number; minAmount: number | null; validUntil: string; status: string; usageCount: number;
};

const BLANK: Omit<Discount, 'id' | 'usageCount'> = {
  code: '', name: '', type: 'percentage', value: 0, minAmount: null, validUntil: '', status: 'Active',
};

function mapApiDiscount(raw: any, index: number): Discount {
  const discountType = raw.discount_type ?? raw.type ?? 'percentage';
  return {
    id: typeof raw.id === 'number' ? raw.id : index + 1,
    code: raw.code ?? '',
    name: raw.name ?? raw.code ?? '',
    type: discountType === 'fixed' ? 'fixed' : 'percentage',
    value: raw.discount_value ?? raw.percentage ?? raw.discountAmount ?? raw.value ?? 0,
    minAmount: raw.min_booking_amount ?? raw.minAmount ?? null,
    validUntil: raw.end_date ?? raw.validUntil ?? raw.expiresAt ?? raw.expiry ?? '',
    status: raw.is_active === false ? 'Inactive' : (raw.status ?? 'Active'),
    usageCount: raw.usage_count ?? raw.usageCount ?? 0,
  };
}

export default function DiscountManagementScreen() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Discount | null }>({ visible: false, mode: 'add', item: null });
  const [form, setForm]           = useState<typeof BLANK>(BLANK);

  const fetchDiscounts = useCallback(async () => {
    try {
      // Try the admin endpoint first (handles all discounts across havens)
      let allData: any[] = await discountsService.getAllDiscounts();

      // If admin endpoint returns nothing, fall back to per-haven fetching
      if (allData.length === 0) {
        const havenRes  = await fetch(API_CONFIG.HAVEN_API);
        const havenData = await havenRes.json();
        const havens: any[] = Array.isArray(havenData.data) ? havenData.data : (Array.isArray(havenData) ? havenData : []);
        const havenIds: string[] = havens.map((h: any) => h.uuid_id).filter(Boolean);

        const results = await Promise.allSettled(
          havenIds.map(id => discountsService.getRoomDiscounts({ havenId: id }))
        );
        results.forEach(r => { if (r.status === 'fulfilled') allData.push(...r.value); });
      }

      const seen = new Set<string>();
      const unique = allData.filter(d => {
        const key = d.id != null ? `id:${d.id}` : `code:${String(d.code)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setDiscounts(unique.map(mapApiDiscount));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load discounts');
    }
  }, []);

  useEffect(() => { fetchDiscounts().finally(() => setLoading(false)); }, [fetchDiscounts]);

  const onRefresh = async () => { setRefreshing(true); await fetchDiscounts(); setRefreshing(false); };

  const openAdd  = () => { setForm(BLANK); setModal({ visible: true, mode: 'add', item: null }); };
  const openEdit = (item: Discount) => {
    setForm({ code: item.code, name: item.name, type: item.type, value: item.value, minAmount: item.minAmount, validUntil: item.validUntil, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim() || !form.value) {
      Alert.alert('Missing Fields', 'Please fill in Code, Name, and Value.'); return;
    }
    if (modal.mode === 'add') {
      setDiscounts(prev => [...prev, { ...form, id: Date.now(), usageCount: 0 }]);
    } else {
      setDiscounts(prev => prev.map(d => d.id === modal.item?.id ? { ...d, ...form } : d));
    }
    setModal({ visible: false, mode: 'add', item: null });
  };

  const handleToggle = (id: number, currentStatus: string) => {
    const next = currentStatus === 'Active' ? 'Inactive' : 'Active';
    Alert.alert(`${next} Discount`, `Are you sure you want to ${next.toLowerCase()} this code?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: next } : d)) },
    ]);
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalCount    = discounts.length;
  const activeCount   = discounts.filter(d => d.status === 'Active').length;
  const inactiveCount = discounts.filter(d => d.status === 'Inactive').length;
  const totalUsage    = discounts.reduce((s, d) => s + d.usageCount, 0);
  const usageRate     = totalCount > 0 ? Math.round((totalUsage / totalCount) * 100) : 0;

  // ── Filter ───────────────────────────────────────────────────────────────────
  const FILTERS = ['All', 'Active', 'Inactive', 'Expired'];
  const filtered = discounts.filter(d => {
    const matchStatus = activeFilter === 'All' || d.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

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
              <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={Colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.heroTitle}>Discount Management</Text>
              <Text style={styles.heroSub}>{totalCount} discount code{totalCount !== 1 ? 's' : ''} total</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Feather name="plus" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── KPI Grid ─────────────────────────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: '#7C3AED' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Total Discounts</Text>
              <MaterialCommunityIcons name="tag-multiple" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{totalCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#16A34A' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Active</Text>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{activeCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#DC2626' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Inactive</Text>
              <MaterialCommunityIcons name="close-circle-outline" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{inactiveCount}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#2563EB' }]}>
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>Usage Rate</Text>
              <MaterialCommunityIcons name="chart-line" size={18} color="rgba(255,255,255,0.35)" />
            </View>
            <Text style={styles.kpiValue}>{usageRate}%</Text>
          </View>
        </View>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={Colors.gray[400]} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search code or name..."
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
        </View>

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

        {/* ── Discount Cards ────────────────────────────────────────────────── */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="ticket-outline" size={52} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No discounts found</Text>
              <Text style={styles.emptyText}>
                {activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} discount codes` : 'Add your first discount code'}
              </Text>
            </View>
          ) : filtered.map(discount => (
            <View key={discount.id} style={styles.card}>

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.codeTag}>
                  <MaterialCommunityIcons name="ticket-percent" size={12} color={Colors.brand.primary} />
                  <Text style={styles.codeTagText}>{discount.code}</Text>
                </View>
                <Badge
                  label={discount.status}
                  variant={discount.status === 'Active' ? 'success' : discount.status === 'Expired' ? 'error' : 'warning'}
                  size="sm"
                />
              </View>

              {/* Name */}
              <Text style={styles.cardName}>{discount.name || '—'}</Text>

              <View style={styles.divider} />

              {/* Info row */}
              <View style={styles.infoRow}>
                {/* Discount value */}
                <View style={styles.infoBlock}>
                  <View style={[styles.infoIconWrap, { backgroundColor: Colors.brand.primarySoft }]}>
                    <MaterialCommunityIcons
                      name={discount.type === 'percentage' ? 'percent' : 'currency-php'}
                      size={14} color={Colors.brand.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Discount</Text>
                    <Text style={styles.infoVal}>
                      {discount.type === 'percentage' ? `${discount.value}%` : `₱${discount.value.toLocaleString()}`}
                    </Text>
                  </View>
                </View>

                {/* Usage */}
                <View style={styles.infoBlock}>
                  <View style={[styles.infoIconWrap, { backgroundColor: '#EDE9FE' }]}>
                    <MaterialCommunityIcons name="ticket-confirmation-outline" size={14} color="#7C3AED" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Used</Text>
                    <Text style={styles.infoVal}>{discount.usageCount}×</Text>
                  </View>
                </View>

                {/* Valid until */}
                <View style={styles.infoBlock}>
                  <View style={[styles.infoIconWrap, { backgroundColor: Colors.gray[100] }]}>
                    <Feather name="calendar" size={13} color={Colors.gray[500]} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Expires</Text>
                    <Text style={styles.infoVal} numberOfLines={1}>{discount.validUntil || '—'}</Text>
                  </View>
                </View>
              </View>

              {/* Min amount */}
              {discount.minAmount ? (
                <View style={styles.minAmountRow}>
                  <Feather name="info" size={11} color={Colors.gray[400]} />
                  <Text style={styles.minAmountText}>Min. booking amount: ₱{discount.minAmount.toLocaleString()}</Text>
                </View>
              ) : null}

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(discount)}>
                  <Feather name="edit-2" size={14} color={Colors.brand.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {discount.status !== 'Expired' && (
                  <TouchableOpacity style={styles.toggleBtn} onPress={() => handleToggle(discount.id, discount.status)}>
                    <Feather name={discount.status === 'Active' ? 'eye-off' : 'eye'} size={14} color={Colors.gray[600]} />
                    <Text style={styles.toggleBtnText}>
                      {discount.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal({ visible: false, mode: 'add', item: null })} />
        <ScrollView style={styles.sheet} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{modal.mode === 'add' ? 'Add Discount Code' : 'Edit Discount Code'}</Text>

          {[
            { label: 'Discount Code', key: 'code', placeholder: 'e.g. PROMO2026', caps: 'characters' as const },
            { label: 'Discount Name', key: 'name', placeholder: 'e.g. Summer Special', caps: 'words' as const },
            { label: 'Valid Until',   key: 'validUntil', placeholder: 'e.g. Dec 31, 2026', caps: 'words' as const },
          ].map(f => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={styles.inputLabel}>{f.label}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.gray[400]}
                value={String((form as any)[f.key] ?? '')}
                onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                autoCapitalize={f.caps}
              />
            </View>
          ))}

          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeRow}>
            {(['percentage', 'fixed'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, form.type === t && styles.typeBtnActive]} onPress={() => setForm(f => ({ ...f, type: t }))}>
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
            style={[styles.textInput, { marginBottom: 24 }]}
            placeholder="e.g. 5000"
            placeholderTextColor={Colors.gray[400]}
            keyboardType="numeric"
            value={String(form.minAmount || '')}
            onChangeText={v => setForm(f => ({ ...f, minAmount: v ? Number(v) : null }))}
          />

          <View style={styles.sheetActions}>
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

  // Hero banner
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
  addBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center',
  },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  kpiCard: { width: '47.5%', borderRadius: 14, padding: 14 },
  kpiRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: Colors.white },

  // New Discount button
  newDiscountBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: Colors.brand.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 18, alignSelf: 'flex-start',
  },
  newDiscountBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },

  // Chips
  chipRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip:     { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.brand.primarySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  codeTagText: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary, letterSpacing: 0.8 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.gray[900], marginBottom: 12 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 14 },

  // Info blocks
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  infoBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 10, color: Colors.gray[400], fontWeight: '600', textTransform: 'uppercase' },
  infoVal:   { fontSize: 13, fontWeight: '700', color: Colors.gray[900], marginTop: 1 },

  minAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  minAmountText: { fontSize: 11, color: Colors.gray[400] },

  // Actions
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primarySoft,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.gray[100],
  },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },

  // Modal / Sheet
  overlay: { flex: 0.35, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: Colors.gray[900], backgroundColor: Colors.gray[50],
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[200], alignItems: 'center', backgroundColor: Colors.gray[50] },
  typeBtnActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primarySoft },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  typeBtnTextActive: { color: Colors.brand.primary },
  sheetActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
