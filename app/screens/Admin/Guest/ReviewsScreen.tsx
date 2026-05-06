import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Styles';

const REVIEWS = [
  { id: 1, guest: 'Juan Dela Cruz', haven: 'Haven A – City View', rating: 5, date: '15/12/2024', text: 'Amazing experience! The haven was spotless and the view was breathtaking. Staff was very accommodating. Will definitely come back!', replied: false, reply: '', helpful: 12 },
  { id: 2, guest: 'Maria Santos', haven: 'Haven B – Ocean View', rating: 4, date: '14/12/2024', text: 'Great place overall. The ocean view was stunning. Only minor issue was the WiFi was a bit slow, but everything else was perfect.', replied: true, reply: "Thank you for your feedback! We've upgraded our WiFi to provide better service.", helpful: 8 },
  { id: 3, guest: 'Pedro Reyes', haven: 'Haven C – Pool View', rating: 5, date: '13/12/2024', text: 'Perfect for families! The kids loved the pool. Very clean and well-maintained. Highly recommended!', replied: true, reply: "We're thrilled to hear your family had a great time! Thank you!", helpful: 15 },
  { id: 4, guest: 'Ana Garcia', haven: 'Haven D – Garden View', rating: 2, date: '12/12/2024', text: 'Good location but the AC needs fixing. Garden view was nice and peaceful. Service was okay.', replied: false, reply: '', helpful: 5 },
  { id: 5, guest: 'Carlos Mendoza', haven: 'Haven E – Mountain View', rating: 5, date: '11/12/2024', text: 'Absolutely breathtaking views! The room was immaculate and every detail was taken care of. 10/10 experience.', replied: false, reply: '', helpful: 20 },
];

const FILTER_OPTIONS = ['All', '5★', '4★', '3★', '2★', '1★'];

const STAT_CARDS = [
  { label: 'Average Rating', value: '4.5', sub: '+0.2', icon: 'star-outline', bg: '#F59E0B', textColor: '#fff' },
  { label: 'Total Reviews', value: '156', sub: '+12', icon: 'chat-outline', bg: '#3B82F6', textColor: '#fff' },
  { label: '5-Star Reviews', value: '89%', sub: '+5%', icon: 'trending-up', bg: '#22C55E', textColor: '#fff' },
  { label: 'Response Rate', value: '92%', sub: '+3%', icon: 'thumb-up-outline', bg: '#8B5CF6', textColor: '#fff' },
];

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <MaterialCommunityIcons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={size}
          color={i <= count ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

function StatCard({ label, value, sub, icon, bg }: typeof STAT_CARDS[0]) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statFooter}>
        <Ionicons name="trending-up" size={12} color="rgba(255,255,255,0.9)" />
        <Text style={styles.statSub}>{sub}</Text>
      </View>
      <View style={styles.statIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={32} color="rgba(255,255,255,0.3)" />
      </View>
    </View>
  );
}

export default function ReviewsScreen() {
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState(REVIEWS);
  const [filter, setFilter] = useState('All');
  const [replyModal, setReplyModal] = useState<{ visible: boolean; id: number | null; text: string }>({ visible: false, id: null, text: '' });

  const filtered = filter === 'All' ? reviews : reviews.filter(r => r.rating === parseInt(filter));

  const handleSendReply = () => {
    if (!replyModal.text.trim()) return;
    setReviews(prev => prev.map(r => r.id === replyModal.id ? { ...r, replied: true, reply: replyModal.text } : r));
    setReplyModal({ visible: false, id: null, text: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Reviews & Feedback</Text>
          <Text style={styles.headerSub}>Monitor and respond to guest reviews</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stat Cards */}
        <View style={styles.statsRow}>
          {STAT_CARDS.map(card => <StatCard key={card.label} {...card} />)}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Reviews</Text>

          {/* Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {FILTER_OPTIONS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, filter === f && styles.chipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Review Cards */}
          <View style={{ gap: 0 }}>
            {filtered.map((review, index) => (
              <View key={review.id} style={[styles.reviewRow, index < filtered.length - 1 && styles.reviewDivider]}>
                {/* Top row */}
                <View style={styles.reviewTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestName}>{review.guest}</Text>
                    <Text style={styles.havenName}>{review.haven}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Stars count={review.rating} size={15} />
                    <Text style={styles.dateText}>{review.date}</Text>
                  </View>
                </View>

                {/* Review text */}
                <Text style={styles.reviewText}>{review.text}</Text>

                {/* Reply or button */}
                {review.replied ? (
                  <View style={styles.replyBox}>
                    <View style={styles.replyHeader}>
                      <View style={styles.replyAccent} />
                      <Text style={styles.replyLabel}>Your Response:</Text>
                    </View>
                    <Text style={styles.replyText}>{review.reply}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={() => setReplyModal({ visible: true, id: review.id, text: '' })}
                  >
                    <Text style={styles.replyBtnText}>Respond to Review</Text>
                  </TouchableOpacity>
                )}

                {/* Helpful */}
                <View style={styles.helpfulRow}>
                  <Ionicons name="thumbs-up-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.helpfulText}>{review.helpful} found this helpful</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Reply Modal */}
      <Modal visible={replyModal.visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setReplyModal({ visible: false, id: null, text: '' })} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Reply to Review</Text>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={replyModal.text}
            onChangeText={t => setReplyModal(prev => ({ ...prev, text: t }))}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReplyModal({ visible: false, id: null, text: '' })}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendReply}>
              <Text style={styles.sendText}>Send Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  // Stat Cards
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: 14,
  },
  statCard: {
    flex: 1, minWidth: '44%', borderRadius: 14,
    padding: 14, overflow: 'hidden',
    position: 'relative', minHeight: 90,
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statFooter: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  statSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  statIconWrap: { position: 'absolute', right: 10, top: 10 },

  // Section
  section: {
    backgroundColor: '#fff', marginHorizontal: 14, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },

  // Filters
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#2563EB' },

  // Review row
  reviewRow: { paddingVertical: 16 },
  reviewDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  guestName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  havenName: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  reviewText: { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 10 },

  // Reply box (existing reply)
  replyBox: {
    backgroundColor: '#EFF6FF', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  replyAccent: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#3B82F6' },
  replyLabel: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  replyText: { fontSize: 13, color: '#3B82F6', lineHeight: 18 },

  // Reply button
  replyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8,
  },
  replyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Helpful
  helpfulRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helpfulText: { fontSize: 12, color: '#9CA3AF' },

  // Modal
  overlay: { flex: 0.45, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  replyInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#111827', height: 120, marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  sendBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F59E0B', alignItems: 'center',
  },
  sendText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});