import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, FlatList, Image, Dimensions, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageCarouselModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageCarouselModal({
  visible, images, initialIndex = 0, onClose,
}: ImageCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  };

  if (!images.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Feather name="x" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Counter */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
        </View>

        {/* Images */}
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
            </View>
          )}
        />

        {/* Dots */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Nav arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.navBtn, styles.navLeft]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              setCurrentIndex(currentIndex - 1);
            }}
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        {currentIndex < images.length - 1 && (
          <TouchableOpacity
            style={[styles.navBtn, styles.navRight]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
              setCurrentIndex(currentIndex + 1);
            }}
          >
            <Feather name="chevron-right" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute', top: 52, right: 20, zIndex: 10,
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  counter: {
    position: 'absolute', top: 60, left: 0, right: 0, zIndex: 10, alignItems: 'center',
  },
  counterText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  imageWrapper: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center' },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 },
  dots: {
    position: 'absolute', bottom: 48, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white, width: 18 },
  navBtn: {
    position: 'absolute', top: '50%', zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  navLeft: { left: 16 },
  navRight: { right: 16 },
});
