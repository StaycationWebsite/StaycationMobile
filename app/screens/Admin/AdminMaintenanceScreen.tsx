import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors, Fonts } from '../../../constants/Styles';
import { API_CONFIG } from '../../../constants/config';
import AdminTopBar from '../../components/AdminTopBar';
import { useTheme } from '../../../hooks/useTheme';

type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved';
type MaintenancePriority = 'Urgent' | 'High' | 'Medium' | 'Low';
type SortDirection = 'asc' | 'desc';
type MaintenanceSortKey =
  | 'id'
  | 'haven'
  | 'issue'
  | 'status'
  | 'priority'
  | 'reported_by'
  | 'location'
  | 'assigned_to'
  | 'type'
  | 'date';

interface MaintenanceItem {
  id: string;
  haven: string;
  issue: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  reported_by: string;
  location: string;
  assigned_to: string;
  type: string;
  date: string;
}

const SHOW_OPTIONS = [5, 10, 20] as const;

const FALLBACK_MAINTENANCE: MaintenanceItem[] = [
  {
    id: '43a9eb88',
    haven: 'Haven 3',
    issue: 'test test test test',
    status: 'Open',
    priority: 'Urgent',
    reported_by: 'Cleaner Staycation',
    location: 'test test test test',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/15/2026',
  },
  {
    id: '04a378dc',
    haven: 'Haven 3',
    issue: 'fwadwadwa',
    status: 'Open',
    priority: 'High',
    reported_by: 'Cleaner Staycation',
    location: 'adwafawdwadwa',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/15/2026',
  },
  {
    id: 'efadc78f',
    haven: 'Haven 3',
    issue: 'hudwiahdwau',
    status: 'Open',
    priority: 'Medium',
    reported_by: 'Cleaner Staycation',
    location: 'hjgyui',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/15/2026',
  },
  {
    id: '662f2d01',
    haven: 'Haven 3',
    issue: 'dwadwadwa',
    status: 'Open',
    priority: 'Medium',
    reported_by: 'Cleaner Staycation',
    location: 'dwadwadwa',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/15/2026',
  },
  {
    id: 'bd060af1',
    haven: 'Haven 3',
    issue: 'dwadwadwa',
    status: 'Open',
    priority: 'Medium',
    reported_by: 'Cleaner Staycation',
    location: 'dwadwadwa',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/15/2026',
  },
  {
    id: '4fbcd4dd',
    haven: 'Haven 8',
    issue: 'Aircon not cooling',
    status: 'Open',
    priority: 'High',
    reported_by: 'Front Desk',
    location: 'Bedroom',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/14/2026',
  },
  {
    id: 'e91ac981',
    haven: 'Haven 2',
    issue: 'Sink leakage',
    status: 'Open',
    priority: 'Urgent',
    reported_by: 'Cleaner Staycation',
    location: 'Kitchen',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/14/2026',
  },
  {
    id: 'a2938a14',
    haven: 'Haven 6',
    issue: 'Broken lamp',
    status: 'Open',
    priority: 'Low',
    reported_by: 'Guest Support',
    location: 'Living Room',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/13/2026',
  },
  {
    id: '65f0f2c2',
    haven: 'Haven 1',
    issue: 'Clogged drain',
    status: 'Open',
    priority: 'Medium',
    reported_by: 'Cleaner Staycation',
    location: 'Bathroom',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/13/2026',
  },
  {
    id: 'a10bf983',
    haven: 'Haven 5',
    issue: 'Door lock issue',
    status: 'Open',
    priority: 'High',
    reported_by: 'Property Admin',
    location: 'Main Door',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/12/2026',
  },
  {
    id: '0d9f3180',
    haven: 'Haven 4',
    issue: 'Faucet replacement',
    status: 'Open',
    priority: 'Medium',
    reported_by: 'Cleaner Staycation',
    location: 'Kitchen',
    assigned_to: 'Unassigned',
    type: 'plumbing',
    date: '1/12/2026',
  },
  {
    id: '1ab5ce90',
    haven: 'Haven 7',
    issue: 'Window hinge loose',
    status: 'Open',
    priority: 'Low',
    reported_by: 'Front Desk',
    location: 'Bedroom',
    assigned_to: 'Unassigned',
    type: 'maintenance',
    date: '1/11/2026',
  },
];

function parseSafeJson(raw: string): any | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeStatus(value?: string): MaintenanceStatus {
  const v = String(value || '').toLowerCase().trim();
  if (v === 'in progress' || v === 'in_progress') return 'In Progress';
  if (v === 'resolved' || v === 'done' || v === 'closed') return 'Resolved';
  return 'Open';
}

function normalizePriority(value?: string): MaintenancePriority {
  const v = String(value || '').toLowerCase().trim();
  if (v === 'urgent') return 'Urgent';
  if (v === 'high') return 'High';
  if (v === 'low') return 'Low';
  return 'Medium';
}

export default function AdminMaintenanceScreen() {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const theme = {
    page: isDark ? '#0B1220' : '#F3F5F8',
    surface: isDark ? '#111827' : Colors.white,
    border: isDark ? '#273244' : '#E2E8F0',
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#94A3B8' : Colors.gray[600],
    input: isDark ? '#1F2937' : Colors.gray[50],
  };

  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState<(typeof SHOW_OPTIONS)[number]>(5);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | MaintenanceStatus>('All Status');
  const [priorityFilter, setPriorityFilter] = useState<'All Priority' | MaintenancePriority>('All Priority');
  const [showOpen, setShowOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<MaintenanceSortKey>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_CONFIG.MAINTENANCE_API);
        const raw = await response.text();

        if (!response.ok) {
          setItems(FALLBACK_MAINTENANCE);
          return;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          setItems(FALLBACK_MAINTENANCE);
          return;
        }

        const data = parseSafeJson(raw);
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.maintenance)
            ? data.maintenance
            : Array.isArray(data)
              ? data
              : [];

        if (list.length === 0) {
          setItems(FALLBACK_MAINTENANCE);
          return;
        }

        setItems(
          list.map((row: any) => ({
            id: String(row.id || row.uuid_id || row.request_id || ''),
            haven: String(row.haven || row.haven_name || 'Unknown Haven'),
            issue: String(row.issue || row.description || '-'),
            status: normalizeStatus(row.status),
            priority: normalizePriority(row.priority),
            reported_by: String(row.reported_by || row.reportedBy || row.created_by || 'Unknown'),
            location: String(row.location || '-'),
            assigned_to: String(row.assigned_to || row.assignee || 'Unassigned'),
            type: String(row.type || row.maintenance_type || '-'),
            date: String(row.date || row.created_at || '-'),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch maintenance requests:', error);
        setItems(FALLBACK_MAINTENANCE);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const total = items.length;
    const open = items.filter((i) => i.status === 'Open').length;
    const inProgress = items.filter((i) => i.status === 'In Progress').length;
    const resolved = items.filter((i) => i.status === 'Resolved').length;
    return { total, open, inProgress, resolved };
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((i) => {
      const statusMatch = statusFilter === 'All Status' ? true : i.status === statusFilter;
      const priorityMatch = priorityFilter === 'All Priority' ? true : i.priority === priorityFilter;
      if (!statusMatch || !priorityMatch) return false;

      if (!query) return true;
      return (
        i.id.toLowerCase().includes(query) ||
        i.haven.toLowerCase().includes(query) ||
        i.issue.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.type.toLowerCase().includes(query) ||
        i.reported_by.toLowerCase().includes(query)
      );
    });
  }, [items, search, statusFilter, priorityFilter]);

  const sortedFiltered = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const dateToNumber = (d: string) => {
        const parsed = new Date(d);
        return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
      };
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortBy) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'haven':
          aVal = a.haven;
          bVal = b.haven;
          break;
        case 'issue':
          aVal = a.issue;
          bVal = b.issue;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'priority':
          aVal = a.priority;
          bVal = b.priority;
          break;
        case 'reported_by':
          aVal = a.reported_by;
          bVal = b.reported_by;
          break;
        case 'location':
          aVal = a.location;
          bVal = b.location;
          break;
        case 'assigned_to':
          aVal = a.assigned_to;
          bVal = b.assigned_to;
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'date':
          aVal = dateToNumber(a.date);
          bVal = dateToNumber(b.date);
          break;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const x = String(aVal).toLowerCase();
      const y = String(bVal).toLowerCase();
      if (x < y) return sortDir === 'asc' ? -1 : 1;
      if (x > y) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / showCount));
  const currentPage = Math.min(page, totalPages);
  const start = sortedFiltered.length === 0 ? 0 : (currentPage - 1) * showCount + 1;
  const end = Math.min(currentPage * showCount, sortedFiltered.length);
  const paginated = sortedFiltered.slice((currentPage - 1) * showCount, currentPage * showCount);

  const toggleSort = (key: MaintenanceSortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('asc');
  };

  const sortIcon = (key: MaintenanceSortKey) => {
    if (sortBy !== key) return 'chevrons-up';
    return sortDir === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  const headerDefs: Array<{ key: MaintenanceSortKey; label: string; wide?: boolean }> = [
    { key: 'id', label: 'ID' },
    { key: 'haven', label: 'Haven' },
    { key: 'issue', label: 'Issue', wide: true },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'reported_by', label: 'Reported By' },
    { key: 'location', label: 'Location', wide: true },
    { key: 'assigned_to', label: 'Assigned To' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <AdminTopBar title="Maintenance Management" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>Maintenance Management</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Track and manage maintenance requests across all properties
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.metricTitle}>Total Requests</Text>
            <Text style={styles.metricValue}>{metrics.total}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.metricTitle}>Open</Text>
            <Text style={styles.metricValue}>{metrics.open}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.metricTitle}>In Progress</Text>
            <Text style={styles.metricValue}>{metrics.inProgress}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.metricTitle}>Resolved</Text>
            <Text style={styles.metricValue}>{metrics.resolved}</Text>
          </View>
        </View>

        <View style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.controlTopRow}>
            <View style={styles.dropdownWrap}>
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Show</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setStatusOpen(false);
                  setPriorityOpen(false);
                  setShowOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{showCount}</Text>
                <Feather name={showOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {showOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {SHOW_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowCount(opt);
                        setPage(1);
                        setShowOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.dropdownWrap}>
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Status</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setShowOpen(false);
                  setPriorityOpen(false);
                  setStatusOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{statusFilter}</Text>
                <Feather name={statusOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {statusOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {(['All Status', 'Open', 'In Progress', 'Resolved'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setStatusFilter(opt);
                        setPage(1);
                        setStatusOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.dropdownWrap}>
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Priority</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setShowOpen(false);
                  setStatusOpen(false);
                  setPriorityOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{priorityFilter}</Text>
                <Feather name={priorityOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {priorityOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {(['All Priority', 'Urgent', 'High', 'Medium', 'Low'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPriorityFilter(opt);
                        setPage(1);
                        setPriorityOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.input }]}>
            <Feather name="search" size={16} color={theme.muted} />
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by ID, haven, issue, location, type, or reported by..."
              placeholderTextColor={theme.muted}
            />
          </View>
        </View>

        <View style={[styles.tableCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
	              <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                  {headerDefs.map((h) => (
                    <TouchableOpacity
                      key={h.key}
                      style={h.wide ? styles.sortHeaderCellWide : styles.sortHeaderCell}
                      onPress={() => toggleSort(h.key)}
                    >
                      <Text style={[h.wide ? styles.headerCellWide : styles.headerCell, { color: theme.muted }]}>{h.label}</Text>
                      <Feather name={sortIcon(h.key)} size={12} color={theme.muted} />
                    </TouchableOpacity>
                  ))}
                  <Text style={[styles.headerCell, { color: theme.muted }]}>Actions</Text>
	              </View>

              {loading ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator size="small" color={Colors.brand.primary} />
                  <Text style={[styles.stateText, { color: theme.muted }]}>Loading maintenance requests...</Text>
                </View>
              ) : paginated.length === 0 ? (
                <View style={styles.stateWrap}>
                  <Feather name="tool" size={24} color={theme.muted} />
                  <Text style={[styles.stateText, { color: theme.muted }]}>No maintenance requests found</Text>
                </View>
              ) : (
                paginated.map((row) => (
                  <View key={row.id} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.id}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.haven}</Text>
                    <Text style={[styles.rowCellWide, { color: theme.text }]} numberOfLines={1}>{row.issue}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.status}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.priority}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.reported_by}</Text>
                    <Text style={[styles.rowCellWide, { color: theme.text }]} numberOfLines={1}>{row.location}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.assigned_to}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.type}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{row.date}</Text>
                    <View style={styles.actionCell}>
                      <TouchableOpacity style={styles.editButton}>
                        <Feather name="edit-2" size={14} color={Colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton}>
                        <Feather name="trash-2" size={14} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
	            <Text style={[styles.footerText, { color: theme.muted }]}>
	              Showing {start} to {end} of {sortedFiltered.length} entries
	            </Text>

            <View style={styles.paginationWrap}>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                const active = p === currentPage;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pageBtn, active && styles.pageBtnActive]}
                    onPress={() => setPage(p)}
                  >
                    <Text style={[styles.pageText, active && styles.pageTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  metricTitle: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  metricValue: {
    marginTop: 6,
    color: Colors.white,
    fontSize: 28,
    fontFamily: Fonts.poppins,
    fontWeight: '700',
  },
  controlCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    zIndex: 100,
  },
  controlTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlLabel: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    marginBottom: 4,
  },
  dropdownWrap: {
    flex: 1,
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  tableHeader: {
    minWidth: 1330,
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  headerCell: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  headerCellWide: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  sortHeaderCell: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortHeaderCellWide: {
    width: 170,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableRow: {
    minWidth: 1330,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  rowCell: {
    width: 110,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  rowCellWide: {
    width: 170,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  actionCell: {
    width: 110,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateWrap: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  footerRow: {
    marginTop: 12,
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  paginationWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: Colors.brand.primary,
  },
  pageText: {
    color: Colors.gray[700],
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  pageTextActive: {
    color: Colors.white,
  },
});
