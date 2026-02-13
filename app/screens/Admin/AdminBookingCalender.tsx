import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../../constants/Styles';
import AdminTopBar from '../../components/AdminTopBar';
import { useTheme } from '../../../hooks/useTheme';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const bookings = [
  { title: 'Archie Break', start: 1, end: 7, status: 'Approved' },
  { title: 'Awaiting Payment', start: 26, end: 28, status: 'Pending' },
];

function getWeeksForMonth(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let currentDay = 1 - firstDay;
  while (currentDay <= daysInMonth) {
    const week: Array<number | null> = [];
    for (let i = 0; i < 7; i += 1) {
      if (currentDay < 1 || currentDay > daysInMonth) {
        week.push(null);
      } else {
        week.push(currentDay);
      }
      currentDay += 1;
    }
    weeks.push(week);
  }
  return weeks;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminBookingCalender() {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const theme = {
    page: isDark ? '#0F172A' : Colors.white,
    surface: isDark ? '#111827' : Colors.white,
    surfaceAlt: isDark ? '#1F2937' : Colors.gray[100],
    border: isDark ? '#374151' : Colors.gray[100],
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#9CA3AF' : Colors.gray[500],
  };

  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 1, 1));
  const [legendOpen, setLegendOpen] = React.useState(true);
  const [propertyOpen, setPropertyOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<'All Statuses' | 'Pending'>('All Statuses');
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState('Haven 8 - tower-d - Floor 25th');
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const legendAnim = React.useRef(new Animated.Value(1)).current;
  const propertyAnim = React.useRef(new Animated.Value(0)).current;

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const weeks = React.useMemo(
    () => getWeeksForMonth(currentDate.getFullYear(), currentDate.getMonth()),
    [monthKey]
  );

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [monthKey, fadeAnim]);

  const handlePrevMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const toggleLegend = () => {
    const next = !legendOpen;
    setLegendOpen(next);
    Animated.timing(legendAnim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const legendHeight = legendAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 150],
  });
  const legendOpacity = legendAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const toggleProperty = () => {
    const next = !propertyOpen;
    setPropertyOpen(next);
    Animated.timing(propertyAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const propertyHeight = propertyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  const filteredBookings = React.useMemo(() => {
    if (statusFilter === 'All Statuses') return bookings;
    return bookings.filter((booking) => booking.status === 'Pending');
  }, [statusFilter]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.page }]}>
      <View style={[styles.screen, { backgroundColor: theme.page }]}>
        <AdminTopBar title="Booking Calendar" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.propertyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.propertyLabel, { color: theme.muted }]}>Selected Property</Text>
            <TouchableOpacity style={styles.propertyRow} onPress={toggleProperty}>
              <MaterialCommunityIcons name="office-building" size={18} color={Colors.brand.primary} />
              <Text style={[styles.propertyValue, { color: theme.text }]}>{selectedProperty}</Text>
              <Feather name={propertyOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
            </TouchableOpacity>
            <Animated.View style={[styles.propertyDropdown, { height: propertyHeight, opacity: propertyAnim, backgroundColor: theme.surface, borderColor: theme.border }]}>
              {['Haven 8 - tower-d - Floor 25th', 'Haven 3 - tower-a - Floor 9th', 'Haven 1 - tower-c - Floor 18th'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.propertyOption, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setSelectedProperty(item);
                    toggleProperty();
                  }}
                >
                  <Text style={[styles.propertyOptionText, { color: theme.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.monthFilterRow}>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
                  <Feather name="chevron-left" size={18} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: theme.text }]}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
                  <Feather name="chevron-right" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.statusDropdownWrap}>
                <Feather name="filter" size={14} color={theme.muted} />
                <TouchableOpacity style={[styles.statusSelect, { backgroundColor: theme.surface, borderColor: isDark ? '#9CA3AF' : '#D4A017' }]} onPress={() => setStatusOpen((prev) => !prev)}>
                  <Text style={[styles.statusSelectText, { color: theme.text }]}>{statusFilter}</Text>
                  <Feather name={statusOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
                </TouchableOpacity>
                {statusOpen && (
                  <View style={[styles.statusMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {(['All Statuses', 'Pending'] as const).map((status) => {
                      const isActive = statusFilter === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[styles.statusMenuItem, isActive && styles.statusMenuItemActive]}
                          onPress={() => {
                            setStatusFilter(status);
                            setStatusOpen(false);
                          }}
                        >
                          <Text style={[styles.statusMenuItemText, { color: theme.text }, isActive && styles.statusMenuItemTextActive]}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt }]}>
              <View style={styles.segmentActive}>
                <Text style={styles.segmentActiveText}>Month</Text>
              </View>
              <View style={styles.segment}>
                <Text style={[styles.segmentText, { color: theme.muted }]}>Week</Text>
              </View>
              <View style={styles.segment}>
                <Text style={[styles.segmentText, { color: theme.muted }]}>Day</Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.calendarCard, { opacity: fadeAnim, backgroundColor: theme.surface, borderColor: theme.border, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            <View style={styles.weekHeader}>
              {weekDays.map((d) => (
                <Text key={d} style={[styles.weekHeaderText, { color: theme.muted }]}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, rowIndex) => (
              <View key={`week-${rowIndex}`} style={styles.weekRow}>
                {filteredBookings.map((booking, bookingIndex) => {
                  const weekStart = week.find((d) => d !== null) ?? 1;
                  const weekEnd = week.slice().reverse().find((d) => d !== null) ?? weekStart;
                  if (booking.end < weekStart || booking.start > weekEnd) return null;
                  const start = Math.max(booking.start, weekStart);
                  const end = Math.min(booking.end, weekEnd);
                  const startIndex = week.indexOf(start);
                  const endIndex = week.indexOf(end);
                  if (startIndex < 0 || endIndex < 0) return null;
                  const leftPct = (startIndex / 7) * 100;
                  const widthPct = ((endIndex - startIndex + 1) / 7) * 100;
                  return (
                    <View
                      key={`booking-${rowIndex}-${bookingIndex}`}
                      style={[
                        styles.bookingBar,
                        booking.status === 'Pending' && styles.bookingBarPending,
                        { left: `${leftPct}%`, width: `${widthPct}%` },
                      ]}
                    >
                      {booking.title ? <Text style={styles.bookingLabel}>{booking.title}</Text> : null}
                    </View>
                  );
                })}
                {week.map((day, colIndex) => (
                  <View key={`day-${rowIndex}-${colIndex}`} style={styles.dayCell}>
                    {day && (
                      <View style={[styles.dayPill, day === 9 && styles.todayPill]}>
                        <Text style={[styles.dayText, { color: theme.text }, day === 9 && styles.todayText]}>{day}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View style={[styles.legendSheet, { height: legendHeight, backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.legendHandleButton} onPress={toggleLegend}>
            <View style={styles.legendHandle} />
            <Text style={[styles.legendChevron, { color: theme.muted }]}>{legendOpen ? 'Collapse' : 'Expand'}</Text>
          </TouchableOpacity>
          <Animated.View style={{ opacity: legendOpacity }}>
            <Text style={[styles.legendTitle, { color: theme.text }]}>Status Legend</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
              <Text style={[styles.legendText, { color: theme.muted }]}>Pending</Text>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[styles.legendText, { color: theme.muted }]}>Approved</Text>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.legendText, { color: theme.muted }]}>Checked-in</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.legendText, { color: theme.muted }]}>Checked-out</Text>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendText, { color: theme.muted }]}>Declined</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 16,
    paddingBottom: 140,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  propertyLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginBottom: 8,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propertyValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  propertyDropdown: {
    overflow: 'hidden',
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  propertyOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  propertyOptionText: {
    fontSize: 13,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  controlsRow: {
    marginTop: 16,
    gap: 8,
    zIndex: 20,
  },
  monthFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  statusDropdownWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusSelect: {
    minWidth: 118,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4A017',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSelectText: {
    fontSize: 13,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  statusMenu: {
    position: 'absolute',
    top: 38,
    right: 0,
    width: 118,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    zIndex: 50,
  },
  statusMenuItem: {
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  statusMenuItemActive: {
    backgroundColor: '#DBEAFE',
  },
  statusMenuItemText: {
    fontSize: 13,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  statusMenuItemTextActive: {
    color: '#1D4ED8',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    flex: 1,
  },
  monthButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  segmentActive: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
  },
  segmentActiveText: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  calendarCard: {
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  weekHeaderText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 6,
    position: 'relative',
  },
  dayCell: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  todayPill: {
    backgroundColor: '#FCD5B5',
  },
  todayText: {
    color: Colors.gray[900],
    fontWeight: '700',
  },
  bookingBar: {
    position: 'absolute',
    left: 6,
    top: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  bookingBarPending: {
    backgroundColor: '#FBBF24',
  },
  bookingLabel: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  legendSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  legendHandleButton: {
    alignItems: 'center',
    gap: 6,
  },
  legendHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[200],
    marginBottom: 8,
  },
  legendChevron: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
    fontWeight: '600',
    marginRight: 10,
  },
});
