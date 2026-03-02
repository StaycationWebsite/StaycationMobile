import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

export default function CleanersManagementScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const CleaningTaskCard = ({ room, type, assignedTo, status, scheduledTime, priority }: any) => (
    <Card style={styles.taskCard} variant="elevated">
      <View style={styles.taskHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomText}>{room}</Text>
          <Text style={styles.typeText}>{type}</Text>
        </View>
        <Badge 
          label={status} 
          variant={
            status === 'Pending' ? 'warning' : 
            status === 'In Progress' ? 'info' : 
            status === 'Completed' ? 'success' : 'error'
          }
          size="sm"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-circle" size={16} color={Colors.brand.primary} />
          <Text style={styles.detailLabel}>Assigned to:</Text>
          <Text style={styles.detailValue}>{assignedTo || 'Unassigned'}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.detailLabel}>Scheduled:</Text>
          <Text style={styles.detailValue}>{scheduledTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={16} 
            color={priority === 'High' ? Colors.red[500] : priority === 'Medium' ? Colors.yellow[500] : Colors.gray[500]}
          />
          <Text style={styles.detailLabel}>Priority:</Text>
          <Text style={[styles.detailValue, {
            color: priority === 'High' ? Colors.red[500] : priority === 'Medium' ? '#92400E' : Colors.gray[600]
          }]}>{priority}</Text>
        </View>
      </View>

      {status === 'Pending' && (
        <TouchableOpacity style={styles.assignButton}>
          <Feather name="user-plus" size={16} color={Colors.white} />
          <Text style={styles.assignText}>Assign Cleaner</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const CleanerCard = ({ name, tasksToday, completedToday, status }: any) => (
    <Card style={styles.cleanerCard}>
      <View style={styles.cleanerHeader}>
        <View style={styles.cleanerAvatar}>
          <Text style={styles.cleanerInitial}>{name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cleanerName}>{name}</Text>
          <View style={styles.cleanerStats}>
            <Text style={styles.cleanerStatText}>{completedToday}/{tasksToday} tasks</Text>
          </View>
        </View>
        <View style={[styles.statusDot, { 
          backgroundColor: status === 'Available' ? Colors.green[500] : 
                          status === 'Busy' ? Colors.yellow[500] : Colors.gray[400]
        }]} />
      </View>
    </Card>
  );

  const MOCK_TASKS = [
    { id: 1, room: 'Haven 101', type: 'Check-out Cleaning', assignedTo: 'Maria Santos', status: 'In Progress', scheduledTime: '2:00 PM', priority: 'High' },
    { id: 2, room: 'Haven 205', type: 'Daily Housekeeping', assignedTo: null, status: 'Pending', scheduledTime: '3:00 PM', priority: 'Medium' },
    { id: 3, room: 'Haven 103', type: 'Deep Cleaning', assignedTo: 'Juan Dela Cruz', status: 'Completed', scheduledTime: '10:00 AM', priority: 'Low' },
  ];

  const MOCK_CLEANERS = [
    { id: 1, name: 'Maria Santos', tasksToday: 5, completedToday: 3, status: 'Busy' },
    { id: 2, name: 'Juan Dela Cruz', tasksToday: 4, completedToday: 4, status: 'Available' },
    { id: 3, name: 'Elena Rodriguez', tasksToday: 6, completedToday: 2, status: 'Busy' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cleaners Management</Text>
          <Text style={styles.headerSubtitle}>{MOCK_CLEANERS.length} staff members</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="broom" size={20} color={Colors.yellow[500]} />
            <Text style={styles.statValue}>{MOCK_TASKS.filter(t => t.status === 'Pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="progress-clock" size={20} color={Colors.blue[500]} />
            <Text style={styles.statValue}>{MOCK_TASKS.filter(t => t.status === 'In Progress').length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="check-all" size={20} color={Colors.green[500]} />
            <Text style={styles.statValue}>{MOCK_TASKS.filter(t => t.status === 'Completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Staff Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Staff</Text>
          <View style={styles.cleanersGrid}>
            {MOCK_CLEANERS.map(cleaner => (
              <CleanerCard key={cleaner.id} {...cleaner} />
            ))}
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Cleaning Tasks</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}>
              <Text style={[styles.chipText, styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>In Progress</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksContainer}>
            {MOCK_TASKS.map(task => (
              <CleaningTaskCard key={task.id} {...task} />
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginTop: 6 },
  statLabel: { fontSize: 10, color: Colors.gray[500], marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], marginBottom: 12 },
  cleanersGrid: { gap: 10 },
  cleanerCard: { padding: 14 },
  cleanerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cleanerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanerInitial: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  cleanerName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  cleanerStats: { marginTop: 2 },
  cleanerStatText: { fontSize: 12, color: Colors.gray[500] },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },
  tasksContainer: { gap: 14 },
  taskCard: { padding: 16 },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomText: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  typeText: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  taskDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 12, color: Colors.gray[600], minWidth: 85 },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
  },
  assignText: { fontSize: 13, fontWeight: '600', color: Colors.white },
});