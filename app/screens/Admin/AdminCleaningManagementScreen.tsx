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

type CleaningStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed';
type SortDirection = 'asc' | 'desc';
type SortKey = 'booking' | 'havenGuest' | 'dates' | 'cleaner' | 'status';
type DateFilter = 'All Dates' | 'Today' | 'This Week' | 'This Month';
type GuideLang = 'EN' | 'FIL';

interface CleaningTask {
  id: string;
  booking_id: string;
  haven_name: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  assigned_cleaner: string;
  status: CleaningStatus;
}

const SHOW_OPTIONS = [5, 10, 20] as const;
const STATUS_OPTIONS: Array<'All Status' | CleaningStatus> = [
  'All Status',
  'Unassigned',
  'Assigned',
  'In Progress',
  'Completed',
];
const DATE_OPTIONS: DateFilter[] = ['All Dates', 'Today', 'This Week', 'This Month'];

function parseSafeJson(raw: string): any | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeStatus(value?: string): CleaningStatus {
  const v = String(value || '').toLowerCase().trim().replace(/_/g, ' ');
  if (v === 'assigned') return 'Assigned';
  if (v === 'in progress') return 'In Progress';
  if (v === 'completed' || v === 'done' || v === 'resolved') return 'Completed';
  return 'Unassigned';
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string): string {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('en-US');
}

function inDateFilter(checkOut: string, filter: DateFilter): boolean {
  if (filter === 'All Dates') return true;
  const date = parseDate(checkOut);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (filter === 'Today') return target.getTime() === today.getTime();

  if (filter === 'This Week') {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return target >= weekStart && target <= weekEnd;
  }

  return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
}

export default function AdminCleaningManagementScreen() {
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

  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState<(typeof SHOW_OPTIONS)[number]>(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | CleaningStatus>('All Status');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All Dates');
  const [showOpen, setShowOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>('booking');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [statusGuideOpen, setStatusGuideOpen] = useState(true);
  const [howToGuideOpen, setHowToGuideOpen] = useState(true);
  const [statusGuideLang, setStatusGuideLang] = useState<GuideLang>('EN');
  const [howToGuideLang, setHowToGuideLang] = useState<GuideLang>('EN');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_CONFIG.CLEANING_API);
        const raw = await response.text();

        if (!response.ok) {
          setTasks([]);
          return;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          setTasks([]);
          return;
        }

        const data = parseSafeJson(raw);
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.tasks)
            ? data.tasks
            : Array.isArray(data)
              ? data
              : [];

        setTasks(
          list.map((row: any) => ({
            id: String(row.id || row.uuid_id || row.task_id || row.booking_id || ''),
            booking_id: String(row.booking_id || row.booking || row.reservation_id || '-'),
            haven_name: String(row.haven_name || row.haven || 'Unknown Haven'),
            guest_name: String(row.guest_name || row.guest || 'Unknown Guest'),
            check_in: String(row.check_in || row.check_in_date || '-'),
            check_out: String(row.check_out || row.check_out_date || '-'),
            assigned_cleaner: String(row.assigned_cleaner || row.cleaner_name || row.assigned_to || 'Unassigned'),
            status: normalizeStatus(row.status),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch cleaning tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const unassigned = tasks.filter((t) => t.status === 'Unassigned').length;
    const assigned = tasks.filter((t) => t.status === 'Assigned').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return { total, unassigned, assigned, inProgress, completed };
  }, [tasks]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const statusMatch = statusFilter === 'All Status' ? true : t.status === statusFilter;
      const dateMatch = inDateFilter(t.check_out, dateFilter);
      if (!statusMatch || !dateMatch) return false;

      if (!query) return true;
      return (
        t.booking_id.toLowerCase().includes(query) ||
        t.guest_name.toLowerCase().includes(query) ||
        t.haven_name.toLowerCase().includes(query) ||
        t.assigned_cleaner.toLowerCase().includes(query)
      );
    });
  }, [tasks, search, statusFilter, dateFilter]);

  const sortedFiltered = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortBy) {
        case 'booking':
          aVal = a.booking_id;
          bVal = b.booking_id;
          break;
        case 'havenGuest':
          aVal = `${a.haven_name} ${a.guest_name}`;
          bVal = `${b.haven_name} ${b.guest_name}`;
          break;
        case 'dates':
          aVal = parseDate(a.check_out)?.getTime() || 0;
          bVal = parseDate(b.check_out)?.getTime() || 0;
          break;
        case 'cleaner':
          aVal = a.assigned_cleaner;
          bVal = b.assigned_cleaner;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
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

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('asc');
  };

  const sortIcon = (key: SortKey) => {
    if (sortBy !== key) return 'chevrons-up';
    return sortDir === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  const statusGuideItems =
    statusGuideLang === 'EN'
      ? [
          { title: 'Unassigned', text: 'No cleaner has been assigned to this task yet' },
          { title: 'Assigned', text: 'A cleaner has been assigned and is scheduled to clean' },
          { title: 'In Progress', text: 'Cleaning is currently being performed' },
          { title: 'Completed', text: 'Room has been cleaned and is ready for inspection' },
        ]
      : [
          { title: 'Unassigned', text: 'Wala pang naka-assign na cleaner para sa task na ito.' },
          { title: 'Assigned', text: 'May naka-assign nang cleaner at naka-iskedyul na ang paglilinis.' },
          { title: 'In Progress', text: 'Kasalukuyang isinasagawa ang paglilinis.' },
          { title: 'Completed', text: 'Natapos na ang paglilinis at handa na para sa inspeksyon.' },
        ];

  const howToItems =
    howToGuideLang === 'EN'
      ? [
          { title: 'View Task Details', text: 'Click the eye icon to view full booking and guest details' },
          { title: 'Assign Cleaner', text: 'Click the assign icon to assign a cleaner to unassigned tasks' },
          { title: 'Track Progress', text: 'Monitor the status as cleaners update their progress' },
          { title: 'Verify Completion', text: 'Review completed tasks and verify the room is ready' },
        ]
      : [
          { title: 'Tingnan ang Task Details', text: 'I-click ang eye icon para makita ang buong booking at guest details' },
          { title: 'Mag-assign ng Cleaner', text: 'I-click ang assign icon para magtalaga ng cleaner sa unassigned tasks' },
          { title: 'Subaybayan ang Progress', text: 'I-monitor ang status habang ina-update ng cleaner ang progreso' },
          { title: 'Beripikahin ang Completion', text: 'I-review ang completed tasks at tiyaking handa na ang room' },
        ];

  const workflowTitle = howToGuideLang === 'EN' ? 'Cleaning Workflow:' : 'Daloy ng Paglilinis:';
  const workflowItems =
    howToGuideLang === 'EN'
      ? [
          { icon: 'user-x', lead: 'Unassigned -> Assigned', text: 'Assign a cleaner to the task after guest check-out' },
          { icon: 'user-check', lead: 'Assigned -> In Progress', text: 'Cleaner starts the cleaning process' },
          { icon: 'loader', lead: 'In Progress -> Completed', text: 'Cleaner finishes and marks task as done' },
          { icon: 'check-circle', lead: 'Completed -> Ready', text: 'Room is verified and ready for next guest' },
        ]
      : [
          { icon: 'user-x', lead: 'Unassigned -> Assigned', text: 'Magtalaga ng cleaner sa task pagkatapos ng guest check-out' },
          { icon: 'user-check', lead: 'Assigned -> In Progress', text: 'Sinisimulan ng cleaner ang proseso ng paglilinis' },
          { icon: 'loader', lead: 'In Progress -> Completed', text: 'Tinatapos ng cleaner at minamarkahang done ang task' },
          { icon: 'check-circle', lead: 'Completed -> Ready', text: 'Naberipika ang room at handa na para sa susunod na guest' },
        ];

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <AdminTopBar title="Cleaning Management" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>Cleaning Management</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Assign and track post check-out cleaning tasks
          </Text>
        </View>

        <View style={styles.guideRow}>
          <View style={[styles.guideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setStatusGuideOpen((prev) => !prev)}>
                <Feather name={statusGuideOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
                <Text style={[styles.guideTitle, { color: theme.text }]}>Cleaning Status Guide</Text>
              </TouchableOpacity>
              <View style={styles.langToggleRow}>
                <TouchableOpacity
                  style={[styles.langToggleBtn, statusGuideLang === 'EN' ? styles.langToggleBtnActive : styles.langToggleBtnMuted]}
                  onPress={() => setStatusGuideLang('EN')}
                >
                  <Text style={statusGuideLang === 'EN' ? styles.langToggleTextActive : styles.langToggleTextMuted}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langToggleBtn, statusGuideLang === 'FIL' ? styles.langToggleBtnActive : styles.langToggleBtnMuted]}
                  onPress={() => setStatusGuideLang('FIL')}
                >
                  <Text style={statusGuideLang === 'FIL' ? styles.langToggleTextActive : styles.langToggleTextMuted}>FIL</Text>
                </TouchableOpacity>
              </View>
            </View>
            {statusGuideOpen && (
              <View style={styles.guideList}>
                {statusGuideItems.map((item) => (
                  <View key={item.title} style={styles.guideListItem}>
                    <Text style={[styles.guideItemTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.guideItemText, { color: theme.muted }]}>{item.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View style={[styles.guideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setHowToGuideOpen((prev) => !prev)}>
                <Feather name={howToGuideOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
                <Text style={[styles.guideTitle, { color: theme.text }]}>How to Manage Cleaning Tasks</Text>
              </TouchableOpacity>
              <View style={styles.langToggleRow}>
                <TouchableOpacity
                  style={[styles.langToggleBtn, howToGuideLang === 'EN' ? styles.langToggleBtnActive : styles.langToggleBtnMuted]}
                  onPress={() => setHowToGuideLang('EN')}
                >
                  <Text style={howToGuideLang === 'EN' ? styles.langToggleTextActive : styles.langToggleTextMuted}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langToggleBtn, howToGuideLang === 'FIL' ? styles.langToggleBtnActive : styles.langToggleBtnMuted]}
                  onPress={() => setHowToGuideLang('FIL')}
                >
                  <Text style={howToGuideLang === 'FIL' ? styles.langToggleTextActive : styles.langToggleTextMuted}>FIL</Text>
                </TouchableOpacity>
              </View>
            </View>
            {howToGuideOpen && (
              <>
                <View style={styles.guideList}>
                  {howToItems.map((item, idx) => (
                    <View key={item.title} style={styles.stepItem}>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.stepBody}>
                        <Text style={[styles.guideItemTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.guideItemText, { color: theme.muted }]}>{item.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={[styles.workflowBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Text style={[styles.workflowTitle, { color: theme.text }]}>{workflowTitle}</Text>
                  {workflowItems.map((item) => (
                    <View key={item.lead} style={styles.workflowLine}>
                      <Feather name={item.icon as any} size={13} color={theme.muted} style={styles.workflowIcon} />
                      <Text style={[styles.workflowText, { color: theme.muted }]}>
                        <Text style={[styles.workflowLead, { color: theme.text }]}>{item.lead}: </Text>
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.metricTitle}>Total Tasks</Text>
            <Text style={styles.metricValue}>{metrics.total}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.metricTitle}>Unassigned</Text>
            <Text style={styles.metricValue}>{metrics.unassigned}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#64748B' }]}>
            <Text style={styles.metricTitle}>Assigned</Text>
            <Text style={styles.metricValue}>{metrics.assigned}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.metricTitle}>In Progress</Text>
            <Text style={styles.metricValue}>{metrics.inProgress}</Text>
          </View>
          <View style={[styles.metricCardFull, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.metricTitle}>Completed</Text>
            <Text style={styles.metricValue}>{metrics.completed}</Text>
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
                  setDateOpen(false);
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
                  setDateOpen(false);
                  setStatusOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{statusFilter}</Text>
                <Feather name={statusOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {statusOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {STATUS_OPTIONS.map((opt) => (
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
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Date</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setShowOpen(false);
                  setStatusOpen(false);
                  setDateOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{dateFilter}</Text>
                <Feather name={dateOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {dateOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {DATE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDateFilter(opt);
                        setPage(1);
                        setDateOpen(false);
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
              placeholder="Search by booking ID, guest, haven, or cleaner..."
              placeholderTextColor={theme.muted}
            />
          </View>
        </View>

        <View style={[styles.tableCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('booking')}>
                  <Text style={[styles.headerCell, { color: theme.muted }]}>Booking ID</Text>
                  <Feather name={sortIcon('booking')} size={12} color={theme.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortHeaderCellWide} onPress={() => toggleSort('havenGuest')}>
                  <Text style={[styles.headerCellWide, { color: theme.muted }]}>Haven & Guest</Text>
                  <Feather name={sortIcon('havenGuest')} size={12} color={theme.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortHeaderCellWide} onPress={() => toggleSort('dates')}>
                  <Text style={[styles.headerCellWide, { color: theme.muted }]}>Check-in / Check-out</Text>
                  <Feather name={sortIcon('dates')} size={12} color={theme.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('cleaner')}>
                  <Text style={[styles.headerCell, { color: theme.muted }]}>Assigned Cleaner</Text>
                  <Feather name={sortIcon('cleaner')} size={12} color={theme.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('status')}>
                  <Text style={[styles.headerCell, { color: theme.muted }]}>Status</Text>
                  <Feather name={sortIcon('status')} size={12} color={theme.muted} />
                </TouchableOpacity>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Actions</Text>
              </View>

              {loading ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator size="small" color={Colors.brand.primary} />
                  <Text style={[styles.stateText, { color: theme.muted }]}>Loading cleaning tasks...</Text>
                </View>
              ) : paginated.length === 0 ? (
                <View style={styles.stateWrap}>
                  <Feather name="sun" size={24} color={theme.muted} />
                  <Text style={[styles.stateText, { color: theme.muted }]}>No cleaning tasks found</Text>
                </View>
              ) : (
                paginated.map((task) => (
                  <View key={task.id} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{task.booking_id}</Text>
                    <View style={styles.rowCellWide}>
                      <Text style={[styles.rowPrimary, { color: theme.text }]} numberOfLines={1}>{task.haven_name}</Text>
                      <Text style={[styles.rowSecondary, { color: theme.muted }]} numberOfLines={1}>{task.guest_name}</Text>
                    </View>
                    <View style={styles.rowCellWide}>
                      <Text style={[styles.rowPrimary, { color: theme.text }]}>{formatDate(task.check_in)}</Text>
                      <Text style={[styles.rowSecondary, { color: theme.muted }]}>{formatDate(task.check_out)}</Text>
                    </View>
                    <Text style={[styles.rowCell, { color: theme.text }]} numberOfLines={1}>{task.assigned_cleaner}</Text>
                    <Text style={[styles.rowCell, { color: theme.text }]}>{task.status}</Text>
                    <View style={styles.actionCell}>
                      <TouchableOpacity style={styles.editButton}>
                        <Feather name="edit-2" size={14} color={Colors.white} />
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

        <View style={styles.legalWrap}>
          <Text style={[styles.legalText, { color: theme.muted }]}>(c) 2026 Staycation Haven. All rights reserved.</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.muted }]}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.muted }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.muted }]}>Terms of Service</Text>
            </TouchableOpacity>
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
  guideRow: {
    gap: 10,
  },
  guideCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  guideTitle: {
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  langToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  langToggleBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langToggleBtnActive: {
    backgroundColor: Colors.brand.primary,
  },
  langToggleBtnMuted: {
    backgroundColor: '#E2E8F0',
  },
  langToggleTextActive: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  langToggleTextMuted: {
    color: Colors.gray[700],
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  guideList: {
    gap: 8,
  },
  guideListItem: {
    gap: 2,
  },
  guideItemTitle: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  guideItemText: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    lineHeight: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  workflowBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  workflowTitle: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  workflowText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.inter,
    lineHeight: 16,
  },
  workflowLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  workflowIcon: {
    marginTop: 1,
  },
  workflowLead: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
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
  metricCardFull: {
    width: '100%',
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
    minWidth: 960,
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
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortHeaderCellWide: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableRow: {
    minWidth: 960,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  rowCell: {
    width: 140,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  rowCellWide: {
    width: 220,
  },
  rowPrimary: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  rowSecondary: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: Fonts.inter,
  },
  actionCell: {
    width: 140,
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
  stateWrap: {
    minHeight: 140,
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
  legalWrap: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  legalText: {
    fontSize: 11,
    fontFamily: Fonts.inter,
  },
  legalLinks: {
    flexDirection: 'row',
    gap: 14,
  },
  linkText: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    textDecorationLine: 'underline',
  },
});
