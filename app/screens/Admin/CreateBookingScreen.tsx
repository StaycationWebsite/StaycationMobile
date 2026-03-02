import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const MOCK_HAVENS = [
  { id: '1', name: 'Haven 101', tower: 'Tower A', floor: '1st Floor', rate: 3500 },
  { id: '2', name: 'Haven 205', tower: 'Tower A', floor: '2nd Floor', rate: 4200 },
  { id: '3', name: 'Haven 103', tower: 'Tower B', floor: '1st Floor', rate: 3800 },
  { id: '4', name: 'Haven 302', tower: 'Tower B', floor: '3rd Floor', rate: 5500 },
];

export default function CreateBookingScreen() {
  const navigation = useNavigation<any>();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedHaven, setSelectedHaven] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [havenDropdownOpen, setHavenDropdownOpen] = useState(false);

  const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name={icon} size={18} color={Colors.gray[400]} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const [inDay, inMon, inYear] = checkIn.split('/').map(Number);
    const [outDay, outMon, outYear] = checkOut.split('/').map(Number);
    const d1 = new Date(inYear, inMon - 1, inDay);
    const d2 = new Date(outYear, outMon - 1, outDay);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const total = selectedHaven ? selectedHaven.rate * nights : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Guest Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.blue[500] + '20' }]}>
              <MaterialCommunityIcons name="account" size={18} color={Colors.blue[500]} />
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

        {/* Haven Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.brand.primary + '20' }]}>
              <MaterialCommunityIcons name="home-city-outline" size={18} color={Colors.brand.primary} />
            </View>
            <Text style={styles.sectionTitle}>Select Haven</Text>
          </View>

          <Text style={styles.inputLabel}>Haven</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setHavenDropdownOpen(!havenDropdownOpen)}
          >
            <MaterialCommunityIcons name="home-outline" size={18} color={Colors.gray[400]} />
            <Text style={[styles.dropdownBtnText, selectedHaven && { color: Colors.gray[900] }]}>
              {selectedHaven ? `${selectedHaven.name} — ${selectedHaven.tower}` : 'Choose a haven'}
            </Text>
            <Feather name={havenDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray[500]} />
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
                    <Text style={[styles.dropdownItemName, selectedHaven?.id === haven.id && { color: Colors.brand.primary }]}>
                      {haven.name}
                    </Text>
                    <Text style={styles.dropdownItemSub}>{haven.tower} · {haven.floor}</Text>
                  </View>
                  <Text style={styles.dropdownItemRate}>₱{haven.rate.toLocaleString()}/night</Text>
                  {selectedHaven?.id === haven.id && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={Colors.brand.primary} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Stay Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.green[500] + '20' }]}>
              <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.green[500]} />
            </View>
            <Text style={styles.sectionTitle}>Stay Details</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Check-in</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="calendar-check" size={18} color={Colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={checkIn}
                  onChangeText={setCheckIn}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={Colors.gray[400]}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Check-out</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="calendar-remove" size={18} color={Colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={checkOut}
                  onChangeText={setCheckOut}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={Colors.gray[400]}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Guests</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
              >
                <Feather name="minus" size={16} color={Colors.brand.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{guestCount}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(guestCount + 1)}
              >
                <Feather name="plus" size={16} color={Colors.brand.primary} />
              </TouchableOpacity>
              <Text style={styles.counterHint}>guest{guestCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Notes (optional)</Text>
            <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={Colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requests or notes..."
                placeholderTextColor={Colors.gray[400]}
                multiline
              />
            </View>
          </View>
        </View>

        {/* Summary */}
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
          <MaterialCommunityIcons name="calendar-plus" size={20} color={Colors.white} />
          <Text style={styles.submitBtnText}>Create Booking</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  content: { padding: 20, gap: 16 },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    gap: 14,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  dateRow: { flexDirection: 'row', gap: 12 },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownBtnText: { flex: 1, fontSize: 14, color: Colors.gray[400] },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
    marginTop: -6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  dropdownItemSelected: { backgroundColor: Colors.brand.primarySoft },
  dropdownItemName: { fontSize: 14, fontWeight: '600', color: Colors.gray[900] },
  dropdownItemSub: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  dropdownItemRate: { fontSize: 13, fontWeight: '700', color: Colors.brand.primary },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  counterValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], minWidth: 24, textAlign: 'center' },
  counterHint: { fontSize: 13, color: Colors.gray[500] },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    gap: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: Colors.gray[500] },
  summaryValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  summaryTotalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    marginTop: 4,
  },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  summaryTotalValue: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});