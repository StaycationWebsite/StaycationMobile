import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Path } from 'react-native-svg';
import { Colors, GuestColors } from '../../../constants/Styles';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SearchModal from '../../components/SearchModal';
import ImageCarouselModal from '../../components/ImageCarouselModal';
import { API_CONFIG } from '../../../constants/config';

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

/** Reference mockup waves — full width, crest/trough aligned to headline. */
const WAVE_REF_W = 400;
const WAVE_REF_H = 108;
const WAVE_STROKE_PX = 1.2;
/** Wider gap between the four ribbons (mockup: clearly separated lines). */
const WAVE_LINE_GAP_PX = 8;
const WAVE_BAND_H = 56;
const WAVE_LINE_OPACITY = [0.4, 0.33, 0.26, 0.18] as const;
const WAVE_SVG_HEIGHT = WAVE_BAND_H + WAVE_LINE_GAP_PX * (WAVE_LINE_OPACITY.length - 1);

function buildWavePath(screenW: number, bandH: number): string {
  const x = (v: number) => (v / WAVE_REF_W) * screenW;
  const y = (v: number) => (v / WAVE_REF_H) * bandH;
  return [
    `M 0 ${y(50)}`,
    `C ${x(58)} ${y(50)} ${x(90)} ${y(14)} ${x(126)} ${y(11)}`,
    `C ${x(162)} ${y(8)} ${x(178)} ${y(68)} ${x(200)} ${y(76)}`,
    `C ${x(224)} ${y(84)} ${x(296)} ${y(40)} ${screenW} ${y(31)}`,
  ].join(' ');
}

function GoldWaveBackdrop({ width }: { width: number }) {
  const pathD = buildWavePath(width, WAVE_BAND_H);
  return (
    <View style={goldWaveStyles.wrap} pointerEvents="none">
      <Svg width={width} height={WAVE_SVG_HEIGHT} viewBox={`0 0 ${width} ${WAVE_SVG_HEIGHT}`}>
        {WAVE_LINE_OPACITY.map((opacity, index) => (
          <G key={index} transform={`translate(0, ${index * WAVE_LINE_GAP_PX})`}>
            <Path
              d={pathD}
              stroke={GuestColors.gold}
              strokeWidth={WAVE_STROKE_PX}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}

const goldWaveStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    width: '100%',
    top: '50%',
    marginTop: -WAVE_SVG_HEIGHT / 2 + 2,
    height: WAVE_SVG_HEIGHT,
    overflow: 'visible',
  },
});

const RoomCard = ({
  item,
  onImagePress,
  cardWidth,
  cardMarginBottom,
}: {
  item: Haven;
  onImagePress: (images: HavenImage[] | undefined) => void;
  cardWidth: number;
  cardMarginBottom?: number;
}) => {
  const navigation = useNavigation<any>();
  const firstImage = item.images?.[0]?.image_url ?? null;
  const ratingVal = item.rating ?? '4.5';
  const reviewCount = 45;
  const locationLine = `${item.tower}, ${item.floor} flr`;

  return (
    <TouchableOpacity
      style={[
        styles.roomCard,
        {
          width: cardWidth,
          alignSelf: 'flex-start',
          ...(cardMarginBottom != null ? { marginBottom: cardMarginBottom } : null),
        },
      ]}
      activeOpacity={0.92}
      onPress={() => navigation.navigate('RoomDetails', { haven: item })}
    >
      <View style={styles.imageContainer}>
        <Pressable onPress={() => onImagePress(item.images)} style={styles.imagePress}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.roomImage} />
          ) : (
            <View style={styles.roomImagePlaceholder}>
              <Feather name="image" size={22} color={GuestColors.goldSoft} />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.havenName} numberOfLines={2}>
          {item.haven_name}
        </Text>
        <View style={styles.ratingBlock}>
          <Ionicons name="star" size={12} color={GuestColors.starYellow} />
          <Text style={styles.ratingText}>
            {ratingVal}
            <Text style={styles.reviewParen}> ({reviewCount} Reviews)</Text>
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={11} color={GuestColors.charcoal} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLine}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/** Vertical gap between the first and second horizontal card strips. */
const TWO_LIST_GAP = 10;
/** Space below back/filter row before the first card strip. */
const LIST_TOP_SPACING = 16;
/** Space above the bottom tab bar so cards do not sit flush on the footer. */
const LIST_BOTTOM_SPACING = 28;
/** Horizontal inset from screen edge (padding). */
const SCREEN_H_PAD = 14;

export default function HavenScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const listRefTop = useRef<FlatList<Haven>>(null);
  const listRefBottom = useRef<FlatList<Haven>>(null);

  /** Exactly 2 cards visible across the row (no third-card peek) — cards fill the viewport width. */
  const colGap = 10;
  const viewportRowWidth = Math.max(0, screenW - SCREEN_H_PAD * 2);
  const cardWidth = Math.max(120, Math.floor((viewportRowWidth - colGap) / 2));
  const cardSnapInterval = cardWidth + colGap;

  const [modalVisible, setModalVisible] = useState(false);
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
        setHavens(data.data);
      }
    } catch (error) {
      console.error('Error fetching havens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = useCallback((images: HavenImage[] | undefined) => {
    if (images?.length) {
      const urls = [...images]
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.image_url);
      setSelectedImages(urls);
      setCarouselVisible(true);
    }
  }, []);

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

  /** Split havens into two rows — each row is its own horizontal carousel. */
  const { havensTop, havensBottom } = useMemo(() => {
    const mid = Math.ceil(sortedHavens.length / 2);
    return {
      havensTop: sortedHavens.slice(0, mid),
      havensBottom: sortedHavens.slice(mid),
    };
  }, [sortedHavens]);

  const onChevronPress = () => {
    if (sortOpen) {
      setSortOpen(false);
      return;
    }
    listRefTop.current?.scrollToOffset({ offset: 0, animated: true });
    listRefBottom.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top + 2 }]}>
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

      {/* Layer 1 — fixed header (no vertical scroll) */}
      <View style={styles.topLayer}>
        <TouchableOpacity
          style={styles.findRoomBar}
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="search" size={20} color="#FFFFFF" />
          <Text style={styles.findRoomBarText}>Find Room</Text>
          <Feather name="chevron-down" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={[styles.heroSection, { marginHorizontal: -16 }]}>
          <GoldWaveBackdrop width={screenW} />
          <Text style={styles.heroLine1}>Find Your Perfect</Text>
          <Text style={styles.heroLine2}>Staycation</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.chevronHit} onPress={onChevronPress} hitSlop={10}>
            <Feather name="chevron-left" size={19} color={GuestColors.gold} />
          </TouchableOpacity>
          <View style={styles.sortAnchor}>
            <TouchableOpacity style={styles.sortIconBox} onPress={() => setSortOpen(!sortOpen)}>
              <Feather name="sliders" size={15} color={GuestColors.gold} />
            </TouchableOpacity>
            {sortOpen ? (
              <View style={styles.dropdownOverlay}>
                {sortOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownOption, opt === selectedSort && styles.dropdownOptionActive]}
                    onPress={() => {
                      setSelectedSort(opt);
                      setSortOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        opt === selectedSort && styles.dropdownOptionTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Layer 2 — two separate horizontal scrolling strips (not a 2×2 grid) */}
      <View style={styles.bottomLayer}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            '#FFFFFF',
            'rgba(255, 255, 255, 0.6)',
            'rgba(184, 142, 47, 0.18)',
            'rgba(184, 142, 47, 0.45)',
            GuestColors.gold,
          ]}
          locations={[0, 0.18, 0.45, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.listAreaGradient}
        />
        {loading ? (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="small" color={GuestColors.gold} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : sortedHavens.length === 0 ? (
          <View style={styles.centeredMessage}>
            <Feather name="home" size={36} color={GuestColors.goldSoft} />
            <Text style={styles.emptyText}>No rooms available</Text>
          </View>
        ) : (
          <>
            <View style={styles.dualListColumn}>
              <View style={styles.listStripSlot}>
                <FlatList
                  ref={listRefTop}
                  horizontal
                  data={havensTop}
                  keyExtractor={(h) => h.uuid_id}
                  showsHorizontalScrollIndicator={false}
                  style={styles.listStripFlatList}
                  contentContainerStyle={styles.hStripContent}
                  snapToInterval={cardSnapInterval}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  ItemSeparatorComponent={() => <View style={{ width: colGap }} />}
                  renderItem={({ item }) => (
                    <RoomCard
                      item={item}
                      onImagePress={handleImagePress}
                      cardWidth={cardWidth}
                    />
                  )}
                />
              </View>
              <View style={styles.listStripGap} />
              <View style={styles.listStripSlot}>
                <View style={styles.bottomStripInner}>
                  <FlatList
                    ref={listRefBottom}
                    horizontal
                    data={havensBottom}
                    keyExtractor={(h) => h.uuid_id}
                    showsHorizontalScrollIndicator={false}
                    style={styles.listStripFlatList}
                    contentContainerStyle={styles.hStripContent}
                    snapToInterval={cardSnapInterval}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    ItemSeparatorComponent={() => <View style={{ width: colGap }} />}
                    renderItem={({ item }) => (
                      <RoomCard
                        item={item}
                        onImagePress={handleImagePress}
                        cardWidth={cardWidth}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  topLayer: {
    paddingHorizontal: 16,
    paddingBottom: 2,
    zIndex: 20,
    overflow: 'visible',
  },
  bottomLayer: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    justifyContent: 'flex-start',
    backgroundColor: GuestColors.gold,
    overflow: 'hidden',
  },
  listAreaGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  findRoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 10,
    marginBottom: 10,
    minHeight: 52,
    backgroundColor: GuestColors.gold,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: { elevation: 12 },
    }),
  },
  findRoomBarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  heroSection: {
    marginBottom: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  heroLine1: {
    fontSize: 21,
    fontWeight: '700',
    color: GuestColors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.3,
    zIndex: 1,
  },
  heroLine2: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: '700',
    color: GuestColors.gold,
    textAlign: 'center',
    letterSpacing: -0.3,
    zIndex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  chevronHit: {
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 10,
  },
  sortAnchor: { position: 'relative', zIndex: 30 },
  sortIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GuestColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
    width: 188,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  dropdownOption: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownOptionActive: { backgroundColor: GuestColors.goldMuted },
  dropdownOptionText: { fontSize: 12, color: GuestColors.charcoal },
  dropdownOptionTextActive: { color: GuestColors.gold, fontWeight: '700' },
  centeredMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  loadingText: { fontSize: 13, color: '#6B6B6B' },
  emptyText: { fontSize: 14, color: '#6B6B6B', fontWeight: '500' },
  dualListColumn: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    minHeight: 0,
    zIndex: 1,
    paddingTop: LIST_TOP_SPACING,
    paddingBottom: LIST_BOTTOM_SPACING,
    backgroundColor: 'transparent',
  },
  /** Equal flex so top and bottom card rows share height 50/50. */
  listStripSlot: {
    flex: 1,
    minHeight: 0,
    alignSelf: 'stretch',
  },
  listStripFlatList: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 0,
    width: '100%',
  },
  bottomStripInner: {
    flex: 1,
    minHeight: 0,
    alignSelf: 'stretch',
    width: '100%',
  },
  listStripGap: {
    height: TWO_LIST_GAP,
    flexShrink: 0,
  },
  hStripContent: {
    paddingLeft: SCREEN_H_PAD,
    paddingRight: SCREEN_H_PAD,
    paddingVertical: 2,
    alignItems: 'center',
    flexGrow: 1,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  /** Slightly wider aspect → shorter image → less total card height. */
  imageContainer: { position: 'relative', width: '100%', aspectRatio: 1.28 },
  imagePress: { flex: 1 },
  roomImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  roomImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: GuestColors.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { paddingHorizontal: 8, paddingVertical: 4 },
  havenName: {
    fontSize: 12,
    fontWeight: '700',
    color: GuestColors.charcoal,
    marginBottom: 2,
    minHeight: 22,
  },
  ratingBlock: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2, flexWrap: 'wrap' },
  ratingText: { fontSize: 11, fontWeight: '600', color: GuestColors.charcoal },
  reviewParen: { fontWeight: '500', color: '#6B6B6B' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 11, fontWeight: '500', color: GuestColors.charcoal, flex: 1 },
});
