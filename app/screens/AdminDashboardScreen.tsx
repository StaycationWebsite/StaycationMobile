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
import { Colors, Fonts } from '../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: 'destructive' }
      ]
    );
  };

  const StatCard = ({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: any, color: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={styles.trendBadge}>
          <Feather name="arrow-up-right" size={12} color="#10B981" />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const ActivityItem = ({ title, time, type }: { title: string, time: string, type: 'booking' | 'payment' | 'review' }) => {
    const getIcon = () => {
      switch(type) {
        case 'booking': return { name: 'calendar-check', color: '#3B82F6' };
        case 'payment': return { name: 'currency-php', color: '#10B981' };
        case 'review': return { name: 'star', color: Colors.brand.primary };
      }
    };
    const icon = getIcon();

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: icon.color + '15' }]}>
          <MaterialCommunityIcons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={Colors.gray[300]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.adminName}>Admin Chief</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.gray[900]} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.notificationBtn, { marginLeft: 12 }]} onPress={handleLogout}>
            <Feather name="log-out" size={22} color={Colors.red[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Analytics Scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.statsScroll}
      >
        <StatCard 
          title="Monthly Revenue" 
          value="₱142,500" 
          trend="+12%" 
          icon="cash-multiple" 
          color={Colors.brand.primary} 
        />
        <StatCard 
          title="Total Bookings" 
          value="84" 
          trend="+5%" 
          icon="calendar-clock" 
          color="#3B82F6" 
        />
        <StatCard 
          title="Occupancy Rate" 
          value="92%" 
          trend="+8%" 
          icon="home-percent" 
          color="#10B981" 
        />
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('AdminTabs', { screen: 'AdminHaven' })}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.brand.primary + '10' }]}>
              <MaterialCommunityIcons name="home-city-outline" size={24} color={Colors.brand.primary} />
            </View>
            <Text style={styles.actionLabel}>Manage Havens</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#6366F110' }]}>
              <MaterialCommunityIcons name="chart-bar" size={24} color="#6366F1" />
            </View>
            <Text style={styles.actionLabel}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B10' }]}>
              <MaterialCommunityIcons name="tag-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.actionLabel}>Discounts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('AdminTabs', { screen: 'Me' })}>
            <View style={[styles.actionIcon, { backgroundColor: '#EC489910' }]}>
              <Feather name="user" size={24} color="#EC4899" />
            </View>
            <Text style={styles.actionLabel}>Admin Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          <ActivityItem 
            title="New Booking: Haven 2 (Unit 1405)" 
            time="2 mins ago" 
            type="booking" 
          />
          <ActivityItem 
            title="Payment Received: ₱4,500" 
            time="1 hour ago" 
            type="payment" 
          />
          <ActivityItem 
            title="5-Star Review received for Haven 1" 
            time="3 hours ago" 
            type="review" 
          />
          <ActivityItem 
            title="Check-out completed: Room 12B" 
            time="5 hours ago" 
            type="booking" 
          />
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  notifDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red[500],
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  statsScroll: {
    paddingLeft: 24,
    paddingRight: 12,
    marginBottom: 32,
  },
  statCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.brand.primary,
    fontWeight: '600',
    fontFamily: Fonts.inter,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[800],
    fontFamily: Fonts.inter,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: Fonts.inter,
  },
  bottomPadding: {
    height: 100,
  }
});
