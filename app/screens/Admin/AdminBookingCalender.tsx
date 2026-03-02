import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import { useNavigation } from '@react-navigation/native';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MOCK_BOOKINGS = [
  {
    id: 'B001', title: 'Archie Break', guest: 'Archie Santos',
    start: 1, end: 7, color: '#22C55E',
    status: 'Approved', statusColor: '#22C55E', statusBg: '#F0FDF4',
    nights: 6, guests: 2, amount: '₱12,400',
  },
  {
    id: 'B002', title: 'Reservation', guest: 'Maria Reyes',
    start: 26, end: 28, color: '#3B82F6',
    status: 'Checked-in', statusColor: '#3B82F6', statusBg: '#EFF6FF',
    nights: 2, guests: 3, amount: '₱4,800',
  },
  {
    id: 'B003', title: 'Weekend Stay', guest: 'Juan dela Cruz',
    start: 10, end: 12, color: '#FBBF24',
    status: 'Pending', statusColor: '#D97706', statusBg: '#FFFBEB',
    nights: 2, guests: 1, amount: '₱3,200',
  },
  {
    id: 'B004', title: 'Family Vacation', guest: 'Rosa Gomez',
    start: 14, end: 18, color: '#8B5CF6',
    status: 'Checked-out', statusColor: '#8B5CF6', statusBg: '#F5F3FF',
    nights: 4, guests: 5, amount: '₱9,600',
  },
  {
    id: 'B005', title: 'Solo Trip', guest: 'Ben Torres',
    start: 20, end: 21, color: '#EF4444',
    status: 'Declined', statusColor: '#EF4444', statusBg: '#FEF2F2',
    nights: 1, guests: 1, amount: '₱1,600',
  },
];
const PROPERTIES = [
  'Haven 8 - Tower D - Floor 25',
  'Haven 3 - Tower A - Floor 9',
  'Haven 1 - Tower C - Floor 18',
];

const STATUS_FILTERS = [
  { key: 'All', color: Colors.brand.primary, bg: Colors.brand.primarySoft },
  { key: 'Pending', color: '#D97706', bg: '#FFFBEB' },
  { key: 'Approved', color: '#22C55E', bg: '#F0FDF4' },
  { key: 'Checked-in', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'Checked-out', color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'Declined', color: '#EF4444', bg: '#FEF2F2' },
];

function getWeeksForMonth(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let current = 1 - firstDay;
  while (current <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current >= 1 && current <= daysInMonth ? current : null);
      current++;
    }
    weeks.push(week);
  }
  return weeks;
}

export default function AdminBookingCalender() {
  const navigation = useNavigation<any>();
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [propertyOpen, setPropertyOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState(PROPERTIES[0]);
  const [legendVisible, setLegendVisible] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const propertyAnim = React.useRef(new Animated.Value(0)).current;
  const legendScaleAnim = React.useRef(new Animated.Value(0)).current;
  const legendOpacityAnim = React.useRef(new Animated.Value(0)).current;
  const cardAnims = React.useRef(MOCK_BOOKINGS.map(() => new Animated.Value(0))).current;
  const [activeFilter, setActiveFilter] = React.useState('All');

  const filteredBookings = React.useMemo(() =>
    activeFilter === 'All'
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter(b => b.status === activeFilter),
    [activeFilter]
  );

  const countForFilter = (key: string) =>
    key === 'All' ? MOCK_BOOKINGS.length : MOCK_BOOKINGS.filter(b => b.status === key).length;

  const formatDate = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const weeks = React.useMemo(
    () => getWeeksForMonth(currentDate.getFullYear(), currentDate.getMonth()),
    [monthKey]
  );

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    cardAnims.forEach(a => a.setValue(0));
    Animated.stagger(90, cardAnims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 140, friction: 12 })
    )).start();
  }, [monthKey]);

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const toggleProperty = () => {
    const next = !propertyOpen;
    setPropertyOpen(next);
    Animated.timing(propertyAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  };

  const toggleLegend = () => {
    if (!legendVisible) {
      setLegendVisible(true);
      Animated.parallel([
        Animated.spring(legendScaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }),
        Animated.timing(legendOpacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(legendScaleAnim, { toValue: 0, useNativeDriver: true, tension: 200, friction: 14 }),
        Animated.timing(legendOpacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => setLegendVisible(false));
    }
  };

  const selectFilter = (key: string) => {
    setActiveFilter(key);
    cardAnims.forEach(a => a.setValue(0));
    Animated.stagger(70, cardAnims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 160, friction: 13 })
    )).start();
  };

  const propertyHeight = propertyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 148] });

  const isToday = (day: number | null) =>
    day !== null &&
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        {/* Simple Header - No AdminTopBar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Booking Calendar</Text>
            <Text style={styles.headerSubtitle}>Manage reservations</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="user" size={20} color={Colors.gray[700]} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Property Picker */}
          <View style={styles.propertyCard}>
            <Text style={styles.propertyLabel}>Selected Property</Text>
            <TouchableOpacity style={styles.propertyRow} onPress={toggleProperty}>
              <MaterialCommunityIcons name="office-building" size={18} color={Colors.brand.primary} />
              <Text style={styles.propertyValue} numberOfLines={1}>{selectedProperty}</Text>
              <Feather name={propertyOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.gray[500]} />
            </TouchableOpacity>
            <Animated.View style={[styles.propertyDropdown, { height: propertyHeight, opacity: propertyAnim }]}>
              {PROPERTIES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.propertyOption, item === selectedProperty && styles.propertyOptionActive]}
                  onPress={() => { setSelectedProperty(item); toggleProperty(); }}
                >
                  <Text style={[styles.propertyOptionText, item === selectedProperty && { color: Colors.brand.primary }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>

          {/* Month Navigation + View toggle */}
          <View style={styles.controlsRow}>
            <View style={styles.monthNavRow}>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(-1)}>
                  <Feather name="chevron-left" size={18} color={Colors.gray[700]} />
                </TouchableOpacity>
                <Text style={styles.monthText}>
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity style={styles.monthButton} onPress={() => changeMonth(1)}>
                  <Feather name="chevron-right" size={18} color={Colors.gray[700]} />
                </TouchableOpacity>
              </View>

              {/* Info icon + popover */}
              <View style={styles.infoWrapper}>
                <TouchableOpacity style={styles.infoButton} onPress={toggleLegend} activeOpacity={0.7}>
                  <Feather name="info" size={17} color={legendVisible ? Colors.brand.primary : Colors.gray[400]} />
                </TouchableOpacity>

                {legendVisible && (
                  <Animated.View style={[
                    styles.legendPopover,
                    {
                      opacity: legendOpacityAnim,
                      transform: [
                        { scale: legendScaleAnim },
                        { translateY: legendScaleAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
                      ],
                    },
                  ]}>
                    <Text style={styles.legendPopoverTitle}>Booking Status</Text>
                    {[
                      { color: '#FBBF24', label: 'Pending' },
                      { color: '#22C55E', label: 'Approved' },
                      { color: '#3B82F6', label: 'Checked-in' },
                      { color: '#8B5CF6', label: 'Checked-out' },
                      { color: '#EF4444', label: 'Declined' },
                    ].map(({ color, label }) => (
                      <View key={label} style={styles.legendPopoverItem}>
                        <View style={[styles.legendPopoverDot, { backgroundColor: color }]} />
                        <Text style={styles.legendPopoverText}>{label}</Text>
                      </View>
                    ))}
                    {/* Caret pointing up-right */}
                    <View style={styles.popoverCaret} />
                  </Animated.View>
                )}
              </View>
            </View>
            <View style={styles.segmented}>
              {['Month', 'Week', 'Day'].map(v => (
                <View key={v} style={v === 'Month' ? styles.segmentActive : styles.segment}>
                  <Text style={v === 'Month' ? styles.segmentActiveText : styles.segmentText}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Calendar Grid */}
          <Animated.View style={[styles.calendarCard, {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }]}>
            {/* Day headers */}
            <View style={styles.weekHeader}>
              {WEEK_DAYS.map(d => (
                <Text key={d} style={styles.weekHeaderText}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, rowIdx) => {
              const firstDayInWeek = week.find(d => d !== null);
              const lastDayInWeek = [...week].reverse().find(d => d !== null);

              return (
                <View key={rowIdx} style={styles.weekRow}>
                  {/* Booking bars (rendered behind day cells) */}
                  {MOCK_BOOKINGS.map((booking, bIdx) => {
                    if (!firstDayInWeek || !lastDayInWeek) return null;
                    if (booking.end < firstDayInWeek || booking.start > lastDayInWeek) return null;
                    const start = Math.max(booking.start, firstDayInWeek);
                    const end = Math.min(booking.end, lastDayInWeek);
                    const startCol = week.indexOf(start);
                    const endCol = week.indexOf(end);
                    if (startCol < 0 || endCol < 0) return null;
                    const leftPct = (startCol / 7) * 100;
                    const widthPct = ((endCol - startCol + 1) / 7) * 100;
                    return (
                      <View
                        key={bIdx}
                        style={[
                          styles.bookingBar,
                          { left: `${leftPct}%` as any, width: `${widthPct}%` as any, backgroundColor: booking.color },
                        ]}
                      >
                        {booking.title ? <Text style={styles.bookingLabel} numberOfLines={1}>{booking.title}</Text> : null}
                      </View>
                    );
                  })}

                  {/* Day cells */}
                  {week.map((day, colIdx) => (
                    <View key={colIdx} style={styles.dayCell}>
                      {day !== null && (
                        <View style={[styles.dayPill, isToday(day) && styles.todayPill]}>
                          <Text style={[styles.dayText, isToday(day) && styles.todayText]}>{day}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </Animated.View>

          {/* Reservation Details */}
          <View style={styles.reservationSection}>
            {/* Header row */}
            <View style={styles.reservationHeader}>
              <Text style={styles.reservationTitle}>Reservations</Text>
              <View style={styles.reservationBadge}>
                <Text style={styles.reservationBadgeText}>{filteredBookings.length}</Text>
              </View>
            </View>

            {/* Status filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              {STATUS_FILTERS.map(filter => {
                const isActive = activeFilter === filter.key;
                const count = countForFilter(filter.key);
                return (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => selectFilter(filter.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.filterPill,
                      isActive
                        ? { backgroundColor: filter.color, borderColor: filter.color }
                        : { backgroundColor: Colors.white, borderColor: Colors.gray[200] },
                    ]}
                  >
                    {!isActive && (
                      <View style={[styles.filterDot, { backgroundColor: filter.color }]} />
                    )}
                    <Text style={[
                      styles.filterPillText,
                      { color: isActive ? Colors.white : Colors.gray[600] },
                    ]}>
                      {filter.key}
                    </Text>
                    {count > 0 && (
                      <View style={[
                        styles.filterCount,
                        { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : filter.bg },
                      ]}>
                        <Text style={[
                          styles.filterCountText,
                          { color: isActive ? Colors.white : filter.color },
                        ]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Empty state */}
            {filteredBookings.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={32} color={Colors.gray[300]} />
                <Text style={styles.emptyStateText}>No {activeFilter} reservations</Text>
              </View>
            )}

            {/* Reservation cards */}
            {filteredBookings.map((booking, idx) => (
              <Animated.View
                key={booking.id}
                style={[
                  styles.reservationCard,
                  {
                    opacity: cardAnims[idx],
                    transform: [{
                      translateY: cardAnims[idx].interpolate({
                        inputRange: [0, 1], outputRange: [24, 0],
                      }),
                    }],
                  },
                ]}
              >
                {/* Color accent bar */}
                <View style={[styles.reservationAccent, { backgroundColor: booking.color }]} />

                <View style={styles.reservationCardInner}>
                  {/* Top row: guest + status */}
                  <View style={styles.reservationCardTop}>
                    <View style={styles.guestAvatarWrap}>
                      <Text style={styles.guestAvatarText}>
                        {booking.guest.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guestName}>{booking.guest}</Text>
                      <Text style={styles.bookingId}>#{booking.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: booking.statusBg }]}>
                      <View style={[styles.statusDot, { backgroundColor: booking.statusColor }]} />
                      <Text style={[styles.statusText, { color: booking.statusColor }]}>{booking.status}</Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.reservationDivider} />

                  {/* Date range */}
                  <View style={styles.dateRangeRow}>
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateBlockLabel}>CHECK-IN</Text>
                      <Text style={styles.dateBlockValue}>{formatDate(booking.start)}</Text>
                    </View>
                    <View style={styles.dateArrowWrap}>
                      <View style={[styles.dateArrowLine, { backgroundColor: booking.color }]} />
                      <Feather name="arrow-right" size={12} color={booking.color} />
                    </View>
                    <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
                      <Text style={styles.dateBlockLabel}>CHECK-OUT</Text>
                      <Text style={styles.dateBlockValue}>{formatDate(booking.end)}</Text>
                    </View>
                  </View>

                  {/* Bottom row: nights, guests, amount */}
                  <View style={styles.reservationMeta}>
                    <View style={styles.metaChip}>
                      <Feather name="moon" size={11} color={Colors.gray[500]} />
                      <Text style={styles.metaChipText}>{booking.nights} nights</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Feather name="users" size={11} color={Colors.gray[500]} />
                      <Text style={styles.metaChipText}>{booking.guests} guests</Text>
                    </View>
                    <View style={[styles.metaChip, styles.metaChipAmount]}>
                      <Text style={styles.metaChipAmountText}>{booking.amount}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  screen: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16, paddingBottom: 60 },
  propertyCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    marginBottom: 16,
  },
  propertyLabel: { fontSize: 11, color: Colors.gray[500], marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  propertyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  propertyValue: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.gray[900] },
  propertyDropdown: { overflow: 'hidden', marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray[100] },
  propertyOption: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  propertyOptionActive: { backgroundColor: Colors.brand.primarySoft },
  propertyOptionText: { fontSize: 13, color: Colors.gray[700], fontWeight: '600' },
  controlsRow: { gap: 12, marginBottom: 16 },
  monthNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, flex: 1 },
  monthButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], minWidth: 180, textAlign: 'center' },
  infoWrapper: { position: 'relative', marginLeft: 8 },
  infoButton: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.gray[100],
    alignItems: 'center', justifyContent: 'center',
  },
  legendPopover: {
    position: 'absolute', top: 42, right: 0,
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    minWidth: 170, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 16,
    borderWidth: 1, borderColor: Colors.gray[100],
    transformOrigin: 'top right',
  },
  popoverCaret: {
    position: 'absolute', top: -7, right: 10,
    width: 14, height: 14, backgroundColor: Colors.white,
    borderTopWidth: 1, borderLeftWidth: 1, borderColor: Colors.gray[100],
    transform: [{ rotate: '45deg' }],
  },
  legendPopoverTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.gray[400],
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  legendPopoverItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  legendPopoverDot: { width: 10, height: 10, borderRadius: 5 },
  legendPopoverText: { fontSize: 13, fontWeight: '600', color: Colors.gray[700] },
  segmented: { flexDirection: 'row', backgroundColor: Colors.gray[100], borderRadius: 14, padding: 4 },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  segmentText: { fontSize: 12, color: Colors.gray[600], fontWeight: '600' },
  segmentActive: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10, backgroundColor: Colors.brand.primary },
  segmentActiveText: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  calendarCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: Colors.gray[100] },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', fontSize: 11, color: Colors.gray[500], fontWeight: '600' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 2, position: 'relative', minHeight: 44 },
  dayCell: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  dayPill: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 12, color: Colors.gray[900], fontWeight: '500' },
  todayPill: { backgroundColor: Colors.brand.primary },
  todayText: { color: Colors.white, fontWeight: '700' },
  bookingBar: {
    position: 'absolute', top: 8, height: 20, borderRadius: 10,
    justifyContent: 'center', paddingLeft: 8, zIndex: 1,
  },
  bookingLabel: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  reservationSection: { marginTop: 20 },
  reservationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  reservationTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray[900] },
  reservationBadge: {
    backgroundColor: Colors.brand.primary, borderRadius: 20, minWidth: 22,
    height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  reservationBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  filterScroll: { marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5,
  },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterPillText: { fontSize: 12, fontWeight: '700' },
  filterCount: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  filterCountText: { fontSize: 10, fontWeight: '800' },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, gap: 10,
  },
  emptyStateText: { fontSize: 14, color: Colors.gray[400], fontWeight: '600' },
  reservationCard: {
    backgroundColor: Colors.white, borderRadius: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.gray[100], flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  reservationAccent: { width: 5, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  reservationCardInner: { flex: 1, padding: 14 },
  reservationCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  guestAvatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brand.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  guestAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.brand.primary },
  guestName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  bookingId: { fontSize: 11, color: Colors.gray[400], fontWeight: '600', marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  reservationDivider: { height: 1, backgroundColor: Colors.gray[50], marginBottom: 12 },
  dateRangeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateBlock: { flex: 1 },
  dateBlockLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  dateBlockValue: { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  dateArrowWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  dateArrowLine: { width: 20, height: 1.5, marginRight: 2 },
  reservationMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.gray[50], borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  metaChipText: { fontSize: 11, fontWeight: '600', color: Colors.gray[600] },
  metaChipAmount: { backgroundColor: Colors.brand.primarySoft, marginLeft: 'auto' as any },
  metaChipAmountText: { fontSize: 12, fontWeight: '800', color: Colors.brand.primary },
});