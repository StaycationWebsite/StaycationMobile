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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors, Fonts } from '../../../constants/Styles';
import { API_CONFIG } from '../../../constants/config';
import { useTheme } from '../../../hooks/useTheme';
import AdminTopBar from '../../components/AdminTopBar';

interface Haven {
  uuid_id: string;
  haven_name: string;
  tower: string;
  floor: string;
  view?: string;
  weekday_rate: string;
  weekend_rate?: string;
  six_hour_rate?: string;
  ten_hour_rate?: string;
  status?: string;
}

type StatusFilter = 'All Status' | 'Available' | 'Unavailable';

const SHOW_OPTIONS = [8, 16, 24] as const;

function toPeso(value: number): string {
  return `PHP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseRate(value?: string): number {
  const parsed = Number.parseFloat(value || '0');
  return Number.isNaN(parsed) ? 0 : parsed;
}

function deriveRates(item: Haven) {
  const weekday = parseRate(item.weekday_rate);
  const sixHour = item.six_hour_rate ? parseRate(item.six_hour_rate) : Math.max(0, Math.round(weekday * 0.71));
  const tenHour = item.ten_hour_rate ? parseRate(item.ten_hour_rate) : Math.max(0, Math.round(weekday * 0.76));
  const weekend = item.weekend_rate ? parseRate(item.weekend_rate) : Math.max(0, Math.round(weekday * 1.33));
  return { sixHour, tenHour, weekday, weekend };
}

function normalizeStatus(item: Haven): 'Available' | 'Unavailable' {
  const status = String(item.status || '').toLowerCase();
  if (status === 'unavailable' || status === 'inactive' || status === 'blocked') return 'Unavailable';
  return 'Available';
}

export default function HavenScreen() {
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

  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState<(typeof SHOW_OPTIONS)[number]>(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Status');
  const [showOpen, setShowOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHavens = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_CONFIG.HAVEN_API);
        const data = await response.json();
        if (Array.isArray(data?.data)) {
          setHavens(data.data);
        } else {
          setHavens([]);
        }
      } catch (error) {
        console.error('Error fetching havens:', error);
        setHavens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHavens();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return havens.filter((item) => {
      const status = normalizeStatus(item);
      const statusMatch = statusFilter === 'All Status' ? true : statusFilter === status;
      if (!statusMatch) return false;

      if (!query) return true;
      const name = String(item.haven_name || '').toLowerCase();
      const tower = String(item.tower || '').toLowerCase();
      const view = String(item.view || '').toLowerCase();
      return name.includes(query) || tower.includes(query) || view.includes(query);
    });
  }, [havens, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / showCount));
  const currentPage = Math.min(page, totalPages);
  const startIndex = filtered.length === 0 ? 0 : (currentPage - 1) * showCount + 1;
  const endIndex = Math.min(currentPage * showCount, filtered.length);
  const paginated = filtered.slice((currentPage - 1) * showCount, currentPage * showCount);

  const onChangeShowCount = (value: (typeof SHOW_OPTIONS)[number]) => {
    setShowCount(value);
    setPage(1);
    setShowOpen(false);
  };

  const onChangeStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    setStatusOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}> 
      <AdminTopBar title="Haven Management" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.heroTopRow}>
            <Text style={[styles.heading, { color: theme.text }]}>All Haven Units</Text>
            <TouchableOpacity style={styles.addButton}>
              <Feather name="plus" size={16} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Haven</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Manage your property units, rates, and availability.</Text>
        </View>

        <View style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.controlsTopRow}>
            <View style={styles.dropdownWrap}>
              <Text style={[styles.controlLabel, { color: theme.muted }]}>Show entries</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.input }]}
                onPress={() => {
                  setStatusOpen(false);
                  setShowOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownText, { color: theme.text }]}>{showCount}</Text>
                <Feather name={showOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {showOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
                  {SHOW_OPTIONS.map((option) => (
                    <TouchableOpacity key={option} style={styles.dropdownItem} onPress={() => onChangeShowCount(option)}>
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option}</Text>
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
                  setStatusOpen((prev) => !prev);
                }}
              >
                <View style={styles.statusFilterLabelWrap}>
                  <Feather name="filter" size={13} color={theme.muted} />
                  <Text style={[styles.dropdownText, { color: theme.text }]}>{statusFilter}</Text>
                </View>
                <Feather name={statusOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
              </TouchableOpacity>
              {statusOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
                  {(['All Status', 'Available', 'Unavailable'] as StatusFilter[]).map((option) => (
                    <TouchableOpacity key={option} style={styles.dropdownItem} onPress={() => onChangeStatus(option)}>
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option}</Text>
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
              placeholder="Search by haven name, tower, or view..."
              placeholderTextColor={theme.muted}
            />
          </View>
        </View>

        <View style={[styles.tableCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Floor</Text>
                <Text style={[styles.headerCell, { color: theme.muted }]}>View</Text>
                <View style={styles.headerSortCell}><Text style={[styles.headerCell, { color: theme.muted }]}>6H Rate</Text><Feather name="chevrons-up" size={12} color={theme.muted} /></View>
                <View style={styles.headerSortCell}><Text style={[styles.headerCell, { color: theme.muted }]}>10H Rate</Text><Feather name="chevrons-up" size={12} color={theme.muted} /></View>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Weekday</Text>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Weekend</Text>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Status</Text>
                <Text style={[styles.headerCell, { color: theme.muted }]}>Actions</Text>
              </View>

              {loading ? (
                <View style={styles.stateWrap}>
                  <ActivityIndicator size="small" color={Colors.brand.primary} />
                  <Text style={[styles.stateText, { color: theme.muted }]}>Loading units...</Text>
                </View>
              ) : paginated.length === 0 ? (
                <View style={styles.stateWrap}>
                  <MaterialCommunityIcons name="home-city-outline" size={44} color="#CBD5E1" />
                  <Text style={[styles.stateText, { color: theme.muted }]}>No haven units found</Text>
                </View>
              ) : (
                paginated.map((item) => {
                  const rates = deriveRates(item);
                  const status = normalizeStatus(item);
                  return (
                    <View key={item.uuid_id} style={[styles.tableRow, { borderBottomColor: theme.border }]}> 
                      <View style={styles.floorCellWrap}>
                        <Text style={[styles.floorText, { color: theme.text }]}>{item.floor || '-'}</Text>
                        <View style={styles.unitMetaRow}>
                          <MaterialCommunityIcons name="home-city" size={13} color={Colors.brand.primary} />
                          <Text style={[styles.unitNameText, { color: theme.text }]}>{item.haven_name}</Text>
                        </View>
                        <Text style={[styles.unitSubText, { color: theme.muted }]}>{item.tower}</Text>
                      </View>

                      <Text style={[styles.rowCell, { color: theme.text }]}>{item.view || 'Pool'}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{toPeso(rates.sixHour)}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{toPeso(rates.tenHour)}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{toPeso(rates.weekday)}</Text>
                      <Text style={[styles.rowCell, { color: theme.text }]}>{toPeso(rates.weekend)}</Text>

                      <View style={styles.rowCell}>
                        <View style={[styles.statusPill, status === 'Available' ? styles.statusAvailable : styles.statusUnavailable]}>
                          <Text style={styles.statusPillText}>{status}</Text>
                        </View>
                      </View>

                      <View style={styles.actionCell}>
                        <TouchableOpacity style={styles.editButton}>
                          <Feather name="edit-2" size={14} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton}>
                          <Feather name="trash-2" size={14} color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.muted }]}>
              Showing {startIndex} to {endIndex} of {filtered.length} entries
            </Text>

            <View style={styles.paginationWrap}>
              <TouchableOpacity
                style={[styles.pageIconBtn, currentPage === 1 && styles.pageIconBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => setPage(1)}
              >
                <Feather name="chevrons-left" size={14} color={currentPage === 1 ? '#94A3B8' : Colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pageIconBtn, currentPage === 1 && styles.pageIconBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Feather name="chevron-left" size={14} color={currentPage === 1 ? '#94A3B8' : Colors.gray[700]} />
              </TouchableOpacity>

              <View style={styles.pageActive}><Text style={styles.pageActiveText}>{currentPage}</Text></View>

              <TouchableOpacity
                style={[styles.pageIconBtn, currentPage === totalPages && styles.pageIconBtnDisabled]}
                disabled={currentPage === totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <Feather name="chevron-right" size={14} color={currentPage === totalPages ? '#94A3B8' : Colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pageIconBtn, currentPage === totalPages && styles.pageIconBtnDisabled]}
                disabled={currentPage === totalPages}
                onPress={() => setPage(totalPages)}
              >
                <Feather name="chevrons-right" size={14} color={currentPage === totalPages ? '#94A3B8' : Colors.gray[700]} />
              </TouchableOpacity>
            </View>
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
    paddingBottom: 30,
    gap: 12,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  controlCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    zIndex: 100,
  },
  controlsTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlLabel: {
    fontSize: 11,
    fontFamily: Fonts.inter,
    marginBottom: 4,
  },
  dropdownWrap: {
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
  statusFilterLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    minWidth: 980,
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerCell: {
    width: 110,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  headerSortCell: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableRow: {
    minWidth: 980,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  floorCellWrap: {
    width: 220,
    paddingRight: 8,
  },
  floorText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  unitMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitNameText: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  unitSubText: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.inter,
  },
  rowCell: {
    width: 110,
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.inter,
    color: '#166534',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pageIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIconBtnDisabled: {
    opacity: 0.55,
  },
  pageActive: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActiveText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
});
