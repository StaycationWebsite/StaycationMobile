import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import settingsReducer from './slices/settingsSlice';
import { dashboardApi } from './api/dashboardApi';
import { activityApi } from './api/activityApi';
import { authApi } from './api/authApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme', 'settings'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  settings: settingsReducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [activityApi.reducerPath]: activityApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      dashboardApi.middleware,
      activityApi.middleware,
      authApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
