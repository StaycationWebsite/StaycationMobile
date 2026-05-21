import React, { useMemo, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GuestColors } from '../../../constants/Styles';
import type { GuestHavenStackParamList } from '../../../navigation/UserNavigator';
import GuestAppHeader from '../../components/GuestAppHeader';
import BookingStepIndicator from '../../components/BookingStepIndicator';

type BookingFlowRoute = RouteProp<GuestHavenStackParamList, 'BookingFlow'>;

const STAY_TYPES = ['Overnight Stay', 'Day Tour', 'Extended Stay'];
const ADDONS = [
  { id: 'pool', name: 'Pool Pass', price: 100 },
  { id: 'towels', name: 'Towels', price: 50 },
  { id: 'robes', name: 'Bath Robe', price: 150 },
  { id: 'comforter', name: 'Extra Comforter', price: 100 },
  { id: 'guestKit', name: 'Guest Kit', price: 75 },
];
const DOWN_PAYMENT = 500;
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const ERROR_COLOR = '#DC2626';

type GuestFieldKey = 'firstName' | 'lastName' | 'age' | 'gender' | 'email' | 'phone';
type GuestFieldErrors = Partial<Record<GuestFieldKey, string>>;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhilippinePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('09')) return true;
  if (digits.length === 12 && digits.startsWith('639')) return true;
  if (digits.length === 10 && digits.startsWith('9')) return true;
  return false;
}

function validateGuestStep(values: {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
}): GuestFieldErrors {
  const errors: GuestFieldErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required';
  if (!values.age.trim()) errors.age = 'Age is required';
  else if (!/^\d{1,3}$/.test(values.age.trim()) || Number(values.age) < 1 || Number(values.age) > 120) {
    errors.age = 'Enter a valid age (1–120)';
  }
  if (!values.gender.trim()) errors.gender = 'Please select your gender';
  if (!values.email.trim()) errors.email = 'Email address is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email (e.g. name@example.com)';
  if (!values.phone.trim()) errors.phone = 'Phone number is required';
  else if (!isValidPhilippinePhone(values.phone)) {
    errors.phone = 'Enter a valid PH mobile number (e.g. 09171234567)';
  }
  return errors;
}

function useBookingScale() {
  const { height, width } = useWindowDimensions();
  return useMemo(() => {
    const hScale = Math.min(1, Math.max(0.72, height / 760));
    const wScale = Math.min(1, Math.max(0.85, width / 390));
    const scale = Math.min(hScale, wScale);
    return {
      scale,
      padH: Math.round(14 * scale),
      padV: Math.round(14 * scale),
      gap: Math.round(8 * scale),
      fieldGap: Math.max(4, Math.round(6 * scale)),
      title: Math.round(15 * scale),
      label: Math.round(12 * scale),
      body: Math.round(13 * scale),
      inputH: Math.max(34, Math.round(40 * scale)),
      btnH: Math.max(44, Math.round(48 * scale)),
    };
  }, [height, width]);
}

type Ui = ReturnType<typeof useBookingScale>;

function BookingTitleRow({
  icon,
  title,
  ui,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  ui: Ui;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: ui.gap }}>
      <Feather name={icon} size={ui.title} color={GuestColors.gold} />
      <Text style={{ fontSize: ui.title, fontWeight: '700', color: GuestColors.charcoal }}>{title}</Text>
    </View>
  );
}

function BookingField({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  last,
  ui,
  error,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  keyboard?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  last?: boolean;
  ui: Ui;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: last ? 0 : ui.fieldGap }}>
      <Text style={{ fontSize: ui.label, fontWeight: '600', color: GuestColors.charcoal, marginBottom: 4 }}>
        {label} *
      </Text>
      <TextInput
        style={{
          height: ui.inputH,
          borderWidth: 1,
          borderColor: error ? ERROR_COLOR : '#E0E0E0',
          borderRadius: 10,
          paddingHorizontal: 12,
          fontSize: ui.body,
          color: GuestColors.charcoal,
          backgroundColor: '#FFFFFF',
        }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboard ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={keyboard === 'email-address' ? false : undefined}
      />
      {error ? <Text style={{ fontSize: ui.label - 1, color: ERROR_COLOR, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

function BookingSelect({
  label,
  value,
  placeholder,
  onPress,
  icon,
  ui,
  error,
  required,
  last,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  ui: Ui;
  error?: string;
  required?: boolean;
  last?: boolean;
}) {
  return (
    <View style={{ marginBottom: last ? 0 : ui.fieldGap }}>
      <Text style={{ fontSize: ui.label, fontWeight: '600', color: GuestColors.charcoal, marginBottom: 4 }}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          height: ui.inputH,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: error ? ERROR_COLOR : '#E0E0E0',
          borderRadius: 10,
          paddingHorizontal: 12,
          backgroundColor: '#FFFFFF',
        }}
      >
        {icon ? <Feather name={icon} size={14} color={GuestColors.gold} /> : null}
        <Text
          style={{ flex: 1, fontSize: ui.body, color: value ? GuestColors.charcoal : '#9CA3AF' }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={14} color="#6B6B6B" />
      </TouchableOpacity>
      {error ? <Text style={{ fontSize: ui.label - 1, color: ERROR_COLOR, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

function GenderPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
  ui,
}: {
  visible: boolean;
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  ui: Ui;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.overlay} onPress={onClose} />
      <View style={pickerStyles.sheetWrap}>
        <View style={pickerStyles.sheet}>
          <Text style={[pickerStyles.sheetTitle, { fontSize: ui.title }]}>Select gender</Text>
          {GENDER_OPTIONS.map((option) => {
            const active = selected === option;
            return (
              <TouchableOpacity
                key={option}
                style={[pickerStyles.option, active && pickerStyles.optionActive]}
                onPress={() => onSelect(option)}
                activeOpacity={0.85}
              >
                <Text style={[pickerStyles.optionText, { fontSize: ui.body }, active && pickerStyles.optionTextActive]}>
                  {option}
                </Text>
                {active ? <Feather name="check" size={18} color={GuestColors.gold} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetTitle: {
    fontWeight: '700',
    color: GuestColors.charcoal,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionActive: {
    backgroundColor: GuestColors.goldMuted,
  },
  optionText: {
    color: GuestColors.charcoal,
    fontWeight: '500',
  },
  optionTextActive: {
    color: GuestColors.gold,
    fontWeight: '700',
  },
});

function BookingSummaryLine({
  label,
  value,
  icon,
  ui,
}: {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  ui: Ui;
}) {
  return (
    <View style={{ width: '48%', marginBottom: ui.gap }}>
      <Text style={{ fontSize: ui.label, color: '#8A8A8A', marginBottom: 2 }}>{label}</Text>
      {icon ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name={icon} size={12} color={GuestColors.gold} />
          <Text style={{ flex: 1, fontSize: ui.body, fontWeight: '600', color: GuestColors.charcoal }} numberOfLines={1}>
            {value}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: ui.body, fontWeight: '600', color: GuestColors.charcoal }} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
}

export default function BookingFlowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GuestHavenStackParamList>>();
  const route = useRoute<BookingFlowRoute>();
  const ui = useBookingScale();
  const { haven } = route.params;

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stayType, setStayType] = useState('');
  const [datesLabel, setDatesLabel] = useState('');
  const [checkInDisplay, setCheckInDisplay] = useState('');
  const [checkOutDisplay, setCheckOutDisplay] = useState('');
  const [guestsLabel, setGuestsLabel] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [fieldErrors, setFieldErrors] = useState<GuestFieldErrors>({});
  const [genderModalOpen, setGenderModalOpen] = useState(false);

  const clearFieldError = (key: GuestFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const baseRate = parseFloat(String(haven?.weekday_rate ?? '2599')) || 2599;
  const addonTotal = useMemo(
    () => ADDONS.reduce((sum, a) => sum + (addonQty[a.id] ?? 1) * a.price, 0),
    [addonQty],
  );
  const total = Math.round(baseRate + addonTotal);
  const guestFullName = `${firstName} ${lastName}`.trim() || '—';
  const guestsSummary = [
    `${adults} Adult${adults !== 1 ? 's' : ''}`,
    children > 0 ? `${children} Child${children !== 1 ? 'ren' : ''}` : null,
    infants > 0 ? `${infants} Infant${infants !== 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(', ');
  const stayTypeSummary = stayType
    ? `${stayType.replace('Overnight Stay', 'Overnight').replace('Day Tour', '10 Hours').replace('Extended Stay', 'Extended')} - ₱${baseRate.toLocaleString('en-US')}`
    : '—';

  const setAddon = (id: string, delta: number) => {
    setAddonQty((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  const onContinue = () => {
    if (step === 0) {
      const errors = validateGuestStep({
        firstName,
        lastName,
        age,
        gender,
        email,
        phone,
      });
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!stayType.trim() || !datesLabel.trim()) {
        Alert.alert('Required', 'Please complete stay type and dates.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    Alert.alert('Booking submitted', 'Your booking request has been recorded.', [
      { text: 'OK', onPress: () => navigation.popToTop() },
    ]);
  };

  const onBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  const renderStepBody = () => {
    if (step === 0) {
      return (
        <View>
          <BookingTitleRow icon="user" title="Guest information" ui={ui} />
          <Text
            style={{
              fontSize: ui.label,
              color: GuestColors.gold,
              marginBottom: ui.gap,
              fontWeight: '600',
            }}
          >
            Adult 1 (Main Guest)
          </Text>
          <BookingField
            label="First Name"
            value={firstName}
            onChange={(t) => {
              setFirstName(t);
              clearFieldError('firstName');
            }}
            placeholder="First Name"
            ui={ui}
            error={fieldErrors.firstName}
          />
          <BookingField
            label="Last Name"
            value={lastName}
            onChange={(t) => {
              setLastName(t);
              clearFieldError('lastName');
            }}
            placeholder="Last Name"
            ui={ui}
            error={fieldErrors.lastName}
          />
          <BookingField
            label="Age"
            value={age}
            onChange={(t) => {
              setAge(t.replace(/\D/g, ''));
              clearFieldError('age');
            }}
            placeholder="Age"
            keyboard="numeric"
            ui={ui}
            error={fieldErrors.age}
          />
          <BookingSelect
            label="Gender"
            value={gender}
            placeholder="Select gender"
            icon="user"
            ui={ui}
            required
            error={fieldErrors.gender}
            onPress={() => setGenderModalOpen(true)}
          />
          <BookingField
            label="Email Address"
            value={email}
            onChange={(t) => {
              setEmail(t);
              clearFieldError('email');
            }}
            placeholder="Email Address"
            keyboard="email-address"
            autoCapitalize="none"
            ui={ui}
            error={fieldErrors.email}
          />
          <BookingField
            label="Phone Number"
            value={phone}
            onChange={(t) => {
              setPhone(t.replace(/[^\d+]/g, ''));
              clearFieldError('phone');
            }}
            placeholder="09171234567"
            keyboard="phone-pad"
            last
            ui={ui}
            error={fieldErrors.phone}
          />
        </View>
      );
    }

    if (step === 1) {
      return (
        <View style={{ flex: 1 }}>
          <BookingTitleRow icon="calendar" title="Booking Details" ui={ui} />
          <BookingSelect
            label="Stay Type"
            value={stayType}
            placeholder="Select Stay Type"
            ui={ui}
            onPress={() => {
              const idx = stayType ? STAY_TYPES.indexOf(stayType) : -1;
              setStayType(STAY_TYPES[(idx + 1) % STAY_TYPES.length]);
            }}
          />
          <BookingTitleRow icon="calendar" title="Dates & Guests" ui={ui} />
          <BookingSelect
            label="Dates"
            value={datesLabel}
            placeholder="When Add Dates"
            icon="calendar"
            ui={ui}
            onPress={() => {
              setDatesLabel('Feb 12 – Feb 13, 2026');
              setCheckInDisplay('Feb 12, 2026 at 2:00 PM');
              setCheckOutDisplay('Feb 13, 2026 at 12:00 AM');
            }}
          />
          <BookingSelect
            label="Guests"
            value={guestsLabel}
            placeholder="Who?"
            icon="users"
            ui={ui}
            onPress={() => {
              const presets = [
                { a: 2, c: 0, i: 0, label: '2 Adults' },
                { a: 2, c: 1, i: 0, label: '2 Adults, 1 Child' },
                { a: 2, c: 1, i: 1, label: '2 Adults, 1 Child, 1 Infant' },
              ];
              const idx = presets.findIndex((p) => p.label === guestsLabel);
              const next = presets[(idx + 1) % presets.length];
              setAdults(next.a);
              setChildren(next.c);
              setInfants(next.i);
              setGuestsLabel(next.label);
            }}
          />
          <Text style={{ fontSize: Math.max(9, ui.label - 1), color: '#0E7490', lineHeight: 14 }}>
            Max 4 guests (adults + children). Infants not counted.
          </Text>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={{ flex: 1 }}>
          <BookingTitleRow icon="package" title="Add-ons (Optional)" ui={ui} />
          <Text style={{ fontSize: ui.label, color: '#5C5C5C', marginBottom: ui.gap, lineHeight: 14 }}>
            Optional extras — skip if none needed.
          </Text>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {ADDONS.map((item) => {
              const qty = addonQty[item.id] ?? 1;
              const btn = Math.max(26, Math.round(28 * ui.scale));
              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E5E5',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: Math.max(4, ui.gap - 2),
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: ui.body, fontWeight: '600', color: GuestColors.charcoal }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: ui.label, color: '#6B6B6B' }}>₱ {item.price.toFixed(2)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => setAddon(item.id, -1)}
                      disabled={qty <= 0}
                      style={{
                        width: btn,
                        height: btn,
                        borderRadius: btn / 2,
                        borderWidth: 1.5,
                        borderColor: '#C8C8C8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name="minus" size={14} color={qty <= 0 ? '#CCC' : '#6B6B6B'} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: ui.body, fontWeight: '700', minWidth: 14, textAlign: 'center' }}>{qty}</Text>
                    <TouchableOpacity
                      onPress={() => setAddon(item.id, 1)}
                      style={{
                        width: btn,
                        height: btn,
                        borderRadius: btn / 2,
                        backgroundColor: GuestColors.gold,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <BookingTitleRow icon="file-text" title="Booking Summary" ui={ui} />
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'flex-start' }}>
          <BookingSummaryLine label="Guest Name" value={guestFullName} ui={ui} />
          <BookingSummaryLine label="Email" value={email || '—'} ui={ui} />
          <BookingSummaryLine label="Phone" value={phone || '—'} ui={ui} />
          <BookingSummaryLine label="Guests" value={guestsSummary || '—'} ui={ui} />
          <BookingSummaryLine label="Check In" value={checkInDisplay || '—'} icon="log-in" ui={ui} />
          <BookingSummaryLine label="Check Out" value={checkOutDisplay || '—'} icon="log-out" ui={ui} />
          <View style={{ width: '100%' }}>
            <BookingSummaryLine label="Stay Type" value={stayTypeSummary} ui={ui} />
          </View>
        </View>
      </View>
    );
  };

  const cardMt = Math.round(8 * ui.scale);
  const formFillsSpace = step === 1 || step === 2 || step === 3;

  return (
    <View style={styles.root}>
      <GenderPickerModal
        visible={genderModalOpen}
        selected={gender}
        ui={ui}
        onClose={() => setGenderModalOpen(false)}
        onSelect={(value) => {
          setGender(value);
          clearFieldError('gender');
          setGenderModalOpen(false);
        }}
      />
      <GuestAppHeader
        onBack={onBack}
        stepStrip={<BookingStepIndicator currentStep={step} />}
      />
      <View style={styles.flex}>
        <LinearGradient
          colors={[GuestColors.gold, '#E8D4A8', '#F0EBE0', '#EFEFEF']}
          locations={[0, 0.12, 0.38, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.body, { paddingHorizontal: ui.padH, paddingBottom: 4 }]}>
          <View
            style={[
              styles.card,
              styles.formCard,
              formFillsSpace && styles.formCardFill,
              {
                marginTop: cardMt,
                paddingHorizontal: ui.padV,
                paddingTop: ui.padV,
                paddingBottom: ui.padV,
              },
            ]}
          >
            {formFillsSpace ? (
              <View style={{ flex: 1, minHeight: 0 }}>{renderStepBody()}</View>
            ) : (
              renderStepBody()
            )}
          </View>

          <View style={[styles.footerArea, { marginTop: cardMt }]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: ui.gap,
              }}
            >
              <Text style={{ fontSize: ui.title, fontWeight: '700', color: GuestColors.charcoal }}>
                ₱{total.toLocaleString('en-US')} total
              </Text>
              <Text style={{ fontSize: ui.label, fontWeight: '600', color: GuestColors.gold }}>
                ₱{DOWN_PAYMENT.toLocaleString('en-US')} down payment
              </Text>
            </View>
            <TouchableOpacity
              style={{
                height: ui.btnH,
                borderRadius: 999,
                backgroundColor: GuestColors.gold,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 4,
              }}
              onPress={onContinue}
              activeOpacity={0.9}
            >
              <Text style={{ color: '#FFF', fontSize: ui.body, fontWeight: '700' }}>
                {step === 3 ? 'Complete Booking' : 'Continue'}
              </Text>
              {step < 3 ? <Text style={{ color: '#FFF', fontSize: ui.body, fontWeight: '700' }}>{'>'}</Text> : null}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GuestColors.gold },
  flex: { flex: 1 },
  body: { flex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    ...cardShadow,
  },
  formCard: {
    flexShrink: 0,
  },
  formCardFill: {
    flex: 1,
    minHeight: 0,
  },
  footerArea: {
    flexShrink: 0,
  },
});
