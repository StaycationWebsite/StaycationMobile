import React from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { Colors, Fonts } from '../../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import AdminTopBar from '../../components/AdminTopBar';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();

  const MetricCard = ({ title, value, icon, color, trend, type }: any) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Feather name="trending-up" size={12} color="#10B981" />
          </View>
        )}
        {type === 'progress' && (
          <MaterialCommunityIcons name="chart-donut" size={24} color="#0D9488" />
        )}
      </View>
      <View style={styles.metricBody}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    </View>
  );

  const StatusCounter = ({ label, count, color, icon }: any) => (
    <View style={styles.counterItem}>
      <View style={[styles.counterCircle, { borderColor: color }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.counterNumber, { color: Colors.gray[900] }]}>{count}</Text>
      </View>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );

  const BookingRow = ({ name, property, date, status, avatar }: any) => (
    <View style={styles.tableRow}>
      <View style={styles.guestCell}>
        <View style={styles.miniAvatar}>
          <Text style={styles.avatarInitial}>{name[0]}</Text>
        </View>
        <View>
          <Text style={styles.guestName}>{name}</Text>
          <Text style={styles.propertySub}>{property}</Text>
        </View>
      </View>
      <View style={styles.dateCell}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Confirmed' ? '#DCFCE7' : '#FEF9C3' }]}>
        <Text style={[styles.statusBadgeText, { color: status === 'Confirmed' ? '#166534' : '#854D0E' }]}>{status}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray[50] }}>
      <AdminTopBar title="Dashboard" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding} />
        
        {/* Top Row: Key Metrics */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.metricsScroll}
        >
          <MetricCard 
            title="Total Revenue" 
            value="₱124,500" 
            icon="currency-php" 
            color={Colors.brand.primary} 
            trend={true}
          />
          <MetricCard 
            title="Active Bookings" 
            value="12" 
            icon="calendar-check" 
            color="#8B5CF6" 
          />
          <MetricCard 
            title="Average Rating" 
            value="4.8" 
            icon="star" 
            color="#EAB308" 
          />
          <MetricCard 
            title="Occupancy Rate" 
            value="85%" 
            icon="home-city" 
            color="#0D9488" 
            type="progress"
          />
        </ScrollView>

        {/* Middle Section: Operational Overview */}
        <View style={styles.sectionRow}>
          <View style={styles.todayCard}>
            <Text style={styles.cardTitle}>Today's Overview</Text>
            <View style={styles.countersRow}>
              <StatusCounter label="Check-ins" count="5" color="#10B981" icon="login-variant" />
              <StatusCounter label="Check-outs" count="3" color="#EF4444" icon="logout-variant" />
              <StatusCounter label="Pending" count="2" color="#F59E0B" icon="clock-outline" />
            </View>
          </View>

          <View style={styles.satisfactionCard}>
            <Text style={styles.cardTitle}>Guest Satisfaction</Text>
            <View style={styles.satisfactionContent}>
              <Text style={styles.bigScore}>4.8<Text style={styles.scoreScale}>/5</Text></Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={16} color={i <= 4 ? "#EAB308" : Colors.gray[200]} />
                ))}
              </View>
              <Text style={styles.totalReviews}>Total Reviews: 128</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.bookingsCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Recent Bookings</Text>
              <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
            </View>
            <BookingRow name="John Doe" property="Haven 1" date="Feb 9-11" status="Confirmed" />
            <BookingRow name="Sarah Smith" property="Haven 2" date="Feb 10-14" status="Pending" />
            <BookingRow name="Mike Ross" property="Haven 1" date="Feb 12-15" status="Confirmed" />
          </View>

          <View style={styles.propertyStatsCard}>
            <Text style={styles.cardTitle}>Property Stats</Text>
            <View style={styles.statsInner}>
              <View style={styles.statBadge}>
                <MaterialCommunityIcons name="office-building" size={18} color={Colors.brand.primary} />
                <Text style={styles.statBadgeText}>4 Listed</Text>
              </View>
              <Text style={styles.chartTitle}>Weekly Occupancy</Text>
              <View style={styles.barChartPlaceholder}>
                {[40, 70, 55, 90, 85, 60, 75].map((h, i) => (
                  <View key={i} style={[styles.chartBar, { height: h * 0.6, backgroundColor: i === 3 ? Colors.brand.primary : Colors.brand.primary + '40' }]} />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentPadding: {
    height: 24,
  },
  metricsScroll: {
    paddingLeft: 24,
    paddingRight: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    padding: 4,
  },
  metricBody: {
    marginTop: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  metricTitle: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'column',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  todayCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 20,
  },
  countersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counterItem: {
    alignItems: 'center',
    gap: 8,
  },
  counterCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  counterNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontWeight: '600',
  },
  satisfactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  satisfactionContent: {
    alignItems: 'center',
  },
  bigScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  scoreScale: {
    fontSize: 16,
    color: Colors.gray[500],
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  bookingsCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  guestCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray[600],
  },
  guestName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  propertySub: {
    fontSize: 11,
    color: Colors.gray[500],
  },
  dateCell: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  propertyStatsCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statsInner: {
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#854D0E',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[500],
    marginBottom: 12,
  },
  barChartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    paddingBottom: 4,
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
  },
  bottomPadding: {
    height: 40,
  }
});
