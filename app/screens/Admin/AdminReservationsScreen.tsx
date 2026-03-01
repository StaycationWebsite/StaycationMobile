import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors, Fonts } from '../../../constants/Styles';
import { API_CONFIG } from '../../../constants/config';
import AdminTopBar from '../../components/AdminTopBar';
import { useTheme } from '../../../hooks/useTheme';

type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'rejected'
  | 'cancelled';
type SortDirection = 'asc' | 'desc';
type ReservationSortKey = 'booking' | 'guest' | 'dates' | 'status';

interface Reservation {
  id: string | number;
  booking_id?: string;
  guest_name?: string;
  haven_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  status?: string;
}

const STATUS_KEYS: ReservationStatus[] = [
  'pending',
  'approved',
  'confirmed',
  'checked_in',
  'completed',
  'rejected',
  'cancelled',
];

const STATUS_META: Record<
  ReservationStatus,
  { label: string; color: string; icon: keyof typeof Feather.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap; iconSet: 'feather' | 'material' }
> = {
  pending: { label: 'Pending', color: '#FBBF24', icon: 'clock', iconSet: 'feather' },
  approved: { label: 'Approved', color: '#22C55E', icon: 'check-circle', iconSet: 'feather' },
  confirmed: { label: 'Confirmed', color: '#16A34A', icon: 'calendar-check', iconSet: 'material' },
  checked_in: { label: 'Checked In', color: '#3B82F6', icon: 'map-pin', iconSet: 'feather' },
  completed: { label: 'Completed', color: '#64748B', icon: 'check-all', iconSet: 'material' },
  rejected: { label: 'Rejected', color: '#EF4444', icon: 'x-circle', iconSet: 'feather' },
  cancelled: { label: 'Cancelled', color: '#B91C1C', icon: 'x-octagon', iconSet: 'feather' },
};

const SHOW_OPTIONS = [10, 25, 50] as const;

function normalizeStatus(raw?: string): ReservationStatus | null {
  const value = (raw || '').trim().toLowerCase().replace(/\s+/g, '_');
  if (value === 'checked-in') return 'checked_in';
  if (STATUS_KEYS.includes(value as ReservationStatus)) return value as ReservationStatus;
  return null;
}

function formatDate(date?: string): string {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminReservationsScreen() {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const theme = {
    page: isDark ? '#0F172A' : '#F8FAFC',
    surface: isDark ? '#111827' : Colors.white,
    border: isDark ? '#1F2937' : Colors.gray[200],
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#9CA3AF' : Colors.gray[600],
    input: isDark ? '#1F2937' : Colors.gray[50],
  };

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState<(typeof SHOW_OPTIONS)[number]>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ReservationStatus>('All');
  const [showOpen, setShowOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortBy, setSortBy] = useState<ReservationSortKey>('booking');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  React.useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_CONFIG.RESERVATIONS_API);
        const contentType = response.headers.get('content-type') || '';
        const raw = await response.text();

        if (!response.ok) {
          console.warn(`Reservations request failed (${response.status})`);
          setReservations([]);
          return;
        }

        if (!contentType.toLowerCase().includes('application/json')) {
          console.warn('Reservations API returned non-JSON response');
          setReservations([]);
          return;
        }

        const data = raw ? JSON.parse(raw) : null;
        if (Array.isArray(data?.data)) {
          setReservations(data.data);
        } else if (Array.isArray(data?.bookings)) {
          setReservations(data.bookings);
        } else if (Array.isArray(data)) {
          setReservations(data);
        } else {
          setReservations([]);
        }
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const counts = useMemo(() => {
    return reservations.reduce<Record<ReservationStatus, number>>(
      (acc, item) => {
        const normalized = normalizeStatus(item.status);
        if (normalized) acc[normalized] += 1;
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        confirmed: 0,
        checked_in: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
      }
    );
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = reservations.filter((item) => {
      const normalizedStatus = normalizeStatus(item.status);
      const statusMatch = categoryFilter === 'All' ? true : normalizedStatus === categoryFilter;
      if (!statusMatch) return false;

      if (!query) return true;
      const bookingId = String(item.booking_id || '').toLowerCase();
      const guestName = String(item.guest_name || '').toLowerCase();
      return bookingId.includes(query) || guestName.includes(query);
    });

    return filtered;
  }, [reservations, searchTerm, categoryFilter, showCount]);

  const sortedReservations = useMemo(() => {
    const list = [...filteredReservations];
    list.sort((a, b) => {
      const aStatus = normalizeStatus(a.status);
      const bStatus = normalizeStatus(b.status);
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortBy) {
        case 'booking':
          aVal = String(a.booking_id || '');
          bVal = String(b.booking_id || '');
          break;
        case 'guest':
          aVal = String(a.guest_name || '');
          bVal = String(b.guest_name || '');
          break;
        case 'dates':
          aVal = new Date(a.check_in_date || 0).getTime();
          bVal = new Date(b.check_in_date || 0).getTime();
          break;
        case 'status':
          aVal = String(aStatus || '');
          bVal = String(bStatus || '');
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
  }, [filteredReservations, sortBy, sortDir]);

  const pagedReservations = useMemo(() => sortedReservations.slice(0, showCount), [sortedReservations, showCount]);

  const toggleSort = (key: ReservationSortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('asc');
  };

  const sortIcon = (key: ReservationSortKey) => {
    if (sortBy !== key) return 'chevrons-up';
    return sortDir === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <AdminTopBar title="Reservations" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.heading, { color: theme.text }]}>Reservations</Text>
          <TouchableOpacity style={styles.newButton}>
            <Text style={styles.newButtonText}>+ New Reservation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>
          {STATUS_KEYS.map((key) => {
            const meta = STATUS_META[key];
            const iconColor = 'rgba(255,255,255,0.28)';
            return (
              <View key={key} style={[styles.statusCard, { backgroundColor: meta.color }]}>
                <Text style={styles.statusLabel}>{meta.label}</Text>
                <Text style={styles.statusCount}>{counts[key]}</Text>
                <View style={styles.statusIconWrap}>
                  {meta.iconSet === 'feather' ? (
                    <Feather name={meta.icon as keyof typeof Feather.glyphMap} size={30} color={iconColor} />
                  ) : (
                    <MaterialCommunityIcons
                      name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={32}
                      color={iconColor}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.searchControls}>
            <View style={styles.dropdownWrap}>
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Show</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setCategoryOpen(false);
                  setShowOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{showCount}</Text>
                <Feather name={showOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {showOpen && (
                <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {SHOW_OPTIONS.map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={styles.menuItem}
                      onPress={() => {
                        setShowCount(count);
                        setShowOpen(false);
                      }}
                    >
                      <Text style={[styles.menuItemText, { color: theme.text }]}>{count}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.searchInputWrap, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Feather name="search" size={16} color={theme.muted} />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search by booking ID or guest name..."
                placeholderTextColor={theme.muted}
              />
            </View>

            <View style={styles.dropdownWrap}>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setShowOpen(false);
                  setCategoryOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>
                  {categoryFilter === 'All' ? 'Category' : STATUS_META[categoryFilter].label}
                </Text>
                <Feather name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {categoryOpen && (
                <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setCategoryFilter('All');
                      setCategoryOpen(false);
                    }}
                  >
                    <Text style={[styles.menuItemText, { color: theme.text }]}>All</Text>
                  </TouchableOpacity>
                  {STATUS_KEYS.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={styles.menuItem}
                      onPress={() => {
                        setCategoryFilter(status);
                        setCategoryOpen(false);
                      }}
                    >
                      <Text style={[styles.menuItemText, { color: theme.text }]}>{STATUS_META[status].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('booking')}>
              <Text style={[styles.tableHeaderText, { color: theme.muted }]}>Booking ID</Text>
              <Feather name={sortIcon('booking')} size={12} color={theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('guest')}>
              <Text style={[styles.tableHeaderText, { color: theme.muted }]}>Guest</Text>
              <Feather name={sortIcon('guest')} size={12} color={theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('dates')}>
              <Text style={[styles.tableHeaderText, { color: theme.muted }]}>Stay Dates</Text>
              <Feather name={sortIcon('dates')} size={12} color={theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortHeaderCell} onPress={() => toggleSort('status')}>
              <Text style={[styles.tableHeaderText, { color: theme.muted }]}>Status</Text>
              <Feather name={sortIcon('status')} size={12} color={theme.muted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="small" color={Colors.brand.primary} />
              <Text style={[styles.stateText, { color: theme.muted }]}>Loading reservations...</Text>
            </View>
          ) : pagedReservations.length === 0 ? (
            <View style={styles.centerState}>
              <Feather name="inbox" size={20} color={theme.muted} />
              <Text style={[styles.stateText, { color: theme.muted }]}>No current reservation</Text>
            </View>
          ) : (
            pagedReservations.map((item) => {
              const normalized = normalizeStatus(item.status);
              const statusMeta = normalized ? STATUS_META[normalized] : null;
              return (
                <View key={String(item.id)} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.cellText, { color: theme.text }]}>{item.booking_id || '-'}</Text>
                  <Text style={[styles.cellText, { color: theme.text }]}>{item.guest_name || '-'}</Text>
                  <Text style={[styles.cellText, { color: theme.text }]}>
                    {formatDate(item.check_in_date)} - {formatDate(item.check_out_date)}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusMeta ? `${statusMeta.color}22` : '#E5E7EB' },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: statusMeta ? statusMeta.color : Colors.gray[700] }]}>
                      {statusMeta ? statusMeta.label : item.status || 'Unknown'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  newButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  newButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  statusCard: {
    width: '48%',
    minHeight: 112,
    borderRadius: 16,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 5,
  },
  statusLabel: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  statusCount: {
    color: Colors.white,
    fontSize: 34,
    fontFamily: Fonts.poppins,
    fontWeight: '700',
    marginTop: 8,
  },
  statusIconWrap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  searchBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  searchControls: {
    gap: 10,
    marginBottom: 12,
  },
  dropdownWrap: {
    position: 'relative',
    zIndex: 20,
  },
  controlLabel: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    marginBottom: 6,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  menu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  searchInputWrap: {
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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  sortHeaderCell: {
    width: '24%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  cellText: {
    width: '24%',
    fontSize: 11,
    fontFamily: Fonts.inter,
  },
  statusPill: {
    width: '24%',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  centerState: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
});
