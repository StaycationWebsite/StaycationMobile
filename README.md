# StaycationMobile — Setup & Structure Guide

## 1. Project Structure (Final Clean Architecture)

```
StaycationMobile/
├── app/                          ← All Expo/React Native source code
│   ├── components/
│   │   ├── common/               ← Reusable UI atoms
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── AdminTopBar.tsx
│   │   ├── ImageCarouselModal.tsx
│   │   ├── SearchModal.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/                    ← ALL hooks live here (single location)
│   │   ├── useAuth.ts            ← THE auth hook (no AsyncStorage.clear side-effect)
│   │   ├── useRefresh.ts
│   │   ├── useRoomDiscounts.ts
│   │   └── useTheme.ts
│   ├── navigation/               ← REMOVED (moved to /navigation)
│   ├── redux/
│   │   ├── api/
│   │   │   ├── activityApi.ts    ← RTK Query (now has endpoints)
│   │   │   ├── authApi.ts
│   │   │   └── dashboardApi.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── settingsSlice.ts
│   │   │   └── themeSlice.ts
│   │   └── store.ts              ← Single Redux store
│   ├── screens/
│   │   ├── Admin/                    ← Owner/Admin-only screens
│   │   │   ├── AdminDashboardScreen.tsx
│   │   │   ├── MoreMenuScreen.tsx
│   │   │   ├── Bookings/
│   │   │   │   ├── AdminBookingCalender.tsx
│   │   │   │   ├── AdminReservationsScreen.tsx
│   │   │   │   ├── BlockedDatesScreen.tsx
│   │   │   │   └── CreateBookingScreen.tsx
│   │   │   ├── Havens/
│   │   │   │   ├── HavenScreen.tsx
│   │   │   │   ├── AddHavenScreen.tsx
│   │   │   │   └── RoomDetailsScreen.tsx
│   │   │   ├── Operations/
│   │   │   │   └── MaintenanceManagementScreen.tsx
│   │   │   ├── Reports/
│   │   │   │   └── ReportsManagementScreen.tsx
│   │   │   ├── Guest/
│   │   │   │   ├── GuestMessagesScreen.tsx
│   │   │   │   └── ReviewsScreen.tsx
│   │   │   ├── Staff/
│   │   │   │   ├── StaffManagementScreen.tsx
│   │   │   │   ├── UserManagementScreen.tsx
│   │   │   │   └── PartnerManagementScreen.tsx
│   │   │   └── Settings/
│   │   │       ├── SettingsScreen.tsx
│   │   │       └── AuditLogsScreen.tsx
│   │   ├── Csr/                      ← CSR-only screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── Bookings/
│   │   │   │   ├── BookingManagementScreen.tsx
│   │   │   │   └── BookingCalendarScreen.tsx
│   │   │   ├── Finance/
│   │   │   │   ├── PaymentManagementScreen.tsx
│   │   │   │   ├── SecurityDepositScreen.tsx
│   │   │   │   └── DiscountManagementScreen.tsx
│   │   │   └── Operations/
│   │   │       ├── DeliverablesManagementScreen.tsx
│   │   │       ├── CleanersManagementScreen.tsx
│   │   │       └── InventoryManagementScreen.tsx
│   │   ├── User/                     ← Guest/User-facing screens
│   │   │   ├── HavenScreen.tsx
│   │   │   ├── MeScreen.tsx
│   │   │   └── RoomDetailsScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── MeScreen.tsx
│   ├── services/
│   │   └── api.ts                ← ApiService class
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── index.ts
│   │   ├── shadows.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts               ← SINGLE source of truth for all types
│   │   └── dashboard.ts
│   ├── utils/
│   │   └── formatters.ts
│   └── index.tsx                 ← App entry (fonts + Redux + Navigation)
│
├── assets/
│   ├── fonts/                    ← (SpaceMono kept for reference)
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── adaptive-icon.png
│       ├── favicon.png
│       └── haven_logo.png
│
├── constants/
│   ├── config.ts                 ← API_CONFIG (single source)
│   └── Styles.ts                 ← Colors + Fonts (brand gold tokens)
│
├── navigation/                   ← ROOT navigation directory
│   ├── AdminNavigator.tsx        ← Owner: bottom tabs + stack wrapper
│   ├── AuthNavigator.tsx         ← Unauthenticated stack
│   ├── BookingsTabNavigator.tsx  ← Bookings tab (Management, Reservations, Calendar)
│   ├── CsrNavigator.tsx          ← CSR bottom tabs
│   ├── FinanceTabNavigator.tsx   ← Finance tab (Payments, Deposits, Discounts)
│   ├── OperationsTabNavigator.tsx← Operations tab (Deliverables, Cleaners, Inventory, Maintenance)
│   └── RootNavigator.tsx         ← Entry: routes by auth state + role
│
├── app.json
├── babel.config.js
├── expo-env.d.ts
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

## 2. Step-by-Step Setup

### Step 1 — Copy assets
```bash
# Copy your images into the correct locations
cp haven_logo.png   assets/images/haven_logo.png
cp icon.png         assets/images/icon.png
cp splash-icon.png  assets/images/splash-icon.png
cp adaptive-icon.png assets/images/adaptive-icon.png
cp favicon.png      assets/images/favicon.png
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Start the dev server
```bash
npx expo start
```
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go for physical device

---

## 3. Test Credentials (Development)

| Role  | Email                           | Password  |
|-------|---------------------------------|-----------|
| Admin | admin@staycationhavenph.com     | admin123  |
| CSR   | csr@staycationhavenph.com       | csr123    |

> Admin login → AdminNavigator (Dashboard + Bookings + Havens + Profile tabs)  
> CSR login → CsrNavigator (Dashboard + Profile tabs)

---

## 4. All Bugs Fixed

| # | File (Original)         | Issue                                   | Fix                                         |
|---|-------------------------|-----------------------------------------|---------------------------------------------|
| 1 | `RootNavigator.tsx`     | Contained useAuth hook, not a navigator | Replaced with real root navigation logic    |
| 2 | `AuthNavigator.tsx`     | Import typo: `LoginScreenreen`          | Fixed to `LoginScreen`                      |
| 3 | `useAuth.tsx` (both)    | Duplicate files in two locations        | Single `app/hooks/useAuth.ts`               |
| 4 | `useAuth.tsx`           | `AsyncStorage.clear()` on every mount   | Removed — no longer clears session on mount |
| 5 | `DashboardScreen.tsx`   | Fake `Feather` emoji fallback component | Uses real `@expo/vector-icons`              |
| 6 | `activityApi.ts`        | Empty stub — no endpoints               | Added `getActivities` endpoint              |
| 7 | `AdminDashboardScreen`  | Broken `Ionicons` import from RN        | All icon imports from `@expo/vector-icons`  |
| 8 | `app/index.tsx`         | Missing `NavigationContainer`           | Added with font loading + PersistGate       |
| 9 | `AdminNavigator.tsx`    | Only 2 tabs, missing Havens + Profile   | Full 4-tab navigator                        |
| 10| `TabNavigator.tsx`      | Named TabNavigator but was a Stack      | Replaced by `AdminNavigator` + `CsrNavigator` |
| 11| Duplicate `hooks/`      | Root-level AND app-level hooks dirs     | Single canonical `app/hooks/`              |
| 12| Duplicate `services/`   | Root-level AND app-level services       | Single canonical `app/services/`           |
| 13| `Fonts` reference       | `Fonts.inter`/`Fonts.poppins` (short)  | Updated to match loaded font family names   |
| 14| `LoginScreen.tsx`       | Dev "Clear Storage" button in prod UI   | Removed — replaced with hint text only     |
| 15| `app.json`              | expo-router plugin only                 | Added splash-screen plugin                  |

---

## 5. Authentication Flow

```
App Launch
  └── PersistGate (loads Redux from AsyncStorage)
        └── RootNavigator
              ├── isLoading=true  → ActivityIndicator
              ├── !isAuthenticated → AuthNavigator → LoginScreen
              └── isAuthenticated
                    ├── role=admin/owner → AdminNavigator
                    │     ├── Tab: Dashboard (AdminDashboardScreen)
                    │     ├── Tab: Bookings → BookingsTabNavigator
                    │     │     ├── Management (BookingManagementScreen)
                    │     │     ├── Reservations (AdminReservationsScreen)
                    │     │     └── Calendar (BookingCalendarScreen)
                    │     ├── Tab: Finance → FinanceTabNavigator
                    │     │     ├── Payments (PaymentManagementScreen)
                    │     │     ├── Deposits (SecurityDepositScreen)
                    │     │     └── Discounts (DiscountManagementScreen)
                    │     ├── Tab: Operations → OperationsTabNavigator
                    │     │     ├── Deliverables (DeliverablesManagementScreen)
                    │     │     ├── Cleaners (CleanersManagementScreen)
                    │     │     ├── Inventory (InventoryManagementScreen)
                    │     │     └── Maintenance (MaintenanceManagementScreen)
                    │     ├── Tab: More (MoreMenuScreen)
                    │     └── Stack screens: RoomDetails, ManageHavens, CreateBooking,
                    │           AddHaven, GuestMessages, Reports, Staff, Reviews,
                    │           Users, Partners, AuditLogs, Settings, BlockedDates
                    └── role=csr → CsrNavigator
                          ├── Tab: CsrDashboard (DashboardScreen)
                          └── Tab: CsrProfile (MeScreen)
```

---

## 6. Replacing Mock Data with Real API

When the backend is ready, in `app/hooks/useAuth.ts`:
```ts
// Replace this block:
const matchedUser = Object.values(MOCK_USERS).find(...)

// With:
const result = await ApiService.loginWithCredentials(credentials);
if (result.success && result.data) {
  dispatch(setCredentials({
    user: result.data.user,
    token: result.data.token,
    refreshToken: result.data.token,
  }));
}
```

---

## 7. Key Conventions

- **Colors**: Always import from `constants/Styles.ts` → `Colors.brand.primary` for gold `#B8860B`
- **Types**: Always import from `app/types/auth.ts` — never redefine User/AuthState locally
- **Hooks**: Always import `useAuth` from `app/hooks/useAuth`
- **Navigation**: Type your navigator params; use `useNavigation<any>()` only as last resort
