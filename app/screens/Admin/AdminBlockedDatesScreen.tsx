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

type StatusFilter = 'All Status' | 'Active' | 'Expired';

interface HavenOption {
  id: string;
  name: string;
}

interface BlockedDate {
  id: string | number;
  haven_id?: string | number;
  haven_name?: string;
  from_date?: string;
  to_date?: string;
  reason?: string;
}

function parseSafeJson(raw: string): any | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(toDate?: string): boolean {
  if (!toDate) return false;
  const end = new Date(toDate);
  if (Number.isNaN(end.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < now;
}

function getStatus(item: BlockedDate): 'Active' | 'Expired' {
  return isExpired(item.to_date) ? 'Expired' : 'Active';
}

const PAGE_SIZE = 8;

export default function AdminBlockedDatesScreen() {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const theme = {
    page: isDark ? '#0B1220' : '#F2F5FA',
    surface: isDark ? '#111827' : Colors.white,
    border: isDark ? '#253247' : '#E2E8F0',
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#94A3B8' : Colors.gray[600],
    input: isDark ? '#1F2937' : Colors.gray[50],
  };

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [havens, setHavens] = useState<HavenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHaven, setSelectedHaven] = useState('All Havens');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All Status');
  const [havenOpen, setHavenOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [blockedResponse, havensResponse] = await Promise.all([
          fetch(API_CONFIG.BLOCKED_DATES_API),
          fetch(API_CONFIG.HAVEN_API),
        ]);

        const blockedText = await blockedResponse.text();
        const havensText = await havensResponse.text();

        const blockedData =
          blockedResponse.ok && (blockedResponse.headers.get('content-type') || '').includes('application/json')
            ? parseSafeJson(blockedText)
            : null;

        const havensData =
          havensResponse.ok && (havensResponse.headers.get('content-type') || '').includes('application/json')
            ? parseSafeJson(havensText)
            : null;

        const blockedArray = Array.isArray(blockedData?.data)
          ? blockedData.data
          : Array.isArray(blockedData?.blocked_dates)
            ? blockedData.blocked_dates
            : Array.isArray(blockedData)
              ? blockedData
              : [];
        setBlockedDates(blockedArray);

        const havenArray = Array.isArray(havensData?.data)
          ? havensData.data
          : Array.isArray(havensData)
            ? havensData
            : [];
        setHavens(
          havenArray.map((item: any) => ({
            id: String(item.uuid_id || item.id || item.haven_id || ''),
            name: String(item.haven_name || item.name || item.title || 'Unknown Haven'),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch blocked dates:', error);
        setBlockedDates([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics = useMemo(() => {
    const totalBlocked = blockedDates.length;
    const active = blockedDates.filter((item) => !isExpired(item.to_date)).length;
    const expired = blockedDates.filter((item) => isExpired(item.to_date)).length;
    const uniqueHavens = new Set(
      blockedDates
        .map((item) => String(item.haven_id || item.haven_name || '').trim())
        .filter((value) => value.length > 0)
    ).size;
    return { totalBlocked, active, expired, uniqueHavens };
  }, [blockedDates]);

  const havenOptions = useMemo(() => ['All Havens', ...havens.map((h) => h.name)], [havens]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = blockedDates.filter((item) => {
      const havenName = String(item.haven_name || '').trim();
      const status = getStatus(item);

      const havenMatch = selectedHaven === 'All Havens' ? true : havenName === selectedHaven;
      const statusMatch = selectedStatus === 'All Status' ? true : selectedStatus === status;
      const queryMatch =
        !query ||
        havenName.toLowerCase().includes(query) ||
        String(item.reason || '').toLowerCase().includes(query);

      return havenMatch && statusMatch && queryMatch;
    });

    return list;
  }, [blockedDates, search, selectedHaven, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onSelectHaven = (value: string) => {
    setSelectedHaven(value);
    setHavenOpen(false);
    setPage(1);
  };

  const onSelectStatus = (value: StatusFilter) => {
    setSelectedStatus(value);
    setStatusOpen(false);
    setPage(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <AdminTopBar title="Blocked Dates" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="calendar-remove-outline" size={22} color={Colors.brand.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heading, { color: theme.text }]}>Blocked Dates Management</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>Control unavailable date ranges across all havens.</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.metricTitle}>Total Blocked</Text>
            <Text style={styles.metricValue}>{metrics.totalBlocked}</Text>
            <Feather name="calendar" size={24} color="rgba(255,255,255,0.32)" style={styles.metricIcon} />
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.metricTitle}>Active</Text>
            <Text style={styles.metricValue}>{metrics.active}</Text>
            <Feather name="clock" size={24} color="rgba(255,255,255,0.32)" style={styles.metricIcon} />
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.metricTitle}>Expired</Text>
            <Text style={styles.metricValue}>{metrics.expired}</Text>
            <Feather name="check-circle" size={24} color="rgba(255,255,255,0.32)" style={styles.metricIcon} />
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.metricTitle}>Havens Affected</Text>
            <Text style={styles.metricValue}>{metrics.uniqueHavens}</Text>
            <MaterialCommunityIcons name="office-building" size={24} color="rgba(255,255,255,0.32)" style={styles.metricIcon} />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={16} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Blocked Date</Text>
        </TouchableOpacity>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.searchWrap, { backgroundColor: theme.input, borderColor: theme.border }]}> 
            <Feather name="search" size={16} color={theme.muted} />
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by haven or reason..."
              placeholderTextColor={theme.muted}
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.dropdownWrap}>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: theme.input, borderColor: theme.border }]}
                onPress={() => {
                  setStatusOpen(false);
                  setHavenOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]} numberOfLines={1}>{selectedHaven}</Text>
                <Feather name={havenOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {havenOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {havenOptions.map((option) => (
                    <TouchableOpacity key={option} style={styles.dropdownItem} onPress={() => onSelectHaven(option)}>
                      <Text style={[styles.dropdownItemText, { color: theme.text }]} numberOfLines={1}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.dropdownWrap}>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: theme.input, borderColor: theme.border }]}
                onPress={() => {
                  setHavenOpen(false);
                  setStatusOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{selectedStatus}</Text>
                <Feather name={statusOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {statusOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
                  {(['All Status', 'Active', 'Expired'] as StatusFilter[]).map((option) => (
                    <TouchableOpacity key={option} style={styles.dropdownItem} onPress={() => onSelectStatus(option)}>
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerCell, { color: theme.muted }]}>Haven</Text>
            <Text style={[styles.headerCell, { color: theme.muted }]}>From</Text>
            <Text style={[styles.headerCell, { color: theme.muted }]}>To</Text>
            <Text style={[styles.headerCell, { color: theme.muted }]}>Status</Text>
            <Text style={[styles.headerCellWide, { color: theme.muted }]}>Reason</Text>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={Colors.brand.primary} />
              <Text style={[styles.emptyText, { color: theme.muted }]}>Loading blocked dates...</Text>
            </View>
          ) : paginated.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={60} color="#CBD5E1" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No blocked dates</Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>Create your first blocked range to prevent bookings.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {paginated.map((item) => {
                  const status = getStatus(item);
                  return (
                    <View key={String(item.id)} style={[styles.tableRow, { borderBottomColor: theme.border }]}> 
                      <Text style={[styles.rowCell, { color: theme.text }]}>{item.haven_name || '-'}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{formatDate(item.from_date)}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{formatDate(item.to_date)}</Text>
                      <View style={[styles.statusPill, status === 'Expired' ? styles.statusExpired : styles.statusActive]}>
                        <Text style={styles.statusPillText}>{status}</Text>
                      </View>
                      <Text style={[styles.rowCellWide, { color: theme.text }]} numberOfLines={1}>{item.reason || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              disabled={currentPage === 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Feather name="chevron-left" size={14} color={currentPage === 1 ? '#94A3B8' : Colors.gray[700]} />
            </TouchableOpacity>
            <View style={styles.pageActive}>
              <Text style={styles.pageActiveText}>{currentPage}</Text>
            </View>
            <Text style={[styles.pageInfo, { color: theme.muted }]}>of {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              disabled={currentPage === totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <Feather name="chevron-right" size={14} color={currentPage === totalPages ? '#94A3B8' : Colors.gray[700]} />
            </TouchableOpacity>
          </View>
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
    paddingBottom: 28,
    gap: 12,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontFamily: Fonts.poppins,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  metricTitle: {
    color: Colors.white,
    fontSize: 13,
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
  metricIcon: {
    position: 'absolute',
    right: 14,
    bottom: 14,
  },
  addButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.poppins,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  searchWrap: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
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
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    zIndex: 30,
  },
  dropdownWrap: {
    flex: 1,
    position: 'relative',
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
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
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
  tableHeader: {
    marginTop: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 640,
  },
  headerCell: {
    width: 100,
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  headerCellWide: {
    width: 240,
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  tableRow: {
    borderBottomWidth: 1,
    minWidth: 640,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowCell: {
    width: 100,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  rowCellWide: {
    width: 240,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  statusPill: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 6,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusExpired: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
    color: '#334155',
  },
  emptyState: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.poppins,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  paginationRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageActive: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActiveText: {
    color: Colors.white,
    fontFamily: Fonts.inter,
    fontWeight: '700',
    fontSize: 12,
  },
  pageInfo: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
});
