import React, { useState, useRef } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Animated, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Card from '../../components/common/Card';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Bookings with check-in and check-out days (for February 2026)
const BOOKINGS = [
  { id: '1', guest: 'John Doe',    room: 'Haven 101', checkIn: 9,  checkOut: 11, checkInTime: '10:00 AM', checkOutTime: '12:00 PM', color: Colors.brand.primary },
  { id: '2', guest: 'Sarah Smith', room: 'Haven 205', checkIn: 14, checkOut: 18, checkInTime: '11:30 AM', checkOutTime: '11:00 AM', color: Colors.green[500] },
  { id: '3', guest: 'Mike Ross',   room: 'Haven 103', checkIn: 20, checkOut: 24, checkInTime: '02:00 PM', checkOutTime: '12:00 PM', color: Colors.blue[500] },
];

const TODAY = 19;

export default function BookingCalendarScreen() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [calendarCollapsed, setCalendarCollapsed] = useState(true);
  const rotateAnim = useRef(new Animated.Value(1)).current; // start collapsed (1 = rotated)

  const toggleCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCalendarCollapsed(prev => !prev);
    Animated.timing(rotateAnim, {
      toValue: calendarCollapsed ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectedBooking = BOOKINGS.find(b => b.id === selectedBookingId) ?? null;

  // Handle tapping a schedule item: expand calendar and highlight that booking's range
  const handleScheduleItemPress = (bookingId: string) => {
    const alreadySelected = selectedBookingId === bookingId;

    if (alreadySelected) {
      setSelectedBookingId(null);
    } else {
      setSelectedBookingId(bookingId);
      // Expand calendar if currently collapsed
      if (calendarCollapsed) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCalendarCollapsed(false);
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // Find booking for a day
  const getBookingForDay = (day: number) =>
    BOOKINGS.find(b => day >= b.checkIn && day <= b.checkOut) ?? null;

  const isCheckIn = (day: number) => BOOKINGS.some(b => b.checkIn === day);
  const isCheckOut = (day: number) => BOOKINGS.some(b => b.checkOut === day);
  const isInRange = (day: number) => BOOKINGS.some(b => day > b.checkIn && day < b.checkOut);

  // Whether this day belongs to the selected booking's range
  const isHighlightedDay = (day: number) => {
    if (!selectedBooking) return false;
    return day >= selectedBooking.checkIn && day <= selectedBooking.checkOut;
  };

  const CalendarDay = ({ day }: { day: number }) => {
    const booking = getBookingForDay(day);
    const checkIn = isCheckIn(day);
    const checkOut = isCheckOut(day);
    const inRange = isInRange(day);
    const isToday = day === TODAY;
    const highlighted = isHighlightedDay(day);

    // Dim days that belong to other bookings when one is selected
    const isDimmed = selectedBooking && booking && booking.id !== selectedBooking.id;

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          inRange && { backgroundColor: (booking?.color ?? Colors.brand.primary) + '18' },
          checkIn && styles.dayCellCheckIn,
          checkOut && styles.dayCellCheckOut,
          // Highlight the selected booking's range with stronger bg
          highlighted && inRange && { backgroundColor: (selectedBooking?.color ?? Colors.brand.primary) + '30' },
        ]}
        onPress={() => {
          if (booking) {
            setSelectedBookingId(prev => prev === booking.id ? null : booking.id);
          }
        }}
        activeOpacity={booking ? 0.75 : 1}
      >
        <View style={[
          styles.dayInner,
          checkIn && { backgroundColor: booking?.color ?? Colors.brand.primary, opacity: isDimmed ? 0.35 : 1 },
          checkOut && { backgroundColor: booking?.color ?? Colors.brand.primary, opacity: isDimmed ? 0.35 : 1 },
          isToday && !checkIn && !checkOut && styles.dayInnerToday,
          // Ring around selected booking's check-in / check-out
          highlighted && checkIn && { backgroundColor: selectedBooking?.color, opacity: 1 },
          highlighted && checkOut && { backgroundColor: selectedBooking?.color, opacity: 1 },
        ]}>
          <Text style={[
            styles.dayText,
            (checkIn || checkOut) && styles.dayTextEndpoint,
            isToday && !checkIn && !checkOut && styles.dayTextToday,
            inRange && !checkIn && !checkOut && { color: isDimmed ? Colors.gray[300] : booking?.color },
          ]}>
            {day}
          </Text>
        </View>
        {checkIn && (
          <View style={[styles.dayBadge, { backgroundColor: booking?.color, opacity: isDimmed ? 0.35 : 1 }]}>
            <Text style={styles.dayBadgeText}>IN</Text>
          </View>
        )}
        {checkOut && (
          <View style={[styles.dayBadge, styles.dayBadgeOut, { opacity: isDimmed ? 0.35 : 1 }]}>
            <Text style={styles.dayBadgeText}>OUT</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Range label shown below calendar for selected booking
  const RangeLabel = ({ booking }: { booking: typeof BOOKINGS[0] }) => {
    const nights = booking.checkOut - booking.checkIn;
    return (
      <View style={[styles.rangeLabel, { borderLeftColor: booking.color }]}>
        <View style={styles.rangeLabelTop}>
          <View style={[styles.rangeLabelDot, { backgroundColor: booking.color }]} />
          <Text style={styles.rangeLabelGuest}>{booking.guest}</Text>
          <Text style={styles.rangeLabelRoom}>{booking.room}</Text>
        </View>
        <View style={styles.rangeLabelDates}>
          <View style={styles.rangeLabelDateItem}>
            <MaterialCommunityIcons name="login-variant" size={13} color={Colors.green[500]} />
            <Text style={styles.rangeLabelDateText}>Feb {booking.checkIn}</Text>
          </View>
          <View style={styles.rangeLabelArrow}>
            <Feather name="arrow-right" size={13} color={Colors.gray[400]} />
            <Text style={styles.rangeLabelNights}>{nights}n</Text>
          </View>
          <View style={styles.rangeLabelDateItem}>
            <MaterialCommunityIcons name="logout-variant" size={13} color={Colors.red[500]} />
            <Text style={styles.rangeLabelDateText}>Feb {booking.checkOut}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Today's schedule: show check-in bookings whose checkIn === TODAY, and check-out === TODAY
  const todaySchedule = BOOKINGS.flatMap(b => {
    const items = [];
    if (b.checkIn === TODAY) {
      items.push({ bookingId: b.id, time: b.checkInTime, guest: b.guest, room: b.room, status: 'Check-in' as const, color: b.color });
    }
    if (b.checkOut === TODAY) {
      items.push({ bookingId: b.id, time: b.checkOutTime, guest: b.guest, room: b.room, status: 'Check-out' as const, color: b.color });
    }
    return items;
  }).sort((a, b) => {
    // Sort by time
    const toMins = (t: string) => {
      const [time, ampm] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMins(a.time) - toMins(b.time);
  });

  // Fallback: if no today schedule from bookings, use mock (remove in production)
  const MOCK_SCHEDULE = todaySchedule.length > 0 ? todaySchedule : [
    { bookingId: '1', time: '10:00 AM', guest: 'John Doe',    room: 'Haven 101', status: 'Check-in'  as const, color: Colors.brand.primary },
    { bookingId: '2', time: '11:30 AM', guest: 'Sarah Smith', room: 'Haven 205', status: 'Check-out' as const, color: Colors.green[500] },
    { bookingId: '3', time: '02:00 PM', guest: 'Mike Johnson', room: 'Haven 103', status: 'Check-in' as const, color: Colors.blue[500] },
  ];

  const BookingItem = ({ bookingId, time, guest, room, status, color }: any) => {
    const isSelected = selectedBookingId === bookingId;
    const isCheckInStatus = status === 'Check-in';
    return (
      <TouchableOpacity
        style={[
          styles.bookingItem,
          isSelected && { borderColor: color, borderWidth: 1.5 },
        ]}
        onPress={() => handleScheduleItemPress(bookingId)}
        activeOpacity={0.75}
      >
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingGuest}>{guest}</Text>
          <Text style={styles.bookingRoom}>{room}</Text>
        </View>
        {/* Status badge instead of just a dot */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: isCheckInStatus ? Colors.green[500] + '18' : Colors.blue[500] + '18' },
        ]}>
          <MaterialCommunityIcons
            name={isCheckInStatus ? 'login-variant' : 'logout-variant'}
            size={12}
            color={isCheckInStatus ? Colors.green[500] : Colors.blue[500]}
          />
          <Text style={[
            styles.statusBadgeText,
            { color: isCheckInStatus ? Colors.green[500] : Colors.blue[500] },
          ]}>
            {status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <Text style={styles.monthText}>February 2026</Text>
        <TouchableOpacity style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.calendarCard}>

          {/* Toggle Row */}
          <TouchableOpacity style={styles.calendarToggle} onPress={toggleCalendar} activeOpacity={0.7}>
            <View style={styles.calendarToggleLeft}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={Colors.brand.primary} />
              <Text style={styles.calendarToggleText}>
                {calendarCollapsed ? 'Show Calendar' : 'Hide Calendar'}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
              <Feather name="chevron-down" size={18} color={Colors.gray[500]} />
            </Animated.View>
          </TouchableOpacity>

          {/* Collapsed Summary */}
          {calendarCollapsed && (
            <View style={styles.collapsedSummary}>
              <View style={styles.summaryPill}>
                <MaterialCommunityIcons name="login-variant" size={13} color={Colors.green[500]} />
                <Text style={styles.summaryPillText}>5 Check-ins</Text>
              </View>
              <View style={styles.summaryPill}>
                <MaterialCommunityIcons name="logout-variant" size={13} color={Colors.blue[500]} />
                <Text style={styles.summaryPillText}>3 Check-outs</Text>
              </View>
              <View style={styles.summaryPill}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.yellow[500]} />
                <Text style={styles.summaryPillText}>2 Pending</Text>
              </View>
            </View>
          )}

          {/* Expanded Calendar */}
          {!calendarCollapsed && (
            <>
              <View style={styles.calendarDivider} />

              <View style={styles.weekDays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {[...Array(28)].map((_, i) => (
                  <CalendarDay key={i} day={i + 1} />
                ))}
              </View>

              {/* Selected booking range detail */}
              {selectedBooking && (
                <View style={styles.selectedRangeWrapper}>
                  <RangeLabel booking={selectedBooking} />
                </View>
              )}

              <View style={styles.inlineLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.green[500] }]} />
                  <Text style={styles.legendText}>Check-in</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.blue[500] }]} />
                  <Text style={styles.legendText}>Check-out</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.brand.primary }]} />
                  <Text style={styles.legendText}>Occupied</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Schedule */}
        <View style={styles.bookingsSection}>
          <View style={styles.bookingsHeader}>
            <Text style={styles.bookingsTitle}>Today's Schedule</Text>
            <Text style={styles.bookingsCount}>{MOCK_SCHEDULE.length} bookings</Text>
          </View>
          {MOCK_SCHEDULE.map((booking, index) => (
            <BookingItem key={index} {...booking} />
          ))}
          {selectedBookingId && (
            <TouchableOpacity style={styles.clearSelectionBtn} onPress={() => setSelectedBookingId(null)}>
              <Text style={styles.clearSelectionText}>Clear selection</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  monthText: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  todayButton: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, backgroundColor: Colors.brand.primarySoft,
  },
  todayButtonText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primaryDark },
  calendarCard: { margin: 20, marginBottom: 16, padding: 16 },
  calendarToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calendarToggleText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  calendarDivider: { height: 1, backgroundColor: Colors.gray[100], marginVertical: 12 },

  collapsedSummary: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  summaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.gray[50], paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.gray[100],
  },
  summaryPillText: { fontSize: 11, fontWeight: '600', color: Colors.gray[600] },

  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { flex: 1, fontSize: 11, fontWeight: '600', color: Colors.gray[400], textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },

  dayCell: {
    width: '14.28%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  dayCellCheckIn: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  dayCellCheckOut: { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  dayInner: {
    width: 30, height: 30, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  dayInnerToday: { borderWidth: 2, borderColor: Colors.brand.primary },
  dayText: { fontSize: 13, fontWeight: '500', color: Colors.gray[700] },
  dayTextEndpoint: { color: Colors.white, fontWeight: '700' },
  dayTextToday: { color: Colors.brand.primary, fontWeight: '700' },
  dayBadge: {
    backgroundColor: Colors.green[500],
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  dayBadgeOut: { backgroundColor: Colors.red[500] },
  dayBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },

  selectedRangeWrapper: { marginTop: 12 },
  rangeLabel: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    gap: 8,
  },
  rangeLabelTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeLabelDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  rangeLabelGuest: { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },
  rangeLabelRoom: { fontSize: 11, color: Colors.gray[500], marginLeft: 4 },
  rangeLabelDates: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeLabelDateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rangeLabelDateText: { fontSize: 12, fontWeight: '600', color: Colors.gray[700] },
  rangeLabelArrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rangeLabelNights: {
    fontSize: 11, fontWeight: '700', color: Colors.gray[500],
  },

  inlineLegend: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.gray[600] },

  bookingsSection: { paddingHorizontal: 20 },
  bookingsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  bookingsTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  bookingsCount: { fontSize: 13, color: Colors.gray[500] },
  bookingItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  timeBox: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: Colors.gray[50], borderRadius: 8, marginRight: 12,
  },
  timeText: { fontSize: 12, fontWeight: '700', color: Colors.gray[700] },
  bookingInfo: { flex: 1 },
  bookingGuest: { fontSize: 14, fontWeight: '600', color: Colors.gray[900] },
  bookingRoom: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  clearSelectionBtn: {
    alignSelf: 'center', marginTop: 4, paddingVertical: 8, paddingHorizontal: 16,
  },
  clearSelectionText: { fontSize: 12, color: Colors.gray[400], fontWeight: '600' },
});