import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

const PERIODS = ['This Week', 'This Month', 'This Year'];
const HAVEN_OPTIONS = ['All Havens', 'Haven 1', 'Haven 2', 'Haven 3', 'Haven 4'];
const YEAR_OPTIONS = ['2024', '2025', '2026'];
const MONTH_OPTIONS = [
  'All Months', 'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
];

const REVENUE_BY_MONTH = [12000, 18000, 22000, 30000, 38500, 28000, 15000, 10000, 8000, 5000, 3000, 2000];
const REVENUE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const TOP_HAVENS = [
  { name: 'Haven 302', revenue: 55000, bookings: 14, occupancy: 92, rating: 4.9 },
  { name: 'Haven 101', revenue: 42500, bookings: 12, occupancy: 85, rating: 4.8 },
  { name: 'Haven 205', revenue: 38000, bookings: 10, occupancy: 78, rating: 4.7 },
  { name: 'Haven 103', revenue: 29000, bookings: 8, occupancy: 72, rating: 4.6 },
];

const PAYMENT_METHODS = [
  { label: 'GCash', percentage: 42, color: Colors.blue[500] },
  { label: 'Bank Transfer', percentage: 28, color: Colors.green[500] },
  { label: 'Credit Card', percentage: 18, color: Colors.purple[500] },
  { label: 'PayMaya', percentage: 12, color: Colors.yellow[500] },
];

const BOOKING_STATUS_DATA = [
  { label: 'Confirmed', count: 14, color: Colors.blue[500] },
  { label: 'Rescheduled', count: 6, color: Colors.purple[500] },
  { label: 'Pending', count: 5, color: Colors.green[500] },
  { label: 'Rejected', count: 4, color: Colors.red[500] },
];
const BOOKING_STATUS_TOTAL = BOOKING_STATUS_DATA.reduce((s, d) => s + d.count, 0);

const RESERVATION_STATUS_DATA = [
  { label: 'Pending', count: 28, color: Colors.yellow[500] },
  { label: 'Confirmed', count: 12, color: Colors.green[500] },
  { label: 'Approved', count: 8, color: Colors.blue[500] },
];
const RESERVATION_STATUS_TOTAL = RESERVATION_STATUS_DATA.reduce((s, d) => s + d.count, 0);

export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [selectedHaven, setSelectedHaven] = useState('All Havens');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [dropdownOpen, setDropdownOpen] = useState<'haven' | 'year' | 'month' | null>(null);

  const DropdownPicker = ({ value, options, onSelect, type }: { value: string; options: string[]; onSelect: (v: string) => void; type: 'haven' | 'year' | 'month' }) => (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.filterPill}
        onPress={() => setDropdownOpen(dropdownOpen === type ? null : type)}
      >
        <Text style={styles.filterPillText} numberOfLines={1}>{value}</Text>
        <Feather name={dropdownOpen === type ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.gray[500]} />
      </TouchableOpacity>
      {dropdownOpen === type && (
        <View style={styles.dropdownMenu}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, opt === value && styles.dropdownItemActive]}
              onPress={() => { onSelect(opt); setDropdownOpen(null); }}
            >
              <Text style={[styles.dropdownItemText, opt === value && styles.dropdownItemTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const StatusChartCard = ({ title, total, data }: { title: string; total: number; data: typeof BOOKING_STATUS_DATA }) => (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{total} total</Text>
      </View>
      <View style={styles.stackedBarRow}>
        {data.map((d, i) => (
          <View
            key={i}
            style={[
              styles.stackedSegment,
              { flex: d.count, backgroundColor: d.color },
              i === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
              i === data.length - 1 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
            ]}
          />
        ))}
      </View>
      <View style={styles.chartLegend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={styles.legendLabel}>{d.label}</Text>
            <Text style={styles.legendCount}>{d.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const MetricCard = ({ title, value, subtitle, icon, color, trend, trendValue }: any) => (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? Colors.green[100] : Colors.red[100] }]}>
            <Feather
              name={trend === 'up' ? 'trending-up' : 'trending-down'}
              size={11}
              color={trend === 'up' ? Colors.green[500] : Colors.red[500]}
            />
            <Text style={[styles.trendText, { color: trend === 'up' ? Colors.green[500] : Colors.red[500] }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Feather name="download" size={18} color={Colors.brand.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Dropdowns */}
      <View style={styles.filterRow}>
        <DropdownPicker value={selectedHaven} options={HAVEN_OPTIONS} onSelect={setSelectedHaven} type="haven" />
        <DropdownPicker value={selectedYear} options={YEAR_OPTIONS} onSelect={setSelectedYear} type="year" />
        <DropdownPicker value={selectedMonth} options={MONTH_OPTIONS} onSelect={setSelectedMonth} type="month" />
      </View>

      {/* Period Filter */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, activePeriod === p && styles.periodChipActive]}
            onPress={() => setActivePeriod(p)}
          >
            <Text style={[styles.periodChipText, activePeriod === p && styles.periodChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
          <MetricCard title="Total Revenue" value="₱38,500" icon="currency-php" color={Colors.green[500]} trend="up" trendValue="+100.0%" />
          <MetricCard title="Total Bookings" value="77" subtitle="This month" icon="calendar-check" color={Colors.blue[500]} trend="up" trendValue="+100.0%" />
          <MetricCard title="Occupancy Rate" value="6.7%" icon="home-percent" color={Colors.purple[500]} trend="up" trendValue="+100.0%" />
          <MetricCard title="New Guests" value="30" icon="account-plus-outline" color={Colors.yellow[500]} trend="up" trendValue="+100.0%" />
        </ScrollView>

        {/* Revenue Chart - monthly line-style */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Revenue</Text>
            <Text style={styles.cardSubtitle}>Monthly</Text>
          </View>
          <Text style={styles.chartTotal}>₱38,500</Text>
          <Text style={styles.chartTotalLabel}>Total for {selectedYear}</Text>
          <View style={styles.barChart}>
            {REVENUE_BY_MONTH.map((h, i) => {
              const maxH = Math.max(...REVENUE_BY_MONTH);
              return (
                <View key={i} style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    {
                      height: (h / maxH) * 70,
                      backgroundColor: i === 4 ? Colors.green[500] : Colors.green[500] + '40',
                    },
                  ]} />
                </View>
              );
            })}
          </View>
          <View style={styles.dayLabels}>
            {REVENUE_MONTHS.map((m, i) => (
              <Text key={i} style={[styles.dayLabel, i === 4 && { color: Colors.green[500], fontWeight: '700' }]}>{m}</Text>
            ))}
          </View>
        </View>

        {/* Booking Status */}
        <StatusChartCard title="Booking Status" total={BOOKING_STATUS_TOTAL} data={BOOKING_STATUS_DATA} />

        {/* Reservations Status */}
        <StatusChartCard title="Reservations Status" total={RESERVATION_STATUS_TOTAL} data={RESERVATION_STATUS_DATA} />

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Methods</Text>
          <View style={styles.paymentMethodsList}>
            {PAYMENT_METHODS.map((method, i) => (
              <View key={i} style={styles.paymentMethodRow}>
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentDot, { backgroundColor: method.color }]} />
                  <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                </View>
                <View style={styles.paymentBarWrapper}>
                  <View style={[styles.paymentBar, { width: `${method.percentage}%` as any, backgroundColor: method.color }]} />
                </View>
                <Text style={styles.paymentMethodPct}>{method.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Havens */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Top Performing Havens</Text>
            <MaterialCommunityIcons name="trophy-outline" size={18} color={Colors.yellow[500]} />
          </View>

          {TOP_HAVENS.map((haven, i) => (
            <View key={haven.name} style={[styles.havenRow, i < TOP_HAVENS.length - 1 && styles.havenRowBorder]}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? Colors.yellow[500] : Colors.gray[100] }]}>
                <Text style={[styles.rankText, { color: i === 0 ? Colors.white : Colors.gray[500] }]}>#{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.havenName}>{haven.name}</Text>
                <View style={styles.havenMeta}>
                  <MaterialCommunityIcons name="calendar" size={11} color={Colors.gray[400]} />
                  <Text style={styles.havenMetaText}>{haven.bookings} bookings</Text>
                  <Text style={styles.havenMetaDot}>·</Text>
                  <MaterialCommunityIcons name="star" size={11} color={Colors.yellow[500]} />
                  <Text style={styles.havenMetaText}>{haven.rating}</Text>
                </View>
                <View style={styles.occupancyBarBg}>
                  <View style={[styles.occupancyBarFill, {
                    width: `${haven.occupancy}%` as any,
                    backgroundColor: i === 0 ? Colors.brand.primary : Colors.brand.primary + '70',
                  }]} />
                </View>
                <Text style={styles.occupancyText}>{haven.occupancy}% occupancy</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.havenRevenue}>₱{(haven.revenue / 1000).toFixed(0)}K</Text>
                <Text style={styles.havenRevenueLabel}>revenue</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Avg Stay Duration', value: '2.8 nights', icon: 'moon-waning-crescent' },
              { label: 'Repeat Guests', value: '34%', icon: 'account-reactivate' },
              { label: 'New Guests', value: '66%', icon: 'account-plus-outline' },
              { label: 'Discount Used', value: '₱48K saved', icon: 'tag-multiple-outline' },
            ].map((stat, i) => (
              <View key={i} style={styles.summaryItem}>
                <MaterialCommunityIcons name={stat.icon as any} size={20} color={Colors.brand.primary} />
                <Text style={styles.summaryValue}>{stat.value}</Text>
                <Text style={styles.summaryLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
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
  exportBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  periodChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.gray[100],
  },
  periodChipActive: { backgroundColor: Colors.brand.primarySoft },
  periodChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  periodChipTextActive: { color: Colors.brand.primaryDark },
  content: { padding: 20, gap: 16 },
  metricsScroll: { paddingBottom: 4, gap: 12 },
  metricCard: {
    width: 148, backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  metricIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  trendText: { fontSize: 10, fontWeight: '700' },
  metricValue: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  metricTitle: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  metricSubtitle: { fontSize: 10, color: Colors.gray[400], marginTop: 2 },
  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    gap: 16,
  },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  cardSubtitle: { fontSize: 12, color: Colors.gray[500] },
  chartTotal: { fontSize: 28, fontWeight: '700', color: Colors.gray[900] },
  chartTotalLabel: { fontSize: 12, color: Colors.gray[500], marginTop: -10 },
  barChart: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 70, marginTop: 8,
  },
  barWrapper: { alignItems: 'center', flex: 1, gap: 4 },
  barLabel: { fontSize: 8, color: Colors.brand.primary, fontWeight: '600', height: 12 },
  bar: { width: 22, borderRadius: 6 },
  dayLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  dayLabel: { fontSize: 10, color: Colors.gray[400], textAlign: 'center', flex: 1 },
  paymentMethodsList: { gap: 12 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentMethodLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
  paymentDot: { width: 10, height: 10, borderRadius: 5 },
  paymentMethodLabel: { fontSize: 13, color: Colors.gray[700], fontWeight: '500' },
  paymentBarWrapper: { flex: 1, height: 8, backgroundColor: Colors.gray[100], borderRadius: 4, overflow: 'hidden' },
  paymentBar: { height: '100%', borderRadius: 4 },
  paymentMethodPct: { fontSize: 12, fontWeight: '700', color: Colors.gray[700], width: 36, textAlign: 'right' },
  havenRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  havenRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  rankBadge: {
    width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '800' },
  havenName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  havenMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  havenMetaText: { fontSize: 11, color: Colors.gray[500] },
  havenMetaDot: { fontSize: 11, color: Colors.gray[300] },
  occupancyBarBg: { height: 5, backgroundColor: Colors.gray[100], borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  occupancyBarFill: { height: '100%', borderRadius: 3 },
  occupancyText: { fontSize: 10, color: Colors.gray[400] },
  havenRevenue: { fontSize: 15, fontWeight: '700', color: Colors.brand.primary },
  havenRevenueLabel: { fontSize: 10, color: Colors.gray[400] },
  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  summaryItem: {
    width: '47%', backgroundColor: Colors.gray[50], borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6,
  },
  summaryValue: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  summaryLabel: { fontSize: 11, color: Colors.gray[500], textAlign: 'center' },
  filterRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
    zIndex: 10,
  },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.gray[100], borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 7, gap: 4,
  },
  filterPillText: { fontSize: 11, fontWeight: '600', color: Colors.gray[700], flex: 1 },
  dropdownMenu: {
    position: 'absolute', top: 38, left: 0, right: 0,
    backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.gray[200], zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 8,
    maxHeight: 180, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 9 },
  dropdownItemActive: { backgroundColor: Colors.brand.primarySoft },
  dropdownItemText: { fontSize: 12, color: Colors.gray[700] },
  dropdownItemTextActive: { color: Colors.brand.primaryDark, fontWeight: '700' },
  stackedBarRow: { flexDirection: 'row', height: 14, borderRadius: 6, overflow: 'hidden' },
  stackedSegment: { height: '100%' },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.gray[600] },
  legendCount: { fontSize: 12, fontWeight: '700', color: Colors.gray[900] },
});