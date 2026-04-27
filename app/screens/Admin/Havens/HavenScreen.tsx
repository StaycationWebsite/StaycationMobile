import React, { useState, useEffect, useMemo, ReactElement } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';

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
}): ReactElement => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const basePrice = parseFloat(item.weekday_rate || '0');
  const bestDiscount = { discount_type: 'percentage' as const, discount_value: 15, discountedPrice: basePrice * 0.85, savings: basePrice * 0.15 };
  const firstImage = item.images?.[0]?.image_url ?? null;
  const displayPrice = bestDiscount ? Math.floor(bestDiscount.discountedPrice) : Math.floor(basePrice);

  const styles = StyleSheet.create({
    roomCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 } as const,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,
    imageContainer: { position: 'relative', width: '100%', height: 180 } as ViewStyle,
    roomImage: { width: '100%', height: '100%', resizeMode: 'cover' } as ImageStyle,
    roomImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
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
    } as ViewStyle,
    overlappingBadge: {
      position: 'absolute',
      bottom: -14,
      left: 16,
      right: 16,
      height: 36,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 } as const,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,
    discountBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingHorizontal: 10,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    discountBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.surface } as TextStyle,
    sampleTag: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    } as ViewStyle,
    sampleTagText: { fontSize: 10, fontWeight: '700', color: theme.colors.primary } as TextStyle,
    cardContent: { padding: 16, paddingTop: 22 } as ViewStyle,
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 } as ViewStyle,
    pricePerNight: { fontSize: 18, fontWeight: '700', color: theme.colors.primary } as TextStyle,
    originalPrice: { fontSize: 13, color: theme.colors.textTertiary, textDecorationLine: 'line-through' } as TextStyle,
    saveBadge: { backgroundColor: theme.colors.successBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 } as ViewStyle,
    saveBadgeText: { fontSize: 10, fontWeight: '600', color: theme.colors.success } as TextStyle,
    havenName: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 8 } as TextStyle,
    locationRating: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 } as ViewStyle,
    locationText: { fontSize: 12, color: theme.colors.textSecondary } as TextStyle,
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 } as ViewStyle,
    ratingText: { fontSize: 13, fontWeight: '700', color: theme.colors.text } as TextStyle,
  });

  return (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RoomDetails', { haven: item })}
    >
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
              <Feather name="image" size={32} color={theme.colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color={theme.colors.surface} />
        </TouchableOpacity>

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
            <Feather name="tag" size={11} color={theme.colors.primary} />
            <Text style={styles.sampleTagText}>TODAY'S RATE</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
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
            <Feather name="map-pin" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.tower}, {item.floor}, QC
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={theme.colors.primary} />
            <Text style={styles.ratingText}>{item.rating ?? '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ────────────────────────────────────────────────────
export default function HavenScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Recommended');
  const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Capacity'];

  useEffect(() => {
    fetchHavens();
  }, []);

  const fetchHavens = async () => {
    try {
      setLoading(true);
      const mockHavens: Haven[] = [
        {
          uuid_id: '1',
          haven_name: 'Haven 101',
          tower: 'Tower A',
          floor: '1st Floor',
          rating: '4.8',
          weekday_rate: '3500',
          capacity: 2,
          beds: '1 Queen',
          room_size: '45',
          images: [{ id: 1, image_url: 'https://picsum.photos/400/300?random=1', display_order: 1 }]
        },
        {
          uuid_id: '2',
          haven_name: 'Haven 205',
          tower: 'Tower A',
          floor: '2nd Floor',
          rating: '4.6',
          weekday_rate: '4200',
          capacity: 4,
          beds: '2 Queen',
          room_size: '60',
          images: [{ id: 2, image_url: 'https://picsum.photos/400/300?random=2', display_order: 1 }]
        }
      ];
      setHavens(mockHavens);
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
      // Carousel logic here
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

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
    topSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    } as ViewStyle,
    logoSection: { flexDirection: 'row', alignItems: 'center', gap: 10 } as ViewStyle,
    logo: { width: 36, height: 36, borderRadius: 8 } as ImageStyle,
    appName: { fontSize: 18, fontWeight: '700', color: theme.colors.primary } as TextStyle,
    findRoomsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 9,
      gap: 6,
    } as ViewStyle,
    findRoomsButtonText: { color: theme.colors.surface, fontSize: 13, fontWeight: '700' } as TextStyle,
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      zIndex: 100,
    } as ViewStyle,
    filterScroll: { flex: 1, marginRight: 8 } as ViewStyle,
    filterContent: { paddingRight: 8 } as ViewStyle,
    filterChip: {
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginRight: 8,
    } as ViewStyle,
    filterLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.primary } as TextStyle,
    sortWrapper: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
    sortLabelText: { marginRight: 6, color: theme.colors.textTertiary, fontSize: 12 } as TextStyle,
    sortBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryLight,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 90,
      gap: 4,
    } as ViewStyle,
    sortBoxText: { fontSize: 11, color: theme.colors.text, flex: 1 } as TextStyle,
    dropdownOverlay: {
      position: 'absolute',
      top: 48,
      right: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 } as const,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 8,
      width: 180,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 1000,
    } as ViewStyle,
    dropdownOption: { paddingVertical: 12, paddingHorizontal: 16 } as ViewStyle,
    dropdownOptionActive: { backgroundColor: theme.colors.primaryLight } as ViewStyle,
    dropdownOptionText: { fontSize: 13, color: theme.colors.text } as TextStyle,
    dropdownOptionTextActive: { color: theme.colors.primary, fontWeight: '600' } as TextStyle,
    scrollView: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
    scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,
    centeredMessage: { alignItems: 'center', paddingTop: 60, gap: 12 } as ViewStyle,
    loadingText: { fontSize: 14, color: theme.colors.textSecondary } as TextStyle,
    emptyText: { fontSize: 15, color: theme.colors.textSecondary, fontWeight: '500' } as TextStyle,
    roomsGrid: { gap: 16 } as ViewStyle,
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topSection}>
        <View style={styles.logoSection}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]} /> {/* Logo placeholder: assets/haven_logo.png missing */}
          <Text style={styles.appName}>Staycation Haven</Text>
        </View>
        <TouchableOpacity style={styles.findRoomsButton} onPress={() => {}}>
          <Feather name="search" size={16} color={theme.colors.surface} />
          <Text style={styles.findRoomsButtonText}>Find Rooms</Text>
        </TouchableOpacity>
      </View>

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
            <Feather name="chevron-down" size={13} color={theme.colors.textSecondary} />
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : sortedHavens.length === 0 ? (
          <View style={styles.centeredMessage}>
            <Feather name="home" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No rooms available</Text>
          </View>
        ) : (
          <FlatList
            data={sortedHavens}
            renderItem={({ item }) => <RoomCard item={item} onImagePress={handleImagePress} />}
            keyExtractor={(item) => item.uuid_id}
            contentContainerStyle={styles.roomsGrid}
            numColumns={1}
          />
        )}
      </ScrollView>
    </View>
  );
};

