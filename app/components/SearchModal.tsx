import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, TouchableWithoutFeedback,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Styles';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (params: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    onSearch({ location, checkIn: '', checkOut: '', guests });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Find Your Haven</Text>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TouchableOpacity style={styles.fieldRow}>
            <Feather name="map-pin" size={16} color={Colors.brand.primary} />
            <Text style={styles.fieldValue}>Quezon City, Philippines</Text>
            <Feather name="chevron-down" size={16} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Check-in</Text>
            <TouchableOpacity style={styles.fieldRow}>
              <Feather name="calendar" size={16} color={Colors.brand.primary} />
              <Text style={styles.fieldValue}>Select date</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateDivider} />
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Check-out</Text>
            <TouchableOpacity style={styles.fieldRow}>
              <Feather name="calendar" size={16} color={Colors.brand.primary} />
              <Text style={styles.fieldValue}>Select date</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Guests</Text>
          <View style={styles.guestRow}>
            <Ionicons name="person-outline" size={16} color={Colors.brand.primary} />
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              <Feather name="minus" size={16} color={Colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.min(10, guests + 1))}
            >
              <Feather name="plus" size={16} color={Colors.gray[700]} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Feather name="search" size={18} color={Colors.white} />
          <Text style={styles.searchBtnText}>Search Rooms</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 16,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.gray[900], marginBottom: 24 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray[500], marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.gray[50], borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  fieldValue: { flex: 1, fontSize: 14, color: Colors.gray[700], fontWeight: '500' },
  datesRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  dateDivider: { width: 1, backgroundColor: Colors.gray[200], alignSelf: 'stretch', marginVertical: 8 },
  guestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.gray[50], borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  guestBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[200] },
  guestCount: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.gray[900], textAlign: 'center' },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.brand.primary, borderRadius: 16, height: 54, marginTop: 8,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  searchBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
