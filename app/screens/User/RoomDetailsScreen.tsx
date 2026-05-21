import React, { useState, useMemo, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GuestColors } from '../../../constants/Styles';
import ImageCarouselModal from '../../components/ImageCarouselModal';
import type { GuestHavenStackParamList } from '../../../navigation/UserNavigator';

type RoomDetailsRouteProp = RouteProp<GuestHavenStackParamList, 'RoomDetails'>;

export default function RoomDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GuestHavenStackParamList>>();
  const route = useRoute<RoomDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const { haven } = route.params ?? {};
  const [activeTab, setActiveTab] = useState('Overview');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [guests] = useState(2);

  const imageUrls = useMemo(() => {
    const imgs = haven?.images ?? [];
    return [...imgs]
      .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
      .map((i: { image_url: string }) => i.image_url)
      .filter(Boolean);
  }, [haven]);

  const heroUri = imageUrls[0] ?? 'https://via.placeholder.com/400';

  const shareRoom = useCallback(async () => {
    try {
      await Share.share({
        message: `${haven?.haven_name ?? 'Staycation Haven'} — ${haven?.tower ?? ''}, ${haven?.floor ?? ''}`,
      });
    } catch {
      /* ignore */
    }
  }, [haven]);

  const onVideoTour = () => {
    Alert.alert('Video tour', 'A hosted video tour will be available for this haven soon.');
  };

  const FeatureItem = ({
    icon,
    label,
    sublabel,
  }: {
    icon: string;
    label: string;
    sublabel?: string;
  }) => (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name={icon as any} size={22} color={GuestColors.gold} />
      <Text style={styles.featureLabel}>{label}</Text>
      {sublabel ? <Text style={styles.featureSublabel}>{sublabel}</Text> : null}
    </View>
  );

  const amenityLabels: Record<string, string> = {
    airConditioning: 'Air Conditioning',
    wifi: 'High-speed WiFi',
    tv: 'Flat-screen TV',
    netflix: 'Netflix Access',
    kitchen: 'Kitchen Access',
    parking: 'Free Parking',
    poolAccess: 'Pool Access',
    balcony: 'Private Balcony',
    washerDryer: 'Washer & Dryer',
    towels: 'Fresh Towels',
    glowBed: 'Glow Bed',
    ps4: 'PS4 Console',
  };

  if (!haven) return null;

  const rate = parseFloat(haven.weekday_rate ?? '0');
  const priceLine = `₱${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.mainContainer}>
      <ImageCarouselModal
        visible={galleryOpen}
        images={imageUrls}
        initialIndex={0}
        onClose={() => setGalleryOpen(false)}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: heroUri }} style={styles.heroImage} />
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={22} color={GuestColors.charcoal} />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.circleBtn} onPress={shareRoom}>
                <Feather name="share-2" size={18} color={GuestColors.charcoal} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="heart-outline" size={20} color={GuestColors.charcoal} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.viewGalleryBtn} activeOpacity={0.9} onPress={() => imageUrls.length && setGalleryOpen(true)}>
            <Feather name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.viewGalleryText}>View Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.videoTourRow} activeOpacity={0.85} onPress={onVideoTour}>
          <Feather name="play-circle" size={20} color={GuestColors.gold} />
          <Text style={styles.videoTourText}>Video Tour</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.roomName}>{haven.haven_name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={GuestColors.starYellow} />
            <Text style={styles.ratingText}>{haven.rating ?? '4.5'}</Text>
            <Text style={styles.reviewsText}>(45 reviews)</Text>
          </View>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color="#6B6B6B" />
            <Text style={styles.locationText}>
              {haven.tower}, {haven.floor} flr
            </Text>
          </View>

          <View style={styles.specGrid}>
            <FeatureItem
              icon="account-group-outline"
              label={`${haven.capacity ?? 4} Guests`}
              sublabel="Max capacity"
            />
            <FeatureItem icon="shower" label="1 bathroom" sublabel="Full bath" />
            <FeatureItem
              icon="bed-outline"
              label={`${haven.beds ?? '1 Long and Pullout'} bed`}
              sublabel="Bed size"
            />
            <FeatureItem
              icon="vector-square"
              label={`${haven.room_size ?? '45.00'}`}
              sublabel="Space"
            />
          </View>

          <View style={styles.tabBar}>
            {(['Overview', 'Amenities', 'Location', 'Reviews'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'Overview' && (
              <>
                <Text style={styles.sectionTitle}>About this space</Text>
                <Text style={styles.description}>
                  {haven.description ??
                    'Experience luxury and comfort in our premium room. Perfect for a relaxing staycation with all the modern amenities you need.'}
                </Text>
              </>
            )}

            {activeTab === 'Amenities' && (
              <View style={styles.amenitiesGrid}>
                {Object.entries(haven.amenities ?? {}).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <View key={key} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color={GuestColors.gold} />
                      <Text style={styles.amenityText}>{amenityLabels[key] ?? key}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'Location' && (
              <View>
                <Text style={styles.locationTitle}>
                  {haven.tower}, {haven.floor}
                </Text>
                <Text style={styles.locationSubtitle}>Quezon City, Metro Manila, Philippines</Text>
                <View style={styles.mapPlaceholder}>
                  <Feather name="map" size={36} color="#B0B0B0" />
                  <Text style={styles.mapText}>Interactive map coming soon</Text>
                </View>
              </View>
            )}

            {activeTab === 'Reviews' && (
              <View style={styles.reviewsPlaceholder}>
                <Feather name="message-circle" size={36} color={GuestColors.goldSoft} />
                <Text style={styles.reviewsPlaceholderText}>
                  Guest reviews will appear here once published.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Text style={styles.footerPrice}>
          {priceLine}
          <Text style={styles.footerPriceUnit}> / per night</Text>
        </Text>
        <View style={styles.footerSelectors}>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => {
              Alert.alert('Dates', 'Date selection will connect to booking flow in a future update.');
            }}
          >
            <Feather name="calendar" size={16} color={GuestColors.charcoal} />
            <Text style={styles.selectorBtnText}>Dates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => {
              Alert.alert(
                'Guests',
                `Current selection: ${guests} guests. Full guest picker will connect to booking soon.`,
              );
            }}
          >
            <Feather name="users" size={16} color={GuestColors.charcoal} />
            <Text style={styles.selectorBtnText}>Guests</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.bookNowBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('BookingFlow', { haven })}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  topBarRight: { flexDirection: 'row', gap: 8 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  viewGalleryBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(44,44,44,0.88)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  viewGalleryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  videoTourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FAFAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEDE8',
  },
  videoTourText: { fontSize: 15, fontWeight: '600', color: GuestColors.charcoal },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  roomName: {
    fontSize: 22,
    fontWeight: '700',
    color: GuestColors.charcoal,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: GuestColors.charcoal,
  },
  reviewsText: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  featureItem: {
    width: '48%',
    minHeight: 96,
    backgroundColor: GuestColors.goldMuted,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: GuestColors.charcoal,
    textAlign: 'center',
    marginTop: 6,
  },
  featureSublabel: {
    fontSize: 10,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
    marginBottom: 16,
    gap: 4,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: GuestColors.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  activeTabText: {
    color: GuestColors.gold,
    fontWeight: '700',
  },
  tabContent: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GuestColors.charcoal,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#4B4B4B',
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#F8F8F6',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  amenityText: {
    fontSize: 12,
    color: GuestColors.charcoal,
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GuestColors.charcoal,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 16,
  },
  mapPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD',
  },
  mapText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewsPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  reviewsPlaceholderText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEDE8',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
    }),
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: GuestColors.gold,
    marginBottom: 10,
  },
  footerPriceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  footerSelectors: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0DCD4',
    backgroundColor: '#FFFFFF',
  },
  selectorBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: GuestColors.charcoal,
  },
  bookNowBtn: {
    backgroundColor: GuestColors.gold,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
