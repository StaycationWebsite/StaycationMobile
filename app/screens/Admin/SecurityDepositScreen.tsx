import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../constants/Styles';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

const INITIAL_DEPOSITS = [
  { id: 1, guest: 'John Doe', room: 'Haven 101', amount: 5000, status: 'Held', checkIn: 'Feb 20', checkOut: 'Feb 23' },
  { id: 2, guest: 'Sarah Smith', room: 'Haven 205', amount: 5000, status: 'Released', checkIn: 'Feb 18', checkOut: 'Feb 21' },
  { id: 3, guest: 'Mike Johnson', room: 'Haven 103', amount: 5000, status: 'Held', checkIn: 'Feb 21', checkOut: 'Feb 24' },
  { id: 4, guest: 'Emily Davis', room: 'Haven 302', amount: 5000, status: 'Deducted', checkIn: 'Feb 15', checkOut: 'Feb 18' },
];

const FILTERS = ['All', 'Held', 'Released', 'Deducted'];

export default function SecurityDepositScreen() {
  const [deposits, setDeposits] = useState(INITIAL_DEPOSITS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [deductModal, setDeductModal] = useState<{ visible: boolean; id: number | null }>({ visible: false, id: null });
  const [deductNote, setDeductNote] = useState('');
  const [deductAmount, setDeductAmount] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRelease = (id: number) => {
    Alert.alert('Release Deposit', 'Return the full security deposit to the guest?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Release', style: 'default',
        onPress: () => setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'Released' } : d)),
      },
    ]);
  };

  const handleDeductConfirm = () => {
    if (!deductAmount || isNaN(Number(deductAmount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid deduction amount.');
      return;
    }
    setDeposits(prev => prev.map(d =>
      d.id === deductModal.id
        ? { ...d, status: 'Deducted', amount: d.amount - Number(deductAmount) }
        : d
    ));
    setDeductModal({ visible: false, id: null });
    setDeductNote('');
    setDeductAmount('');
    Alert.alert('Deduction Applied', `₱${Number(deductAmount).toLocaleString()} has been deducted from the deposit.`);
  };

  const filtered = deposits.filter(d => activeFilter === 'All' || d.status === activeFilter);
  const totalHeld = deposits.filter(d => d.status === 'Held').reduce((s, d) => s + d.amount, 0);
  const totalReleased = deposits.filter(d => d.status === 'Released').reduce((s, d) => s + d.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Security Deposits</Text>
          <Text style={styles.headerSubtitle}>{deposits.length} total deposits</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <View style={styles.summarySection}>
          <Card style={styles.summaryCard}>
            <MaterialCommunityIcons name="shield-lock" size={28} color={Colors.yellow[500]} />
            <Text style={styles.summaryValue}>₱{totalHeld.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Held</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <MaterialCommunityIcons name="shield-check" size={28} color={Colors.green[500]} />
            <Text style={styles.summaryValue}>₱{totalReleased.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Released</Text>
          </Card>
        </View>

        <View style={styles.filterChips}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="shield-off-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} deposits</Text>
            </View>
          ) : filtered.map(deposit => (
            <Card key={deposit.id} style={styles.depositCard} variant="elevated">
              <View style={styles.depositHeader}>
                <View style={styles.guestInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{deposit.guest[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{deposit.guest}</Text>
                    <Text style={styles.roomText}>{deposit.room}</Text>
                  </View>
                </View>
                <Badge
                  label={deposit.status}
                  variant={deposit.status === 'Held' ? 'warning' : deposit.status === 'Released' ? 'success' : 'error'}
                  size="sm"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.depositDetails}>
                <View style={styles.amountRow}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={Colors.brand.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Security Deposit</Text>
                    <Text style={styles.amountValue}>₱{deposit.amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.datesRow}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    <Text style={styles.dateValue}>{deposit.checkIn}</Text>
                  </View>
                  <View style={styles.dateSeparator} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    <Text style={styles.dateValue}>{deposit.checkOut}</Text>
                  </View>
                </View>
              </View>

              {deposit.status === 'Held' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.releaseButton} onPress={() => handleRelease(deposit.id)}>
                    <Feather name="check-circle" size={16} color={Colors.white} />
                    <Text style={styles.releaseText}>Release</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deductButton}
                    onPress={() => { setDeductModal({ visible: true, id: deposit.id }); setDeductAmount(String(deposit.amount)); }}
                  >
                    <Feather name="alert-circle" size={16} color={Colors.red[500]} />
                    <Text style={styles.deductText}>Deduct</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Deduct Modal */}
      <Modal visible={deductModal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDeductModal({ visible: false, id: null })} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Deduct from Deposit</Text>
          <Text style={styles.modalSub}>Enter the amount to deduct for damages or fees.</Text>

          <Text style={styles.inputLabel}>Deduction Amount (₱)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 1000"
            keyboardType="numeric"
            value={deductAmount}
            onChangeText={setDeductAmount}
            placeholderTextColor={Colors.gray[400]}
          />

          <Text style={styles.inputLabel}>Reason / Notes (optional)</Text>
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="e.g. Broken window, stained sheets..."
            multiline
            value={deductNote}
            onChangeText={setDeductNote}
            placeholderTextColor={Colors.gray[400]}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeductModal({ visible: false, id: null })}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleDeductConfirm}>
              <Text style={styles.applyBtnText}>Apply Deduction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  summarySection: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  summaryCard: { flex: 1, padding: 16, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginTop: 8 },
  summaryLabel: { fontSize: 12, color: Colors.gray[500], marginTop: 4 },
  filterChips: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipActive: { backgroundColor: Colors.brand.primarySoft },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.brand.primaryDark },
  content: { padding: 20, gap: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },
  depositCard: { padding: 16 },
  depositHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  guestInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary },
  guestName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  roomText: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  depositDetails: { gap: 12, marginBottom: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amountLabel: { fontSize: 12, color: Colors.gray[500] },
  amountValue: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary, marginTop: 2 },
  datesRow: { flexDirection: 'row', alignItems: 'center' },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 11, color: Colors.gray[500], marginBottom: 4 },
  dateValue: { fontSize: 13, fontWeight: '600', color: Colors.gray[900] },
  dateSeparator: { width: 1, height: 30, backgroundColor: Colors.gray[200], marginHorizontal: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  releaseButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.green[500],
  },
  releaseText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  deductButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.red[100],
  },
  deductText: { fontSize: 13, fontWeight: '600', color: Colors.red[500] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 6 },
  modalSub: { fontSize: 13, color: Colors.gray[500], marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: Colors.gray[900], backgroundColor: Colors.gray[50], marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  applyBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.red[500], alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});