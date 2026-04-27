import React, { useState, useMemo } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../../hooks/useTheme';

const MOCK_HAVENS = [
  { id: '1', name: 'Haven 101', tower: 'Tower A', floor: '1st Floor', rate: 3500 },
  { id: '2', name: 'Haven 205', tower: 'Tower A', floor: '2nd Floor', rate: 4200 },
  { id: '3', name: 'Haven 103', tower: 'Tower B', floor: '1st Floor', rate: 3800 },
  { id: '4', name: 'Haven 302', tower: 'Tower B', floor: '3rd Floor', rate: 5500 },
];

function formatDateTime(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function CreateBookingScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedHaven, setSelectedHaven] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [havenDropdownOpen, setHavenDropdownOpen] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [pickerTempDate, setPickerTempDate] = useState(new Date());

  const openDatePicker = (target: 'checkIn' | 'checkOut') => {
    const existing = target === 'checkIn' ? checkIn : checkOut;
    setPickerTempDate(existing ?? new Date());
    setPickerTarget(target);
    setPickerMode('date');
    setPickerVisible(true);
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setPickerVisible(false);
      return;
    }
    const date = selectedDate ?? pickerTempDate;
    if (pickerMode === 'date') {
      setPickerTempDate(date);
      setPickerVisible(false);
      setTimeout(() => {
        setPickerMode('time');
        setPickerVisible(true);
      }, 50);
    } else {
      setPickerVisible(false);
      const final = new Date(pickerTempDate);
      final.setHours(date.getHours(), date.getMinutes());
      if (pickerTarget === 'checkIn') setCheckIn(final);
      else setCheckOut(final);
    }
  };

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.round((checkOut!.getTime() - checkIn!.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const total = selectedHaven ? selectedHaven.rate * nights : 0;

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: theme.colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    content: { padding: 20, gap: 16 },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      gap: 14,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    sectionIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    inputGroup: { gap: 6 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 46,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, color: theme.colors.text },
    dateRow: { flexDirection: 'row', gap: 12 },
    datePickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 46,
    },
    datePickerText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary },
    dropdownBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 46,
    },
    dropdownBtnText: { flex: 1, fontSize: 14, color: theme.colors.textSecondary },
    dropdown: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      overflow: 'hidden',
      marginTop: -6,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceSecondary,
    },
    dropdownItemSelected: { backgroundColor: theme.colors.primaryLight },
    dropdownItemName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    dropdownItemSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
    dropdownItemRate: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
    counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    counterBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center', alignItems: 'center',
    },
    counterValue: { fontSize: 18, fontWeight: '700', color: theme.colors.text, minWidth: 24, textAlign: 'center' },
    counterHint: { fontSize: 13, color: theme.colors.textSecondary },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      gap: 10,
    },
    summaryTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13, color: theme.colors.textSecondary },
    summaryValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
    summaryTotalRow: {
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      marginTop: 4,
    },
    summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    summaryTotalValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.surface },
  }), [theme]);

const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType }: any) => {
  const inputGroupStyle = {gap: 6};
  const inputLabelStyle = {fontSize: 12, fontWeight: '600', color: '#6B7280'};
  const inputWrapperStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  };
  const inputIconStyle = {marginRight: 8};
  const inputStyle = {flex: 1, fontSize: 14, color: '#111827'};
  
  return (
    <View style={inputGroupStyle}>
      <Text style={inputLabelStyle}>{label}</Text>
      <View style={inputWrapperStyle}>
        <MaterialCommunityIcons name={icon} size={18} color="#6B7280" style={inputIconStyle} />
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#3B82F640' }]}>
              <MaterialCommunityIcons name="account" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>Guest Information</Text>
          </View>

          <InputField
            label="Full Name"
            icon="account-outline"
            value={guestName}
            onChangeText={setGuestName}
            placeholder="e.g. Juan dela Cruz"
          />
          <InputField
            label="Email Address"
            icon="email-outline"
            value={guestEmail}
            onChangeText={setGuestEmail}
            placeholder="guest@email.com"
            keyboardType="email-address"
          />
          <InputField
            label="Phone Number"
            icon="phone-outline"
            value={guestPhone}
            onChangeText={setGuestPhone}
            placeholder="+63 900 000 0000"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: theme.colors.primaryLight }]}>
              <MaterialCommunityIcons name="home-city-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Select Haven</Text>
          </View>

          <Text style={styles.inputLabel}>Haven</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setHavenDropdownOpen(!havenDropdownOpen)}
          >
            <MaterialCommunityIcons name="home-outline" size={18} color={theme.colors.textTertiary} />
            <Text style={[styles.dropdownBtnText, selectedHaven && { color: theme.colors.text }]}>
              {selectedHaven ? `${selectedHaven.name} — ${selectedHaven.tower}` : 'Choose a haven'}
            </Text>
            <Feather name={havenDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          {havenDropdownOpen && (
            <View style={styles.dropdown}>
              {MOCK_HAVENS.map(haven => (
                <TouchableOpacity
                  key={haven.id}
                  style={[styles.dropdownItem, selectedHaven?.id === haven.id && styles.dropdownItemSelected]}
                  onPress={() => { setSelectedHaven(haven); setHavenDropdownOpen(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dropdownItemName, selectedHaven?.id === haven.id && { color: theme.colors.primary }]}>
                      {haven.name}
                    </Text>
                    <Text style={styles.dropdownItemSub}>{haven.tower} · {haven.floor}</Text>
                  </View>
                  <Text style={styles.dropdownItemRate}>₱{haven.rate.toLocaleString()}/night</Text>
                  {selectedHaven?.id === haven.id && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#22C55E20' }]}>
              <MaterialCommunityIcons name="calendar-range" size={18} color="#22C55E" />
            </View>
            <Text style={styles.sectionTitle}>Stay Details</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Check-in</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => openDatePicker('checkIn')}>
                <MaterialCommunityIcons name="calendar-check" size={18} color={theme.colors.textTertiary} />
                <Text style={styles.datePickerText, checkIn && { color: theme.colors.text }}>
                  {checkIn ? formatDateTime(checkIn) : 'Select date & time'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Check-out</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => openDatePicker('checkOut')}>
                <MaterialCommunityIcons name="calendar-remove" size={18} color={theme.colors.textTertiary} />
                <Text style={[styles.datePickerText, checkOut && { color: theme.colors.text }]}>
                  {checkOut ? formatDateTime(checkOut) : 'Select date & time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {pickerVisible && (
            <DateTimePicker
              value={pickerTempDate}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Guests</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
              >
                <Feather name="minus" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{guestCount}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(guestCount + 1)}
              >
                <Feather name="plus" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.counterHint}>guest{guestCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Notes (optional)</Text>
            <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requests or notes..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
              />
            </View>
          </View>
        </View>

        {selectedHaven && nights > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Haven</Text>
              <Text style={styles.summaryValue}>{selectedHaven.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{nights} night{nights !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate</Text>
              <Text style={styles.summaryValue}>₱{selectedHaven.rate.toLocaleString()}/night</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>₱{total.toLocaleString()}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!guestName || !selectedHaven || !checkIn || !checkOut) && styles.submitBtnDisabled]}
          disabled={!guestName || !selectedHaven || !checkIn || !checkOut}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="calendar-plus" size={20} color={theme.colors.surface} />
          <Text style={styles.submitBtnText}>Create Booking</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
