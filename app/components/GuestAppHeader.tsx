import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, GuestColors } from '../../constants/Styles';
import { BRAND_NAME } from '../../constants/brand';
import HavenLogoMark from './HavenLogoMark';

type GuestAppHeaderProps = {
  onBack?: () => void;
  showBackBar?: boolean;
  /** Stepper row inside a white pill below Back (booking flow). */
  stepStrip?: React.ReactNode;
};

/**
 * Guest header: white brand bar + gold band (Back + optional step pill).
 */
export default function GuestAppHeader({ onBack, showBackBar = true, stepStrip }: GuestAppHeaderProps) {
  const insets = useSafeAreaInsets();
  const sidePad = Math.max(12, insets.left, insets.right);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.brandBar,
          {
            paddingTop: insets.top + 10,
            paddingLeft: sidePad,
            paddingRight: sidePad,
          },
        ]}
      >
        <View style={styles.logoRow}>
          <HavenLogoMark size={42} />
          <Text style={styles.brandName}>{BRAND_NAME}</Text>
        </View>
      </View>

      {showBackBar ? (
        <View
          style={[
            styles.goldBand,
            { paddingLeft: sidePad, paddingRight: sidePad },
            stepStrip ? styles.goldBandWithStrip : null,
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          {stepStrip ? <View style={styles.stepPill}>{stepStrip}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundColor: Colors.white,
  },
  brandBar: {
    backgroundColor: Colors.white,
    paddingBottom: 16,
    minHeight: 64,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    gap: 10,
  },
  brandName: {
    flex: 1,
    flexShrink: 1,
    fontSize: 23,
    fontWeight: '700',
    color: GuestColors.gold,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  goldBand: {
    backgroundColor: GuestColors.gold,
    paddingTop: 10,
    paddingBottom: 10,
  },
  goldBandWithStrip: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepPill: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
});
