import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

type RoomDetailsRouteProp = RouteProp<{ params: { haven: any } }, 'params'>;

export default function RoomDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoomDetailsRouteProp>();
  const { haven } = route.params || {};
  const [activeTab, setActiveTab] = useState('Overview');

  if (!haven) return null;

  const FeatureItem = ({ icon, label, sublabel }: { icon: any, label: string, sublabel?: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.brand.primary} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      {sublabel && <Text style={styles.featureSublabel}>{sublabel}</Text>}
    </View>
  );

  const InfoCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
    <View style={styles.infoCard}>
      <Feather name={icon} size={24} color={Colors.brand.primary} style={styles.infoCardIcon} />
      <View style={styles.infoCardText}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        <Text style={styles.infoCardDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: haven.images?.[0]?.image_url || 'https://via.placeholder.com/400' }} 
            style={styles.heroImage} 
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color={Colors.gray[900]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={22} color={Colors.gray[900]} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title & Location Section */}
          <View style={styles.titleSection}>
            <Text style={styles.roomName}>{haven.haven_name}</Text>
            <View style={styles.ratingLocationRow}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={Colors.brand.primary} />
                <Text style={styles.ratingText}>{haven.rating || '4.5'}</Text>
                <Text style={styles.reviewsText}>(0 reviews)</Text>
              </View>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color={Colors.gray[500]} />
                <Text style={styles.locationText}>{haven.tower}, {haven.floor}, Quezon City</Text>
              </View>
            </View>
          </View>

          {/* Feature Grid */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.featureGrid}
          >
            <FeatureItem icon="account-group-outline" label={`${haven.capacity || '4'} guests`} />
            <FeatureItem icon="bed-outline" label="1 Long and Pullout" sublabel="bed size" />
            <FeatureItem icon="shower" label="1 bathroom" />
            <FeatureItem icon="vector-square" label="45.00 Space" />
          </ScrollView>

          {/* Navigation Tabs */}
          <View style={styles.tabBar}>
            {['Overview', 'Amenities', 'Location', 'Reviews'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overview Content */}
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About this space</Text>
            <Text style={styles.description}>
              Experience luxury and comfort in our {haven.room_type || 'Studio'} room. 
              Perfect for a relaxing staycation with all the modern amenities you need. 
              This premium haven offers a unique blend of style and functionality, 
              ensuring a memorable stay in the heart of Quezon City.
            </Text>
          </View>

          {/* Information Cards Section */}
          <View style={styles.infoCardsRow}>
            <InfoCard 
              icon="shield" 
              title="Self check-in" 
              description="Check yourself in with the keypad." 
            />
            <InfoCard 
              icon="clock" 
              title="24/7 Support" 
              description="We're here to help anytime." 
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPriceSection}>
          <Text style={styles.footerPriceLabel}>Price</Text>
          <View style={styles.footerPriceRow}>
            <Text style={styles.footerPrice}>₱{parseFloat(haven.weekday_rate).toLocaleString('en-US')}</Text>
            <Text style={styles.footerPriceUnit}> / night</Text>
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
    backgroundColor: '#FAF7ED', // Light beige
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