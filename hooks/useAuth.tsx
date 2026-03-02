import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/redux/store';
import { setCredentials, logout as logoutAction, setLoading, setError } from '../app/redux/slices/authSlice';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

// Mock user database for testing
const MOCK_USERS = {
  // Admin user
  admin: {
    email: 'admin@staycationhavenph.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@staycationhavenph.com',
      name: 'Admin User',
      role: 'admin' as const,
    },
  },
  // CSR user
  csr: {
    email: 'csr@staycationhavenph.com',
    password: 'csr123',
    user: {
      id: '2',
      email: 'csr@staycationhavenph.com',
      name: 'CSR Agent',
      role: 'csr' as const,
    },
  },
};

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔥 TEMPORARY FIX: Clear storage on mount to force fresh login
  // Remove this useEffect after testing!
  useEffect(() => {
    const clearOldSession = async () => {
      await AsyncStorage.clear();
      dispatch(logoutAction());
      console.log('🗑️ Old session cleared - please login again');
    };
    clearOldSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Check against mock users
      const matchedUser = Object.values(MOCK_USERS).find(
        (mockUser) => 
          mockUser.email === credentials.email && 
          mockUser.password === credentials.password
      );

      if (matchedUser) {
        const mockToken = 'mock-token-123';
        const mockRefreshToken = 'mock-refresh-token-456';

        dispatch(setCredentials({
          user: matchedUser.user,
          token: mockToken,
          refreshToken: mockRefreshToken,
        }));

        return { success: true };
      }

      // If no match found
      const errorMsg = 'Invalid email or password';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const clearError = () => {
    dispatch(setError(null));
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};