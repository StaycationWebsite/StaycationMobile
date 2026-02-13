import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Image, Modal, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';

type AdminTopBarProps = {
  title?: string;
};

export default function AdminTopBar({ title }: AdminTopBarProps) {
  const { user, logout } = useAuth();
  const { mode, resolvedMode, setMode } = useTheme();
  const navigation = useNavigation<any>();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: sidebarVisible ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible, menuAnimation]);

  const topLineStyle = {
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-3, 0],
        }),
      },
      {
        rotate: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const middleLineStyle = {
    opacity: menuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        scaleX: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.4],
        }),
      },
    ],
  };

  const bottomLineStyle = {
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [3, 0],
        }),
      },
      {
        rotate: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-45deg'],
        }),
      },
    ],
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const isDark = resolvedMode === 'dark';
  const theme = {
    bar: isDark ? '#111827' : '#F3F4F6',
    border: isDark ? '#1F2937' : '#E5E7EB',
    textPrimary: isDark ? '#E5E7EB' : '#374151',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    icon: isDark ? '#D1D5DB' : '#4B5563',
    pill: isDark ? '#1F2937' : '#E5E7EB',
    pillBorder: isDark ? '#374151' : '#D1D5DB',
    menuBg: isDark ? '#111827' : '#F3F4F6',
    menuHeader: isDark ? '#1F2937' : '#E5E7EB',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bar }]}>
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <View style={[styles.container, { backgroundColor: theme.bar, borderBottomColor: theme.border }]}>
        <View style={styles.leftGroup}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarVisible((prev) => !prev)}>
            <View style={styles.menuIcon}>
              <Animated.View style={[styles.menuLine, styles.menuLineTop, { backgroundColor: theme.icon }, topLineStyle]} />
              <Animated.View style={[styles.menuLine, { backgroundColor: theme.icon }, middleLineStyle]} />
              <Animated.View style={[styles.menuLine, styles.menuLineBottom, { backgroundColor: theme.icon }, bottomLineStyle]} />
            </View>
          </TouchableOpacity>
          <View style={styles.centerGroup}>
            <Text style={[styles.dateText, { color: theme.textPrimary }]}>{formatDate(currentTime)}</Text>
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatTime(currentTime)}</Text>
              <View style={[styles.tempPill, { backgroundColor: theme.pill, borderColor: theme.pillBorder }]}>
                <Ionicons name="cloud-outline" size={12} color={theme.textSecondary} />
              </View>
            </View>
            {title ? <Text style={[styles.pageLabel, { color: theme.textSecondary }]}>{title}</Text> : null}
          </View>
        </View>

        <View style={styles.rightGroup}>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialCommunityIcons name="message-outline" size={20} color={theme.icon} />
            <View style={styles.dot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="notifications-outline" size={20} color={theme.icon} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>7</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => setProfileOpen(true)}>
            <Image
              source={{ uri: user?.image || 'https://res.cloudinary.com/dmlxadsvc/image/upload/v1770106536/staycation-haven/havens/ljnxoo8ujbvycw0yjzgr.png' }}
              style={styles.avatar}
            />
            <Feather name="chevron-down" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={profileOpen} transparent animationType="fade" onRequestClose={() => setProfileOpen(false)}>
        <Pressable style={styles.profileOverlay} onPress={() => setProfileOpen(false)}>
          <Pressable style={[styles.profileMenu, { backgroundColor: theme.menuBg, borderColor: theme.pillBorder }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.profileHeader, { backgroundColor: theme.menuHeader }]}>
              <Image
                source={{ uri: user?.image || 'https://res.cloudinary.com/dmlxadsvc/image/upload/v1770106536/staycation-haven/havens/ljnxoo8ujbvycw0yjzgr.png' }}
                style={styles.profileHeaderAvatar}
              />
              <View style={styles.profileHeaderTextWrap}>
                <Text style={[styles.profileHeaderName, { color: theme.textPrimary }]}>{user?.name || 'Pia Admin'}</Text>
                <Text numberOfLines={1} style={[styles.profileHeaderEmail, { color: theme.textSecondary }]}>{user?.email || 'pia@staycationhavenph.com'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setProfileOpen(false);
                navigation.navigate('AdminProfile');
              }}
            >
              <Feather name="user" size={17} color="#B88715" />
              <Text style={[styles.menuRowText, { color: theme.textPrimary }]}>My Profile</Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.pillBorder }]} />
            <View style={styles.themeRow}>
              <View style={[styles.themePill, { backgroundColor: theme.pill, borderColor: theme.pillBorder }]}>
                <TouchableOpacity style={styles.themeIconButton} onPress={() => setMode('dark')}>
                  <Feather name="moon" size={13} color={mode === 'dark' ? '#60A5FA' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.themeIconButton} onPress={() => setMode('light')}>
                  <Feather name="sun" size={13} color={mode === 'light' ? '#B88715' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.themeIconButton} onPress={() => setMode('system')}>
                  <MaterialCommunityIcons name="monitor" size={13} color={mode === 'system' ? '#10B981' : '#6B7280'} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.menuDivider, { backgroundColor: theme.pillBorder }]} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setProfileOpen(false);
                logout();
              }}
            >
              <Feather name="log-out" size={17} color="#EF4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F3F4F6',
    zIndex: 1000,
  },
  container: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  menuIcon: {
    width: 18,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#4B5563',
  },
  menuLineTop: {
    top: 3,
  },
  menuLineBottom: {
    bottom: 3,
  },
  centerGroup: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dateText: {
    color: '#374151',
    fontFamily: Fonts.inter,
    fontSize: 14,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    gap: 6,
  },
  timeText: {
    color: '#6B7280',
    fontFamily: Fonts.inter,
    fontSize: 12,
  },
  tempPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pageLabel: {
    marginTop: -1,
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: Fonts.inter,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -1,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Fonts.inter,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'flex-start',
  },
  profileMenu: {
    width: 206,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 58,
    marginRight: 8,
    alignSelf: 'flex-end',
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    gap: 10,
  },
  profileHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  profileHeaderTextWrap: {
    flex: 1,
  },
  profileHeaderName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.poppins,
  },
  profileHeaderEmail: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: Fonts.inter,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuRowText: {
    color: '#4B5563',
    fontSize: 16,
    fontFamily: Fonts.inter,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  themeRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  themeIconButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
});
