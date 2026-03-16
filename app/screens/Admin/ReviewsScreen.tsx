import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const REVIEWS = [
  { id: 1, guest: 'Sarah Smith',   haven: 'Haven 205', rating: 5, date: 'Feb 20, 2026', text: 'Amazing stay! The room was spotless and the view was breathtaking. Will definitely come back.', replied: false, reply: '' },
  { id: 2, guest: 'John Doe',      haven: 'Haven 101', rating: 4, date: 'Feb 18, 2026', text: 'Great experience overall. Clean room, fast WiFi. Only minor issue was parking.', replied: true, reply: 'Thank you, John! We\'ll look into the parking situation.' },
  { id: 3, guest: 'Emily Davis',   haven: 'Haven 302', rating: 5, date: 'Feb 15, 2026', text: 'Perfect staycation spot. The pool access and Netflix were a plus!', replied: false, reply: '' },
  { id: 4, guest: 'Mike Johnson',  haven: 'Haven 103', rating: 3, date: 'Feb 10, 2026', text: 'Decent stay but the air conditioning was a bit noisy at night.', replied: true, reply: 'We apologize for the inconvenience, Mike! The AC unit has been serviced.' },
  { id: 5, guest: 'Ana Reyes',     haven: 'Haven 205', rating: 5, date: 'Feb 8, 2026',  text: 'Absolutely loved it! The breakfast was amazing and the staff were very friendly.', replied: false, reply: '' },
];

const FILTER_OPTIONS = ['All', '5★', '4★', '3★', '2★', '1★'];

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <MaterialCommunityIcons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={size}
          color={i <= count ? Colors.yellow[500] : Colors.gray[300]}
        />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState(REVIEWS);
  const [filter, setFilter] = useState('All');
  const [replyModal, setReplyModal] = useState<{ visible: boolean; id: number | null; text: string }>({ visible: false, id: null, text: '' });

  const filtered = filter === 'All' ? reviews : reviews.filter(r => r.rating === parseInt(filter));
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const handleSendReply = () => {
    if (!replyModal.text.trim()) return;
    setReviews(prev => prev.map(r => r.id === replyModal.id ? { ...r, replied: true, reply: replyModal.text } : r));
    setReplyModal({ visible: false, id: null, text: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guest Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.ratingBig}>
          <Text style={styles.ratingNumber}>{avgRating}</Text>
          <Stars count={Math.round(parseFloat(avgRating))} size={20} />
          <Text style={styles.ratingCount}>{reviews.length} reviews</Text>
        </View>
        <View style={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = (count / reviews.length) * 100;
            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.barLabel}>{star}★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: star >= 4 ? Colors.green[500] : star === 3 ? Colors.yellow[500] : Colors.red[500] }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 10 }}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && { backgroundColor: Colors.brand.primarySoft }]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && { color: Colors.brand.primaryDark }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(review => (
          <View key={review.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAvatar}>
                <Text style={styles.avatarText}>{review.guest[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guestName}>{review.guest}</Text>
                <Text style={styles.havenName}>{review.haven}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Stars count={review.rating} />
                <Text style={styles.dateText}>{review.date}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>

            {review.replied ? (
              <View style={styles.replyBox}>
                <View style={styles.replyHeader}>
                  <MaterialCommunityIcons name="reply" size={14} color={Colors.brand.primary} />
                  <Text style={styles.replyLabel}>Your Reply</Text>
                </View>
                <Text style={styles.replyText}>{review.reply}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => setReplyModal({ visible: true, id: review.id, text: '' })}
              >
                <MaterialCommunityIcons name="reply-outline" size={16} color={Colors.brand.primary} />
                <Text style={styles.replyBtnText}>Reply to Review</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={{ height: 32 }} />
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
            placeholderTextColor={Colors.gray[400]}
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
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  summary: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.white, padding: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  ratingBig: { alignItems: 'center', gap: 4, minWidth: 80 },
  ratingNumber: { fontSize: 36, fontWeight: '800', color: Colors.gray[900] },
  ratingCount: { fontSize: 11, color: Colors.gray[500] },
  ratingBars: { flex: 1, gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { fontSize: 11, color: Colors.gray[600], width: 22 },
  barTrack: { flex: 1, height: 6, backgroundColor: Colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barCount: { fontSize: 11, color: Colors.gray[500], width: 12, textAlign: 'right' },
  filterBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100], height: 54 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.gray[100] },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  list: { padding: 20, gap: 14 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.gray[100] },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand.primarySoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary },
  guestName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  havenName: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  dateText: { fontSize: 11, color: Colors.gray[400] },
  reviewText: { fontSize: 14, color: Colors.gray[700], lineHeight: 20, marginBottom: 12 },
  replyBox: { backgroundColor: Colors.brand.primarySoft, borderRadius: 10, padding: 12 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  replyLabel: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary },
  replyText: { fontSize: 13, color: Colors.gray[700] },
  replyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.brand.primarySoft, alignSelf: 'flex-start',
  },
  replyBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  overlay: { flex: 0.4, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[200], alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], marginBottom: 16 },
  replyInput: { borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12, padding: 14, fontSize: 15, color: Colors.gray[900], height: 120, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100], alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  sendBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: 'center' },
  sendText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
