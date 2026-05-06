import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationSettings {
  push: boolean;
  email: boolean;
  bookings: boolean;
  payments: boolean;
  inventory: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  language: string;
  currency: string;
  dateFormat: string;
  refreshInterval: number;
}

const initialState: SettingsState = {
  notifications: {
    push: true,
    email: true,
    bookings: true,
    payments: true,
    inventory: true,
  },
  language: 'en',
  currency: 'PHP',
  dateFormat: 'MM/dd/yyyy',
  refreshInterval: 30,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    togglePushNotifications: (state) => {
      state.notifications.push = !state.notifications.push;
    },
    toggleEmailNotifications: (state) => {
      state.notifications.email = !state.notifications.email;
    },
    toggleNotificationType: (
      state,
      action: PayloadAction<'bookings' | 'payments' | 'inventory'>
    ) => {
      state.notifications[action.payload] = !state.notifications[action.payload];
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
  },
});

export const {
  togglePushNotifications,
  toggleEmailNotifications,
  toggleNotificationType,
  setLanguage,
  setCurrency,
  setRefreshInterval,
} = settingsSlice.actions;

export default settingsSlice.reducer;
