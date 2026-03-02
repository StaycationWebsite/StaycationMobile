import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/Styles';

const AMENITIES_LIST = [
  { key: 'airConditioning', label: 'Air Conditioning', icon: 'air-conditioner' },
  { key: 'wifi', label: 'High-speed WiFi', icon: 'wifi' },
  { key: 'tv', label: 'Flat-screen TV', icon: 'television' },
  { key: 'netflix', label: 'Netflix Access', icon: 'netflix' },
  { key: 'kitchen', label: 'Kitchen Access', icon: 'stove' },
  { key: 'parking', label: 'Free Parking', icon: 'car' },
  { key: 'poolAccess', label: 'Pool Access', icon: 'pool' },
  { key: 'balcony', label: 'Private Balcony', icon: 'balcony' },
  { key: 'washerDryer', label: 'Washer & Dryer', icon: 'washing-machine' },
  { key: 'ps4', label: 'PS4 Console', icon: 'gamepad-variant' },
];

const TOWERS = ['Tower A', 'Tower B', 'Tower C'];
const FLOORS = ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];

export default function AddHavenScreen() {
  const navigation = useNavigation<any>();

  const [havenName, setHavenName] = useState('');
  const [tower, setTower] = useState('');
  const [floor, setFloor] = useState('');
  const [description, setDescription] = useState('');
  const [weekdayRate, setWeekdayRate] = useState('');
  const [weekendRate, setWeekendRate] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [beds, setBeds] = useState(1);
  const [roomSize, setRoomSize] = useState('');
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});
  const [towerDropOpen, setTowerDropOpen] = useState(false);
  const [floorDropOpen, setFloorDropOpen] = useState(false);

  const toggleAmenity = (key: string) =>
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }));

  const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
        <MaterialCommunityIcons name={icon} size={18} color={Colors.gray[400]} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && { textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );

  const DropdownField = ({ label, icon, value, options, open, setOpen, onSelect }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setOpen(!open)}>
        <MaterialCommunityIcons name={icon} size={18} color={Colors.gray[400]} />
        <Text style={[styles.dropdownBtnText, value && { color: Colors.gray[900] }]}>
          {value || `Select ${label}`}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray[500]} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map((opt: string) => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, value === opt && styles.dropdownItemSelected]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, value === opt && { color: Colors.brand.primary }]}>{opt}</Text>
              {value === opt && <MaterialCommunityIcons name="check" size={16} color={Colors.brand.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const StepperField = ({ label, value, setValue }: any) => (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.max(1, value - 1))}>
          <Feather name="minus" size={14} color={Colors.brand.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(value + 1)}>
          <Feather name="plus" size={14} color={Colors.brand.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const isValid = havenName && tower && floor && weekdayRate;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Haven</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Photo Upload Placeholder */}
        <TouchableOpacity style={styles.photoUpload}>
          <MaterialCommunityIcons name="camera-plus-outline" size={32} color={Colors.gray[400]} />
          <Text style={styles.photoUploadTitle}>Add Photos</Text>
          <Text style={styles.photoUploadSub}>Tap to upload haven images</Text>
        </TouchableOpacity>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.brand.primary + '20' }]}>
              <MaterialCommunityIcons name="home-outline" size={18} color={Colors.brand.primary} />
            </View>
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <InputField
            label="Haven Name"
            icon="home-city-outline"
            value={havenName}
            onChangeText={setHavenName}
            placeholder="e.g. Haven 101"
          />
          <DropdownField
            label="Tower"
            icon="office-building-outline"
            value={tower}
            options={TOWERS}
            open={towerDropOpen}
            setOpen={setTowerDropOpen}
            onSelect={setTower}
          />
          <DropdownField
            label="Floor"
            icon="layers-outline"
            value={floor}
            options={FLOORS}
            open={floorDropOpen}
            setOpen={setFloorDropOpen}
            onSelect={setFloor}
          />
          <InputField
            label="Description"
            icon="text-box-outline"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this haven..."
            multiline
          />
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.green[500] + '20' }]}>
              <MaterialCommunityIcons name="currency-php" size={18} color={Colors.green[500]} />
            </View>
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Weekday Rate"
                icon="currency-php"
                value={weekdayRate}
                onChangeText={setWeekdayRate}
                placeholder="3,500"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Weekend Rate"
                icon="currency-php"
                value={weekendRate}
                onChangeText={setWeekendRate}
                placeholder="4,500"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.blue[500] + '20' }]}>
              <MaterialCommunityIcons name="information-outline" size={18} color={Colors.blue[500]} />
            </View>
            <Text style={styles.sectionTitle}>Room Details</Text>
          </View>

          <StepperField label="Max Guests" value={capacity} setValue={setCapacity} />
          <View style={styles.divider} />
          <StepperField label="Number of Beds" value={beds} setValue={setBeds} />
          <View style={styles.divider} />
          <InputField
            label="Room Size (sqm)"
            icon="vector-square"
            value={roomSize}
            onChangeText={setRoomSize}
            placeholder="e.g. 45"
            keyboardType="numeric"
          />
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.purple[500] + '20' }]}>
              <MaterialCommunityIcons name="star-outline" size={18} color={Colors.purple[500]} />
            </View>
            <Text style={styles.sectionTitle}>Amenities</Text>
          </View>

          {AMENITIES_LIST.map((item, index) => (
            <View key={item.key}>
              <View style={styles.amenityRow}>
                <View style={styles.amenityLeft}>
                  <View style={[styles.amenityIconBox, amenities[item.key] && { backgroundColor: Colors.brand.primary + '20' }]}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color={amenities[item.key] ? Colors.brand.primary : Colors.gray[400]}
                    />
                  </View>
                  <Text style={[styles.amenityLabel, amenities[item.key] && { color: Colors.gray[900] }]}>
                    {item.label}
                  </Text>
                </View>
                <Switch
                  value={!!amenities[item.key]}
                  onValueChange={() => toggleAmenity(item.key)}
                  trackColor={{ false: Colors.gray[200], true: Colors.brand.primary + '60' }}
                  thumbColor={amenities[item.key] ? Colors.brand.primary : Colors.gray[400]}
                />
              </View>
              {index < AMENITIES_LIST.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          disabled={!isValid}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="home-plus-outline" size={20} color={Colors.white} />
          <Text style={styles.submitBtnText}>Add Haven</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
  content: { padding: 20, gap: 16 },
  photoUpload: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 6,
  },
  photoUploadTitle: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  photoUploadSub: { fontSize: 12, color: Colors.gray[400] },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    gap: 14,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  twoColRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: Colors.gray[900] },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownBtnText: { flex: 1, fontSize: 14, color: Colors.gray[400] },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
    marginTop: -6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  dropdownItemSelected: { backgroundColor: Colors.brand.primarySoft },
  dropdownItemText: { fontSize: 14, fontWeight: '500', color: Colors.gray[800] },
  divider: { height: 1, backgroundColor: Colors.gray[100] },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  stepperLabel: { fontSize: 14, fontWeight: '500', color: Colors.gray[800] },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.brand.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  stepperValue: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], minWidth: 20, textAlign: 'center' },
  amenityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  amenityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amenityIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  amenityLabel: { fontSize: 14, fontWeight: '500', color: Colors.gray[600] },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});