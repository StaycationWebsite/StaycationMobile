import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    label: 'Total Revenue (30 days)',
    value: '₱8,000',
    change: '+45.5%',
    positive: true,
    color: '#3B82F6',
    icon: 'currency-usd',
  },
  {
    label: 'Total Bookings (30 days)',
    value: '16',
    change: '+14.3%',
    positive: true,
    color: '#10B981',
    icon: 'calendar-month-outline',
  },
  {
    label: 'Occupancy Rate',
    value: '12.2%',
    change: '+22.2%',
    positive: true,
    color: '#F59E0B',
    icon: 'trending-up',
  },
  {
    label: 'New Guests (30 days)',
    value: '7',
    change: '-22.2%',
    positive: false,
    color: '#A855F7',
    icon: 'tag-outline',
  },
];

const HAVEN_REVENUES = [
  { name: 'Haven 1',  revenue: '₱3,500', bookings: 7,  max: 3500 },
  { name: 'Haven 10', revenue: '₱1,500', bookings: 3,  max: 3500 },
  { name: 'Haven 2',  revenue: '₱1,000', bookings: 2,  max: 3500 },
  { name: 'Haven 8',  revenue: '₱1,000', bookings: 2,  max: 3500 },
  { name: 'Haven 3',  revenue: '₱500',   bookings: 1,  max: 3500 },
  { name: 'Haven 4',  revenue: '₱500',   bookings: 1,  max: 3500 },
];

const MONTHLY_TREND = [
  { month: 'Mar', value: 9500, max: 9500 },
  { month: 'Apr', value: 4000, max: 9500 },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RevenueManagementScreen() {
  const navigation = useNavigation<any>();
  const [activeAction, setActiveAction] = useState<'pricing' | 'discounts' | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Revenue Management</Text>
          <Text style={styles.headerSub}>Real-time revenue data, pricing rules, and optimization</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Stat Cards ── */}
        <View style={styles.statsGrid}>
          {STAT_CARDS.map(card => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: card.color }]}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{card.value}</Text>
                <MaterialCommunityIcons name={card.icon as any} size={32} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.changeRow}>
                <MaterialCommunityIcons
                  name={card.positive ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.changeText}>{card.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Revenue by Haven ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Haven</Text>
          <View style={styles.havenGrid}>
            {HAVEN_REVENUES.map(haven => (
              <View key={haven.name} style={styles.havenCard}>
                <Text style={styles.havenName}>{haven.name}</Text>
                <Text style={styles.havenRevenue}>{haven.revenue}</Text>
                {/* Mini bar */}
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      { width: `${(haven.bookings / 7) * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.havenBookings}>{haven.bookings} bookings</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Monthly Revenue Trend ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Revenue Trend</Text>
          <View style={styles.trendCard}>
            {MONTHLY_TREND.map(row => (
              <View key={row.month} style={styles.trendRow}>
                <Text style={styles.trendMonth}>{row.month}</Text>
                <View style={styles.trendBarTrack}>
                  <View
                    style={[
                      styles.trendBarFill,
                      { width: `${(row.value / row.max) * 100}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.trendValue}>₱{row.value.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, activeAction === 'pricing' && styles.actionBtnActive]}
            onPress={() => setActiveAction(activeAction === 'pricing' ? null : 'pricing')}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="tag-multiple-outline"
              size={18}
              color={activeAction === 'pricing' ? '#fff' : Colors.gray[300]}
            />
            <Text style={[styles.actionBtnText, activeAction === 'pricing' && { color: '#fff' }]}>
              Pricing Rules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, activeAction === 'discounts' && styles.actionBtnActive]}
            onPress={() => setActiveAction(activeAction === 'discounts' ? null : 'discounts')}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="percent-outline"
              size={18}
              color={activeAction === 'discounts' ? '#fff' : Colors.gray[300]}
            />
            <Text style={[styles.actionBtnText, activeAction === 'discounts' && { color: '#fff' }]}>
              Discounts & Promos
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Pricing Rules Placeholder ── */}
        {activeAction === 'pricing' && (
          <View style={styles.placeholderCard}>
            <MaterialCommunityIcons name="tag-multiple-outline" size={36} color={Colors.gray[500]} />
            <Text style={styles.placeholderTitle}>Pricing Rules</Text>
            <Text style={styles.placeholderSub}>Configure dynamic pricing, seasonal rates, and minimum stay rules.</Text>
          </View>
        )}

        {/* ── Discounts & Promos Placeholder ── */}
        {activeAction === 'discounts' && (
          <View style={styles.placeholderCard}>
            <MaterialCommunityIcons name="percent-outline" size={36} color={Colors.gray[500]} />
            <Text style={styles.placeholderTitle}>Discounts & Promos</Text>
            <Text style={styles.placeholderSub}>Manage discount codes, promotional offers, and special deals.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.gray[50] },
  scrollContent: { padding: 16, gap: 16 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backBtn:       { paddingTop: 2 },
  headerTitle:   { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  headerSub:     { fontSize: 12, color: Colors.gray[500], marginTop: 2 },

  // Stat cards — 2-column grid
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    borderRadius: 14,
    padding: 14,
    width: '47.5%',
    gap: 6,
  },
  statLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500', lineHeight: 15 },
  statRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue:     { fontSize: 26, fontWeight: '800', color: '#fff' },
  changeRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeText:    { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Section
  section:       { gap: 10 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },

  // Haven grid
  havenGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  havenCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    padding: 14,
    width: '47.5%',
    gap: 4,
  },
  havenName:     { fontSize: 12, color: Colors.gray[500], fontWeight: '500' },
  havenRevenue:  { fontSize: 20, fontWeight: '800', color: Colors.gray[900] },
  miniBarTrack: {
    height: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  miniBarFill:   { height: 4, backgroundColor: '#F59E0B', borderRadius: 2 },
  havenBookings: { fontSize: 11, color: Colors.gray[400] },

  // Monthly trend
  trendCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    padding: 16,
    gap: 14,
  },
  trendRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trendMonth:    { fontSize: 13, color: Colors.gray[500], fontWeight: '600', width: 32 },
  trendBarTrack: { flex: 1, height: 10, backgroundColor: Colors.gray[100], borderRadius: 5, overflow: 'hidden' },
  trendBarFill:  { height: 10, backgroundColor: '#F59E0B', borderRadius: 5 },
  trendValue:    { fontSize: 12, color: Colors.gray[800], fontWeight: '700', width: 60, textAlign: 'right' },

  // Action buttons
  actionsRow:    { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    paddingVertical: 14,
  },
  actionBtnActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: Colors.gray[700] },

  // Placeholder
  placeholderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  placeholderTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[800] },
  placeholderSub:   { fontSize: 13, color: Colors.gray[500], textAlign: 'center', lineHeight: 18 },
});