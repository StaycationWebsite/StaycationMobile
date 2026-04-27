import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type Category = 'auth' | 'create' | 'update' | 'delete';
type Severity  = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface LogEntry {
  id: number;
  action: string;
  description: string;
  email: string;
  role: string;
  ip: string;
  timestamp: string;
  category: Category;
  severity: Severity;
  icon: string;
}

const LOGS: LogEntry[] = [
  { id: 1,  action: 'User Login',           description: 'Successful login from Chrome browser',                 email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-17 10:30:45', category: 'auth',   severity: 'INFO',     icon: 'login' },
  { id: 2,  action: 'Haven Created',        description: 'Created new haven: Haven A – City View',              email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-17 09:15:22', category: 'create', severity: 'INFO',     icon: 'home-plus-outline' },
  { id: 3,  action: 'Booking Modified',     description: 'Updated booking BK-2024-001 – Changed check-in date', email: 'staff@staycation.com',  role: 'Staff', ip: '192.168.1.185', timestamp: '2024-12-17 08:45:10', category: 'update', severity: 'WARNING',  icon: 'calendar-edit' },
  { id: 4,  action: 'Failed Login Attempt', description: 'Failed login attempt – Invalid credentials',           email: 'unknown@example.com',   role: 'N/A',   ip: '203.123.45.67', timestamp: '2024-12-17 07:22:33', category: 'auth',   severity: 'ERROR',    icon: 'login-variant' },
  { id: 5,  action: 'Pricing Updated',      description: 'Updated weekend rates for all havens',                 email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-16 16:30:12', category: 'update', severity: 'INFO',     icon: 'currency-php' },
  { id: 6,  action: 'User Created',         description: 'Created new staff account: staff2@staycation.com',    email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-16 14:20:05', category: 'create', severity: 'INFO',     icon: 'account-plus' },
  { id: 7,  action: 'Haven Deleted',        description: 'Deleted haven: Haven E – Test Unit',                   email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-16 11:10:45', category: 'delete', severity: 'CRITICAL', icon: 'home-remove-outline' },
  { id: 8,  action: 'Settings Changed',     description: 'Updated system notification settings',                 email: 'admin@staycation.com',  role: 'Owner', ip: '192.168.1.100', timestamp: '2024-12-15 15:45:30', category: 'update', severity: 'INFO',     icon: 'cog-outline' },
];

const SEVERITY_CFG: Record<Severity, { color: string; bg: string }> = {
  INFO:     { color: '#2563EB', bg: '#DBEAFE' },
  WARNING:  { color: '#D97706', bg: '#FEF3C7' },
  ERROR:    { color: '#EA580C', bg: '#FFEDD5' },
  CRITICAL: { color: '#DC2626', bg: '#FEE2E2' },
};

const CATEGORY_CFG: Record<Category, { color: string; bg: string }> = {
  auth:   { color: Colors.blue[500],   bg: Colors.blue[100]  },
  create: { color: Colors.green[500],  bg: Colors.green[100] },
  update: { color: Colors.yellow[500], bg: Colors.yellow[100]},
  delete: { color: Colors.red[500],    bg: Colors.red[100]   },
};

const KPI_CARDS = [
  { label: 'Total Events',     value: '1,247', change: '+12%', color: '#2563EB', icon: 'pulse' as const },
  { label: 'Active Users',     value: '8',     change: '+2',   color: '#16A34A', icon: 'account-group-outline' as const },
  { label: 'Security Events',  value: '3',     change: '-50%', color: '#8B5CF6', icon: 'shield-outline' as const },
  { label: "Today's Events",   value: '24',    change: '+5',   color: '#D97706', icon: 'calendar-today-outline' as const },
];

const FILTERS = ['All', 'Auth', 'Create', 'Update', 'Delete'] as const;

export default function AuditLogsScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState('All');
  const [search, setSearch]  = useState('');

  const filtered = LOGS.filter(l => {
    const catOk = filter === 'All' || l.category === filter.toLowerCase();
    const q = search.toLowerCase();
    const searchOk = !q || l.action.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.ip.includes(q) || l.description.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Audit Logs</Text>
          <Text style={s.headerSub}>Monitor all system activities and security events</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.kpiRow}>
          {KPI_CARDS.map(k => (
            <View key={k.label} style={[s.kpiCard, { backgroundColor: k.color }]}>
              <Text style={s.kpiLabel}>{k.label}</Text>
              <Text style={s.kpiValue}>{k.value}</Text>
              <View style={s.kpiChangeRow}>
                <Feather name="trending-up" size={11} color="rgba(255,255,255,0.8)" />
                <Text style={s.kpiChange}>{k.change}</Text>
              </View>
              <MaterialCommunityIcons name={k.icon} size={40} color="rgba(255,255,255,0.18)" style={s.kpiWatermark} />
            </View>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={s.searchWrap}>
          <Feather name="search" size={15} color={Colors.gray[400]} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by action, user, IP..."
            placeholderTextColor={Colors.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={15} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <Feather name="filter" size={14} color={Colors.gray[500]} style={{ marginRight: 2 }} />
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[s.chip, active && { backgroundColor: Colors.brand.primary }]}
                onPress={() => setFilter(f)}
              >
                <Text style={[s.chipText, active && { color: Colors.white }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Log entries */}
        <View style={s.listWrap}>
          <Text style={s.countText}>{filtered.length} log entr{filtered.length === 1 ? 'y' : 'ies'}</Text>

          {filtered.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={48} color={Colors.gray[300]} />
              <Text style={s.emptyText}>No log entries found</Text>
            </View>
          ) : filtered.map(log => {
            const sev = SEVERITY_CFG[log.severity];
            const cat = CATEGORY_CFG[log.category];
            return (
              <View key={log.id} style={s.card}>
                {/* Top: icon + action + severity */}
                <View style={s.cardTop}>
                  <View style={[s.typeIcon, { backgroundColor: cat.bg }]}>
                    <MaterialCommunityIcons name={log.icon as any} size={18} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.actionText}>{log.action}</Text>
                    <Text style={s.descText} numberOfLines={2}>{log.description}</Text>
                  </View>
                  <View style={[s.severityBadge, { backgroundColor: sev.bg }]}>
                    <Text style={[s.severityText, { color: sev.color }]}>{log.severity}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={s.detailsGrid}>
                  {/* User */}
                  <View style={s.detailItem}>
                    <Feather name="user" size={11} color={Colors.gray[400]} />
                    <View>
                      <Text style={s.detailValue}>{log.email}</Text>
                      <Text style={s.detailSub}>{log.role}</Text>
                    </View>
                  </View>
                  {/* Timestamp */}
                  <View style={s.detailItem}>
                    <Feather name="clock" size={11} color={Colors.gray[400]} />
                    <Text style={s.detailValue}>{log.timestamp}</Text>
                  </View>
                  {/* IP */}
                  <View style={s.detailItem}>
                    <MaterialCommunityIcons name="ip-network-outline" size={13} color={Colors.gray[400]} />
                    <Text style={s.detailValue}>{log.ip}</Text>
                  </View>
                  {/* Category badge */}
                  <View style={[s.catBadge, { backgroundColor: cat.bg }]}>
                    <Text style={[s.catText, { color: cat.color }]}>
                      {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  headerSub:   { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  // KPI
  kpiRow:       { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  kpiCard:      { width: 148, borderRadius: 16, padding: 14, overflow: 'hidden' },
  kpiLabel:     { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  kpiValue:     { fontSize: 28, fontWeight: '800', color: Colors.white },
  kpiChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  kpiChange:    { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  kpiWatermark: { position: 'absolute', bottom: 6, right: 8 },
  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: Colors.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900] },
  // Filters
  filterRow: { paddingHorizontal: 16, paddingBottom: 14, gap: 8, alignItems: 'center' },
  chip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  // List
  listWrap:  { paddingHorizontal: 16, gap: 10 },
  countText: { fontSize: 12, color: Colors.gray[500], fontWeight: '600', marginBottom: 4 },
  empty:     { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15, color: Colors.gray[500], fontWeight: '600' },
  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    gap: 12,
  },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  typeIcon:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  actionText:   { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  descText:     { fontSize: 12, color: Colors.gray[500], marginTop: 2, lineHeight: 17 },
  severityBadge:{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, flexShrink: 0 },
  severityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  // Details
  detailsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  detailItem:  { flexDirection: 'row', alignItems: 'flex-start', gap: 5, flex: 1, minWidth: '45%' },
  detailValue: { fontSize: 11, color: Colors.gray[700], fontWeight: '600' },
  detailSub:   { fontSize: 10, color: Colors.gray[400], marginTop: 1 },
  catBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  catText:     { fontSize: 11, fontWeight: '700' },
});
