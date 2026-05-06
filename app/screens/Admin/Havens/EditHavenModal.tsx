import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Switch, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import { API_CONFIG } from '../../../../constants/config';

const GOLD   = Colors.brand.primary;       // #B8860B
const GOLD_S = Colors.brand.primarySoft;   // #FEF9C3

const TOWERS     = ['Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E'];
const VIEW_TYPES = ['City View', 'Pool View', 'Garden View', 'Sea View', 'Mountain View', 'Skyline View'];
const AMENITIES_LIST = [
  { key: 'airConditioning', label: 'Air Conditioning',  icon: 'air-conditioner' },
  { key: 'wifi',            label: 'High-speed WiFi',   icon: 'wifi' },
  { key: 'tv',              label: 'Flat-screen TV',    icon: 'television' },
  { key: 'netflix',         label: 'Netflix Access',    icon: 'netflix' },
  { key: 'kitchen',         label: 'Kitchen Access',    icon: 'stove' },
  { key: 'parking',         label: 'Free Parking',      icon: 'car' },
  { key: 'poolAccess',      label: 'Pool Access',       icon: 'pool' },
  { key: 'balcony',         label: 'Private Balcony',   icon: 'balcony' },
  { key: 'washerDryer',     label: 'Washer & Dryer',    icon: 'washing-machine' },
  { key: 'ps4',             label: 'PS4 Console',       icon: 'gamepad-variant' },
];

const STEPS = [
  { label: 'Basic Info',   icon: 'home-outline' },
  { label: 'Pricing',      icon: 'currency-php' },
  { label: 'Check-in',     icon: 'clock-time-eight-outline' },
  { label: 'Availability', icon: 'calendar-check-outline' },
  { label: 'Details',      icon: 'clipboard-text-outline' },
  { label: 'Amenities',    icon: 'star-outline' },
  { label: 'Images',       icon: 'image-multiple-outline' },
  { label: 'Photo Tour',   icon: 'camera-enhance-outline' },
  { label: 'Video',        icon: 'video-outline' },
];

interface Haven {
  uuid_id: string;
  haven_name: string;
  tower: string;
  floor: string;
  weekday_rate: string;
  capacity?: number;
  beds?: string;
  room_size?: string;
  description?: string;
  amenities?: Record<string, boolean>;
}

interface Props {
  visible: boolean;
  haven: Haven | null;
  onClose: () => void;
  onSaved: (updated: Haven) => void;
}

// ── Reusable sub-components ──────────────────────────────────────────
function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={s.label}>
      {text} {required && <Text style={{ color: Colors.red[500] }}>*</Text>}
    </Text>
  );
}

function Field({ label, value, onChange, placeholder, numeric, multi, required }: any) {
  return (
    <View style={s.fieldWrap}>
      <Label text={label} required={required} />
      <TextInput
        style={[s.input, multi && s.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        keyboardType={numeric ? 'numeric' : 'default'}
        multiline={multi}
        textAlignVertical={multi ? 'top' : 'center'}
      />
    </View>
  );
}

function Picker({ label, value, options, open, setOpen, onSelect, required }: any) {
  return (
    <View style={s.fieldWrap}>
      <Label text={label} required={required} />
      <TouchableOpacity style={s.pickerBtn} onPress={() => setOpen(!open)}>
        <Text style={[s.pickerText, !value && { color: Colors.gray[400] }]}>
          {value || `Select ${label}`}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray[500]} />
      </TouchableOpacity>
      {open && (
        <View style={s.pickerDropdown}>
          {options.map((opt: string) => (
            <TouchableOpacity
              key={opt}
              style={[s.pickerOption, value === opt && s.pickerOptionActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[s.pickerOptionText, value === opt && { color: GOLD, fontWeight: '700' }]}>
                {opt}
              </Text>
              {value === opt && <Feather name="check" size={14} color={GOLD} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function Counter({ label, value, setValue }: any) {
  return (
    <View style={s.counterRow}>
      <Text style={s.counterLabel}>{label}</Text>
      <View style={s.counterControls}>
        <TouchableOpacity style={s.counterBtn} onPress={() => setValue(Math.max(1, value - 1))}>
          <Feather name="minus" size={14} color={GOLD} />
        </TouchableOpacity>
        <Text style={s.counterValue}>{value}</Text>
        <TouchableOpacity style={s.counterBtn} onPress={() => setValue(value + 1)}>
          <Feather name="plus" size={14} color={GOLD} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function EditHavenModal({ visible, haven, onClose, onSaved }: Props) {
  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);

  const [havenName, setHavenName]         = useState('');
  const [tower, setTower]                 = useState('');
  const [towerOpen, setTowerOpen]         = useState(false);
  const [floor, setFloor]                 = useState('');
  const [viewType, setViewType]           = useState('');
  const [viewOpen, setViewOpen]           = useState(false);
  const [weekdayRate, setWeekdayRate]     = useState('');
  const [weekendRate, setWeekendRate]     = useState('');
  const [checkinTime, setCheckinTime]     = useState('2:00 PM');
  const [checkoutTime, setCheckoutTime]   = useState('12:00 PM');
  const [minNights, setMinNights]         = useState(1);
  const [maxNights, setMaxNights]         = useState(7);
  const [capacity, setCapacity]           = useState(2);
  const [beds, setBeds]                   = useState(1);
  const [roomSize, setRoomSize]           = useState('');
  const [description, setDescription]    = useState('');
  const [amenities, setAmenities]         = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (haven && visible) {
      setHavenName(haven.haven_name ?? '');
      setTower(haven.tower ?? '');
      setFloor(haven.floor ?? '');
      setWeekdayRate(haven.weekday_rate ?? '');
      setCapacity(haven.capacity ?? 2);
      setBeds(parseInt(haven.beds ?? '1', 10) || 1);
      setRoomSize(haven.room_size ?? '');
      setDescription(haven.description ?? '');
      setAmenities(haven.amenities ?? {});
      setStep(0);
    }
  }, [haven, visible]);

  // visited tracks which steps were opened so we can show Incomplete vs Not Started
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const goToStep = (i: number) => {
    setVisited(v => new Set(v).add(i));
    setStep(i);
  };

  const stepState = (i: number): 'done' | 'active' | 'incomplete' | 'idle' => {
    if (i < step) return 'done';
    if (i === step) return 'active';
    if (visited.has(i)) return 'incomplete';
    return 'idle';
  };

  const handleSave = async () => {
    if (!havenName || !tower || !floor) {
      Alert.alert('Missing Info', 'Please fill in Haven Name, Tower, and Floor.');
      goToStep(0);
      return;
    }
    setSaving(true);
    try {
      const body = {
        haven_name: havenName, tower, floor, view_type: viewType,
        weekday_rate: weekdayRate, weekend_rate: weekendRate,
        check_in_time: checkinTime, check_out_time: checkoutTime,
        min_nights: minNights, max_nights: maxNights,
        capacity, beds: String(beds), room_size: roomSize, description, amenities,
      };
      await fetch(`${API_CONFIG.HAVEN_API}/${haven!.uuid_id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onSaved({ ...haven!, ...body });
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 0: return (
        <>
          <Field label="Haven Name" value={havenName} onChange={setHavenName} placeholder="e.g. Haven 8" required />
          <Picker label="Tower" value={tower} options={TOWERS} open={towerOpen} setOpen={setTowerOpen} onSelect={setTower} required />
          <Field label="Floor" value={floor} onChange={setFloor} placeholder="e.g. 25th" required />
          <Picker label="View Type" value={viewType} options={VIEW_TYPES} open={viewOpen} setOpen={setViewOpen} onSelect={setViewType} />
        </>
      );
      case 1: return (
        <>
          <Field label="Weekday Rate (₱)" value={weekdayRate} onChange={setWeekdayRate} placeholder="3,500" numeric required />
          <Field label="Weekend Rate (₱)" value={weekendRate} onChange={setWeekendRate} placeholder="4,500" numeric />
        </>
      );
      case 2: return (
        <>
          <Field label="Check-in Time" value={checkinTime} onChange={setCheckinTime} placeholder="2:00 PM" />
          <Field label="Check-out Time" value={checkoutTime} onChange={setCheckoutTime} placeholder="12:00 PM" />
        </>
      );
      case 3: return (
        <>
          <Counter label="Minimum Nights" value={minNights} setValue={setMinNights} />
          <View style={s.divider} />
          <Counter label="Maximum Nights" value={maxNights} setValue={setMaxNights} />
        </>
      );
      case 4: return (
        <>
          <Counter label="Max Guests" value={capacity} setValue={setCapacity} />
          <View style={s.divider} />
          <Counter label="Number of Beds" value={beds} setValue={setBeds} />
          <View style={s.divider} />
          <Field label="Room Size (sqm)" value={roomSize} onChange={setRoomSize} placeholder="45" numeric />
          <Field label="Description" value={description} onChange={setDescription} placeholder="Describe this haven..." multi />
        </>
      );
      case 5: return AMENITIES_LIST.map((item, i) => (
        <View key={item.key}>
          <View style={s.amenityRow}>
            <View style={s.amenityLeft}>
              <View style={[s.amenityIcon, amenities[item.key] && { backgroundColor: GOLD_S }]}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={amenities[item.key] ? GOLD : Colors.gray[400]} />
              </View>
              <Text style={[s.amenityText, amenities[item.key] && { color: Colors.gray[900] }]}>{item.label}</Text>
            </View>
            <Switch
              value={!!amenities[item.key]}
              onValueChange={() => setAmenities(p => ({ ...p, [item.key]: !p[item.key] }))}
              trackColor={{ false: Colors.gray[200], true: GOLD + '80' }}
              thumbColor={amenities[item.key] ? GOLD : Colors.gray[400]}
            />
          </View>
          {i < AMENITIES_LIST.length - 1 && <View style={s.divider} />}
        </View>
      ));
      default: return (
        <View style={s.placeholder}>
          <View style={s.placeholderIcon}>
            <MaterialCommunityIcons name={STEPS[step].icon as any} size={32} color={GOLD} />
          </View>
          <Text style={s.placeholderTitle}>{STEPS[step].label}</Text>
          <Text style={s.placeholderSub}>This section will be available soon.</Text>
        </View>
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />

        <View style={s.sheet}>
          {/* ── Header ── */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Edit Haven</Text>
              <Text style={s.headerSub}>Update haven information and settings</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color={GOLD} />
            </TouchableOpacity>
          </View>

          {/* ── Step Indicator ── */}
          <View style={s.stepBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stepBarContent}>
              {STEPS.map((st, i) => {
                const state = stepState(i);
                const isActive = state === 'active';
                const isDone   = state === 'done';
                return (
                  <TouchableOpacity key={i} style={s.stepItem} onPress={() => goToStep(i)}>
                    {/* connector line (left) */}
                    <View style={[s.line, { opacity: i === 0 ? 0 : 1 }, isDone && { backgroundColor: GOLD }]} />

                    {/* circle */}
                    <View style={[
                      s.stepCircle,
                      isDone   && s.stepCircleDone,
                      isActive && s.stepCircleActive,
                    ]}>
                      {isDone ? (
                        <Feather name="check" size={13} color={Colors.white} />
                      ) : (
                        <MaterialCommunityIcons name={st.icon as any} size={15}
                          color={isActive ? Colors.white : Colors.gray[400]} />
                      )}
                    </View>

                    {/* connector line (right) */}
                    <View style={[s.line, { opacity: i === STEPS.length - 1 ? 0 : 1 }, isDone && { backgroundColor: GOLD }]} />

                    {/* label */}
                    <Text style={[s.stepLabel, isActive && s.stepLabelActive, isDone && s.stepLabelDone]}>
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Form ── */}
          <ScrollView
            style={s.formScroll}
            contentContainerStyle={s.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.formCard}>
              {renderContent()}
            </View>
          </ScrollView>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <View style={s.legend}>
              <View style={s.legendItem}>
                <View style={s.dotIdle} />
                <Text style={s.legendText}>Not Started</Text>
              </View>
              <View style={s.legendItem}>
                <View style={s.dotIncomplete} />
                <Text style={s.legendText}>Incomplete</Text>
              </View>
              <View style={s.legendItem}>
                <View style={s.dotDone} />
                <Text style={s.legendText}>Completed</Text>
              </View>
            </View>

            <View style={s.footerBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {step < STEPS.length - 1 ? (
                <TouchableOpacity style={s.nextBtn} onPress={() => goToStep(step + 1)}>
                  <Text style={s.nextText}>Next</Text>
                  <Feather name="arrow-right" size={16} color={Colors.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={s.nextBtn} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color={Colors.white} />
                    : <><Feather name="check" size={16} color={Colors.white} /><Text style={s.nextText}>Save</Text></>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  // ── Overlay ──
  overlay:   { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },

  // ── Sheet ──
  sheet: {
    backgroundColor: Colors.gray[50],
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90%',
    // shadow on sheet edge
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: GOLD,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Step Bar ──
  stepBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
    paddingVertical: 14,
  },
  stepBarContent: { paddingHorizontal: 12 },
  stepItem: { alignItems: 'center', width: 68 },
  line: { flex: 1, height: 2, backgroundColor: Colors.gray[200], minWidth: 8 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.gray[100], borderWidth: 1.5, borderColor: Colors.gray[300],
    justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: GOLD, borderColor: GOLD,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  stepCircleDone: { backgroundColor: Colors.green[500], borderColor: Colors.green[500] },
  stepLabel: {
    fontSize: 9, fontWeight: '500', color: Colors.gray[400],
    textAlign: 'center', marginTop: 6, width: 68,
  },
  stepLabelActive: { color: GOLD,              fontWeight: '700' },
  stepLabelDone:   { color: Colors.green[500], fontWeight: '600' },

  // ── Form ──
  formScroll:  { backgroundColor: Colors.gray[50] },
  formContent: { padding: 16, paddingBottom: 8 },
  formCard: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  fieldWrap: { gap: 6 },
  label:  { fontSize: 11, fontWeight: '700', color: Colors.gray[600], letterSpacing: 0.6, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.gray[50], borderWidth: 1.5, borderColor: Colors.gray[200],
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: Colors.gray[900],
  },
  inputMulti: { height: 90, paddingTop: 12 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.gray[50], borderWidth: 1.5, borderColor: Colors.gray[200],
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
  },
  pickerText: { fontSize: 14, color: Colors.gray[900], flex: 1 },
  pickerDropdown: {
    backgroundColor: Colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray[200],
    marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 6,
  },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[50],
  },
  pickerOptionActive: { backgroundColor: GOLD_S },
  pickerOptionText:   { fontSize: 14, color: Colors.gray[800] },
  divider: { height: 1, backgroundColor: Colors.gray[100] },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  counterLabel: { fontSize: 14, fontWeight: '500', color: Colors.gray[800] },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counterBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: GOLD_S, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: GOLD + '30',
  },
  counterValue: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], minWidth: 24, textAlign: 'center' },
  amenityRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  amenityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amenityIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  amenityText: { fontSize: 14, fontWeight: '500', color: Colors.gray[600] },
  placeholder: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  placeholderIcon: {
    width: 70, height: 70, borderRadius: 20,
    backgroundColor: GOLD_S, justifyContent: 'center', alignItems: 'center',
  },
  placeholderTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[700] },
  placeholderSub:   { fontSize: 13, color: Colors.gray[400] },

  // ── Footer ──
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, gap: 12,
  },
  legend:     { flexDirection: 'row', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 11, color: Colors.gray[500] },
  dotIdle:       { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.gray[300] },
  dotIncomplete: { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: GOLD, borderStyle: 'dashed' },
  dotDone:       { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.green[500] },
  footerBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.gray[200],
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  nextBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: GOLD,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  nextText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
