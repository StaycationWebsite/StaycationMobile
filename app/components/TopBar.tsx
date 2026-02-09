import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Platform 
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import Sidebar from './Sidebar';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }) + ' PST';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />
      <View style={styles.container}>
        {/* Left Section: Menu & Date/Time */}
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Feather name="menu" size={24} color={Colors.gray[900]} />
          </TouchableOpacity>
          
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          </View>
        </View>

        {/* Right Section: Messages, Notifications, Profile */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="message-outline" size={22} color={Colors.gray[600]} />
            <View style={styles.redDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={Colors.gray[600]} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>7</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dmlxadsvc/image/upload/v1770106536/staycation-haven/havens/ljnxoo8ujbvycw0yjzgr.png' }} 
              style={styles.profilePic} 
            />
            <Feather name="chevron-down" size={14} color={Colors.gray[400]} style={styles.downArrow} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
    zIndex: 1000,
  },
  container: {
    height: 100,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  dateTimeContainer: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
  },
  timeText: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red[500],
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.red[500],
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingVertical: 4,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  downArrow: {
    marginLeft: 4,
  },
});
