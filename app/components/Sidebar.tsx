import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  SafeAreaView,
  Pressable 
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import { useNavigation } from '@react-navigation/native';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  activeRoute?: string;
}

export default function Sidebar({ visible, onClose, activeRoute = 'Dashboard' }: SidebarProps) {
  const navigation = useNavigation<any>();

  const MenuItem = ({ icon, label, route, iconColor = Colors.gray[600], iconType = 'feather' }: any) => {
    const isActive = label === activeRoute;
    
    const renderIcon = () => {
      const color = isActive ? Colors.white : iconColor;
      if (iconType === 'material') return <MaterialCommunityIcons name={icon} size={20} color={color} />;
      if (iconType === 'ion') return <Ionicons name={icon} size={20} color={color} />;
      if (iconType === 'fa5') return <FontAwesome5 name={icon} size={18} color={color} />;
      return <Feather name={icon} size={20} color={color} />;
    };

    return (
      <TouchableOpacity 
        style={[styles.menuItem, isActive && styles.activeMenuItem]}
        onPress={() => {
          if (route) {
            navigation.navigate(route);
          }
          onClose();
        }}
      >
        <View style={styles.menuIconWrapper}>
          {renderIcon()}
        </View>
        <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sidebarContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.brandTitle}>Staycation Haven</Text>
                <Text style={styles.portalSubtitle}>Owner Portal</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={Colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.menuContent}>
                {/* Active Dashboard */}
                <MenuItem 
                  icon="home" 
                  label="Dashboard" 
                  route="AdminDashboard"
                  iconColor={Colors.brand.primary} 
                  iconType="feather"
                />

                <View style={styles.divider} />

                {/* Overview Section */}
                <SectionHeader title="OVERVIEW" />
                <MenuItem 
                  icon="chart-bar" 
                  label="Analytics & Reports" 
                  iconColor="#0D9488" 
                  iconType="material" 
                />

                {/* Bookings Section */}
                <SectionHeader title="BOOKINGS" />
                <MenuItem 
                  icon="calendar-month" 
                  label="Booking Calendar" 
                  route="AdminBookingCalender"
                  iconColor="#8B5CF6" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="note-text-outline" 
                  label="Reservations" 
                  iconColor="#8B5CF6" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="calendar-remove" 
                  label="Blocked Dates" 
                  iconColor="#EF4444" 
                  iconType="material" 
                />

                {/* Property Section */}
                <SectionHeader title="PROPERTY" />
                <MenuItem 
                  icon="office-building" 
                  label="Haven Management" 
                  route="ManageHavens"
                  iconColor="#8B5CF6" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="wrench" 
                  label="Maintenance" 
                  iconColor="#F59E0B" 
                  iconType="feather" 
                />
                <MenuItem 
                  icon="sparkles" 
                  label="Cleaning Management" 
                  iconColor="#F59E0B" 
                  iconType="ion" 
                />

                {/* Finance Section */}
                <SectionHeader title="FINANCE" />
                <MenuItem 
                  icon="currency-php" 
                  label="Revenue Management" 
                  iconColor="#10B981" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="credit-card-outline" 
                  label="Payment Methods" 
                  iconColor="#8B5CF6" 
                  iconType="material" 
                />

                {/* Communication Section */}
                <SectionHeader title="COMMUNICATION" />
                <MenuItem 
                  icon="headphones" 
                  label="Guest Assistance" 
                  iconColor="#EC4899" 
                  iconType="feather" 
                />
                <MenuItem 
                  icon="message-text-outline" 
                  label="Messages" 
                  iconColor="#10B981" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="star-outline" 
                  label="Reviews & Feedback" 
                  iconColor="#EAB308" 
                  iconType="material" 
                />

                {/* Team Section */}
                <SectionHeader title="TEAM" />
                <MenuItem 
                  icon="account-group-outline" 
                  label="Staff Management" 
                  iconColor="#EAB308" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="account-group" 
                  label="User Management" 
                  iconColor="#0D9488" 
                  iconType="material" 
                />
                <MenuItem 
                  icon="handshake" 
                  label="Partner Management" 
                  iconColor="#3B82F6" 
                  iconType="fa5" 
                />

                {/* System Section */}
                <SectionHeader title="SYSTEM" />
                <MenuItem 
                  icon="settings" 
                  label="Settings" 
                  iconColor="#6B7280" 
                  iconType="feather" 
                />
                <MenuItem 
                  icon="shield-alert-outline" 
                  label="Audit Logs" 
                  iconColor="#EF4444" 
                  iconType="material" 
                />
              </View>
            </ScrollView>

            {/* Footer / User Info */}
            <View style={styles.sidebarFooter}>
              <View style={styles.userBrief}>
                <View style={styles.miniAvatar} />
                <View>
                  <Text style={styles.userName}>Admin Chief</Text>
                  <Text style={styles.userRole}>Super Admin</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B', // Dark navy blue
    fontFamily: Fonts.poppins,
  },
  portalSubtitle: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.gray[400],
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: Colors.brand.primary, // Mustard gold
  },
  menuIconWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
  },
  activeMenuLabel: {
    color: Colors.white,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginVertical: 8,
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  userBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[200],
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  userRole: {
    fontSize: 11,
    color: Colors.gray[500],
  }
});
