import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';


type BookingStatus = 'all' | 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';

interface Booking {
  id: string;
  guestName: string;
  guestAvatar?: string;
  havenName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'partial';
}

// Mock data
const mockBookings: Booking[] = [
  {
    id: '1',
    guestName: 'John Doe',
    havenName: 'Haven 1',
    checkIn: 'Feb 9, 2026',
    checkOut: 'Feb 11, 2026',
    nights: 2,
    guests: 2,
    amount: 12500,
    status: 'confirmed',
    paymentStatus: 'paid',
  },
  {
    id: '2',
    guestName: 'Jane Smith',
    havenName: 'Haven 2',
    checkIn: 'Feb 10, 2026',
    checkOut: 'Feb 13, 2026',
    nights: 3,
    guests: 4,
    amount: 18750,
    status: 'pending',
    paymentStatus: 'pending',
  },
  {
    id: '3',
    guestName: 'Mike Johnson',
    havenName: 'Haven 3',
    checkIn: 'Feb 8, 2026',
    checkOut: 'Feb 10, 2026',
    nights: 2,
    guests: 3,
    amount: 15000,
    status: 'checked-in',
    paymentStatus: 'paid',
  },
  {
    id: '4',
    guestName: 'Sarah Williams',
    havenName: 'Haven 1',
    checkIn: 'Feb 5, 2026',
    checkOut: 'Feb 8, 2026',
    nights: 3,
    guests: 2,
    amount: 18000,
    status: 'checked-out',
    paymentStatus: 'paid',
  },
  {
    id: '5',
    guestName: 'David Brown',
    havenName: 'Haven 4',
    checkIn: 'Feb 12, 2026',
    checkOut: 'Feb 14, 2026',
    nights: 2,
    guests: 2,
    amount: 11000,
    status: 'cancelled',
    paymentStatus: 'pending',
  },
];

export default function AdminReservationsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusTabs: { key: BookingStatus; label: string; icon: string; count: number }[] = [
    { key: 'all', label: 'All', icon: 'list', count: 12 },
    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle', count: 5 },
    { key: 'pending', label: 'Pending', icon: 'clock', count: 2 },
    { key: 'checked-in', label: 'Checked In', icon: 'log-in', count: 3 },
    { key: 'checked-out', label: 'Checked Out', icon: 'log-out', count: 1 },
    { key: 'cancelled', label: 'Cancelled', icon: 'x-circle', count: 1 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.blue[500];
      case 'pending':
        return Colors.yellow[500];
      case 'checked-in':
        return Colors.green[500];
      case 'checked-out':
        return Colors.gray[500];
      case 'cancelled':
        return Colors.red[500];
      default:
        return Colors.gray[500];
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return Colors.green[500];
      case 'partial':
        return Colors.yellow[500];
      case 'pending':
        return Colors.red[500];
      default:
        return Colors.gray[500];
    }
  };

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.havenName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <TouchableOpacity style={styles.bookingCard} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.guestInfo}>
          <View style={styles.guestAvatar}>
            <Text style={styles.guestAvatarText}>{booking.guestName[0]}</Text>
          </View>
          <View style={styles.guestDetails}>
            <Text style={styles.guestName}>{booking.guestName}</Text>
            <Text style={styles.havenName}>{booking.havenName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.replace('-', ' ')}
          </Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateItem}>
          <Feather name="log-in" size={14} color={Colors.gray[400]} />
          <Text style={styles.dateLabel}>Check-in</Text>
          <Text style={styles.dateValue}>{booking.checkIn}</Text>
        </View>
        <View style={styles.dateDivider}>
          <Feather name="arrow-right" size={16} color={Colors.gray[300]} />
          <Text style={styles.nightsText}>{booking.nights} nights</Text>
        </View>
        <View style={styles.dateItem}>
          <Feather name="log-out" size={14} color={Colors.gray[400]} />
          <Text style={styles.dateLabel}>Check-out</Text>
          <Text style={styles.dateValue}>{booking.checkOut}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.detailText}>{booking.guests} Guests</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="currency-php" size={16} color={Colors.gray[500]} />
          <Text style={styles.detailText}>{booking.amount.toLocaleString()}</Text>
        </View>
        <View style={[styles.paymentBadge, { backgroundColor: `${getPaymentStatusColor(booking.paymentStatus)}15` }]}>
          <Text style={[styles.paymentText, { color: getPaymentStatusColor(booking.paymentStatus) }]}>
            {booking.paymentStatus}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="eye" size={16} color={Colors.brand.primary} />
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="message-circle" size={16} color={Colors.blue[500]} />
          <Text style={[styles.actionBtnText, { color: Colors.blue[500] }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="more-vertical" size={16} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setSidebarVisible(true)}>
          <Feather name="menu" size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservations</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Feather name="bell" size={22} color={Colors.gray[700]} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by guest or haven..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedStatus === tab.key && styles.tabActive]}
            onPress={() => setSelectedStatus(tab.key)}
            activeOpacity={0.7}
          >
            <Feather
              name={tab.icon as any}
              size={16}
              color={selectedStatus === tab.key ? Colors.white : Colors.gray[600]}
            />
            <Text style={[styles.tabText, selectedStatus === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.tabCount,
                selectedStatus === tab.key && styles.tabCountActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  selectedStatus === tab.key && styles.tabCountTextActive,
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
        <View style={styles.bookingsHeader}>
          <Text style={styles.bookingsCount}>
            {filteredBookings.length} Reservation{filteredBookings.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Text style={styles.sortBtnText}>Sort by Date</Text>
            <Feather name="chevron-down" size={16} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>

        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red[500],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray[900],
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.gray[50],
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.brand.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray[600],
  },
  tabCountTextActive: {
    color: Colors.white,
  },
  bookingsList: {
    flex: 1,
  },
  bookingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bookingsCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  bookingCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.brand.primary,
  },
  guestDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 2,
  },
  havenName: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  dateDivider: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  nightsText: {
    fontSize: 10,
    color: Colors.gray[500],
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  paymentBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brand.primary,
  },
});