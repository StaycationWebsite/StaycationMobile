import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather } from '@expo/vector-icons';
import { useState, useMemo } from 'react';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  bookedDates?: string[];
  blockedDates?: string[];
}

interface Day {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isBlocked: boolean;
  isPast: boolean;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  bookedDates = [],
  blockedDates = [],
}: DateRangePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Day[] = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: '',
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isBooked: false,
        isBlocked: false,
        isPast: false,
      });
    }

    // Current month's days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0, 0, 0, 0);

      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isBooked: bookedDates.includes(dateStr),
        isBlocked: blockedDates.includes(dateStr),
        isPast: dayDate < today,
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: '',
        day: i,
        isCurrentMonth: false,
        isBooked: false,
        isBlocked: false,
        isPast: false,
      });
    }

    return days;
  }, [currentDate, bookedDates, blockedDates]);

  const isDateInRange = (date: string): boolean => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const isStartDate = (date: string): boolean => date === startDate;
  const isEndDate = (date: string): boolean => date === endDate;

  const handleDatePress = (date: string) => {
    if (!date) return;

    const day = calendarDays.find(d => d.date === date);
    if (day?.isBooked || day?.isBlocked || day?.isPast) return;

    if (!startDate || (startDate && endDate)) {
      onDateRangeChange(date, null);
    } else if (date < startDate) {
      onDateRangeChange(date, null);
    } else {
      onDateRangeChange(startDate, date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Feather name="chevron-left" size={20} color={Colors.brand.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Feather name="chevron-right" size={20} color={Colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          const isSelectable = day.isCurrentMonth && !day.isPast && !day.isBooked && !day.isBlocked;
          const isSelected = isStartDate(day.date) || isEndDate(day.date);
          const inRange = isDateInRange(day.date);

          return (
            <TouchableOpacity
              key={index}
              disabled={!isSelectable}
              onPress={() => handleDatePress(day.date)}
              style={[
                styles.dayButton,
                !day.isCurrentMonth && styles.dayButtonOtherMonth,
                day.isPast && styles.dayButtonPast,
                day.isBooked && styles.dayButtonBooked,
                day.isBlocked && styles.dayButtonBlocked,
                inRange && styles.dayButtonInRange,
                isSelected && styles.dayButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOtherMonth,
                  day.isPast && styles.dayTextDisabled,
                  day.isBooked && styles.dayTextDisabled,
                  day.isBlocked && styles.dayTextDisabled,
                  inRange && styles.dayTextInRange,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.gray[100] }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.brand.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.gray[500] }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {startDate && endDate && (
        <View style={styles.selectedDatesContainer}>
          <Text style={styles.selectedDatesLabel}>Selected Dates:</Text>
          <Text style={styles.selectedDatesText}>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayButtonOtherMonth: {
    opacity: 0.3,
  },
  dayButtonPast: {
    backgroundColor: Colors.gray[100],
  },
  dayButtonBooked: {
    backgroundColor: Colors.gray[300],
  },
  dayButtonBlocked: {
    backgroundColor: Colors.gray[300],
  },
  dayButtonInRange: {
    backgroundColor: Colors.brand.primarySoft,
  },
  dayButtonSelected: {
    backgroundColor: Colors.brand.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
  },
  dayTextOtherMonth: {
    color: Colors.gray[400],
  },
  dayTextDisabled: {
    color: Colors.gray[400],
  },
  dayTextInRange: {
    color: Colors.brand.primary,
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  selectedDatesContainer: {
    backgroundColor: Colors.brand.primarySoft,
    padding: 12,
    borderRadius: 8,
  },
  selectedDatesLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    marginBottom: 4,
  },
  selectedDatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
});
