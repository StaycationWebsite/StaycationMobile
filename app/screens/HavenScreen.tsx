import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import SearchModal from '../components/SearchModal';
import ImageCarouselModal from '../components/ImageCarouselModal';
import { API_CONFIG } from '../../constants/config';
import { useRoomDiscounts } from '../hooks/useRoomDiscounts';

interface HavenImage {
  id: number;
  image_url: string;
  display_order: number;
}
// ... interface Haven ...

export default function HavenScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carousel State
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Filter & Sort State
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Recommended');
  const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Capacity'];

  useEffect(() => {
    fetchHavens();
  }, []);

  const fetchHavens = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.HAVEN_API);
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        console.log('Havens fetched:', data.data.length, 'rooms');
        console.log('First room data:', data.data[0]);
        setHavens(data.data);
      }
    } catch (error) {
      console.error('Error fetching havens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setModalVisible(false);
  };

  const handleImagePress = (images: HavenImage[] | undefined) => {
    if (images && images.length > 0) {
      const imageUrls = images.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url);
      setSelectedImages(imageUrls);
      setSelectedImageIndex(0);
      setCarouselVisible(true);
    }
  };

  const RoomCard = ({ item }: { item: Haven }) => {
    const { calculateBestDiscount } = useRoomDiscounts(item.uuid_id);
    const basePrice = parseFloat(item.weekday_rate || '0');
    const firstImage = item.images && item.images.length > 0 ? item.images[0].image_url : null;

    const bestDiscount = useMemo(() => {
      return calculateBestDiscount(basePrice);
    }, [basePrice, calculateBestDiscount]);

    const displayPrice = bestDiscount ? Math.floor(bestDiscount.discountedPrice) : Math.floor(basePrice);
    const savings = bestDiscount ? Math.floor(bestDiscount.savings) : 0;

    return (
      <View style={styles.roomCard}>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => handleImagePress(item.images)}
            style={{ flex: 1 }}
          >
            {firstImage ? (
              <Image
                source={{ uri: firstImage }}
                style={styles.roomImage}
              />
            ) : (
              <View style={styles.roomImagePlaceholder} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Feather name="heart" size={20} color={Colors.white} />
          </TouchableOpacity>
          {bestDiscount && (
            <View style={styles.discountNameContainer}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {bestDiscount.discount_type === 'percentage'
                    ? `-${bestDiscount.discount_value}% OFF`
                    : `-₱${Math.floor(bestDiscount.discount_value)} OFF`}
                </Text>
              </View>
              <View style={styles.discountNameWithIcon}>
                <Feather name="tag" size={12} color={Colors.brand.primary} />
                <Text style={styles.discountName}>{bestDiscount.name}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              <View style={styles.priceRow}>
                <Text style={styles.pricePerNight}>₱{displayPrice.toLocaleString('en-US')}</Text>
                {bestDiscount && (
                  <Text style={styles.originalPrice}>₱{Math.floor(basePrice).toLocaleString('en-US')}</Text>
                )}
              </View>
              <Text style={styles.priceLabel}>per night</Text>
            </View>
            {bestDiscount && (
              <View style={styles.savingSection}>
                <Text style={styles.savingLabel}>Save</Text>
                <Text style={styles.savingAmount}>₱{savings.toLocaleString('en-US')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.havenName}>{item.haven_name}</Text>

          <View style={styles.locationRating}>
            <View style={styles.locationSection}>
              <Feather name="map-pin" size={14} color={Colors.gray[600]} />
              <Text style={styles.locationText}>{item.tower}, {item.floor}</Text>
            </View>
            <View style={styles.ratingSection}>
              <Feather name="star" size={14} color={Colors.brand.primary} />
              <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSearch={handleSearch}
      />
      
      <ImageCarouselModal
        visible={carouselVisible}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setCarouselVisible(false)}
      />

      {/* Sticky Header */}
      <View style={styles.topSection}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/haven_logo.png')}
            style={styles.logo}
          />
          <View style={styles.appNameContainer}>
            <Text style={styles.appName}>taycation Haven</Text>
            <Text style={styles.appNameExponent}>PH</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.findRoomsButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="search" size={18} color={Colors.white} style={styles.buttonIcon} />
          <Text style={styles.findRoomsButtonText}>Find Rooms</Text>
        </TouchableOpacity>
      </View>

      {/* Filter & Sort Section */}
      <View style={[styles.filterContainer, { zIndex: 100 }]}>
        <View style={styles.filterScrollWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContent}
          >
            {['Price', 'Capacity', 'Rating', 'Tower'].map((filter) => (
              <TouchableOpacity key={filter} style={styles.filterChip}>
                <Text style={styles.filterLabel}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortWrapper}>
          <Text style={styles.sortLabelText}>Sort:</Text>
          <TouchableOpacity
            style={styles.sortBox}
            onPress={() => setSortOpen(!sortOpen)}
          >
            <Text style={styles.sortBoxText}>{selectedSort}</Text>
            <Feather name="chevron-down" size={14} color={Colors.gray[900]} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        {sortOpen && (
          <View style={styles.dropdownOverlay}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  option === selectedSort && styles.dropdownOptionActive
                ]}
                onPress={() => {
                  setSelectedSort(option);
                  setSortOpen(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  option === selectedSort && styles.dropdownOptionTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Find Your Perfect</Text>
          <Text style={styles.highlightedText}>Staycation</Text>
          <View style={styles.dot} />
          <Text style={styles.description}>
            Discover our premium havens with world-class amenities. Short stays, extended stays, or your perfect getaway - all at your fingertips.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Premium Havens</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>
        </View>

        {/* Room Cards Section - First 5 */}
        <View style={styles.roomsSection}>
          <View style={styles.roomsSectionHeader}>
            <Text style={styles.roomsSectionTitle}>Staycation Haven PH</Text>
            <Feather name="chevron-right" size={20} color={Colors.gray[600]} />
          </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomsScroll}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {loading ? (
            <Text style={styles.loadingText}>Loading havens...</Text>
          ) : havens.length > 0 ? (
            havens.slice(0, 5).map((haven, index) => (
              <View key={haven.uuid_id || index}>
                <RoomCard item={haven} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No havens available</Text>
          )}
        </ScrollView>
      </View>

      {/* Remaining Rooms Section */}
      {havens.length > 5 && (
        <View style={styles.remainingSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.roomsScroll}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {havens.slice(5).map((haven, index) => (
              <View key={haven.uuid_id || index}>
                <RoomCard item={haven} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    width: '100%',
    maxWidth: '100%',
  },
  topSection: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginTop: 0,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    width: '100%',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
  appNameExponent: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginLeft: 2,
    marginTop: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  findRoomsButton: {
    width: '100%',
    backgroundColor: Colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 10,
  },
  findRoomsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: Fonts.poppins,
  },
  buttonDropdownIcon: {
    marginLeft: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  highlightedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    fontFamily: Fonts.inter,
    lineHeight: 22,
    marginHorizontal: 10,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
  roomsSection: {
    paddingVertical: 24,
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  roomsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roomsSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  roomsScroll: {
    paddingHorizontal: 0,
  },
  scrollContentContainer: {
    paddingRight: 20,
  },
  roomCard: {
    width: 170,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  imageContainer: {
    position: 'relative',
    width: 170,
    height: 130,
    backgroundColor: Colors.gray[200],
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  roomImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[200],
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
    paddingBottom: 16,
    marginTop: 12,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceInfo: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pricePerNight: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
  originalPrice: {
    fontSize: 9,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    textDecorationLine: 'line-through',
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    marginTop: 2,
  },
  savingSection: {
    alignItems: 'flex-end',
  },
  savingLabel: {
    fontSize: 9,
    color: '#22C55E', // Green
    fontFamily: Fonts.inter,
  },
  savingAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    fontFamily: Fonts.poppins,
    marginTop: 2,
  },
  discountNameContainer: {
    position: 'absolute',
    bottom: 12, // Moved inside the card (image area)
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    gap: 0,
  },
  discountBadge: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Fonts.poppins,
  },
  discountNameWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8, // Add padding on the right for the pill shape
  },
  discountName: {
    fontSize: 10,
    color: Colors.brand.primaryDark, // Gold/Brown color
    fontFamily: Fonts.poppins,
    fontWeight: '700',
  },
  havenName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 8,
  },
  locationRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 9,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    textAlign: 'center',
    padding: 20,
  },
  remainingSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 16,
  },
  // Filter & Sort Styles
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  filterScrollWrapper: {
    flex: 1,
    marginRight: 10,
  },
  filterContent: {
    paddingRight: 10,
  },
  filterChip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: Colors.white,
  },
  filterLabel: {
    color: '#2563EB', // Blue as requested
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.poppins,
  },
  sortWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabelText: {
    marginRight: 8,
    color: Colors.gray[600],
    fontSize: 12,
    fontFamily: Fonts.inter,
  },
  sortBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DAA520', // Golden-yellow border
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    minWidth: 100,
    justifyContent: 'space-between',
  },
  sortBoxText: {
    fontSize: 12,
    fontFamily: Fonts.inter,
    color: Colors.gray[900],
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: 180,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  dropdownOptionActive: {
    backgroundColor: '#EFF6FF', // Light blue background for active
  },
  dropdownOptionText: {
    fontSize: 13,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
  },
  dropdownOptionTextActive: {
    color: '#2563EB', // Blue text for active
    fontWeight: '600',
  },
});
