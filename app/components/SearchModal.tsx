import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (params: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(2);
  const { theme } = useTheme();

  const handleSearch = () => {
    onSearch({ location, checkIn: "", checkOut: "", guests });
    onClose();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
        },
        sheet: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 16,
        },
        handle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.borderLight,
          alignSelf: "center",
          marginBottom: 20,
        },
        title: {
          fontSize: 20,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 24,
        },
        field: {
          marginBottom: 18,
        },
        fieldLabel: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.colors.textSecondary,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        fieldRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
        },
        fieldValue: {
          flex: 1,
          fontSize: 14,
          color: theme.colors.text,
          fontWeight: "500",
        },
        datesRow: {
          flexDirection: "row",
          gap: 8,
          marginBottom: 18,
        },
        dateDivider: {
          width: 1,
          backgroundColor: theme.colors.border,
          alignSelf: "stretch",
          marginVertical: 8,
        },
        guestRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
        },
        guestBtn: {
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: theme.colors.surface,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        guestCount: {
          flex: 1,
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.text,
          textAlign: "center",
        },
        searchBtn: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
          height: 54,
          marginTop: 8,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
        searchBtnText: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.surface,
        },
      }),
    [theme.colors]
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Find Your Haven</Text>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TouchableOpacity style={styles.fieldRow}>
            <Feather name="map-pin" size={16} color={theme.colors.primary} />
            <Text style={styles.fieldValue}>Quezon City, Philippines</Text>
            <Feather name="chevron-down" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Check-in</Text>
            <TouchableOpacity style={styles.fieldRow}>
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.fieldValue}>Select date</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateDivider} />
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Check-out</Text>
            <TouchableOpacity style={styles.fieldRow}>
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.fieldValue}>Select date</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Guests</Text>
          <View style={styles.guestRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              <Feather name="minus" size={16} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.min(10, guests + 1))}
            >
              <Feather name="plus" size={16} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Feather name="search" size={18} color={theme.colors.surface} />
          <Text style={styles.searchBtnText}>Search Rooms</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

