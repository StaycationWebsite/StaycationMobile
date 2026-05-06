import React, { useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@/lib/hooks/useTheme';

const MENU_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: "view-dashboard-outline", screen: "Dashboard", color: "#3B82F6" },
      { label: "Analytics & Reports", icon: "chart-line", screen: "AnalyticsReports", color: "#8B5CF6" },
    ],
  },
  {
    title: "Bookings",
    items: [
      { label: "Booking Calendar", icon: "calendar-month-outline", screen: "BookingCalendar", color: "#3B82F6" },
      { label: "Reservations", icon: "calendar-check-outline", screen: "Reservations", color: "#10B981" },
      { label: "Blocked Dates", icon: "calendar-remove-outline", screen: "BlockedDates", color: "#EF4444" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Staff Management", icon: "account-group-outline", screen: "Staff", color: "#3B82F6" },
      { label: "User Management", icon: "account-multiple-outline", screen: "Users", color: "#10B981" },
      { label: "Partner Management", icon: "handshake-outline", screen: "Partners", color: "#B8860B" },
      { label: "Haven Management", icon: "home-city-outline", screen: "ManageHavens", color: "#8B5CF6" },
    ],
  },
  {
    title: "Property & Operations",
    items: [
      { label: "Maintenance", icon: "wrench-outline", screen: "Maintenance", color: "#F59E0B" },
      { label: "Cleaning Management", icon: "broom", screen: "CleaningManagement", color: "#10B981" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Revenue Management", icon: "cash-multiple", screen: "RevenueManagement", color: "#10B981" },
      { label: "Payment Methods", icon: "credit-card-outline", screen: "PaymentMethods", color: "#3B82F6" },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Guest Assistance", icon: "headset", screen: "GuestAssistance", color: "#3B82F6" },
      { label: "Guest Messages", icon: "message-text-outline", screen: "GuestMessages", color: "#10B981" },
      { label: "Reviews", icon: "star-outline", screen: "Reviews", color: "#F59E0B" },
    ],
  },
  {
    title: "Reports & Logs",
    items: [
      { label: "Reports", icon: "chart-bar", screen: "Reports", color: "#10B981" },
      { label: "Audit Logs", icon: "clipboard-list-outline", screen: "AuditLogs", color: "#EF4444" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", icon: "cog-outline", screen: "Settings", color: "#6B7280" },
      { label: "Profile", icon: "account-circle-outline", screen: "Profile", color: "#B8860B" },
    ],
  },
];

export default function MoreMenuScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        header: {
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        profileRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        },
        avatar: {
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: theme.colors.primaryLight,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: theme.colors.primary,
        },
        adminName: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.text,
        },
        adminRole: {
          fontSize: 12,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        content: {
          padding: 20,
          gap: 20,
        },
        section: {
          gap: 8,
        },
        sectionTitle: {
          fontSize: 12,
          fontWeight: "700",
          color: theme.colors.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          paddingHorizontal: 4,
        },
        sectionCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: "hidden",
        },
        menuItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        menuIcon: {
          width: 36,
          height: 36,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        },
        menuLabel: {
          flex: 1,
          fontSize: 14,
          fontWeight: "600",
          color: theme.colors.text,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.surfaceSecondary,
          marginLeft: 66,
        },
      }),
    [theme.colors]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>Admin User</Text>
            <Text style={styles.adminRole}>Super Admin · Staycation Haven</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.screen}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate(item.screen as never)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
