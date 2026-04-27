import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkInTime, setCheckInTime] = useState('2:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('12:00 PM');


  const InfoRow = ({ label, value, icon, color = Colors.brand.primary }: any) => (
    <TouchableOpacity style={styles.toggleRow} onPress={() => Alert.alert('Coming Soon', 'Time picker coming in next update.')}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
      <Feather name="chevron-right" size={16} color={Colors.gray[400]} style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  );

  const ToggleRow = ({ label, sublabel, value, onChange, icon, color = Colors.blue[500] }: any) => (
    <View style={styles.toggleRow}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSublabel}>{sublabel}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onChange}
        trackColor={{ false: Colors.gray[200], true: color + '20' }}
        thumbColor={value ? color : Colors.gray[300]} 
        ios_backgroundColor={Colors.gray[100]}
      />
    </View>
  );

  const SECTIONS = [
    {
      title: 'Notifications',
      items: [
        <ToggleRow key="push" label="Push Notifications" sublabel="Get alerts on your phone" value={pushNotif} onChange={setPushNotif} icon="bell-outline" color={Colors.blue[500]} />,
        <ToggleRow key="email" label="Email Notifications" sublabel="Receive email updates" value={emailNotif} onChange={setEmailNotif} icon="email-outline" color={Colors.blue[500]} />,
        <ToggleRow key="sms" label="SMS Notifications" sublabel="Get text message alerts" value={smsNotif} onChange={setSmsNotif} icon="message-text-outline" color={Colors.blue[500]} />,
      ],
    },
    {
      title: 'Booking Settings',
      items: [
        <InfoRow key="checkin" label="Check-in Time" value={checkInTime} icon="clock-in" color={Colors.green[500]} />,
        <InfoRow key="checkout" label="Check-out Time" value={checkOutTime} icon="clock-out" color={Colors.red[500]} />,
        <ToggleRow key="autoconfirm" label="Auto-confirm Bookings" sublabel="Automatically confirm new bookings" value={autoConfirm} onChange={setAutoConfirm} icon="calendar-check-outline" color={Colors.green[500]} />,
      ],
    },
    {
      title: 'System',
      items: [
        <ToggleRow key="maintenance" label="Maintenance Mode" sublabel="Disable guest bookings temporarily" value={maintenanceMode} onChange={(v: boolean) => { if (v) Alert.alert('Enable Maintenance Mode?', 'This will prevent new bookings.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Enable', style: 'destructive', onPress: () => setMaintenanceMode(true) }]); else setMaintenanceMode(false); }} icon="wrench-outline" color={Colors.red[500]} />,
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item}
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionCard}>
            {[
              { label: 'App Version', value: '1.0.0 (MVP)' },
              { label: 'Build', value: '2026.03' },
              { label: 'Environment', value: 'Development' },
            ].map((row, idx, arr) => (
              <React.Fragment key={row.label}>
                <View style={styles.aboutRow}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.aboutValue}>{row.value}</Text>
                </View>
                {idx < arr.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => {} },
          ])}
        >
          <MaterialCommunityIcons name="logout" size={18} color={Colors.red[500]} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  content: { padding: 20, gap: 20 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.gray[100], overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  rowSublabel: { fontSize: 12, color: Colors.gray[500], marginTop: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.brand.primary },
  divider: { height: 1, backgroundColor: Colors.gray[50], marginLeft: 66 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  aboutValue: { fontSize: 13, color: Colors.gray[500] },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.red[100], marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.red[500] },
});
