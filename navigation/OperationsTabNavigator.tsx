import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Styles';
import { useNavigation } from '@react-navigation/native';

import DeliverablesManagementScreen from '../app/screens/Admin/DeliverablesManagementScreen';
import CleanersManagementScreen from '../app/screens/Admin/CleanersManagementScreen';
import InventoryManagementScreen from '../app/screens/Admin/InventoryManagementScreen';

const { width } = Dimensions.get('window');
const TABS = ['Deliverables', 'Cleaners', 'Inventory'];
const TAB_COUNT = TABS.length;

export default function OperationsTabNavigator() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (index: number) => {
    if (index === activeTab) return;
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -index * width,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.spring(indicatorAnim, {
        toValue: index * (width / TAB_COUNT),
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
    ]).start();
    setActiveTab(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Operations</Text>
          <Text style={styles.headerSubtitle}>Daily operations & logistics</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => switchTab(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, { color: activeTab === index ? Colors.brand.primary : Colors.gray[500] }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[styles.tabIndicator, { width: width / TAB_COUNT, transform: [{ translateX: indicatorAnim }] }]}
        />
      </View>

      <View style={styles.screensWrapper}>
        <Animated.View style={[styles.screensRow, { transform: [{ translateX: slideAnim }] }]}>
          <View style={{ width }}><DeliverablesManagementScreen /></View>
          <View style={{ width }}><CleanersManagementScreen /></View>
          <View style={{ width }}><InventoryManagementScreen /></View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  iconButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gray[100],
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100], height: 46,
    position: 'relative',
  },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: 0,
    height: 3, backgroundColor: Colors.brand.primary, borderRadius: 2,
  },
  screensWrapper: { flex: 1, overflow: 'hidden' },
  screensRow: { flexDirection: 'row', flex: 1 },
});