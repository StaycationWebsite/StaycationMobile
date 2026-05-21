import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GuestColors } from '../../../constants/Styles';

export default function GuestBookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <View style={styles.empty}>
        <Feather name="calendar" size={48} color={GuestColors.goldSoft} />
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptySubtitle}>
          When you book a stay, it will appear here with dates and details.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: GuestColors.gold,
    marginBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: GuestColors.charcoal,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
