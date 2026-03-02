import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked-in';

interface Booking {
  id: number;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: number;
  notes?: string;
}

const INITIAL_BOOKINGS: Booking[] = [
  { id: 1, guest: 'John Doe',    room: 'Haven 101', checkIn: 'Feb 20, 2026', checkOut: 'Feb 23, 2026', status: 'Confirmed',  amount: 12500, notes: 'Early check-in requested.' },
  { id: 2, guest: 'Sarah Smith', room: 'Haven 205', checkIn: 'Feb 21, 2026', checkOut: 'Feb 24, 2026', status: 'Pending',    amount: 15000, notes: '' },
  { id: 3, guest: 'Mike Johnson',room: 'Haven 103', checkIn: 'Feb 22, 2026', checkOut: 'Feb 25, 2026', status: 'Confirmed',  amount: 10800, notes: 'Allergic to feather pillows.' },
  { id: 4, guest: 'Emily Davis', room: 'Haven 302', checkIn: 'Feb 23, 2026', checkOut: 'Feb 26, 2026', status: 'Checked-in', amount: 18000, notes: '' },
];

const HAVEN_OPTIONS = ['Haven 101', 'Haven 103', 'Haven 205', 'Haven 302'];
const STATUS_OPTIONS: BookingStatus[] = ['Confirmed', 'Pending', 'Checked-in', 'Cancelled'];
const FILTER_TABS = ['All', 'Confirmed', 'Pending', 'Checked-in'];

const emptyForm = {
  guest: '', room: HAVEN_OPTIONS[0], checkIn: '', checkOut: '',
  status: 'Pending' as BookingStatus, amount: '', notes: '',
};

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
  Confirmed:    { bg: Colors.green[100],  text: Colors.green[500] },
  Pending:      { bg: Colors.yellow[100], text: '#92400E' },
  Cancelled:    { bg: Colors.red[100],    text: Colors.red[500] },
  'Checked-in': { bg: Colors.blue[100],  text: Colors.blue[500] },
};

// ─── Reusable form components ────────────────────────────────────────────────

const FormInput = ({ label, placeholder, value, onChange, error, keyboardType, multiline }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[
      styles.inputWrapper,
      error && styles.inputError,
      multiline && { height: 80, alignItems: 'flex-start', paddingVertical: 10 },
    ]}>
      <TextInput
        style={[styles.input, multiline && { textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const SelectorRow = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.selectorChip, value === opt && styles.selectorChipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.selectorChipText, value === opt && styles.selectorChipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BookingManagementScreen() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // 'add' | 'view' | 'edit' | null
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Helpers ──────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  const filterCount = (tab: string) =>
    tab === 'All' ? bookings.length : bookings.filter(b => b.status === tab).length;

  const setField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.guest.trim())    e.guest    = 'Guest name is required';
    if (!form.checkIn.trim())  e.checkIn  = 'Check-in date is required';
    if (!form.checkOut.trim()) e.checkOut = 'Check-out date is required';
    if (!form.amount.trim() || isNaN(Number(form.amount))) e.amount = 'Valid amount is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedBooking(null);
    setForm(emptyForm);
    setErrors({});
  };

  // ── Open handlers ─────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setErrors({}); setModalMode('add'); };

  const openView = (b: Booking) => { setSelectedBooking(b); setModalMode('view'); };

  const openEdit = (b: Booking) => {
    setSelectedBooking(b);
    setForm({ guest: b.guest, room: b.room, checkIn: b.checkIn, checkOut: b.checkOut,
               status: b.status, amount: String(b.amount), notes: b.notes ?? '' });
    setErrors({});
    setModalMode('edit');
  };

  // ── Save / Delete handlers ────────────────────────────────────
  const handleAdd = () => {
    if (!validate()) return;
    setBookings(prev => [{
      id: Date.now(), guest: form.guest.trim(), room: form.room,
      checkIn: form.checkIn.trim(), checkOut: form.checkOut.trim(),
      status: form.status, amount: Number(form.amount), notes: form.notes.trim(),
    }, ...prev]);
    closeModal();
  };

  const handleSaveEdit = () => {
    if (!validate()) return;
    setBookings(prev => prev.map(b =>
      b.id === selectedBooking?.id
        ? { ...b, guest: form.guest.trim(), room: form.room, checkIn: form.checkIn.trim(),
            checkOut: form.checkOut.trim(), status: form.status,
            amount: Number(form.amount), notes: form.notes.trim() }
        : b
    ));
    closeModal();
  };

  const handleDelete = (b: Booking) => {
    Alert.alert('Delete Booking', `Remove booking for ${b.guest}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: () => { setBookings(prev => prev.filter(x => x.id !== b.id)); closeModal(); } },
    ]);
  };

  // ── View Detail Sheet ─────────────────────────────────────────
  const ViewSheet = () => {
    if (!selectedBooking) return null;
    const b = selectedBooking;
    const sc = statusColors[b.status];
    return (
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Booking Details</Text>
          <TouchableOpacity style={styles.sheetCloseBtn} onPress={closeModal}>
            <Feather name="x" size={18} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {/* Guest hero */}
          <View style={styles.viewHero}>
            <View style={styles.viewAvatar}>
              <Text style={styles.viewAvatarText}>{b.guest[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.viewGuestName}>{b.guest}</Text>
              <Text style={styles.viewRoom}>{b.room}</Text>
            </View>
            <View style={[styles.viewStatusBadge, { backgroundColor: sc.bg }]}>
              <View style={[styles.viewStatusDot, { backgroundColor: sc.text }]} />
              <Text style={[styles.viewStatusText, { color: sc.text }]}>{b.status}</Text>
            </View>
          </View>

          {/* Check-in / Check-out grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="login-variant" size={20} color={Colors.green[500]} />
              <Text style={styles.infoBoxLabel}>Check-in</Text>
              <Text style={styles.infoBoxValue}>{b.checkIn}</Text>
            </View>
            <View style={[styles.infoBox, styles.infoBoxBorder]}>
              <MaterialCommunityIcons name="logout-variant" size={20} color={Colors.red[500]} />
              <Text style={styles.infoBoxLabel}>Check-out</Text>
              <Text style={styles.infoBoxValue}>{b.checkOut}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <View>
              <Text style={styles.amountCardLabel}>Total Amount</Text>
              <Text style={styles.amountCardValue}>₱{b.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.amountIcon}>
              <MaterialCommunityIcons name="currency-php" size={24} color={Colors.green[500]} />
            </View>
          </View>

          {/* Notes */}
          {!!b.notes && (
            <View style={styles.notesBox}>
              <View style={styles.notesHeader}>
                <MaterialCommunityIcons name="note-text-outline" size={15} color={Colors.brand.primary} />
                <Text style={styles.notesTitle}>Notes</Text>
              </View>
              <Text style={styles.notesText}>{b.notes}</Text>
            </View>
          )}

          {/* Booking ID */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Booking ID</Text>
            <Text style={styles.metaValue}>#BK-{String(b.id).padStart(4, '0')}</Text>
          </View>

          <View style={{ height: 8 }} />
        </ScrollView>

        <View style={styles.sheetActions}>
          <TouchableOpacity
            style={[styles.cancelBtn, styles.deleteBtn]}
            onPress={() => handleDelete(b)}
          >
            <Feather name="trash-2" size={16} color={Colors.red[500]} />
            <Text style={[styles.cancelBtnText, { color: Colors.red[500] }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => { closeModal(); setTimeout(() => openEdit(b), 250); }}
          >
            <Feather name="edit-2" size={16} color={Colors.white} />
            <Text style={styles.submitBtnText}>Edit Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Add / Edit Form Sheet ─────────────────────────────────────
  const FormSheet = () => {
    const isEdit = modalMode === 'edit';
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>{isEdit ? 'Edit Booking' : 'Add New Booking'}</Text>
              <Text style={styles.sheetSubtitle}>
                {isEdit ? `Editing ${selectedBooking?.guest}` : 'Fill in the reservation details'}
              </Text>
            </View>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={closeModal}>
              <Feather name="x" size={18} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <FormInput label="Guest Name" placeholder="e.g. Juan dela Cruz"
              value={form.guest} onChange={(v: string) => setField('guest', v)} error={errors.guest} />

            <SelectorRow label="Haven / Room" options={HAVEN_OPTIONS} value={form.room} onChange={v => setField('room', v)} />

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <FormInput label="Check-in Date" placeholder="e.g. Feb 20, 2026"
                  value={form.checkIn} onChange={(v: string) => setField('checkIn', v)} error={errors.checkIn} />
              </View>
              <View style={styles.dateArrow}><Feather name="arrow-right" size={16} color={Colors.gray[400]} /></View>
              <View style={{ flex: 1 }}>
                <FormInput label="Check-out Date" placeholder="e.g. Feb 23, 2026"
                  value={form.checkOut} onChange={(v: string) => setField('checkOut', v)} error={errors.checkOut} />
              </View>
            </View>

            <FormInput label="Total Amount (₱)" placeholder="e.g. 12500"
              value={form.amount} onChange={(v: string) => setField('amount', v)}
              error={errors.amount} keyboardType="numeric" />

            <SelectorRow label="Booking Status" options={STATUS_OPTIONS} value={form.status} onChange={v => setField('status', v)} />

            <FormInput label="Notes (optional)" placeholder="Any special requests or remarks..."
              value={form.notes} onChange={(v: string) => setField('notes', v)} multiline />

            {/* Live preview */}
            {form.guest.trim() && form.checkIn.trim() && form.checkOut.trim() && form.amount.trim() && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Preview</Text>
                <View style={styles.previewRow}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>{form.guest[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewGuest}>{form.guest}</Text>
                    <Text style={styles.previewRoom}>{form.room}</Text>
                  </View>
                  <View style={[styles.previewBadge, { backgroundColor: statusColors[form.status]?.bg }]}>
                    <Text style={[styles.previewBadgeText, { color: statusColors[form.status]?.text }]}>{form.status}</Text>
                  </View>
                </View>
                <View style={styles.previewMeta}>
                  <MaterialCommunityIcons name="calendar-range" size={13} color={Colors.gray[500]} />
                  <Text style={styles.previewMetaText}>{form.checkIn} → {form.checkOut}</Text>
                  <Text style={styles.previewAmount}>₱{Number(form.amount || 0).toLocaleString()}</Text>
                </View>
              </View>
            )}
            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={styles.sheetActions}>
            {isEdit && (
              <TouchableOpacity
                style={[styles.cancelBtn, styles.deleteBtn, { flex: 0, paddingHorizontal: 18 }]}
                onPress={() => handleDelete(selectedBooking!)}
              >
                <Feather name="trash-2" size={16} color={Colors.red[500]} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={closeModal}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={isEdit ? handleSaveEdit : handleAdd}>
              <MaterialCommunityIcons name={isEdit ? 'content-save-outline' : 'calendar-plus'} size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>{isEdit ? 'Save Changes' : 'Add Booking'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Booking Management</Text>
          <Text style={styles.headerSubtitle}>{bookings.length} active bookings</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterText, activeFilter === tab && styles.filterTextActive]}>{tab}</Text>
              {filterCount(tab) > 0 && (
                <View style={[styles.filterBadge, activeFilter !== tab && styles.filterBadgeInactive]}>
                  <Text style={[styles.filterBadgeText, activeFilter !== tab && styles.filterBadgeTextInactive]}>
                    {filterCount(tab)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <View style={styles.content}>
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter : ''} bookings found</Text>
            </View>
          ) : (
            filteredBookings.map(booking => (
              <Card key={booking.id} style={styles.bookingCard} variant="elevated">
                <View style={styles.bookingHeader}>
                  <View style={styles.guestInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{booking.guest[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guestName}>{booking.guest}</Text>
                      <Text style={styles.roomText}>{booking.room}</Text>
                    </View>
                  </View>
                  <Badge
                    label={booking.status}
                    variant={
                      booking.status === 'Confirmed'   ? 'success' :
                      booking.status === 'Pending'     ? 'warning' :
                      booking.status === 'Cancelled'   ? 'error'   : 'info'
                    }
                    size="sm"
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar-check" size={16} color={Colors.brand.primary} />
                    <Text style={styles.detailLabel}>Check-in:</Text>
                    <Text style={styles.detailValue}>{booking.checkIn}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar-remove" size={16} color={Colors.gray[500]} />
                    <Text style={styles.detailLabel}>Check-out:</Text>
                    <Text style={styles.detailValue}>{booking.checkOut}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="currency-php" size={16} color={Colors.green[500]} />
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={[styles.detailValue, styles.amountText]}>₱{booking.amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openView(booking)}>
                    <Feather name="eye" size={16} color={Colors.brand.primary} />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => openEdit(booking)}>
                    <Feather name="edit-2" size={16} color={Colors.gray[700]} />
                    <Text style={[styles.actionText, styles.actionTextSecondary]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Unified Modal ───────────────────────────────────────── */}
      <Modal visible={modalMode !== null} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          {modalMode === 'view' && <ViewSheet />}
          {(modalMode === 'add' || modalMode === 'edit') && <FormSheet />}
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

  filterContainer: {
    backgroundColor: Colors.white, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.gray[100], gap: 6,
  },
  filterChipActive: { backgroundColor: Colors.brand.primarySoft },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  filterTextActive: { color: Colors.brand.primaryDark },
  filterBadge: {
    backgroundColor: Colors.brand.primary, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center',
  },
  filterBadgeInactive: { backgroundColor: Colors.gray[300] },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  filterBadgeTextInactive: { color: Colors.gray[600] },

  content: { padding: 20, gap: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },

  bookingCard: { padding: 16 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  guestInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary },
  guestName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  roomText: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  bookingDetails: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, color: Colors.gray[600], minWidth: 80 },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  amountText: { color: Colors.green[500] },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primarySoft,
  },
  actionButtonSecondary: { backgroundColor: Colors.gray[100] },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  actionTextSecondary: { color: Colors.gray[700] },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  // Bottom sheet shared
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

  // View sheet
  viewHero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.gray[50], borderRadius: 16, padding: 16,
  },
  viewAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  viewAvatarText: { fontSize: 22, fontWeight: '700', color: Colors.brand.primary },
  viewGuestName: { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  viewRoom: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  viewStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  viewStatusDot: { width: 7, height: 7, borderRadius: 4 },
  viewStatusText: { fontSize: 12, fontWeight: '700' },

  infoGrid: {
    flexDirection: 'row', backgroundColor: Colors.gray[50],
    borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.gray[100],
  },
  infoBox: { flex: 1, padding: 16, gap: 6, alignItems: 'center' },
  infoBoxBorder: { borderLeftWidth: 1, borderLeftColor: Colors.gray[100] },
  infoBoxLabel: { fontSize: 11, color: Colors.gray[500], fontWeight: '600' },
  infoBoxValue: { fontSize: 13, fontWeight: '700', color: Colors.gray[900], textAlign: 'center' },

  amountCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.green[100], borderRadius: 16, padding: 16,
  },
  amountCardLabel: { fontSize: 12, color: Colors.green[500], fontWeight: '600', marginBottom: 4 },
  amountCardValue: { fontSize: 26, fontWeight: '700', color: Colors.green[500] },
  amountIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
  },

  notesBox: {
    backgroundColor: Colors.brand.primarySoft, borderRadius: 14, padding: 14,
    gap: 8, borderLeftWidth: 3, borderLeftColor: Colors.brand.primary,
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notesTitle: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary },
  notesText: { fontSize: 13, color: Colors.gray[700], lineHeight: 20 },

  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 4,
  },
  metaLabel: { fontSize: 12, color: Colors.gray[400] },
  metaValue: { fontSize: 12, fontWeight: '700', color: Colors.gray[500] },

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

  selectorRow: { gap: 8, paddingVertical: 2 },
  selectorChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.gray[100], borderWidth: 1, borderColor: Colors.gray[200],
  },
  selectorChipActive: { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary },
  selectorChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  selectorChipTextActive: { color: Colors.brand.primaryDark },

  dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dateArrow: { marginTop: 32, paddingHorizontal: 2 },

  previewCard: {
    backgroundColor: Colors.brand.primarySoft, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.brand.primaryLight,
  },
  previewTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.brand.primaryDark,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center',
  },
  previewAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  previewGuest: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  previewRoom: { fontSize: 12, color: Colors.gray[500] },
  previewBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { fontSize: 11, fontWeight: '700' },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewMetaText: { fontSize: 12, color: Colors.gray[600], flex: 1 },
  previewAmount: { fontSize: 13, fontWeight: '700', color: Colors.green[500] },

  // Sheet action buttons
  sheetActions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  cancelBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100],
  },
  deleteBtn: { backgroundColor: Colors.red[100] },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  submitBtn: {
    flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});