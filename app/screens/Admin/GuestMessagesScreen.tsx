import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const MOCK_CONVERSATIONS = [
  {
    id: '1', name: 'John Doe', room: 'Haven 101', lastMessage: 'What time is check-in?',
    time: '2m ago', unread: 2, status: 'Confirmed',
  },
  {
    id: '2', name: 'Sarah Smith', room: 'Haven 205', lastMessage: 'Can we get extra towels?',
    time: '15m ago', unread: 1, status: 'Checked-in',
  },
  {
    id: '3', name: 'Mike Johnson', room: 'Haven 103', lastMessage: 'Thanks for the welcome note!',
    time: '1h ago', unread: 0, status: 'Checked-in',
  },
  {
    id: '4', name: 'Emily Davis', room: 'Haven 302', lastMessage: 'Is parking available?',
    time: '3h ago', unread: 0, status: 'Confirmed',
  },
  {
    id: '5', name: 'Carlos Reyes', room: 'Haven 104', lastMessage: 'Late checkout possible?',
    time: 'Yesterday', unread: 0, status: 'Checked-out',
  },
];

const MOCK_MESSAGES: Record<string, { id: string; text: string; sender: 'guest' | 'admin'; time: string }[]> = {
  '1': [
    { id: 'm1', text: 'Hi! Just wanted to confirm my reservation for Feb 20-23.', sender: 'guest', time: '9:00 AM' },
    { id: 'm2', text: 'Hello John! Yes, your reservation is confirmed. Welcome to Staycation Haven!', sender: 'admin', time: '9:05 AM' },
    { id: 'm3', text: 'What time is check-in?', sender: 'guest', time: '9:10 AM' },
  ],
  '2': [
    { id: 'm1', text: 'Good morning! We just checked in. The room is amazing!', sender: 'guest', time: '11:00 AM' },
    { id: 'm2', text: 'So glad you love it! Let us know if you need anything.', sender: 'admin', time: '11:05 AM' },
    { id: 'm3', text: 'Can we get extra towels?', sender: 'guest', time: '11:30 AM' },
  ],
};

const QUICK_REPLIES = [
  'Check-in is at 2:00 PM 🕑',
  'Check-out is at 12:00 NN',
  'Our team will assist you shortly!',
  'Thank you for staying with us! 🏡',
];

export default function GuestMessagesScreen() {
  const navigation = useNavigation<any>();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [search, setSearch] = useState('');

  const activeConvo = MOCK_CONVERSATIONS.find(c => c.id === selectedConvo);
  const currentMessages = selectedConvo ? (messages[selectedConvo] ?? []) : [];

  const sendMessage = (text: string) => {
    if (!text.trim() || !selectedConvo) return;
    const newMsg = {
      id: `m${Date.now()}`,
      text: text.trim(),
      sender: 'admin' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedConvo]: [...(prev[selectedConvo] ?? []), newMsg],
    }));
    setMessageText('');
  };

  const statusColor = (status: string) =>
    status === 'Checked-in' ? Colors.green[500] :
    status === 'Confirmed' ? Colors.blue[500] : Colors.gray[400];

  const filteredConvos = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.room.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedConvo && activeConvo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedConvo(null)}>
            <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
          </TouchableOpacity>
          <View style={styles.chatHeaderAvatar}>
            <Text style={styles.chatHeaderInitial}>{activeConvo.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatHeaderName}>{activeConvo.name}</Text>
            <View style={styles.chatHeaderMeta}>
              <View style={[styles.statusDot, { backgroundColor: statusColor(activeConvo.status) }]} />
              <Text style={styles.chatHeaderRoom}>{activeConvo.room} · {activeConvo.status}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatMoreBtn}>
            <Feather name="more-vertical" size={20} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {currentMessages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleWrapper,
                  msg.sender === 'admin' ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                ]}
              >
                {msg.sender === 'guest' && (
                  <View style={styles.messageMiniAvatar}>
                    <Text style={styles.messageMiniAvatarText}>{activeConvo.name[0]}</Text>
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  msg.sender === 'admin' ? styles.bubbleAdmin : styles.bubbleGuest,
                ]}>
                  <Text style={[styles.bubbleText, msg.sender === 'admin' && styles.bubbleTextAdmin]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.bubbleTime, msg.sender === 'admin' && styles.bubbleTimeAdmin]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Quick Replies */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickRepliesScroll}
            contentContainerStyle={styles.quickRepliesContent}
          >
            {QUICK_REPLIES.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickReplyChip}
                onPress={() => sendMessage(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <View style={styles.inputBarInner}>
              <TextInput
                style={styles.messageInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor={Colors.gray[400]}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
                onPress={() => sendMessage(messageText)}
                disabled={!messageText.trim()}
              >
                <MaterialCommunityIcons name="send" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guest Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="message-text" size={20} color={Colors.brand.primary} />
          <Text style={styles.statValue}>{MOCK_CONVERSATIONS.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="message-badge" size={20} color={Colors.red[500]} />
          <Text style={styles.statValue}>{MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread, 0)}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="account-check" size={20} color={Colors.green[500]} />
          <Text style={styles.statValue}>{MOCK_CONVERSATIONS.filter(c => c.status === 'Checked-in').length}</Text>
          <Text style={styles.statLabel}>Active Guests</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={16} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search guests or rooms..."
          placeholderTextColor={Colors.gray[400]}
        />
      </View>

      {/* Conversation List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredConvos.map((convo, index) => (
          <TouchableOpacity
            key={convo.id}
            style={[styles.convoItem, index === 0 && { marginTop: 8 }]}
            onPress={() => setSelectedConvo(convo.id)}
            activeOpacity={0.7}
          >
            <View style={styles.convoAvatar}>
              <Text style={styles.convoAvatarText}>{convo.name[0]}</Text>
              {convo.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{convo.unread}</Text>
                </View>
              )}
            </View>
            <View style={styles.convoBody}>
              <View style={styles.convoTop}>
                <Text style={styles.convoName}>{convo.name}</Text>
                <Text style={styles.convoTime}>{convo.time}</Text>
              </View>
              <View style={styles.convoBottom}>
                <View style={styles.convoMeta}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(convo.status) }]} />
                  <Text style={styles.convoRoom}>{convo.room}</Text>
                </View>
              </View>
              <Text style={[styles.convoLastMsg, convo.unread > 0 && styles.convoLastMsgBold]} numberOfLines={1}>
                {convo.lastMessage}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.gray[300]} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.gray[50], justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  statBox: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  statLabel: { fontSize: 10, color: Colors.gray[500] },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  convoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
    gap: 14,
  },
  convoAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  convoAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary },
  unreadBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: Colors.red[500], minWidth: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, borderWidth: 1.5, borderColor: Colors.white,
  },
  unreadBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  convoBody: { flex: 1 },
  convoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  convoName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  convoTime: { fontSize: 11, color: Colors.gray[400] },
  convoBottom: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  convoMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  convoRoom: { fontSize: 11, color: Colors.gray[500] },
  convoLastMsg: { fontSize: 12, color: Colors.gray[500] },
  convoLastMsgBold: { fontWeight: '600', color: Colors.gray[700] },
  // Chat view
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    gap: 12,
  },
  chatHeaderAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  chatHeaderInitial: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary },
  chatHeaderName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  chatHeaderMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  chatHeaderRoom: { fontSize: 11, color: Colors.gray[500] },
  chatMoreBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  messageBubbleWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleWrapperLeft: { justifyContent: 'flex-start' },
  bubbleWrapperRight: { justifyContent: 'flex-end' },
  messageMiniAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gray[200], justifyContent: 'center', alignItems: 'center',
  },
  messageMiniAvatarText: { fontSize: 11, fontWeight: '700', color: Colors.gray[600] },
  messageBubble: {
    maxWidth: '72%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 4,
  },
  bubbleGuest: {
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: Colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: Colors.gray[900], lineHeight: 20 },
  bubbleTextAdmin: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.gray[400], alignSelf: 'flex-end' },
  bubbleTimeAdmin: { color: Colors.white + '99' },
  quickRepliesScroll: { maxHeight: 44, backgroundColor: Colors.white },
  quickRepliesContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickReplyChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.brand.primarySoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.primaryLight ?? Colors.brand.primary + '30',
  },
  quickReplyText: { fontSize: 12, color: Colors.brand.primaryDark, fontWeight: '600' },
  inputBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 46,
  },
  messageInput: { flex: 1, fontSize: 14, color: Colors.gray[900], maxHeight: 100 },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.gray[300] },
});