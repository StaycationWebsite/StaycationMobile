import React from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const MENU_SECTIONS = [
  {
    title: 'Management',
    items: [
      { label: 'Staff Management',      icon: 'account-group-outline',    screen: 'Staff',       color: Colors.blue[500] },
      { label: 'User Management',        icon: 'account-multiple-outline', screen: 'Users',       color: Colors.green[500] },
      { label: 'Partner Management',     icon: 'handshake-outline',        screen: 'Partners',    color: Colors.brand.primary },
      { label: 'Haven Management',       icon: 'home-city-outline',        screen: 'ManageHavens',color: Colors.purple[500] },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Guest Messages',  icon: 'message-text-outline',  screen: 'GuestMessages', color: Colors.blue[500] },
      { label: 'Reviews',         icon: 'star-outline',          screen: 'Reviews',        color: Colors.yellow[500] },
    ],
  },
  {
    title: 'Reports & Logs',
    items: [
      { label: 'Reports',     icon: 'chart-bar',          screen: 'Reports',    color: Colors.green[500] },
      { label: 'Audit Logs',  icon: 'clipboard-list-outline', screen: 'AuditLogs', color: Colors.red[500] },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings',  icon: 'cog-outline',    screen: 'Settings', color: Colors.gray[700] },
      { label: 'Profile',   icon: 'account-circle-outline', screen: 'Profile', color: Colors.brand.primary },
    ],
  },
];

export default function MoreMenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={28} color={Colors.brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>Admin User</Text>
            <Text style={styles.adminRole}>Super Admin · Staycation Haven</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.screen}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Feather name="chevron-right" size={16} color={Colors.gray[400]} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.brand.primaryLight,
  },
  adminName: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  adminRole: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  content: { padding: 20, gap: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  divider: { height: 1, backgroundColor: Colors.gray[50], marginLeft: 66 },
});
