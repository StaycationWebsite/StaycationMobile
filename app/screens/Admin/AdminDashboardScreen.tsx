import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');
const METRIC_CARD_W = width * 0.40;
const ACTION_CARD_W = (width - 52) / 2;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const MetricCard = ({ title, value, icon, color, trend }: any) => (
    <View style={[styles.metricCard, { width: METRIC_CARD_W }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Feather name="trending-up" size={11} color={Colors.green[500]} />
          </View>
        )}
      </View>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.metricTitle} numberOfLines={2}>{title}</Text>
    </View>
  );

  const StatusCounter = ({ label, count, color, icon }: any) => (
    <View style={styles.counterItem}>
      <View style={[styles.counterCircle, { borderColor: color }]}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
        <Text style={styles.counterNumber}>{count}</Text>
      </View>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );

  const BookingRow = ({ name, property, date, status }: any) => (
    <View style={styles.tableRow}>
      <View style={styles.guestCell}>
        <View style={styles.miniAvatar}>
          <Text style={styles.avatarInitial}>{name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName} numberOfLines={1}>{name}</Text>
          <Text style={styles.propertySub}>{property}</Text>
        </View>
      </View>
      <Text style={styles.dateText} numberOfLines={1}>{date}</Text>
      <View style={[styles.statusBadge, {
        backgroundColor: status === 'Confirmed' ? Colors.green[100] : Colors.yellow[100],
      }]}>
        <Text style={[styles.statusBadgeText, {
          color: status === 'Confirmed' ? Colors.green[500] : '#854D0E',
        }]}>{status}</Text>
      </View>
    </View>
  );

  const QuickActionCard = ({ title, icon, iconColor, onPress }: any) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { width: ACTION_CARD_W }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: iconColor + '15' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={styles.quickActionText} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName} numberOfLines={1}>{user?.name ?? 'Admin'} 👋</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notifButton}>
            <Feather name="bell" size={20} color={Colors.gray[700]} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={28} color={Colors.brand.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: 20 }} />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="New Booking"
              icon="calendar-plus"
              iconColor={Colors.blue[500]}
              onPress={() => navigation.navigate('CreateBooking')}
            />
            <QuickActionCard
              title="Add Haven"
              icon="home-plus-outline"
              iconColor={Colors.brand.primary}
              onPress={() => navigation.navigate('AddHaven')}
            />
            <QuickActionCard
              title="Guest Messages"
              icon="message-text-outline"
              iconColor={Colors.green[500]}
              onPress={() => navigation.navigate('GuestMessages')}
            />
            <QuickActionCard
              title="Reports & Analytics"
              icon="chart-bar"
              iconColor={Colors.purple[500]}
              onPress={() => navigation.navigate('Reports')}
            />
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsScroll}
          >
            <MetricCard title="Total Revenue" value="₱124,500" icon="currency-php" color={Colors.brand.primary} trend />
            <MetricCard title="Active Bookings" value="12" icon="calendar-check" color={Colors.purple[500]} />
            <MetricCard title="Avg Rating" value="4.8" icon="star" color={Colors.yellow[500]} />
            <MetricCard title="Occupancy" value="85%" icon="home-city" color="#0D9488" />
          </ScrollView>
        </View>

        {/* Today's Overview */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
          <Text style={styles.cardTitle}>Today's Overview</Text>
          <View style={styles.countersRow}>
            <StatusCounter label="Check-ins" count="5" color={Colors.green[500]} icon="login-variant" />
            <StatusCounter label="Check-outs" count="3" color={Colors.red[500]} icon="logout-variant" />
            <StatusCounter label="Pending" count="2" color={Colors.yellow[500]} icon="clock-outline" />
          </View>
        </View>

        {/* Guest Satisfaction */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
          <Text style={styles.cardTitle}>Guest Satisfaction</Text>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={styles.bigScore}>4.8<Text style={styles.scoreScale}>/5</Text></Text>
            <View style={{ flexDirection: 'row', gap: 4, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <MaterialCommunityIcons
                  key={i}
                  name="star"
                  size={18}
                  color={i <= 4 ? Colors.yellow[500] : Colors.gray[200]}
                />
              ))}
            </View>
            <Text style={{ fontSize: 12, color: Colors.gray[500] }}>Total Reviews: 128</Text>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>Recent Bookings</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, color: Colors.brand.primary, fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <BookingRow name="John Doe" property="Haven 1" date="Feb 9-11" status="Confirmed" />
          <BookingRow name="Sarah Smith" property="Haven 2" date="Feb 10-14" status="Pending" />
          <BookingRow name="Mike Ross" property="Haven 1" date="Feb 12-15" status="Confirmed" />
        </View>

        {/* Weekly Occupancy Chart */}
        <View style={[styles.card, { marginHorizontal: 16, marginBottom: 32 }]}>
          <Text style={styles.cardTitle}>Property Stats</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <View style={[styles.statPill, { backgroundColor: Colors.brand.primarySoft }]}>
              <MaterialCommunityIcons name="office-building" size={14} color={Colors.brand.primary} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.brand.primaryDark }}>4 Listed</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: Colors.gray[500], marginBottom: 12, fontWeight: '600' }}>
            Weekly Occupancy
          </Text>
          <View style={styles.barChart}>
            {[40, 70, 55, 90, 85, 60, 75].map((h, i) => (
              <View
                key={i}
                style={[styles.bar, {
                  height: h * 0.55,
                  backgroundColor: i === 3 ? Colors.brand.primary : Colors.brand.primary + '40',
                }]}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={{ fontSize: 10, color: Colors.gray[400], textAlign: 'center', flex: 1 }}>{d}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  greeting: { fontSize: 14, color: Colors.gray[500] },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.gray[900], marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.red[500], borderWidth: 1.5, borderColor: Colors.white,
  },
  profileButton: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.gray[900],
    marginBottom: 14, paddingHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 14, gap: 12,
  },
  quickActionCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[100],
  },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12, fontWeight: '600', color: Colors.gray[900], textAlign: 'center',
  },
  metricsScroll: { paddingLeft: 16, paddingRight: 8, gap: 12, marginBottom: 4 },
  metricCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  metricIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { padding: 4 },
  metricValue: { fontSize: 17, fontWeight: '700', color: Colors.gray[900] },
  metricTitle: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900], marginBottom: 16 },
  countersRow: { flexDirection: 'row', justifyContent: 'space-around' },
  counterItem: { alignItems: 'center', gap: 8 },
  counterCircle: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 2,
  },
  counterNumber: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  counterLabel: { fontSize: 11, color: Colors.gray[500], fontWeight: '600' },
  bigScore: { fontSize: 32, fontWeight: '700', color: Colors.gray[900] },
  scoreScale: { fontSize: 16, color: Colors.gray[500] },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray[50],
  },
  guestCell: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  avatarInitial: { fontSize: 12, fontWeight: '700', color: Colors.gray[600] },
  guestName: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  propertySub: { fontSize: 11, color: Colors.gray[500] },
  dateText: { flex: 1, fontSize: 11, color: Colors.gray[600] },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start',
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 55 },
  bar: { flex: 1, marginHorizontal: 2, borderRadius: 4 },
});
