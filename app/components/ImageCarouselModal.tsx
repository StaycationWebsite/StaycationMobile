import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Image, Dimensions, StatusBar, FlatList } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
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
  visible, 
  images, 
  initialIndex = 0, 
  onClose 
}: ImageCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // Wait for layout to be ready before scrolling, or use a small timeout
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);

      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      scale.value = 0.95;
      opacity.value = 0;
    }
  }, [visible, initialIndex]);

  const handleClose = () => {
    scale.value = withTiming(0.95, { duration: 250, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) }, () => {
      runOnJS(onClose)();
    });
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        <StatusBar hidden />
        <Animated.View style={[styles.backdrop, { opacity }]} />
        
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={images}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: item }} 
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.leftNav]} 
                    onPress={handlePrev}
                  >
                    <Feather name="chevron-left" size={32} color={Colors.white} />
                  </TouchableOpacity>
                )}

                {currentIndex < images.length - 1 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.rightNav]} 
                    onPress={handleNext}
                  >
                    <Feather name="chevron-right" size={32} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex ? styles.paginationDotActive : styles.paginationDotInactive
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  contentContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  carouselContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '75%', // Keep visual aspect similar but allow full width swiping
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    padding: 20,
    transform: [{ translateY: -30 }],
  },
  leftNav: {
    left: 0,
  },
  rightNav: {
    right: 0,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.white,
    width: 8,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
