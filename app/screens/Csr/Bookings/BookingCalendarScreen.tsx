import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Animated, LayoutAnimation, Platform, UIManager, RefreshControl, Modal,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Card from '../../../components/common/Card';
import { bookingsService } from '../../../../services/bookingsService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BOOKING_COLORS = [Colors.brand.primary, Colors.green[500], Colors.blue[500], Colors.yellow[500], Colors.red[500]];
const NOW = new Date();
const TODAY = NOW.getDate();

type CalendarBooking = {
  id: string; guest: string; room: string;
  checkIn: number; checkOut: number;
  checkInTime: string; checkOutTime: string; color: string;
};

function mapApiToCalendar(raw: any, index: number): CalendarBooking {
  const checkInDate = new Date(raw.check_in_date);
  const checkOutDate = new Date(raw.check_out_date);
  const now = new Date();
  // Only use day-of-month for current month
  const sameMonth = (d: Date) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return {
    id: raw.id,
    guest: `${raw.guest_first_name ?? ''} ${raw.guest_last_name ?? ''}`.trim(),
    room: raw.room_name ?? '',
    checkIn: sameMonth(checkInDate) ? checkInDate.getDate() : (checkInDate < now ? 1 : 31),
    checkOut: sameMonth(checkOutDate) ? checkOutDate.getDate() : (checkOutDate > now ? 31 : 1),
    checkInTime: raw.check_in_time ? raw.check_in_time.slice(0, 5) : '',
    checkOutTime: raw.check_out_time ? raw.check_out_time.slice(0, 5) : '',
    color: BOOKING_COLORS[index % BOOKING_COLORS.length],
  };
}

export default function BookingCalendarScreen() {
  const [BOOKINGS, setBOOKINGS] = useState<CalendarBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [calendarCollapsed, setCalendarCollapsed] = useState(true);
  const [viewDate, setViewDate] = useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Check-in' | 'Check-out'>('All');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const rotateAnim = useRef(new Animated.Value(1)).current; // start collapsed (1 = rotated)

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();
  const MONTH_LONG = viewDate.toLocaleString('en-US', { month: 'long' });
  const MONTH_SHORT = viewDate.toLocaleString('en-US', { month: 'short' });
  const DAYS_IN_MONTH = new Date(viewYear, viewMonth + 1, 0).getDate();
  const isCurrentMonth = viewMonth === NOW.getMonth() && viewYear === NOW.getFullYear();

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));
  const goToToday = () => {
    setViewDate(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
    setViewMode('Month');
  };

  const switchViewMode = (mode: 'Month' | 'Week' | 'Day') => {
    setViewMode(mode);
    if (mode !== 'Month' && calendarCollapsed) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCalendarCollapsed(false);
      Animated.timing(rotateAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  };

  const getViewDays = (): number[] => {
    if (viewMode === 'Month') return Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
    const refDay = isCurrentMonth ? TODAY : 1;
    const refDate = new Date(viewYear, viewMonth, refDay);
    if (viewMode === 'Week') {
      const startDay = refDay - refDate.getDay();
      return Array.from({ length: 7 }, (_, i) => startDay + i);
    }
    // Day
    return [refDay];
  };

  const viewDays = getViewDays();

  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsService.getBookings();
      setBOOKINGS(data.map(mapApiToCalendar));
    } catch (_) {}
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

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
    const isToday = isCurrentMonth && day === TODAY;
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
            <Text style={styles.rangeLabelDateText}>{MONTH_SHORT} {booking.checkIn}</Text>
          </View>
          <View style={styles.rangeLabelArrow}>
            <Feather name="arrow-right" size={13} color={Colors.gray[400]} />
            <Text style={styles.rangeLabelNights}>{nights}n</Text>
          </View>
          <View style={styles.rangeLabelDateItem}>
            <MaterialCommunityIcons name="logout-variant" size={13} color={Colors.red[500]} />
            <Text style={styles.rangeLabelDateText}>{MONTH_SHORT} {booking.checkOut}</Text>
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

  const MOCK_SCHEDULE = todaySchedule;
  const filteredSchedule = statusFilter === 'All'
    ? MOCK_SCHEDULE
    : MOCK_SCHEDULE.filter(item => item.status === statusFilter);

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
    <View style={styles.container}>
      {/* ── Nav Bar ─────────────────────────────────────────── */}
      <View style={styles.calendarNav}>
        {/* Row 1: < Today > … March 2026 */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
            <Feather name="chevron-left" size={14} color={Colors.gray[500]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
            <Feather name="chevron-right" size={14} color={Colors.gray[500]} />
          </TouchableOpacity>
          <Text style={styles.monthText} numberOfLines={1}>{MONTH_LONG} {viewYear}</Text>
        </View>

        {/* Row 2: Month Week Day | filter | All Statuses */}
        <View style={styles.navRowControls}>
          <View style={styles.viewSegment}>
            {(['Month', 'Week', 'Day'] as const).map(mode => (
              <TouchableOpacity key={mode} style={[styles.segmentBtn, viewMode === mode && styles.segmentBtnActive]} onPress={() => switchViewMode(mode)}>
                <Text style={[styles.segmentText, viewMode === mode && styles.segmentTextActive]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Feather name="filter" size={13} color={Colors.gray[400]} />
          <TouchableOpacity style={styles.statusPill} onPress={() => setShowStatusModal(true)}>
            <Text style={styles.statusPillText}>{statusFilter === 'All' ? 'All Statuses' : statusFilter}</Text>
            <Feather name="chevron-down" size={11} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}>
        <Card style={styles.calendarCard}>

          {/* ── Toggle Row ──────────────────────────────────── */}
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
                <Text style={styles.summaryPillText}>{BOOKINGS.filter(b => b.checkIn >= 1 && b.checkIn <= DAYS_IN_MONTH).length} Check-ins</Text>
              </View>
              <View style={styles.summaryPill}>
                <MaterialCommunityIcons name="logout-variant" size={13} color={Colors.blue[500]} />
                <Text style={styles.summaryPillText}>{BOOKINGS.filter(b => b.checkOut >= 1 && b.checkOut <= DAYS_IN_MONTH).length} Check-outs</Text>
              </View>
              <View style={styles.summaryPill}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.yellow[500]} />
                <Text style={styles.summaryPillText}>{MOCK_SCHEDULE.length} Today</Text>
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
                {viewDays.map((day, i) => (
                  <React.Fragment key={i}>
                    {day >= 1 && day <= DAYS_IN_MONTH
                      ? CalendarDay({ day })
                      : <View key={i} style={styles.dayCell} />}
                  </React.Fragment>
                ))}
              </View>

              {/* Selected booking range detail */}
              {selectedBooking && (
                <View style={styles.selectedRangeWrapper}>
                  {RangeLabel({ booking: selectedBooking })}
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
            <Text style={styles.bookingsCount}>{filteredSchedule.length} bookings</Text>
          </View>
          {filteredSchedule.map((booking, index) => (
            <React.Fragment key={index}>
              {BookingItem(booking)}
            </React.Fragment>
          ))}
          {selectedBookingId && (
            <TouchableOpacity style={styles.clearSelectionBtn} onPress={() => setSelectedBookingId(null)}>
              <Text style={styles.clearSelectionText}>Clear selection</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Status Filter Modal ─────────────────────────────── */}
      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={() => setShowStatusModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowStatusModal(false)}>
          <View style={styles.statusModal}>
            <Text style={styles.statusModalTitle}>Filter by Status</Text>
            {(['All', 'Check-in', 'Check-out'] as const).map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.statusOption, statusFilter === option && styles.statusOptionActive]}
                onPress={() => { setStatusFilter(option); setShowStatusModal(false); }}
              >
                <View style={[styles.statusOptionDot, {
                  backgroundColor: option === 'All' ? Colors.brand.primary : option === 'Check-in' ? Colors.green[500] : Colors.blue[500],
                }]} />
                <Text style={[styles.statusOptionText, statusFilter === option && styles.statusOptionTextActive]}>
                  {option === 'All' ? 'All Statuses' : option}
                </Text>
                {statusFilter === option && <Feather name="check" size={16} color={Colors.brand.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },

  // Nav bar
  calendarNav: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, gap: 6,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  navRowControls: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  monthText: { fontSize: 14, fontWeight: '700', color: Colors.gray[900], flex: 1 },
  navBtn: {
    width: 30, height: 30, borderRadius: 7,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 7, backgroundColor: Colors.brand.primary,
  },
  todayButtonText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  viewSegment: {
    flexDirection: 'row', backgroundColor: Colors.gray[100], borderRadius: 7, padding: 2,
  },
  segmentBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 },
  segmentBtnActive: { backgroundColor: Colors.white },
  segmentText: { fontSize: 11, fontWeight: '600', color: Colors.gray[400] },
  segmentTextActive: { color: Colors.gray[800], fontWeight: '700' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.gray[100], borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  statusPillText: { fontSize: 11, fontWeight: '600', color: Colors.gray[600] },
  calendarCard: { marginHorizontal: 12, marginTop: 8, marginBottom: 12, padding: 12 },
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

  weekDays: { flexDirection: 'row', marginBottom: 4 },
  weekDayText: { flex: 1, fontSize: 10, fontWeight: '600', color: Colors.gray[400], textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },

  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 1,
  },
  dayCellCheckIn: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  dayCellCheckOut: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  dayInner: {
    width: 26, height: 26, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  dayInnerToday: { borderWidth: 2, borderColor: Colors.brand.primary },
  dayText: { fontSize: 11, fontWeight: '500', color: Colors.gray[700] },
  dayTextEndpoint: { color: Colors.white, fontWeight: '700' },
  dayTextToday: { color: Colors.brand.primary, fontWeight: '700' },
  dayBadge: {
    backgroundColor: Colors.green[500],
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 3,
    minWidth: 18,
    alignItems: 'center',
  },
  dayBadgeOut: { backgroundColor: Colors.red[500] },
  dayBadgeText: { fontSize: 6, fontWeight: '800', color: Colors.white, letterSpacing: 0.2 },

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

  // Status filter modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 32,
  },
  statusModal: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 20, gap: 4,
  },
  statusModalTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray[800], marginBottom: 8 },
  statusOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusOptionActive: { backgroundColor: Colors.brand.primarySoft },
  statusOptionDot: { width: 10, height: 10, borderRadius: 5 },
  statusOptionText: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.gray[700] },
  statusOptionTextActive: { fontWeight: '700', color: Colors.brand.primaryDark },
});