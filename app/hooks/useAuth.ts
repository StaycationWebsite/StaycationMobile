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

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const email = credentials.email.trim().toLowerCase();
      const role: UserRole = email.includes('csr') ? 'csr' : 'admin';
      const name = role === 'csr' ? 'CSR User' : 'Staycation Admin';

      dispatch(
        setCredentials({
          user: {
            id: `${role}-123`,
            email: credentials.email || 'admin@staycationhavenph.com',
            name,
            role,
          },
          token: `mock-token-${role}-${Date.now()}`,
          refreshToken: `mock-refresh-${role}-${Date.now()}`,
        })
      );
      return { success: true };
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
