import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../../constants/Styles';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SearchModal from '../../components/SearchModal';
import ImageCarouselModal from '../../components/ImageCarouselModal';
import { API_CONFIG } from '../../../constants/config';
import { useRoomDiscounts } from '../../hooks/useRoomDiscounts';

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
  description?: string;
  amenities?: Record<string, boolean>;
  images?: HavenImage[];
}

// ── Room Card ──────────────────────────────────────────────────────
const RoomCard = ({
  item,
  onImagePress,
}: {
  item: Haven;
  onImagePress: (images: HavenImage[] | undefined) => void;
}) => {
  const navigation = useNavigation<any>();
  const { calculateBestDiscount } = useRoomDiscounts(item.uuid_id);
  const basePrice = parseFloat(item.weekday_rate || '0');
  const firstImage = item.images?.[0]?.image_url ?? null;

  const bestDiscount = useMemo(
    () => calculateBestDiscount(basePrice),
    [basePrice, calculateBestDiscount]
  );

  const displayPrice = bestDiscount ? Math.floor(bestDiscount.discountedPrice) : Math.floor(basePrice);

  return (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RoomDetails', { haven: item })}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImagePress(item.images)}
          style={{ flex: 1 }}
        >
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.roomImage} />
          ) : (
            <View style={styles.roomImagePlaceholder}>
              <Feather name="image" size={32} color={Colors.gray[300]} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Discount badge */}
        <View style={styles.overlappingBadge}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              {bestDiscount
                ? bestDiscount.discount_type === 'percentage'
                  ? `-${bestDiscount.discount_value}% OFF`
                  : `-₱${Math.floor(bestDiscount.discount_value)} OFF`
                : 'BEST DEAL'}
            </Text>
          </View>
          <View style={styles.sampleTag}>
            <Feather name="tag" size={11} color={Colors.brand.primary} />
            <Text style={styles.sampleTagText}>TODAY'S RATE</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.pricePerNight}>₱{displayPrice.toLocaleString('en-US')}</Text>
          {bestDiscount && (
            <Text style={styles.originalPrice}>
              ₱{Math.floor(basePrice).toLocaleString('en-US')}
            </Text>
          )}
          {bestDiscount && (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save ₱{Math.floor(bestDiscount.savings).toLocaleString()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.havenName} numberOfLines={1}>
          {item.haven_name}
        </Text>

        <View style={styles.locationRating}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={Colors.gray[500]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.tower}, {item.floor}, QC
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Colors.brand.primary} />
            <Text style={styles.ratingText}>{item.rating ?? '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ────────────────────────────────────────────────────
export default function HavenScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Recommended');
  const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Capacity'];

  useEffect(() => { fetchHavens(); }, []);

  const fetchHavens = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.HAVEN_API);
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setHavens(data.data);
      }
    } catch (error) {
      console.error('Error fetching havens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (images: HavenImage[] | undefined) => {
    if (images?.length) {
      const urls = [...images]
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.image_url);
      setSelectedImages(urls);
      setCarouselVisible(true);
    }
  };

  const sortedHavens = useMemo(() => {
    const copy = [...havens];
    switch (selectedSort) {
      case 'Price: Low to High':
        return copy.sort((a, b) => parseFloat(a.weekday_rate) - parseFloat(b.weekday_rate));
      case 'Price: High to Low':
        return copy.sort((a, b) => parseFloat(b.weekday_rate) - parseFloat(a.weekday_rate));
      case 'Rating':
        return copy.sort((a, b) => parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0'));
      case 'Capacity':
        return copy.sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0));
      default:
        return copy;
    }
  }, [havens, selectedSort]);

  return (
    <View style={styles.mainContainer}>
      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSearch={() => setModalVisible(false)}
      />
      <ImageCarouselModal
        visible={carouselVisible}
        images={selectedImages}
        initialIndex={0}
        onClose={() => setCarouselVisible(false)}
      />

      {/* Header */}
      <View style={styles.topSection}>
        <View style={styles.logoSection}>
          <Image source={require('../../../assets/haven_logo.png')} style={styles.logo} />
          <Text style={styles.appName}>Staycation Haven</Text>
        </View>
        <TouchableOpacity style={styles.findRoomsButton} onPress={() => setModalVisible(true)}>
          <Feather name="search" size={16} color={Colors.white} />
          <Text style={styles.findRoomsButtonText}>Find Rooms</Text>
        </TouchableOpacity>
      </View>

      {/* Filter & Sort */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}
        >
          {['Price', 'Capacity', 'Rating', 'Tower'].map((f) => (
            <TouchableOpacity key={f} style={styles.filterChip}>
              <Text style={styles.filterLabel}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortWrapper}>
          <Text style={styles.sortLabelText}>Sort:</Text>
          <TouchableOpacity style={styles.sortBox} onPress={() => setSortOpen(!sortOpen)}>
            <Text style={styles.sortBoxText} numberOfLines={1}>{selectedSort}</Text>
            <Feather name="chevron-down" size={13} color={Colors.gray[700]} />
          </TouchableOpacity>
        </View>

        {sortOpen && (
          <View style={styles.dropdownOverlay}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownOption, opt === selectedSort && styles.dropdownOptionActive]}
                onPress={() => { setSelectedSort(opt); setSortOpen(false); }}
              >
                <Text style={[styles.dropdownOptionText, opt === selectedSort && styles.dropdownOptionTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : sortedHavens.length === 0 ? (
          <View style={styles.centeredMessage}>
            <Feather name="home" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No rooms available</Text>
          </View>
        ) : (
          <View style={styles.roomsGrid}>
            {sortedHavens.map((haven) => (
              <RoomCard key={haven.uuid_id} item={haven} onImagePress={handleImagePress} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.white },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  appName: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  findRoomsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 6,
  },
  findRoomsButtonText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    zIndex: 100,
  },
  filterScroll: { flex: 1, marginRight: 8 },
  filterContent: { paddingRight: 8 },
  filterChip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterLabel: { color: Colors.blue[600], fontSize: 12, fontWeight: '600' },
  sortWrapper: { flexDirection: 'row', alignItems: 'center' },
  sortLabelText: { marginRight: 6, color: Colors.gray[500], fontSize: 12 },
  sortBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
    gap: 4,
  },
  sortBoxText: { fontSize: 11, color: Colors.gray[900], flex: 1 },
  dropdownOverlay: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    width: 180,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    zIndex: 1000,
  },
  dropdownOption: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownOptionActive: { backgroundColor: Colors.blue[100] },
  dropdownOptionText: { fontSize: 13, color: Colors.gray[900] },
  dropdownOptionTextActive: { color: Colors.blue[600], fontWeight: '600' },
  scrollView: { flex: 1, backgroundColor: Colors.gray[50] },
  scrollContent: { padding: 16, paddingBottom: 32 },
  centeredMessage: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, color: Colors.gray[500] },
  emptyText: { fontSize: 15, color: Colors.gray[500], fontWeight: '500' },
  roomsGrid: { gap: 16 },
  roomCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: { position: 'relative', width: '100%', height: 180 },
  roomImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  roomImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlappingBadge: {
    position: 'absolute',
    bottom: -14,
    left: 16,
    right: 16,
    height: 36,
    backgroundColor: Colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  discountBadge: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  sampleTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sampleTagText: { fontSize: 10, fontWeight: '700', color: Colors.brand.primary },
  cardContent: { padding: 16, paddingTop: 22 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  pricePerNight: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  originalPrice: { fontSize: 13, color: Colors.gray[400], textDecorationLine: 'line-through' },
  saveBadge: { backgroundColor: Colors.green[100], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  saveBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.green[500] },
  havenName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900], marginBottom: 8 },
  locationRating: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  locationText: { fontSize: 12, color: Colors.gray[500] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: Colors.gray[900] },
});
