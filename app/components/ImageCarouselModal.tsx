import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GuestColors } from '../../constants/Styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMB = 56;
const THUMB_GAP = 8;

interface ImageCarouselModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageCarouselModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageCarouselModalProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const thumbRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && images.length) {
      const idx = Math.min(initialIndex, images.length - 1);
      setCurrentIndex(idx);
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: false });
        thumbRef.current?.scrollToIndex({ index: idx, animated: false, viewPosition: 0.5 });
      });
    }
  }, [visible, initialIndex, images.length]);

  const handleMomentumScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
    thumbRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: GuestColors.charcoalDeep,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 12,
        },
        closeText: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
        },
        counterText: {
          color: '#FFFFFF',
          fontSize: 15,
          fontWeight: '600',
        },
        headerSpacer: { width: 56 },
        imageArea: {
          flex: 1,
          justifyContent: 'center',
        },
        imageWrapper: {
          width: SCREEN_WIDTH,
          justifyContent: 'center',
          alignItems: 'center',
        },
        image: {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT * 0.62,
        },
        thumbStrip: {
          paddingVertical: 16,
          paddingHorizontal: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        },
        thumb: {
          width: THUMB,
          height: THUMB,
          borderRadius: 8,
          marginHorizontal: THUMB_GAP / 2,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: 'transparent',
        },
        thumbActive: {
          borderColor: GuestColors.gold,
        },
        thumbImage: {
          width: '100%',
          height: '100%',
        },
      }),
    []
  );

  const renderThumb = ({ item, index }: ListRenderItemInfo<string>) => (
    <TouchableOpacity
      onPress={() => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }}
      style={[styles.thumb, index === currentIndex && styles.thumbActive]}
    >
      <Image source={{ uri: item }} style={styles.thumbImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (!images.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.imageArea}>
          <FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(initialIndex, images.length - 1)}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onScrollToIndexFailed={({ index }) => {
              requestAnimationFrame(() => {
                flatListRef.current?.scrollToIndex({ index, animated: false });
              });
            }}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            renderItem={({ item }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
              </View>
            )}
          />
        </View>

        {images.length > 1 ? (
          <View style={[styles.thumbStrip, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <FlatList
              ref={thumbRef}
              data={images}
              keyExtractor={(_, i) => `t-${i}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              renderItem={renderThumb}
              onScrollToIndexFailed={({ index }) => {
                requestAnimationFrame(() => {
                  thumbRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
                });
              }}
              getItemLayout={(_, index) => ({
                length: THUMB + THUMB_GAP,
                offset: (THUMB + THUMB_GAP) * index,
                index,
              })}
            />
          </View>
        ) : (
          <View style={{ height: Math.max(insets.bottom, 16) }} />
        )}
      </View>
    </Modal>
  );
}
