import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/Styles';

// Define types for better TypeScript support
type PropertyStatus = 'Booked' | 'Limited' | 'Rejected';

interface BookingItem {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  savedDate: string;
  status: PropertyStatus;
}

interface TableColumn {
  key: string;
  title: string;
  width: number;
}

const tableColumns: TableColumn[] = [
  { key: 'name', title: 'Property Name', width: 0.3 },
  { key: 'location', title: 'Location', width: 0.25 },
  { key: 'price', title: 'Price/Night', width: 0.15 },
  { key: 'rating', title: 'Rating', width: 0.1 },
  { key: 'savedDate', title: 'Saved Date', width: 0.12 },
  { key: 'status', title: 'Status', width: 0.08 },
];

// Sample static data for testing
const bookings: BookingItem[] = [
  {
    id: '1',
    name: 'Haven 1',
    location: 'Jimmy Santos',
    price: 3104,
    rating: 4.8,
    savedDate: '2024-02-03',
    status: 'Booked',
  },
  {
    id: '2',
    name: 'Haven 1',
    location: 'remi sample',
    price: 2599,
    rating: 4.6,
    savedDate: '2024-02-03',
    status: 'Rejected',
  },
  {
    id: '3',
    name: 'Haven 7',
    location: 'bilog bilog',
    price: 1299,
    rating: 4.5,
    savedDate: '2024-02-02',
    status: 'Booked',
  },
  {
    id: '4',
    name: 'Haven 2',
    location: 'bilog bilog',
    price: 5196,
    rating: 4.7,
    savedDate: '2024-02-02',
    status: 'Booked',
  },
  {
    id: '5',
    name: 'Haven 1',
    location: 'Sample Test',
    price: 1999,
    rating: 4.4,
    savedDate: '2024-02-02',
    status: 'Rejected',
  },
  {
    id: '6',
    name: 'Haven 2',
    location: 'Sample Test',
    price: 1999,
    rating: 4.6,
    savedDate: '2024-02-02',
    status: 'Rejected',
  },
];

export default function WishlistScreen() {
  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case 'Booked':
        return Colors.brand.primary;
      case 'Limited':
        return '#F59E0B';
      case 'Rejected':
        return Colors.red[500];
      default:
        return Colors.gray[600];
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {tableColumns.map((column) => (
        <View key={column.key} style={[styles.headerCell, { flex: column.width }]}>
          <Text style={styles.headerText}>{column.title}</Text>
        </View>
      ))}
      <View style={[styles.headerCell, { flex: 0.05 }]}>
        <Text style={styles.headerText}>Action</Text>
      </View>
    </View>
  );

  const renderTableRow = (item: BookingItem) => (
    <View key={item.id} style={styles.tableRow}>
      <View style={[styles.tableCell, { flex: 0.3 }]}>
        <Text style={styles.cellTextPrimary} numberOfLines={1}>{item.name}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 0.25 }]}>
        <Text style={styles.cellTextSecondary} numberOfLines={1}>{item.location}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 0.15 }]}>
        <Text style={styles.cellTextPrice}>₱{item.price.toLocaleString()}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 0.1 }]}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={Colors.brand.primary} />
          <Text style={styles.cellTextRating}>{item.rating}</Text>
        </View>
      </View>
      <View style={[styles.tableCell, { flex: 0.12 }]}>
        <Text style={styles.cellTextSecondary}>{item.savedDate}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 0.08 }]}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={[styles.tableCell, { flex: 0.05 }]}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart" size={16} color={Colors.red[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} bookings found</Text>
      </View>
      
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {renderTableHeader()}
            {bookings.map(renderTableRow)}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.tableFooter}>
        <Text style={styles.footerText}>Showing {bookings.length} entries</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[50],
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.gray[700],
    fontFamily: Fonts.inter,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cellTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
  },
  cellTextSecondary: {
    fontSize: 12,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  cellTextPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    fontFamily: Fonts.inter,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellTextRating: {
    fontSize: 12,
    color: Colors.gray[700],
    marginLeft: 2,
    fontFamily: Fonts.inter,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: Fonts.inter,
    textTransform: 'uppercase',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  tableFooter: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: Fonts.inter,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: Fonts.inter,
  },
});
