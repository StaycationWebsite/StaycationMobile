import { StyleSheet } from 'react-native';

export const Colors = {
  brand: {
    primary: '#B8860B',       // Dark gold
    primaryDark: '#8B6508',
    primaryLight: '#DAA520',
    primaryLighter: '#F0E68C',
    primarySoft: '#FEF9C3',
  },
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  red: {
    500: '#EF4444',
    100: '#FEE2E2',
  },
  green: {
    500: '#10B981',
    100: '#D1FAE5',
  },
  blue: {
    500: '#3B82F6',
    600: '#2563EB',
    100: '#DBEAFE',
  },
  yellow: {
    500: '#F59E0B',
    100: '#FEF3C7',
  },
  purple: {
    500: '#8B5CF6',
  },
};

export const Fonts = {
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  poppins: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold: 'Poppins_700Bold',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
