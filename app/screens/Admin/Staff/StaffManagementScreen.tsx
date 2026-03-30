import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

type Staff = {
  id: number; name: string; role: string; email: string; phone: string; status: string;
};

const ROLES = ['Owner', 'CSR', 'Cleaner', 'Partner'];

const INITIAL_STAFF: Staff[] = [
  { id: 1, name: 'Maria Santos',   role: 'Owner',   email: 'maria@staycation.ph',   phone: '+63 912 345 6789', status: 'Active' },
  { id: 2, name: 'Juan dela Cruz', role: 'CSR',     email: 'juan@staycation.ph',    phone: '+63 923 456 7890', status: 'Active' },
  { id: 3, name: 'Anna Reyes',     role: 'CSR',     email: 'anna@staycation.ph',    phone: '+63 934 567 8901', status: 'Active' },
  { id: 4, name: 'Carlo Mendoza',  role: 'Cleaner', email: 'carlo@staycation.ph',   phone: '+63 945 678 9012', status: 'Active' },
  { id: 5, name: 'Liza Gomez',     role: 'Cleaner', email: 'liza@staycation.ph',    phone: '+63 956 789 0123', status: 'Active' },
  { id: 6, name: 'Ryan Torres',    role: 'Cleaner', email: 'ryan@staycation.ph',    phone: '+63 967 890 1234', status: 'Inactive' },
  { id: 7, name: 'Ben Cruz',       role: 'Partner', email: 'ben@partner.ph',        phone: '+63 978 901 2345', status: 'Active' },
  { id: 8, name: 'Grace Tan',      role: 'CSR',     email: 'grace@staycation.ph',   phone: '+63 989 012 3456', status: 'Active' },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  Owner:   { bg: Colors.brand.primarySoft, text: Colors.brand.primaryDark },
  CSR:     { bg: Colors.blue[100],         text: Colors.blue[500] },
  Cleaner: { bg: Colors.green[100],        text: Colors.green[500] },
  Partner: { bg: Colors.purple[500] + '20', text: Colors.purple[500] },
};

const BLANK = { name: '', role: 'CSR', email: '', phone: '', status: 'Active' };

export default function StaffManagementScreen() {
  const navigation = useNavigation<any>();
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [filterRole, setFilterRole] = useState('All');
  const [modal, setModal] = useState<{ visible: boolean; mode: 'add' | 'edit'; item: Staff | null }>({ visible: false, mode: 'add', item: null });
  const [form, setForm] = useState(BLANK);

  const filtered = filterRole === 'All' ? staff : staff.filter(s => s.role === filterRole);

  const openAdd = () => { setForm(BLANK); setModal({ visible: true, mode: 'add', item: null }); };
  const openEdit = (item: Staff) => {
    setForm({ name: item.name, role: item.role, email: item.email, phone: item.phone, status: item.status });
    setModal({ visible: true, mode: 'edit', item });
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Name and Email.');
      return;
    }
    if (modal.mode === 'add') {
      setStaff(prev => [...prev, { ...form, id: Date.now() }]);
    } else {
      setStaff(prev => prev.map(s => s.id === modal.item?.id ? { ...s, ...form } : s));
    }
    setModal({ visible: false, mode: 'add', item: null });
  };

  const handleDelete = (id: number) => {
    Alert.alert('Remove Staff', 'Are you sure you want to remove this staff member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setStaff(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Role Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 10, alignItems: 'center' }}>
        {['All', ...ROLES].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filterRole === r && { backgroundColor: Colors.brand.primarySoft }]}
            onPress={() => setFilterRole(r)}
          >
            <Text style={[styles.filterChipText, filterRole === r && { color: Colors.brand.primaryDark }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.countText}>{filtered.length} staff members</Text>
        {filtered.map(member => {
          const rc = roleColors[member.role] ?? { bg: Colors.gray[100], text: Colors.gray[600] };
          return (
            <View key={member.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarText}>{member.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.cardName}>{member.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: rc.text }]}>{member.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardEmail}>{member.email}</Text>
                  <Text style={styles.cardPhone}>{member.phone}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <View style={[styles.statusDot, { backgroundColor: member.status === 'Active' ? Colors.green[500] : Colors.gray[400] }]} />
                <Text style={styles.statusText}>{member.status}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(member)}>
                  <Feather name="edit-2" size={14} color={Colors.brand.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(member.id)}>
                  <Feather name="trash-2" size={14} color={Colors.red[500]} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal({ visible: false, mode: 'add', item: null })} />
        <ScrollView style={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{modal.mode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}</Text>

          {[
            { label: 'Full Name', key: 'name', placeholder: 'e.g. Juan dela Cruz' },
            { label: 'Email', key: 'email', placeholder: 'staff@email.com' },
            { label: 'Phone', key: 'phone', placeholder: '+63 900 000 0000' },
          ].map(field => (
            <View key={field.key} style={{ marginBottom: 14 }}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.textInput}
                value={(form as any)[field.key]}
                onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          ))}

          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, form.role === r && { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary }]}
                onPress={() => setForm(f => ({ ...f, role: r }))}
              >
                <Text style={[styles.roleBtnText, form.role === r && { color: Colors.brand.primary }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal({ visible: false, mode: 'add', item: null })}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{modal.mode === 'add' ? 'Add Staff' : 'Save Changes'}</Text>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
  filterBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], height: 54 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.gray[100] },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  list: { padding: 20, gap: 12 },
  countText: { fontSize: 12, color: Colors.gray[500], fontWeight: '600', marginBottom: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.gray[100] },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  cardAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  cardEmail: { fontSize: 12, color: Colors.gray[500] },
  cardPhone: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, color: Colors.gray[500], fontWeight: '500' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.brand.primarySoft },
  editBtnText: { fontSize: 12, fontWeight: '600', color: Colors.brand.primary },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.red[100], justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 0.3, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.gray[900], backgroundColor: Colors.gray[50], marginBottom: 0 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  roleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.gray[50] },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
