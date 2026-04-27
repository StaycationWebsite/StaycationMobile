import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

// ─── Types & Mock Data ────────────────────────────────────────────────────────
type PaymentStatus = 'Active' | 'Inactive';
type MethodType = 'Bank Transfer' | 'Cash' | 'Mobile Wallet' | 'Credit Card';

interface PaymentMethod {
  id: string;
  name: string;
  type: MethodType;
  provider: string;
  hasQR: boolean;
  status: PaymentStatus;
  icon: string;
  iconColor: string;
}

const MOCK_METHODS: PaymentMethod[] = [
  {
    id: '1',
    name: 'Bank Transfer Payment (BDO)',
    type: 'Bank Transfer',
    provider: 'BDO Unibank',
    hasQR: true,
    status: 'Inactive',
    icon: 'bank-outline',
    iconColor: '#6B7280',
  },
  {
    id: '2',
    name: 'Cash payment',
    type: 'Cash',
    provider: 'Front desk',
    hasQR: false,
    status: 'Inactive',
    icon: 'cash-multiple',
    iconColor: '#10B981',
  },
  {
    id: '3',
    name: 'GCash',
    type: 'Mobile Wallet',
    provider: 'GCash',
    hasQR: true,
    status: 'Active',
    icon: 'wallet-outline',
    iconColor: '#3B82F6',
  },
];

const METHOD_TYPES: Array<{ label: string; icon: string; example: string }> = [
  { label: 'Credit Card',   icon: 'credit-card-outline', example: 'For Visa, Mastercard, etc.' },
  { label: 'Bank Transfer', icon: 'bank-outline',        example: 'For BDO, BPI, etc.' },
  { label: 'Mobile Wallet', icon: 'wallet-outline',      example: 'For GCash, PayMaya, etc.' },
  { label: 'Cash',          icon: 'cash-multiple',       example: 'For on-site cash payments' },
];

const STATUS_FILTER_OPTIONS: Array<'All' | PaymentStatus> = ['All', 'Active', 'Inactive'];

// ─── Add Payment Modal ────────────────────────────────────────────────────────
function AddPaymentModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [selectedType, setSelectedType] = useState<MethodType | null>(null);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.inputLabel}>Payment Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GCash, BDO Bank Transfer"
              placeholderTextColor={Colors.gray[400]}
              value={name}
              onChangeText={setName}
            />

            {/* Provider */}
            <Text style={styles.inputLabel}>Provider *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GCash, BDO Unibank"
              placeholderTextColor={Colors.gray[400]}
              value={provider}
              onChangeText={setProvider}
            />

            {/* Type */}
            <Text style={styles.inputLabel}>Method Type *</Text>
            <View style={styles.typeGrid}>
              {METHOD_TYPES.map(t => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.typeChip, selectedType === t.label && styles.typeChipActive]}
                  onPress={() => setSelectedType(t.label as MethodType)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={t.icon as any}
                    size={16}
                    color={selectedType === t.label ? '#fff' : Colors.gray[500]}
                  />
                  <Text style={[styles.typeChipText, selectedType === t.label && { color: '#fff' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Additional details about this payment method"
              placeholderTextColor={Colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Status toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.inputLabel}>Set as Active</Text>
                <Text style={styles.toggleSub}>Visible to guests during checkout</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: Colors.gray[200], true: Colors.brand.primary + '80' }}
                thumbColor={isActive ? Colors.brand.primary : Colors.gray[400]}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Add Payment Method</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Method Detail Modal ──────────────────────────────────────────────────────
function MethodDetailModal({ method, onClose }: { method: PaymentMethod; onClose: () => void }) {
  const isActive = method.status === 'Active';
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon + name */}
            <View style={styles.detailHero}>
              <View style={[styles.detailHeroIcon, { backgroundColor: method.iconColor + '18' }]}>
                <MaterialCommunityIcons name={method.icon as any} size={28} color={method.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailHeroName}>{method.name}</Text>
                <Text style={styles.detailHeroType}>{method.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#EF4444' }]}>
                  {method.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <DetailRow icon="store-outline"      label="Provider"       value={method.provider} />
              <DetailRow icon="credit-card-outline" label="Account Details" value="••••••••••••" />
              <DetailRow
                icon="qrcode"
                label="QR Code"
                value={method.hasQR ? 'Available — tap to view' : 'No QR code'}
                valueColor={method.hasQR ? Colors.brand.primary : Colors.gray[400]}
              />
            </View>

            {/* Actions */}
            <View style={styles.detailActions}>
              <TouchableOpacity style={styles.editBtn}>
                <Feather name="edit-2" size={16} color={Colors.brand.primary} />
                <Text style={[styles.editBtnText, { color: Colors.brand.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn}>
                <Feather name="trash-2" size={16} color="#EF4444" />
                <Text style={[styles.editBtnText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value, valueColor }: {
  icon: string; label: string; value: string; valueColor?: string;
}) {
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
export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [showGuide, setShowGuide] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const counts = {
    total:    MOCK_METHODS.length,
    active:   MOCK_METHODS.filter(m => m.status === 'Active').length,
    inactive: MOCK_METHODS.filter(m => m.status === 'Inactive').length,
  };

  const filtered = MOCK_METHODS.filter(m => {
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
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
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSub}>Manage payment methods and processing options</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Stat Cards ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Methods', value: counts.total,    color: '#6366F1', icon: 'wallet-outline' },
            { label: 'Active',        value: counts.active,   color: '#10B981', icon: 'credit-card-outline' },
            { label: 'Inactive',      value: counts.inactive, color: '#EF4444', icon: 'eye-off-outline' },
          ].map(card => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.color }]}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{card.value}</Text>
                <MaterialCommunityIcons name={card.icon as any} size={28} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          ))}
        </View>

        {/* ── Status Guide ── */}
        <TouchableOpacity
          style={styles.collapseCard}
          onPress={() => setShowGuide(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.collapseTitle}>Payment Method Status Guide</Text>
          <Feather name={showGuide ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.gray[500]} />
        </TouchableOpacity>
        {showGuide && (
          <View style={styles.guideBody}>
            <View style={styles.guideRow}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guideLabel}>Active</Text>
                <Text style={styles.guideSub}>Payment method is currently available for guests to use during checkout</Text>
              </View>
            </View>
            <View style={styles.guideRow}>
              <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guideLabel}>Inactive</Text>
                <Text style={styles.guideSub}>Payment method is temporarily disabled and not visible to guests</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── How to Add ── */}
        <TouchableOpacity
          style={styles.collapseCard}
          onPress={() => setShowHowTo(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.collapseTitle}>How to Add Payment Methods</Text>
          <Feather name={showHowTo ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.gray[500]} />
        </TouchableOpacity>
        {showHowTo && (
          <View style={styles.howToBody}>
            {[
              { step: 1, title: 'Click Add Payment Method',  desc: 'Use the "Add Payment Method" button in the header to open the form' },
              { step: 2, title: 'Fill Required Fields',      desc: 'Enter payment name, select method type, provider, and account details' },
              { step: 3, title: 'Add Description (Optional)',desc: 'Provide additional details about the payment method for clarity' },
              { step: 4, title: 'Set Status & Save',         desc: 'Toggle active status and click "Add Payment Method" to save' },
            ].map(s => (
              <View key={s.step} style={styles.howToStep}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{s.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}

            {/* Method types */}
            <View style={styles.typesBox}>
              <Text style={styles.typesBoxTitle}>Payment Method Types:</Text>
              <View style={styles.typesGrid}>
                {METHOD_TYPES.map(t => (
                  <View key={t.label} style={styles.typeRow}>
                    <MaterialCommunityIcons name={t.icon as any} size={13} color={Colors.brand.primary} />
                    <Text style={styles.typeRowText}><Text style={{ fontWeight: '700' }}>{t.label}:</Text> {t.example}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Search + Add ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Feather name="search" size={15} color={Colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by payment name, provider, or method..."
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
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Status Filters ── */}
        <View style={styles.filtersRow}>
          {STATUS_FILTER_OPTIONS.map(f => {
            const active = statusFilter === f;
            const color = f === 'Active' ? '#10B981' : f === 'Inactive' ? '#EF4444' : Colors.brand.primary;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
                onPress={() => setStatusFilter(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, active && { color: '#fff' }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Method Cards ── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="credit-card-off-outline" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No payment methods found</Text>
          </View>
        ) : (
          <View style={styles.methodList}>
            {filtered.map(method => {
              const isActive = method.status === 'Active';
              return (
                <TouchableOpacity
                  key={method.id}
                  style={styles.methodCard}
                  onPress={() => setSelectedMethod(method)}
                  activeOpacity={0.75}
                >
                  {/* Icon + name */}
                  <View style={styles.methodCardTop}>
                    <View style={[styles.methodIcon, { backgroundColor: method.iconColor + '18' }]}>
                      <MaterialCommunityIcons name={method.icon as any} size={20} color={method.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodType}>{method.type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                      <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
                      <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#EF4444' }]}>
                        {method.status}
                      </Text>
                    </View>
                  </View>

                  {/* Provider + QR */}
                  <View style={styles.methodCardBottom}>
                    <View style={styles.methodMeta}>
                      <MaterialCommunityIcons name="store-outline" size={12} color={Colors.gray[400]} />
                      <Text style={styles.methodMetaText}>{method.provider}</Text>
                    </View>
                    <View style={styles.methodMeta}>
                      <MaterialCommunityIcons
                        name={method.hasQR ? 'qrcode' : 'qrcode-remove'}
                        size={12}
                        color={method.hasQR ? Colors.brand.primary : Colors.gray[400]}
                      />
                      <Text style={[styles.methodMetaText, method.hasQR && { color: Colors.brand.primary }]}>
                        {method.hasQR ? 'QR Available' : 'No QR code'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.methodCardActions}>
                    <TouchableOpacity style={styles.actionIconBtn}>
                      <Feather name="eye" size={15} color={Colors.gray[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn}>
                      <Feather name="edit-2" size={15} color={Colors.brand.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn}>
                      <Feather name="trash-2" size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modals */}
      {showAddModal && <AddPaymentModal onClose={() => setShowAddModal(false)} />}
      {selectedMethod && <MethodDetailModal method={selectedMethod} onClose={() => setSelectedMethod(null)} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.gray[50] },
  scrollContent: { padding: 16, gap: 12 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white, paddingHorizontal: 16,
    paddingTop: 8, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn:     { paddingTop: 2 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  headerSub:   { fontSize: 12, color: Colors.gray[500], marginTop: 2 },

  // Stats
  statsRow:  { flexDirection: 'row', gap: 8 },
  statCard:  { flex: 1, borderRadius: 14, padding: 12, gap: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  statRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },

  // Collapsible cards
  collapseCard: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[100],
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  collapseTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray[800] },

  // Guide
  guideBody: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[100],
    padding: 14, gap: 12, marginTop: -8,
  },
  guideRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guideLabel:{ fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  guideSub:  { fontSize: 12, color: Colors.gray[500], marginTop: 2 },

  // How to
  howToBody: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[100],
    padding: 14, gap: 14, marginTop: -8,
  },
  howToStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNum:   { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  stepDesc:  { fontSize: 12, color: Colors.gray[500], marginTop: 2, lineHeight: 17 },
  typesBox: {
    backgroundColor: Colors.gray[50], borderRadius: 10,
    borderWidth: 1, borderColor: Colors.gray[100], padding: 12, gap: 8,
  },
  typesBoxTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[700] },
  typesGrid:     { gap: 6 },
  typeRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeRowText:   { fontSize: 12, color: Colors.gray[600] },

  // Search
  searchRow:  { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[100],
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[800] },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.brand.primary, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Filters
  filtersRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },

  // Method cards
  methodList: { gap: 10 },
  methodCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.gray[100], padding: 14, gap: 10,
  },
  methodCardTop:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon:       { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  methodName:       { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  methodType:       { fontSize: 12, color: Colors.gray[500], marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  methodCardBottom: { flexDirection: 'row', gap: 16 },
  methodMeta:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  methodMetaText:   { fontSize: 12, color: Colors.gray[500] },
  methodCardActions:{ flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: Colors.gray[50], paddingTop: 8 },
  actionIconBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 6,
    backgroundColor: Colors.gray[50], borderRadius: 8,
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:  { fontSize: 14, color: Colors.gray[400] },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36, maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200],
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle:  { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },

  // Form
  inputLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray[700], marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.gray[50], borderRadius: 10,
    borderWidth: 1, borderColor: Colors.gray[200],
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.gray[800],
  },
  typeGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white,
  },
  typeChipActive:   { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  typeChipText:     { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, marginBottom: 4,
  },
  toggleSub:    { fontSize: 11, color: Colors.gray[400], marginTop: 2 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.brand.primary, borderRadius: 14, paddingVertical: 14, marginTop: 16,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Detail modal
  detailHero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  detailHeroIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  detailHeroName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  detailHeroType: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  detailSection:  { gap: 12, marginBottom: 20 },
  detailRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  detailLabel: { fontSize: 11, color: Colors.gray[500], marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[800] },
  detailActions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.brand.primary, borderRadius: 12, paddingVertical: 12,
  },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingVertical: 12,
  },
  editBtnText: { fontSize: 14, fontWeight: '700' },
});