import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

// ─── Types & Mock Data ────────────────────────────────────────────────────────
type BookingStatus = 'Pending' | 'Approved' | 'Declined' | 'Completed' | 'Rejected';

interface GuestBooking {
  id: string;
  bookingRef: string;
  createdAt: string;
  guestName: string;
  email: string;
  phone: string;
  haven: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: string;
  status: BookingStatus;
}

const MOCK_BOOKINGS: GuestBooking[] = [
  {
    id: '1',
    bookingRef: 'BK1776820698884',
    createdAt: '22/04/2026, 09:20:19',
    guestName: 'John Doe',
    email: 'csr@staycationhavenph.com',
    phone: '0991484954',
    haven: 'Haven 1',
    checkIn: 'Apr 22, 2026',
    checkOut: 'Jul 23, 2026',
    guests: 10,
    amount: '₱137,908.00',
    status: 'Rejected',
  },
  {
    id: '2',
    bookingRef: 'BK1776389194144',
    createdAt: '17/04/2026, 09:34:01',
    guestName: 'Clark O',
    email: 'clarkorzame9215@gmail.com',
    phone: '9458893753',
    haven: 'Haven 1',
    checkIn: 'Apr 20, 2026',
    checkOut: 'Apr 21, 2026',
    guests: 2,
    amount: '₱3,284.00',
    status: 'Approved',
  },
  {
    id: '3',
    bookingRef: 'BK-1776154974648-JQAA5K68W',
    createdAt: '14/04/2026, 16:22:55',
    guestName: 'Joel Malupiton',
    email: 'jusper.anderson@gmail.com',
    phone: '09157930859',
    haven: 'Haven 3',
    checkIn: 'May 14, 2026',
    checkOut: 'May 15, 2026',
    guests: 1,
    amount: '₱2,699.00',
    status: 'Pending',
  },
  {
    id: '4',
    bookingRef: 'BK1776147967419',
    createdAt: '14/04/2026, 14:27:19',
    guestName: 'John Achas',
    email: 'johnjmachas@gmail.com',
    phone: '9999999999',
    haven: 'Haven 1',
    checkIn: 'Apr 18, 2026',
    checkOut: 'Apr 18, 2026',
    guests: 1,
    amount: '₱1,599.00',
    status: 'Completed',
  },
  {
    id: '5',
    bookingRef: 'BK1776137546741',
    createdAt: '14/04/2026, 11:34:07',
    guestName: 'John Doe',
    email: 'csr@staycationhavenph.com',
    phone: '0991484954',
    haven: 'Haven 1',
    checkIn: 'Apr 1, 2026',
    checkOut: 'Apr 2, 2026',
    guests: 2,
    amount: '₱1,599.00',
    status: 'Pending',
  },
  {
    id: '6',
    bookingRef: 'BK1775973772988',
    createdAt: '12/04/2026, 10:15:00',
    guestName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '09123456789',
    haven: 'Haven 2',
    checkIn: 'Apr 15, 2026',
    checkOut: 'Apr 17, 2026',
    guests: 3,
    amount: '₱4,200.00',
    status: 'Approved',
  },
  {
    id: '7',
    bookingRef: 'BK1774422273264',
    createdAt: '10/04/2026, 08:30:00',
    guestName: 'Anna Reyes',
    email: 'anna.reyes@gmail.com',
    phone: '09987654321',
    haven: 'Haven 5',
    checkIn: 'Apr 25, 2026',
    checkOut: 'Apr 27, 2026',
    guests: 4,
    amount: '₱5,600.00',
    status: 'Declined',
  },
];

const STATUS_CONFIG: Record<BookingStatus, { color: string; bg: string; icon: string }> = {
  Pending:   { color: '#F59E0B', bg: '#FFFBEB', icon: 'clock-outline' },
  Approved:  { color: '#10B981', bg: '#ECFDF5', icon: 'check-circle-outline' },
  Declined:  { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
  Completed: { color: '#3B82F6', bg: '#EFF6FF', icon: 'checkbox-marked-circle-outline' },
  Rejected:  { color: '#6B7280', bg: '#F3F4F6', icon: 'cancel' },
};

const STATUS_FILTERS: Array<'All' | BookingStatus> = [
  'All', 'Pending', 'Approved', 'Declined', 'Completed', 'Rejected',
];

// ─── Booking Detail Modal ─────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose }: { booking: GuestBooking; onClose: () => void }) {
  const cfg = STATUS_CONFIG[booking.status];
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View style={[styles.statusBanner, { backgroundColor: cfg.bg }]}>
              <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
              <Text style={[styles.statusBannerText, { color: cfg.color }]}>{booking.status}</Text>
            </View>

            {/* Details */}
            <View style={styles.detailSection}>
              <DetailRow icon="identifier"           label="Booking Ref"  value={booking.bookingRef} />
              <DetailRow icon="calendar-clock"       label="Created"      value={booking.createdAt} />
              <DetailRow icon="account-outline"      label="Guest"        value={booking.guestName} />
              <DetailRow icon="email-outline"        label="Email"        value={booking.email} />
              <DetailRow icon="phone-outline"        label="Phone"        value={booking.phone} />
              <DetailRow icon="home-city-outline"    label="Haven"        value={booking.haven} />
              <DetailRow icon="login"                label="Check-In"     value={booking.checkIn}  valueColor={Colors.green[500]} />
              <DetailRow icon="logout"               label="Check-Out"    value={booking.checkOut} valueColor={Colors.red[500]} />
              <DetailRow icon="account-group-outline"label="Guests"       value={`${booking.guests} guest${booking.guests > 1 ? 's' : ''}`} />
              <DetailRow icon="cash-multiple"        label="Amount"       value={booking.amount}   valueColor={Colors.green[500]} />
            </View>

            {/* Action buttons for Pending */}
            {booking.status === 'Pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}>
                  <Feather name="x" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 20 }} />
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
        <MaterialCommunityIcons name={icon as any} size={14} color={Colors.brand.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onPress }: { booking: GuestBooking; onPress: () => void }) {
  const cfg = STATUS_CONFIG[booking.status];
  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress} activeOpacity={0.75}>
      {/* Top: ref + status */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingRef} numberOfLines={1}>{booking.bookingRef}</Text>
          <Text style={styles.createdAt}>{booking.createdAt}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{booking.status}</Text>
        </View>
      </View>

      {/* Guest */}
      <View style={styles.cardRow}>
        <MaterialCommunityIcons name="account-outline" size={13} color={Colors.gray[400]} />
        <Text style={styles.guestName}>{booking.guestName}</Text>
        <Text style={styles.cardDot}>·</Text>
        <MaterialCommunityIcons name="home-city-outline" size={13} color={Colors.brand.primary} />
        <Text style={styles.havenText}>{booking.haven}</Text>
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateChip}>
          <MaterialCommunityIcons name="login" size={11} color={Colors.green[500]} />
          <Text style={[styles.dateText, { color: Colors.green[500] }]}>{booking.checkIn}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={12} color={Colors.gray[300]} />
        <View style={styles.dateChip}>
          <MaterialCommunityIcons name="logout" size={11} color={Colors.red[500]} />
          <Text style={[styles.dateText, { color: Colors.red[500] }]}>{booking.checkOut}</Text>
        </View>
      </View>

      {/* Footer: guests + amount + actions */}
      <View style={styles.cardFooter}>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="account-group-outline" size={13} color={Colors.gray[400]} />
          <Text style={styles.metaText}>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.amountText}>{booking.amount}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="eye" size={14} color={Colors.gray[500]} />
          </TouchableOpacity>
          {booking.status === 'Pending' && (
            <>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="check" size={14} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="x" size={14} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GuestAssistanceScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [selectedBooking, setSelectedBooking] = useState<GuestBooking | null>(null);

  const counts = {
    total:     MOCK_BOOKINGS.length,
    pending:   MOCK_BOOKINGS.filter(b => b.status === 'Pending').length,
    approved:  MOCK_BOOKINGS.filter(b => b.status === 'Approved').length,
    declined:  MOCK_BOOKINGS.filter(b => b.status === 'Declined').length,
  };

  const filtered = MOCK_BOOKINGS.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.bookingRef.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.haven.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q);
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
          <Text style={styles.headerTitle}>Guest Assistance</Text>
          <Text style={styles.headerSub}>Manage booking requests, approve reservations, and assist guests</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Stat Cards ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {[
            { label: 'Total Bookings', value: counts.total,    color: '#3B82F6', icon: 'calendar-month-outline' },
            { label: 'Pending',        value: counts.pending,  color: '#F59E0B', icon: 'clock-outline' },
            { label: 'Approved',       value: counts.approved, color: '#10B981', icon: 'check-circle-outline' },
            { label: 'Declined',       value: counts.declined, color: '#EF4444', icon: 'close-circle-outline' },
          ].map(card => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.color }]}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{card.value}</Text>
                <MaterialCommunityIcons name={card.icon as any} size={30} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={15} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by booking ref, guest name, or haven..."
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

        {/* ── Status Filters ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f;
            const cfg = f !== 'All' ? STATUS_CONFIG[f] : null;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  active && { backgroundColor: cfg?.color ?? Colors.brand.primary, borderColor: cfg?.color ?? Colors.brand.primary },
                ]}
                onPress={() => setStatusFilter(f)}
                activeOpacity={0.7}
              >
                {cfg && (
                  <MaterialCommunityIcons
                    name={cfg.icon as any}
                    size={11}
                    color={active ? '#fff' : cfg.color}
                  />
                )}
                <Text style={[styles.filterText, active && { color: '#fff' }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Results count ── */}
        <Text style={styles.resultsText}>
          Showing <Text style={{ fontWeight: '700', color: Colors.gray[800] }}>{filtered.length}</Text> booking{filtered.length !== 1 ? 's' : ''}
        </Text>

        {/* ── Booking List ── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-remove-outline" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          <View style={styles.bookingList}>
            {filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => setSelectedBooking(booking)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
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
  statsRow:  { gap: 10, paddingBottom: 4 },
  statCard:  { borderRadius: 14, padding: 14, width: 150, gap: 4 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  statRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[100],
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[800] },

  // Filters
  filtersRow: { gap: 8, paddingBottom: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },

  // Results
  resultsText: { fontSize: 12, color: Colors.gray[500] },

  // Booking cards
  bookingList: { gap: 10 },
  bookingCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
    padding: 14, gap: 8,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bookingRef:  { fontSize: 12, fontWeight: '700', color: Colors.gray[700] },
  createdAt:   { fontSize: 11, color: Colors.gray[400], marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  statusText:  { fontSize: 11, fontWeight: '700' },
  cardRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  guestName:   { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  cardDot:     { color: Colors.gray[300], fontSize: 12 },
  havenText:   { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  datesRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gray[50], borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  dateText:    { fontSize: 11, fontWeight: '500' },
  cardFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaText:    { fontSize: 12, color: Colors.gray[500] },
  amountText:  { fontSize: 13, fontWeight: '700', color: Colors.green[500] },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center', alignItems: 'center',
  },

  // Empty
  emptyState:  { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:   { fontSize: 14, color: Colors.gray[400] },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36, maxHeight: '88%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200],
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle:  { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, marginBottom: 16,
  },
  statusBannerText: { fontSize: 14, fontWeight: '700' },
  detailSection:    { gap: 12, marginBottom: 20 },
  detailRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  detailLabel:  { fontSize: 11, color: Colors.gray[500], marginBottom: 2 },
  detailValue:  { fontSize: 13, fontWeight: '600', color: Colors.gray[800] },
  actionRow:    { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 13,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});