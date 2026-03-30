import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import { useAuth } from '../../hooks/useAuth';
import { bookingsService, Booking } from '../../../services/bookingsService';
import { paymentsService } from '../../../services/paymentsService';
import { inventoryService } from '../../../services/inventoryService';

type ActivityType = 'booking' | 'payment' | 'message';
type StatusType = 'success' | 'pending' | 'info';
type TrendType = 'up' | 'down' | 'neutral';

const iconForActivity = (type: ActivityType): { name: any; color: string } => ({
  booking: { name: 'calendar-check-outline', color: Colors.brand.primary },
  payment: { name: 'credit-card-outline', color: Colors.green[500] },
  message: { name: 'message-text-outline', color: Colors.blue[500] },
})[type];

const statusStyle = (status: StatusType) => ({
  success: { bg: Colors.green[100], text: Colors.green[500] },
  pending: { bg: Colors.yellow[100], text: '#92400E' },
  info: { bg: Colors.blue[100], text: Colors.blue[600] },
})[status];

const trendColor = (trend: TrendType) => ({
  up: Colors.green[500], down: Colors.red[500], neutral: Colors.gray[500],
})[trend];

type Stats = {
  totalBookings: number;
  pendingPaymentsAmount: number;
  pendingPaymentsCount: number;
  activeDepositsCount: number;
  lowStockCount: number;
  criticalStockCount: number;
};

type Activity = {
  id: string; type: ActivityType; status: StatusType; title: string; description: string; timestamp: string;
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0, pendingPaymentsAmount: 0, pendingPaymentsCount: 0,
    activeDepositsCount: 0, lowStockCount: 0, criticalStockCount: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = useCallback(async () => {
    try {
      const [bookings, payments, inventory] = await Promise.all([
        bookingsService.getBookings(),
        paymentsService.getBookingPayments(),
        inventoryService.getInventory(),
      ]);

      const pendingPayments = payments.filter(p => p.payment_status === 'pending_down_payment');
      const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
      const critical = inventory.filter(i => i.status === 'Out of Stock');

      setStats({
        totalBookings: bookings.length,
        pendingPaymentsAmount: pendingPayments.reduce((s, p) => s + parseFloat(p.amount_paid ?? '0'), 0),
        pendingPaymentsCount: pendingPayments.length,
        activeDepositsCount: bookings.filter(b => b.has_security_deposit).length,
        lowStockCount: lowStock.length,
        criticalStockCount: critical.length,
      });

      const recentActivities: Activity[] = bookings.slice(0, 3).map(b => ({
        id: b.id,
        type: 'booking' as const,
        status: b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'pending' : 'info',
        title: b.status === 'confirmed' ? 'Booking confirmed' : 'New booking received',
        description: `${b.room_name} — ${b.guest_first_name} ${b.guest_last_name}`,
        timestamp: b.created_at,
      }));
      setActivities(recentActivities);
    } catch (_) {
      // Fail silently on dashboard — partial data is fine
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, change, trend, iconName, iconColor, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconBox, { backgroundColor: iconColor + '20' }]}>
          <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
        </View>
        {change !== undefined && (
          <View style={styles.trendRow}>
            <MaterialCommunityIcons
              name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'}
              size={15}
              color={trendColor(trend)}
            />
            <Text style={[styles.trendText, { color: trendColor(trend) }]}>{Math.abs(change)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickAction = ({ title, iconName, color, badge, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.qaIconBox, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={iconName} size={26} color={color} />
        {badge > 0 && (
          <View style={styles.qaBadge}>
            <Text style={styles.qaBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.qaTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.brand.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greet()},</Text>
            <Text style={styles.userName}>{user?.name ?? 'CSR Agent'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Feather name="bell" size={22} color={Colors.gray[700]} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            <StatCard title="Total Bookings" value={stats.totalBookings} iconName="calendar-multiselect" iconColor={Colors.brand.primary} />
            <StatCard title="Pending Payments" value={`₱${stats.pendingPaymentsAmount.toLocaleString()}`} iconName="credit-card-outline" iconColor={Colors.green[500]} subtitle={`${stats.pendingPaymentsCount} payments`} />
            <StatCard title="Active Deposits" value={stats.activeDepositsCount} iconName="shield-check-outline" iconColor={Colors.yellow[500]} subtitle={`${stats.activeDepositsCount} deposits`} />
            <StatCard title="Inventory Alerts" value={stats.lowStockCount} iconName="package-variant-closed" iconColor={Colors.red[500]} subtitle={`${stats.criticalStockCount} critical`} />
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Quick Actions</Text>
          <View style={styles.qaGrid}>
            <QuickAction title="New Booking" iconName="calendar-plus" color={Colors.brand.primary} badge={0} onPress={() => {}} />
            <QuickAction title="Payments" iconName="credit-card-check-outline" color={Colors.green[500]} badge={stats.pendingPaymentsCount} onPress={() => {}} />
            <QuickAction title="Deposits" iconName="shield-account-outline" color={Colors.yellow[500]} badge={stats.activeDepositsCount} onPress={() => {}} />
            <QuickAction title="Inventory" iconName="package-variant" color={Colors.red[500]} badge={stats.criticalStockCount} onPress={() => {}} />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            {activities.map((a, i) => {
              const { name: iconName, color: iconColor } = iconForActivity(a.type);
              const { bg, text } = statusStyle(a.status);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.activityRow, i < activities.length - 1 && styles.activityRowBorder]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.activityIconBox, { backgroundColor: iconColor + '18' }]}>
                    <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
                  </View>
                  <View style={styles.activityBody}>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <Text style={[styles.statusText, { color: text }]}>{a.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.activityDesc} numberOfLines={1}>{a.description}</Text>
                    <Text style={styles.activityTime}>Just now</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: Colors.gray[500] },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.gray[900], marginTop: 2 },
  notifBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red[500], borderWidth: 1.5, borderColor: Colors.white },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[900], marginBottom: 14 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  statCard: {
    width: 164, backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statIconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendText: { fontSize: 12, fontWeight: '700' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  statTitle: { fontSize: 12, color: Colors.gray[500] },
  statSubtitle: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, gap: 12 },
  quickAction: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 18, padding: 18,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  qaIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10, position: 'relative' },
  qaBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.red[500], minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: Colors.white },
  qaBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  qaTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray[900], textAlign: 'center' },
  activityCard: { backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.gray[100] },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  activityRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray[50] },
  activityIconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  activityBody: { flex: 1 },
  activityMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: Colors.gray[900], flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: '700' },
  activityDesc: { fontSize: 12, color: Colors.gray[500], marginBottom: 2 },
  activityTime: { fontSize: 11, color: Colors.gray[400] },
});
