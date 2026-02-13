import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';
import Sidebar from './Sidebar';

type AdminTopBarProps = {
  title: string;
};

export default function AdminTopBar({ title }: AdminTopBarProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSidebarVisible(true)}>
          <Feather name="menu" size={22} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={20} color={Colors.gray[900]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    height: 56,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Fonts.poppins,
  },
});
