import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Colors } from '../../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RoomDetailsRouteProp = RouteProp<{ RoomDetails: { haven: any } }, 'RoomDetails'>;

export default function RoomDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoomDetailsRouteProp>();
  const { haven } = route.params ?? {};
  const [activeTab, setActiveTab] = useState('Overview');

  if (!haven) return null;

  const FeatureItem = ({ icon, label, sublabel }: { icon: string; label: string; sublabel?: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <MaterialCommunityIcons name={icon as any} size={22} color={Colors.brand.primary} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      {sublabel && <Text style={styles.featureSublabel}>{sublabel}</Text>}
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

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: haven.images?.[0]?.image_url ?? 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={22} color={Colors.gray[900]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color={Colors.gray[900]} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.roomName}>{haven.haven_name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.brand.primary} />
              <Text style={styles.ratingText}>{haven.rating ?? '4.5'}</Text>
              <Text style={styles.reviewsText}>(0 reviews)</Text>
            </View>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={13} color={Colors.gray[500]} />
              <Text style={styles.locationText}>{haven.tower}, {haven.floor}, Quezon City</Text>
            </View>
          </View>

          {/* Features */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featureGrid}>
            <FeatureItem icon="account-group-outline" label={`${haven.capacity ?? 4} guests`} />
            <FeatureItem icon="bed-outline" label={`${haven.beds ?? 1} Bed`} />
            <FeatureItem icon="shower" label="1 bathroom" />
            <FeatureItem icon="vector-square" label={`${haven.room_size ?? '45'} sqm`} />
          </ScrollView>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {['Overview', 'Amenities', 'Location'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'Overview' && (
              <>
                <Text style={styles.sectionTitle}>About this space</Text>
                <Text style={styles.description}>
                  {haven.description ?? 'Experience luxury and comfort in our premium room. Perfect for a relaxing staycation with all the modern amenities you need.'}
                </Text>
              </>
            )}

            {activeTab === 'Amenities' && (
              <View style={styles.amenitiesGrid}>
                {Object.entries(haven.amenities ?? {}).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <View key={key} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.brand.primary} />
                      <Text style={styles.amenityText}>{amenityLabels[key] ?? key}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'Location' && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationTitle}>{haven.tower}, {haven.floor}</Text>
                <Text style={styles.locationSubtitle}>Quezon City, Metro Manila, Philippines</Text>
                <View style={styles.mapPlaceholder}>
                  <Feather name="map" size={36} color={Colors.gray[300]} />
                  <Text style={styles.mapText}>Interactive map coming soon</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPriceLabel}>per night</Text>
          <Text style={styles.footerPrice}>
            ₱{parseFloat(haven.weekday_rate ?? '0').toLocaleString('en-US')}
          </Text>
        </View>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Reserve Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  imageContainer: { width: '100%', height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: {
    position: 'absolute', top: 50, left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  favoriteButton: {
    position: 'absolute', top: 50, right: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  content: {
    paddingTop: 24, paddingHorizontal: 20,
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20,
  },
  titleSection: { marginBottom: 20 },
  roomName: { fontSize: 24, fontWeight: '700', color: Colors.gray[900], marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  ratingText: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  reviewsText: { fontSize: 13, color: Colors.gray[500] },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 13, color: Colors.gray[500] },
  featureGrid: { paddingVertical: 8, gap: 12, marginBottom: 24 },
  featureItem: {
    width: 96, height: 100, backgroundColor: Colors.brand.primarySoft,
    borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center',
  },
  featureIconBox: { marginBottom: 6 },
  featureLabel: { fontSize: 11, fontWeight: '600', color: Colors.gray[900], textAlign: 'center' },
  featureSublabel: { fontSize: 9, color: Colors.gray[500], textAlign: 'center' },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100], marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 12, marginRight: 24,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  activeTabItem: { borderBottomColor: Colors.brand.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.gray[500] },
  activeTabText: { color: Colors.brand.primary, fontWeight: '700' },
  tabContent: { marginBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[900], marginBottom: 10 },
  description: { fontSize: 14, color: Colors.gray[600], lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', width: '48%',
    backgroundColor: Colors.gray[50], padding: 12, borderRadius: 10, gap: 8,
  },
  amenityText: { fontSize: 12, color: Colors.gray[700] },
  locationContainer: {},
  locationTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900], marginBottom: 4 },
  locationSubtitle: { fontSize: 13, color: Colors.gray[500], marginBottom: 16 },
  mapPlaceholder: {
    width: '100%', height: 160, backgroundColor: Colors.gray[100],
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.gray[300],
  },
  mapText: { marginTop: 8, fontSize: 12, color: Colors.gray[400] },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Colors.gray[100], backgroundColor: Colors.white,
  },
  footerPriceLabel: { fontSize: 11, color: Colors.gray[500] },
  footerPrice: { fontSize: 20, fontWeight: '700', color: Colors.brand.primary },
  reserveButton: {
    backgroundColor: Colors.brand.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  reserveButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
