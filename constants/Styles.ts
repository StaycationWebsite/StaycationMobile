import { StyleSheet } from 'react-native';

export const Colors = {
  brand: {
    primary: '#B8860B',
    primaryDark: '#8B6508',
    primaryLight: '#DAA520',
    primaryLighter: '#F0E68C',
    primarySoft: '#F5DEB3',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },
  white: '#FFFFFF',
  red: {
    500: '#EF4444',
  },
};

export const Fonts = {
  inter: 'Inter',
  poppins: 'Poppins',
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
  profileHeader: {
    backgroundColor: Colors.white,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
    fontFamily: Fonts.poppins,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.gray[900],
    marginLeft: 16,
    fontFamily: Fonts.inter,
  },
  menuItemTextDanger: {
    color: Colors.red[500],
  },
  iconSpacing: {
    marginLeft: 16,
  },
});
