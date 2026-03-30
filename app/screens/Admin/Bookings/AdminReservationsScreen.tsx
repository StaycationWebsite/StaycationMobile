import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type BookingStatus = 'pending' | 'approved' | 'confirmed' | 'checked-in' | 'completed' | 'rejected' | 'cancelled';
type FilterStatus = 'all' | BookingStatus;

interface Booking {
  id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  havenName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  amount: number;
  remainingBalance: number;
  status: BookingStatus;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

const MOCK_BOOKINGS: Booking[] = [
  { id: '1', bookingId: 'BK-2026-001', guestName: 'John Doe',      guestEmail: 'john@email.com',   guestPhone: '+63 912 345 6789', havenName: 'Haven 101', checkIn: 'Mar 10, 2026', checkOut: 'Mar 12, 2026', nights: 2, adults: 2, children: 0, infants: 0, amount: 12500,  remainingBalance: 12500, status: 'pending',    paymentStatus: 'pending' },
  { id: '2', bookingId: 'BK-2026-002', guestName: 'Jane Smith',     guestEmail: 'jane@email.com',   guestPhone: '+63 917 234 5678', havenName: 'Haven 205', checkIn: 'Mar 11, 2026', checkOut: 'Mar 14, 2026', nights: 3, adults: 2, children: 1, infants: 0, amount: 18750,  remainingBalance: 9375,  status: 'approved',   paymentStatus: 'partial' },
  { id: '3', bookingId: 'BK-2026-003', guestName: 'Mike Johnson',   guestEmail: 'mike@email.com',   guestPhone: '+63 919 876 5432', havenName: 'Haven 302', checkIn: 'Mar 9, 2026',  checkOut: 'Mar 11, 2026', nights: 2, adults: 3, children: 0, infants: 0, amount: 15000,  remainingBalance: 0,     status: 'confirmed',  paymentStatus: 'paid' },
  { id: '4', bookingId: 'BK-2026-004', guestName: 'Sarah Williams', guestEmail: 'sarah@email.com',  guestPhone: '+63 922 111 2222', havenName: 'Haven 101', checkIn: 'Mar 8, 2026',  checkOut: 'Mar 9, 2026',  nights: 1, adults: 2, children: 0, infants: 0, amount: 6250,   remainingBalance: 0,     status: 'checked-in', paymentStatus: 'paid' },
  { id: '5', bookingId: 'BK-2026-005', guestName: 'David Brown',    guestEmail: 'david@email.com',  guestPhone: '+63 933 444 5555', havenName: 'Haven 404', checkIn: 'Mar 5, 2026',  checkOut: 'Mar 8, 2026',  nights: 3, adults: 4, children: 2, infants: 1, amount: 22500,  remainingBalance: 0,     status: 'completed',  paymentStatus: 'paid' },
  { id: '6', bookingId: 'BK-2026-006', guestName: 'Anna Cruz',      guestEmail: 'anna@email.com',   guestPhone: '+63 944 666 7777', havenName: 'Haven 203', checkIn: 'Mar 15, 2026', checkOut: 'Mar 17, 2026', nights: 2, adults: 2, children: 0, infants: 0, amount: 12500,  remainingBalance: 12500, status: 'rejected',   paymentStatus: 'pending' },
  { id: '7', bookingId: 'BK-2026-007', guestName: 'Robert Lee',     guestEmail: 'robert@email.com', guestPhone: '+63 955 888 9999', havenName: 'Haven 305', checkIn: 'Mar 20, 2026', checkOut: 'Mar 22, 2026', nights: 2, adults: 2, children: 1, infants: 0, amount: 14000,  remainingBalance: 14000, status: 'cancelled',  paymentStatus: 'pending' },
];

const STATUS_CFG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: 'Pending',    color: '#D97706', bg: '#FEF3C7' },
  approved:     { label: 'Approved',   color: '#16A34A', bg: '#DCFCE7' },
  confirmed:    { label: 'Confirmed',  color: '#059669', bg: '#D1FAE5' },
  'checked-in': { label: 'Checked In', color: '#2563EB', bg: '#DBEAFE' },
  completed:    { label: 'Completed',  color: '#6B7280', bg: '#F3F4F6' },
  rejected:     { label: 'Rejected',   color: '#DC2626', bg: '#FEE2E2' },
  cancelled:    { label: 'Cancelled',  color: '#B91C1C', bg: '#FEE2E2' },
};

const SUMMARY_KEYS: BookingStatus[] = ['pending', 'approved', 'confirmed', 'checked-in', 'completed', 'rejected', 'cancelled'];

// ─── Module-level BookingCard ──────────────────────────────────────────────
const BookingCard = ({
  booking, onApprove, onReject, onCheckIn, onCheckOut, onDetails,
}: {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  onCheckIn: (id: string) => void;
  onCheckOut:(id: string) => void;
  onDetails: (b: Booking) => void;
}) => {
  const cfg = STATUS_CFG[booking.status];
  const payColor = booking.paymentStatus === 'paid' ? '#16A34A' : booking.paymentStatus === 'partial' ? '#D97706' : '#DC2626';
  const totalGuests = booking.adults + booking.children + booking.infants;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{booking.guestName[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName}>{booking.guestName}</Text>
          <Text style={styles.bookingMeta}>{booking.bookingId} · {booking.havenName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Check-in</Text>
          <Text style={styles.dateValue}>{booking.checkIn}</Text>
        </View>
        <View style={styles.dateMid}>
          <Feather name="arrow-right" size={14} color={Colors.gray[400]} />
          <Text style={styles.nightsText}>{booking.nights}n</Text>
        </View>
        <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.dateLabel}>Check-out</Text>
          <Text style={styles.dateValue}>{booking.checkOut}</Text>
        </View>
      </View>

      {/* Footer info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={14} color={Colors.gray[500]} />
          <Text style={styles.infoText}>{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</Text>
        </View>
        <MaterialCommunityIcons name="currency-php" size={14} color={Colors.gray[500]} />
        <Text style={styles.amountText}>{booking.amount.toLocaleString()}</Text>
        <View style={[styles.payBadge, { backgroundColor: payColor + '18' }]}>
          <Text style={[styles.payText, { color: payColor }]}>{booking.paymentStatus}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => onDetails(booking)}>
          <Feather name="eye" size={14} color={Colors.brand.primary} />
          <Text style={styles.detailsBtnText}>Details</Text>
        </TouchableOpacity>

        {booking.status === 'pending' && (
          <>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DCFCE7' }]} onPress={() => onApprove(booking.id)}>
              <Feather name="check" size={14} color="#16A34A" />
              <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => onReject(booking.id)}>
              <Feather name="x" size={14} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {(booking.status === 'approved' || booking.status === 'confirmed') && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DBEAFE' }]} onPress={() => onCheckIn(booking.id)}>
            <Feather name="log-in" size={14} color="#2563EB" />
            <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Check In</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'checked-in' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]} onPress={() => onCheckOut(booking.id)}>
            <Feather name="log-out" size={14} color="#D97706" />
            <Text style={[styles.actionBtnText, { color: '#D97706' }]}>Check Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function AdminReservationsScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filter, setFilter]   = useState<FilterStatus>('all');
  const [search, setSearch]   = useState('');
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);

  const countFor = (s: BookingStatus) => bookings.filter(b => b.status === s).length;

  const filtered = bookings.filter(b => {
    const statusOk = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const searchOk = q === '' ||
      b.guestName.toLowerCase().includes(q) ||
      b.bookingId.toLowerCase().includes(q) ||
      b.havenName.toLowerCase().includes(q);
    return statusOk && searchOk;
  });

  const updateStatus = (id: string, status: BookingStatus) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

  const handleApprove  = (id: string) => Alert.alert('Approve Booking', 'Approve this reservation?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Approve', onPress: () => updateStatus(id, 'approved') }]);
  const handleReject   = (id: string) => Alert.alert('Reject Booking',  'Reject this reservation?',  [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => updateStatus(id, 'rejected') }]);
  const handleCheckIn  = (id: string) => Alert.alert('Check In Guest',  'Mark guest as checked in?',  [{ text: 'Cancel', style: 'cancel' }, { text: 'Check In', onPress: () => updateStatus(id, 'checked-in') }]);
  const handleCheckOut = (id: string) => Alert.alert('Check Out Guest', 'Mark guest as completed?',   [{ text: 'Cancel', style: 'cancel' }, { text: 'Check Out', onPress: () => updateStatus(id, 'completed') }]);

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContent}>
        <TouchableOpacity
          style={[styles.summaryCard, { backgroundColor: Colors.brand.primary }, filter === 'all' && styles.summaryCardSelected]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.summaryCount, { color: '#fff' }]}>{bookings.length}</Text>
          <Text style={[styles.summaryLabel, { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
        {SUMMARY_KEYS.map(s => {
          const cfg = STATUS_CFG[s];
          const active = filter === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.summaryCard, { backgroundColor: cfg.bg }, active && { borderWidth: 2, borderColor: cfg.color }]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.summaryCount, { color: cfg.color }]}>{countFor(s)}</Text>
              <Text style={[styles.summaryLabel, { color: cfg.color }]}>{cfg.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Search + New button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search guest, booking ID, haven..."
            placeholderTextColor={Colors.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('CreateBooking')}>
          <Feather name="plus" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} Reservation{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Reservations</Text>
            <Text style={styles.emptySubtitle}>No {filter !== 'all' ? filter : ''} reservations found.</Text>
          </View>
        ) : (
          filtered.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              onApprove={handleApprove}
              onReject={handleReject}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onDetails={setDetailsBooking}
            />
          ))
        )}
      </ScrollView>

      {/* Details Bottom Sheet */}
      <Modal visible={detailsBooking !== null} transparent animationType="slide" onRequestClose={() => setDetailsBooking(null)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setDetailsBooking(null)} />
          <View style={styles.sheet}>
            {detailsBooking && (() => {
              const cfg = STATUS_CFG[detailsBooking.status];
              return (
                <>
                  <View style={styles.sheetHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetTitle}>Booking Details</Text>
                      <Text style={styles.sheetSub}>{detailsBooking.bookingId}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDetailsBooking(null)}>
                      <Feather name="x" size={22} color={Colors.gray[700]} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Status */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg, paddingHorizontal: 24, paddingVertical: 8 }]}>
                        <Text style={[styles.statusText, { color: cfg.color, fontSize: 14 }]}>{cfg.label}</Text>
                      </View>
                    </View>

                    {/* Guest Info */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Guest Information</Text>
                      {[
                        { label: 'Name',  value: detailsBooking.guestName  },
                        { label: 'Email', value: detailsBooking.guestEmail },
                        { label: 'Phone', value: detailsBooking.guestPhone },
                      ].map(row => (
                        <View key={row.label} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{row.label}</Text>
                          <Text style={styles.detailValue}>{row.value}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Booking Info */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Booking Information</Text>
                      {[
                        { label: 'Haven',      value: detailsBooking.havenName },
                        { label: 'Check-in',   value: detailsBooking.checkIn   },
                        { label: 'Check-out',  value: detailsBooking.checkOut  },
                        { label: 'Nights',     value: String(detailsBooking.nights) },
                        { label: 'Guests',     value: `${detailsBooking.adults}A · ${detailsBooking.children}C · ${detailsBooking.infants}I` },
                      ].map(row => (
                        <View key={row.label} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{row.label}</Text>
                          <Text style={styles.detailValue}>{row.value}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Payment */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Payment</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.detailValue}>₱{detailsBooking.amount.toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Balance</Text>
                        <Text style={[styles.detailValue, { color: detailsBooking.remainingBalance > 0 ? '#DC2626' : '#16A34A' }]}>
                          ₱{detailsBooking.remainingBalance.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                      {detailsBooking.status === 'pending' && (
                        <>
                          <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: '#DCFCE7', flex: 1 }]} onPress={() => { handleApprove(detailsBooking.id); setDetailsBooking(null); }}>
                            <Feather name="check" size={16} color="#16A34A" />
                            <Text style={[styles.modalActionText, { color: '#16A34A' }]}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: '#FEE2E2', flex: 1 }]} onPress={() => { handleReject(detailsBooking.id); setDetailsBooking(null); }}>
                            <Feather name="x" size={16} color="#DC2626" />
                            <Text style={[styles.modalActionText, { color: '#DC2626' }]}>Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {(detailsBooking.status === 'approved' || detailsBooking.status === 'confirmed') && (
                        <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: '#DBEAFE', flex: 1 }]} onPress={() => { handleCheckIn(detailsBooking.id); setDetailsBooking(null); }}>
                          <Feather name="log-in" size={16} color="#2563EB" />
                          <Text style={[styles.modalActionText, { color: '#2563EB' }]}>Check In Guest</Text>
                        </TouchableOpacity>
                      )}
                      {detailsBooking.status === 'checked-in' && (
                        <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: '#FEF3C7', flex: 1 }]} onPress={() => { handleCheckOut(detailsBooking.id); setDetailsBooking(null); }}>
                          <Feather name="log-out" size={16} color="#D97706" />
                          <Text style={[styles.modalActionText, { color: '#D97706' }]}>Check Out Guest</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ height: 20 }} />
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  // Summary
  summaryScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], maxHeight: 88 },
  summaryContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  summaryCard: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, alignItems: 'center', minWidth: 72, height: 68, justifyContent: 'center' },
  summaryCardSelected: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  summaryCount: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: Colors.white },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray[50], borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10, borderWidth: 1, borderColor: Colors.gray[100] },
  searchInput: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  newBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  // Count
  countRow: { paddingHorizontal: 20, paddingVertical: 8 },
  countText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  // Card
  card: { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary },
  guestName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  bookingMeta: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  datesRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray[50], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: 11, color: Colors.gray[500], fontWeight: '500' },
  dateValue: { fontSize: 13, fontWeight: '700', color: Colors.gray[900], marginTop: 2 },
  dateMid: { alignItems: 'center', paddingHorizontal: 8 },
  nightsText: { fontSize: 10, color: Colors.gray[400], marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, fontWeight: '600', color: Colors.gray[700] },
  amountText: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  payBadge: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  payText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  actionsRow: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100], flexWrap: 'wrap' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.brand.primarySoft },
  detailsBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[700] },
  emptySubtitle: { fontSize: 14, color: Colors.gray[500] },
  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '88%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  sheetSub: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  detailSection: { backgroundColor: Colors.gray[50], borderRadius: 12, padding: 14, marginBottom: 12 },
  detailSectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  detailLabel: { fontSize: 13, color: Colors.gray[600] },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900], flex: 1, textAlign: 'right' },
  modalActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  modalActionText: { fontSize: 14, fontWeight: '700' },
});
