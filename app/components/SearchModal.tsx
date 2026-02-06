import { Text, View, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Colors, Fonts } from '../../constants/Styles';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { HAVEN_API } from '@env';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: () => void;
}

interface Haven {
  uuid_id: string;
  haven_name: string;
}

export default function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('1 Guest');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [havens, setHavens] = useState<Haven[]>([]);
  const [loadingHavens, setLoadingHavens] = useState(false);

  const guestOptions = ['1 Guest', '2 Guests', '3 Guests', '4 Guests', '5 Guests', '6 Guests', '7 Guests', '8 Guests', '9 Guests', '10 Guests'];

  useEffect(() => {
    fetchHavens();
  }, []);

  const fetchHavens = async () => {
    try {
      setLoadingHavens(true);
      const apiUrl = HAVEN_API;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setHavens(data.data);
      }
    } catch (error) {
      console.error('Error fetching havens:', error);
    } finally {
      setLoadingHavens(false);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={20} color={Colors.brand.primary} />
              <Text style={styles.sectionTitle}>LOCATION</Text>
            </View>
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            >
              <Feather name="map-pin" size={18} color={Colors.gray[500]} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Location</Text>
                <Text style={styles.placeholder}>{location || 'Where?'}</Text>
              </View>
              <Feather
                name={activeDropdown === 'location' ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.gray[500]}
              />
            </TouchableOpacity>
            {activeDropdown === 'location' && (
              <View style={styles.dropdownMenu}>
                {loadingHavens ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.brand.primary} />
                  </View>
                ) : (
                  <ScrollView style={styles.dropdownScroll}>
                    {havens.map((haven: Haven) => (
                      <TouchableOpacity
                        key={haven.uuid_id}
                        style={[styles.dropdownItem, location === haven.haven_name && styles.dropdownItemActive]}
                        onPress={() => {
                          setLocation(haven.haven_name);
                          setActiveDropdown(null);
                        }}
                      >
                        <Feather name="map-pin" size={16} color={location === haven.haven_name ? Colors.brand.primary : Colors.gray[500]} style={styles.dropdownItemIcon} />
                        <Text style={[styles.dropdownItemText, location === haven.haven_name && styles.dropdownItemTextActive]}>{haven.haven_name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="calendar" size={20} color={Colors.brand.primary} />
              <Text style={styles.sectionTitle}>DATES</Text>
            </View>
            <TouchableOpacity style={styles.inputField}>
              <Feather name="calendar" size={18} color={Colors.gray[500]} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>When</Text>
                <Text style={styles.placeholder}>Add dates</Text>
              </View>
              <Feather name="chevron-down" size={18} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={20} color={Colors.brand.primary} />
              <Text style={styles.sectionTitle}>GUESTS</Text>
            </View>
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
            >
              <Feather name="user" size={18} color={Colors.gray[500]} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Who</Text>
                <Text style={styles.inputValue}>{guests}</Text>
              </View>
              <Feather
                name={activeDropdown === 'guests' ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.gray[500]}
              />
            </TouchableOpacity>
            {activeDropdown === 'guests' && (
              <View style={styles.dropdownMenu}>
                {guestOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGuests(option);
                      setActiveDropdown(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
              <Text style={styles.searchButtonText}>Search Rooms</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray[600],
    fontFamily: Fonts.poppins,
    marginLeft: 10,
    letterSpacing: 1,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  inputContent: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    marginBottom: 2,
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 15,
    color: Colors.gray[500],
    fontFamily: Fonts.inter,
    fontWeight: '500',
  },
  inputValue: {
    fontSize: 15,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    fontFamily: Fonts.poppins,
  },
  searchButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    fontFamily: Fonts.poppins,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderTopWidth: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: 6,
    marginHorizontal: 0,
    maxHeight: 300,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.gray[900],
    fontFamily: Fonts.inter,
    fontWeight: '500',
  },
  dropdownItemActive: {
    backgroundColor: Colors.brand.primarySoft,
  },
  dropdownItemTextActive: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
});
