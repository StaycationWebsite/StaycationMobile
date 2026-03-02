import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
} from '../redux/slices/authSlice';
import { UserRole } from '../types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

// Mock users — replace with real API call when backend is ready
const MOCK_USERS: Record<string, { email: string; password: string; user: { id: string; email: string; name: string; role: UserRole } }> = {
  admin: {
    email: 'admin@staycationhavenph.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@staycationhavenph.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
  csr: {
    email: 'csr@staycationhavenph.com',
    password: 'csr123',
    user: {
      id: '2',
      email: 'csr@staycationhavenph.com',
      name: 'CSR Agent',
      role: 'csr',
    },
  },
};

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // TODO: Replace with real API: await ApiService.loginWithCredentials(credentials)
      const matchedUser = Object.values(MOCK_USERS).find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (matchedUser) {
        dispatch(
          setCredentials({
            user: matchedUser.user,
            token: `mock-token-${Date.now()}`,
            refreshToken: `mock-refresh-${Date.now()}`,
          })
        );
        return { success: true };
      }

      const errorMsg = 'Invalid email or password';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
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
