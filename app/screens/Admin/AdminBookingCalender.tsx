import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../../constants/Styles';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weeks: Array<Array<number | null>> = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
];

export default function AdminBookingCalender() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="menu" size={22} color={Colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Calendar</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={20} color={Colors.gray[900]} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.propertyCard}>
            <Text style={styles.propertyLabel}>Selected Property</Text>
            <View style={styles.propertyRow}>
              <MaterialCommunityIcons name="office-building" size={18} color={Colors.brand.primary} />
              <Text style={styles.propertyValue}>Haven 8 - tower-d - Floor 25th</Text>
            </View>
            <Feather name="chevron-down" size={18} color={Colors.gray[600]} />
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.monthButton}>
                <Feather name="chevron-left" size={18} color={Colors.gray[700]} />
              </TouchableOpacity>
              <Text style={styles.monthText}>February 2026</Text>
              <TouchableOpacity style={styles.monthButton}>
                <Feather name="chevron-right" size={18} color={Colors.gray[700]} />
              </TouchableOpacity>
            </View>
            <View style={styles.segmented}>
              <View style={styles.segmentActive}>
                <Text style={styles.segmentActiveText}>Month</Text>
              </View>
              <View style={styles.segment}>
                <Text style={styles.segmentText}>Week</Text>
              </View>
              <View style={styles.segment}>
                <Text style={styles.segmentText}>Day</Text>
              </View>
            </View>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.weekHeader}>
              {weekDays.map((d) => (
                <Text key={d} style={styles.weekHeaderText}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, rowIndex) => (
              <View key={`week-${rowIndex}`} style={styles.weekRow}>
                {rowIndex === 0 && (
                  <View style={styles.bookingBarWeek1}>
                    <Text style={styles.bookingLabel}>Archie Break</Text>
                  </View>
                )}
                {rowIndex === 3 && (
                  <View style={styles.bookingBarWeek4} />
                )}
                {week.map((day, colIndex) => (
                  <View key={`day-${rowIndex}-${colIndex}`} style={styles.dayCell}>
                    {day && (
                      <View style={[styles.dayPill, day === 9 && styles.todayPill]}>
                        <Text style={[styles.dayText, day === 9 && styles.todayText]}>{day}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.legendSheet}>
          <View style={styles.legendHandle} />
          <Text style={styles.legendTitle}>Status Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
            <Text style={styles.legendText}>Pending</Text>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Approved</Text>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Checked-in</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Checked-out</Text>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Declined</Text>
          </View>
        </View>
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
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Fonts.poppins,
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
  controlsRow: {
    marginTop: 16,
    gap: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 6,
    position: 'relative',
  },
  dayCell: {
    width: 36,
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
  bookingBarWeek1: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  bookingBarWeek4: {
    position: 'absolute',
    left: 6 + 5 * 42,
    width: 36 * 3 + 12,
    top: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
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
  legendHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[200],
    marginBottom: 8,
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
