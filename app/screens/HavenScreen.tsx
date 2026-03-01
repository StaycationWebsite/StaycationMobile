import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Fonts } from '../../constants/Styles';
import { API_CONFIG } from '../../constants/config';
import { useRoomDiscounts } from '../../hooks/useRoomDiscounts';
import { useTheme } from '../../hooks/useTheme';
import AdminTopBar from '../components/AdminTopBar';
import ImageCarouselModal from '../components/ImageCarouselModal';

interface HavenImage {
  id: number;
  image_url: string;
  display_order: number;
}

interface Haven {
  uuid_id: string;
  haven_name: string;
  tower: string;
  floor: string;
  rating?: string;
  weekday_rate: string;
  capacity?: number;
  beds?: string;
  room_size?: string;
  images?: HavenImage[];
}

type SortOption = 'Recently Added' | 'Price: Low to High' | 'Price: High to Low' | 'Rating' | 'Capacity';

const SORT_OPTIONS: SortOption[] = [
  'Recently Added',
  'Price: Low to High',
  'Price: High to Low',
  'Rating',
  'Capacity',
];

const HavenCard = ({
  item,
  theme,
  onPreview,
}: {
  item: Haven;
  theme: { card: string; border: string; text: string; muted: string; chipBg: string };
  onPreview: (images: HavenImage[] | undefined) => void;
}) => {
  const navigation = useNavigation<any>();
  const { calculateBestDiscount } = useRoomDiscounts(item.uuid_id);

  const basePrice = parseFloat(item.weekday_rate || '0');
  const bestDiscount = useMemo(() => calculateBestDiscount(basePrice), [basePrice, calculateBestDiscount]);
  const displayPrice = bestDiscount ? Math.floor(bestDiscount.discountedPrice) : Math.floor(basePrice);
  const firstImage = item.images?.[0]?.image_url || null;

  const discountLabel = bestDiscount
    ? bestDiscount.discount_type === 'percentage'
      ? `${bestDiscount.discount_value}% OFF`
      : `PHP ${Math.floor(bestDiscount.discount_value).toLocaleString('en-US')} OFF`
    : 'No active discount';

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      <TouchableOpacity style={styles.cardImageWrap} activeOpacity={0.9} onPress={() => onPreview(item.images)}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Feather name="image" size={22} color={Colors.gray[500]} />
          </View>
        )}
        <View style={styles.cardPricePill}>
          <Text style={styles.cardPricePillText}>PHP {displayPrice.toLocaleString('en-US')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <View style={styles.cardHeadingRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
            {item.haven_name}
          </Text>
          <View style={[styles.cardChip, { backgroundColor: theme.chipBg }]}>
            <Text style={styles.cardChipText}>{discountLabel}</Text>
          </View>
        </View>

        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={theme.muted} />
            <Text style={[styles.metaText, { color: theme.muted }]}>{item.tower}, {item.floor}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={Colors.brand.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{item.rating || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={theme.muted} />
            <Text style={[styles.metaText, { color: theme.muted }]}>{item.capacity || 0} pax</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onPreview(item.images)}
          >
            <Text style={styles.secondaryBtnText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('RoomDetails', { haven: item })}
          >
            <Text style={styles.primaryBtnText}>Open Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function HavenScreen() {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  const theme = {
    page: isDark ? '#0B1220' : '#F3F6FB',
    surface: isDark ? '#111827' : Colors.white,
    card: isDark ? '#111827' : Colors.white,
    border: isDark ? '#273244' : '#E2E8F0',
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#9CA3AF' : Colors.gray[600],
    chipBg: isDark ? '#1F2937' : '#EEF2FF',
  };

  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('Recently Added');
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchHavens();
  }, []);

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

  const sortedHavens = useMemo(() => {
    const list = [...havens];
    switch (selectedSort) {
      case 'Price: Low to High':
        return list.sort((a, b) => parseFloat(a.weekday_rate || '0') - parseFloat(b.weekday_rate || '0'));
      case 'Price: High to Low':
        return list.sort((a, b) => parseFloat(b.weekday_rate || '0') - parseFloat(a.weekday_rate || '0'));
      case 'Rating':
        return list.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
      case 'Capacity':
        return list.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
      default:
        return list;
    }
  }, [havens, selectedSort]);

  const summary = useMemo(() => {
    const total = havens.length;
    const avgPrice = total
      ? Math.floor(havens.reduce((sum, h) => sum + parseFloat(h.weekday_rate || '0'), 0) / total)
      : 0;
    const avgRating = total
      ? (havens.reduce((sum, h) => sum + parseFloat(h.rating || '0'), 0) / total).toFixed(1)
      : '0.0';
    return { total, avgPrice, avgRating };
  }, [havens]);

  const handleImagePress = (images: HavenImage[] | undefined) => {
    if (!images || images.length === 0) return;
    const urls = [...images].sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url);
    setSelectedImages(urls);
    setSelectedImageIndex(0);
    setCarouselVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.page }]}>
      <AdminTopBar title="Manage Havens" />

      <ImageCarouselModal
        visible={carouselVisible}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setCarouselVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Haven Inventory</Text>
            <Text style={[styles.heroSubtitle, { color: theme.muted }]}>Monitor active properties, pricing, and room readiness.</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchHavens}>
            <Feather name="refresh-cw" size={15} color={Colors.white} />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <Text style={[styles.kpiLabel, { color: theme.muted }]}>Total Havens</Text>
            <Text style={[styles.kpiValue, { color: theme.text }]}>{summary.total}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <Text style={[styles.kpiLabel, { color: theme.muted }]}>Avg. Price</Text>
            <Text style={[styles.kpiValue, { color: theme.text }]}>PHP {summary.avgPrice.toLocaleString('en-US')}</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <Text style={[styles.kpiLabel, { color: theme.muted }]}>Avg. Rating</Text>
            <Text style={[styles.kpiValue, { color: theme.text }]}>{summary.avgRating}</Text>
          </View>
        </View>

        <View style={[styles.toolbar, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <Text style={[styles.sortLabel, { color: theme.muted }]}>Sort</Text>
          <TouchableOpacity
            style={[styles.sortBox, { borderColor: theme.border, backgroundColor: theme.page }]}
            onPress={() => setSortOpen((prev) => !prev)}
          >
            <Text style={[styles.sortValue, { color: theme.text }]}>{selectedSort}</Text>
            <Feather name={sortOpen ? 'chevron-up' : 'chevron-down'} size={14} color={theme.muted} />
          </TouchableOpacity>
          {sortOpen && (
            <View style={[styles.sortMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.sortOption}
                  onPress={() => {
                    setSelectedSort(option);
                    setSortOpen(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, { color: theme.text }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={Colors.brand.primary} size="small" />
            <Text style={[styles.stateText, { color: theme.muted }]}>Loading havens...</Text>
          </View>
        ) : sortedHavens.length === 0 ? (
          <View style={styles.stateBlock}>
            <Feather name="home" size={24} color={theme.muted} />
            <Text style={[styles.stateText, { color: theme.muted }]}>No havens available</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {sortedHavens.map((haven, index) => (
              <HavenCard key={haven.uuid_id || index} item={haven} theme={theme} onPreview={handleImagePress} />
            ))}
          </View>
        )}
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  heroSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: Fonts.inter,
    maxWidth: 220,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  refreshBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: Fonts.inter,
  },
  kpiValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  toolbar: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    zIndex: 50,
  },
  sortLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: Fonts.inter,
  },
  sortBox: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortValue: {
    fontSize: 13,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  sortMenu: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 86,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortOptionText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
  listWrap: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImageWrap: {
    height: 170,
    position: 'relative',
    backgroundColor: Colors.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPricePill: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.74)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardPricePillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  cardBody: {
    padding: 14,
  },
  cardHeadingRow: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  cardChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardChipText: {
    color: '#3730A3',
    fontSize: 11,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  cardMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  cardActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 12,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.inter,
    fontWeight: '700',
  },
  stateBlock: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    fontFamily: Fonts.inter,
  },
});
