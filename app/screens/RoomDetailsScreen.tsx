import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

type RoomDetailsRouteProp = RouteProp<{ params: { haven: any } }, 'params'>;

export default function RoomDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoomDetailsRouteProp>();
  const { haven } = route.params || {};
  const [activeTab, setActiveTab] = useState('Overview');
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  const theme = {
    page: isDark ? '#0B1220' : Colors.white,
    surface: isDark ? '#111827' : Colors.white,
    surfaceSoft: isDark ? '#1F2937' : Colors.gray[50],
    panel: isDark ? '#1F2937' : '#FAF7ED',
    text: isDark ? '#E5E7EB' : Colors.gray[900],
    muted: isDark ? '#9CA3AF' : Colors.gray[500],
    border: isDark ? '#374151' : Colors.gray[100],
    iconBg: isDark ? '#1F2937' : Colors.white,
    icon: isDark ? '#E5E7EB' : Colors.gray[900],
    map: isDark ? '#1F2937' : Colors.gray[100],
    mapBorder: isDark ? '#4B5563' : Colors.gray[200],
  };

  if (!haven) return null;

  const FeatureItem = ({ icon, label, sublabel }: { icon: any; label: string; sublabel?: string }) => (
    <View style={[styles.featureItem, { backgroundColor: theme.panel }]}>
      <View style={styles.featureIconBox}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.brand.primary} />
      </View>
      <Text style={[styles.featureLabel, { color: theme.text }]}>{label}</Text>
      {sublabel && <Text style={[styles.featureSublabel, { color: theme.muted }]}>{sublabel}</Text>}
    </View>
  );

  const InfoCard = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
    <View style={[styles.infoCard, { borderColor: theme.border, backgroundColor: theme.surfaceSoft }]}>
      <Feather name={icon} size={24} color={Colors.brand.primary} style={styles.infoCardIcon} />
      <View style={styles.infoCardText}>
        <Text style={[styles.infoCardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.infoCardDescription, { color: theme.muted }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.page }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: haven.images?.[0]?.image_url || 'https://via.placeholder.com/400' }} style={styles.heroImage} />
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.iconBg }]} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color={theme.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.favoriteButton, { backgroundColor: theme.iconBg }]}>
            <Ionicons name="heart-outline" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={styles.titleSection}>
            <Text style={[styles.roomName, { color: theme.text }]}>{haven.haven_name}</Text>
            <View style={styles.ratingLocationRow}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={Colors.brand.primary} />
                <Text style={[styles.ratingText, { color: theme.text }]}>{haven.rating || '4.5'}</Text>
                <Text style={[styles.reviewsText, { color: theme.muted }]}>(0 reviews)</Text>
              </View>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color={theme.muted} />
                <Text style={[styles.locationText, { color: theme.muted }]}>
                  {haven.tower}, {haven.floor}, Quezon City
                </Text>
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featureGrid}>
            <FeatureItem icon="account-group-outline" label={`${haven.capacity || '4'} guests`} />
            <FeatureItem icon="bed-outline" label={`${haven.beds || '1'} Bed`} sublabel="size" />
            <FeatureItem icon="shower" label="1 bathroom" />
            <FeatureItem icon="vector-square" label={`${haven.room_size || '45.00'} Space`} />
          </ScrollView>

          <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
            {['Overview', 'Amenities', 'Location', 'Reviews'].map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}>
                <Text style={[styles.tabText, { color: theme.muted }, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'Overview' && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>About this space</Text>
                <Text style={[styles.description, { color: isDark ? '#CBD5E1' : Colors.gray[600] }]}>
                  {haven.description ||
                    'Experience luxury and comfort in our premium room. Perfect for a relaxing staycation with all the modern amenities you need.'}
                </Text>
              </>
            )}

            {activeTab === 'Amenities' && (
              <View style={styles.amenitiesGrid}>
                {Object.entries(haven.amenities || {}).map(([key, value]) => {
                  if (!value) return null;
                  const labels: Record<string, string> = {
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
                    <View key={key} style={[styles.amenityItem, { backgroundColor: theme.surfaceSoft }]}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.brand.primary} />
                      <Text style={[styles.amenityText, { color: isDark ? '#D1D5DB' : Colors.gray[700] }]}>{labels[key] || key}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'Location' && (
              <View style={styles.locationContainer}>
                <Text style={[styles.locationTitle, { color: theme.text }]}>
                  {haven.tower}, {haven.floor}
                </Text>
                <Text style={[styles.locationSubtitle, { color: theme.muted }]}>Quezon City, Metro Manila, Philippines</Text>
                <View style={[styles.mapPlaceholder, { backgroundColor: theme.map, borderColor: theme.mapBorder }]}>
                  <Feather name="map" size={40} color={theme.muted} />
                  <Text style={[styles.mapText, { color: theme.muted }]}>Interactive map coming soon</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoCardsRow}>
            <InfoCard icon="shield" title="Self check-in" description="Check yourself in with the keypad." />
            <InfoCard icon="clock" title="24/7 Support" description="We're here to help anytime." />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={styles.footerPriceSection}>
          <Text style={[styles.footerPriceLabel, { color: theme.muted }]}>Price</Text>
          <View style={styles.footerPriceRow}>
            <Text style={styles.footerPrice}>PHP {parseFloat(haven.weekday_rate).toLocaleString('en-US')}</Text>
            <Text style={[styles.footerPriceUnit, { color: isDark ? '#CBD5E1' : Colors.gray[600] }]}> / night</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Reserve Now</Text>
        </TouchableOpacity>
      </View>
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
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  titleSection: {
    marginBottom: 24,
  },
  roomName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 8,
  },
  ratingLocationRow: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  reviewsText: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  featureGrid: {
    paddingVertical: 10,
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    width: 100,
    height: 110,
    backgroundColor: '#FAF7ED',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconBox: {
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
    fontFamily: Fonts.poppins,
  },
  featureSublabel: {
    fontSize: 9,
    color: Colors.gray[500],
    textAlign: 'center',
    fontFamily: Fonts.inter,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: Colors.brand.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[500],
    fontFamily: Fonts.poppins,
  },
  activeTabText: {
    color: Colors.brand.primary,
    fontWeight: '700',
  },
  tabContent: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[600],
    lineHeight: 24,
    fontFamily: Fonts.inter,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  amenityText: {
    fontSize: 13,
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
  locationContainer: {
    padding: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginBottom: 16,
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.gray[200],
  },
  mapText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    backgroundColor: Colors.gray[50],
  },
  infoCardIcon: {
    marginBottom: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 11,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  footerPriceSection: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.poppins,
  },
  footerPriceUnit: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  reserveButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.poppins,
  },
});
