import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type Partner = { id: number; name: string; type: string; contact: string; email: string; contractEnd: string; status: string; };

const PARTNER_TYPES = ['Cleaning', 'Maintenance', 'Laundry', 'Catering', 'Security'];

const INITIAL_PARTNERS: Partner[] = [
  { id: 1, name: 'CleanPro Services',     type: 'Cleaning',     contact: '+63 912 100 1001', email: 'cleanpro@partner.ph',    contractEnd: 'Dec 31, 2026', status: 'Active' },
  { id: 2, name: 'FixIt Maintenance Co.', type: 'Maintenance',  contact: '+63 923 200 2002', email: 'fixit@partner.ph',       contractEnd: 'Jun 30, 2026', status: 'Active' },
  { id: 3, name: 'FreshWash Laundry',     type: 'Laundry',      contact: '+63 934 300 3003', email: 'freshwash@partner.ph',   contractEnd: 'Mar 31, 2026', status: 'Expiring' },
  { id: 4, name: 'TastyBites Catering',   type: 'Catering',     contact: '+63 945 400 4004', email: 'tastybites@partner.ph',  contractEnd: 'Dec 31, 2025', status: 'Expired' },
  { id: 5, name: 'SecureGuard Inc.',       type: 'Security',     contact: '+63 956 500 5005', email: 'secureguard@partner.ph', contractEnd: 'Sep 30, 2026', status: 'Active' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Active:   { bg: Colors.green[100],  text: Colors.green[500] },
  Expiring: { bg: Colors.yellow[100], text: '#92400E' },
  Expired:  { bg: Colors.red[100],    text: Colors.red[500] },
};

const typeIcons: Record<string, string> = {
  Cleaning: 'broom', Maintenance: 'wrench', Laundry: 'washing-machine',
  Catering: 'food', Security: 'shield-check',
};

const BLANK = { name: '', type: 'Cleaning', contact: '', email: '', contractEnd: '', status: 'Active' };

export default function PartnerManagementScreen() {
  const navigation = useNavigation<any>();
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [modal, setModal] = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Partner | null }>({ visible: false, mode: 'add', item: null });
  const [form, setForm] = useState(BLANK);

  const openAdd = () => { setForm(BLANK); setModal({ visible: true, mode: 'add', item: null }); };
  const openEdit = (item: Partner) => {
    setForm({ name: item.name, type: item.type, contact: item.contact, email: item.email, contractEnd: item.contractEnd, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };
  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Missing Fields', 'Please enter partner name.'); return; }
    if (modal.mode === 'add') setPartners(prev => [...prev, { ...form, id: Date.now() }]);
    else setPartners(prev => prev.map(p => p.id === modal.item?.id ? { ...p, ...form } : p));
    setModal({ visible: false, mode: 'add', item: null });
  };
  const handleDelete = (id: number) => {
    Alert.alert('Remove Partner', 'Remove this partner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPartners(prev => prev.filter(p => p.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total', value: partners.length, color: Colors.brand.primary },
          { label: 'Active', value: partners.filter(p => p.status === 'Active').length, color: Colors.green[500] },
          { label: 'Expiring', value: partners.filter(p => p.status === 'Expiring').length, color: Colors.yellow[500] },
          { label: 'Expired', value: partners.filter(p => p.status === 'Expired').length, color: Colors.red[500] },
        ].map(s => (
          <View key={s.label} style={styles.summaryBox}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {partners.map(partner => {
          const sc = statusColors[partner.status];
          const icon = typeIcons[partner.type] ?? 'briefcase-outline';
          return (
            <View key={partner.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.typeIcon, { backgroundColor: Colors.brand.primarySoft }]}>
                  <MaterialCommunityIcons name={icon as any} size={22} color={Colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{partner.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.partnerType}>{partner.type}</Text>
                </View>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="phone-outline" size={13} color={Colors.gray[400]} />
                  <Text style={styles.infoText}>{partner.contact}</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="email-outline" size={13} color={Colors.gray[400]} />
                  <Text style={styles.infoText}>{partner.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar-clock" size={13} color={Colors.gray[400]} />
                  <Text style={styles.infoText}>Contract ends: {partner.contractEnd}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(partner)}>
                  <Feather name="edit-2" size={14} color={Colors.brand.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(partner.id)}>
                  <Feather name="trash-2" size={14} color={Colors.red[500]} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={modal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal({ visible: false, mode: 'add', item: null })} />
        <ScrollView style={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{modal.mode === 'add' ? 'Add Partner' : 'Edit Partner'}</Text>
          {[
            { label: 'Company Name', key: 'name', placeholder: 'e.g. CleanPro Services' },
            { label: 'Contact Number', key: 'contact', placeholder: '+63 900 000 0000' },
            { label: 'Email', key: 'email', placeholder: 'partner@email.com' },
            { label: 'Contract End Date', key: 'contractEnd', placeholder: 'e.g. Dec 31, 2026' },
          ].map(f => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput style={styles.textInput} value={(form as any)[f.key]} onChangeText={v => setForm(ff => ({ ...ff, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={Colors.gray[400]} />
            </View>
          ))}
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeRow}>
            {PARTNER_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, form.type === t && { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary }]} onPress={() => setForm(f => ({ ...f, type: t }))}>
                <Text style={[styles.typeBtnText, form.type === t && { color: Colors.brand.primary }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal({ visible: false, mode: 'add', item: null })}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{modal.mode === 'add' ? 'Add Partner' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  summaryBox: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  list: { padding: 20, gap: 14 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.gray[100] },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  typeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  partnerName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  partnerType: { fontSize: 12, color: Colors.gray[500] },
  infoGrid: { gap: 6, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: Colors.gray[600] },
  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.brand.primarySoft },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  deleteBtn: { width: 40, height: 38, borderRadius: 10, backgroundColor: Colors.red[100], justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 0.3, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.gray[900], backgroundColor: Colors.gray[50] },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.gray[50] },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
