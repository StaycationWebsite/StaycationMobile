import { useState, useEffect, useCallback } from 'react';
import { AuthState, User, Session } from '../types/auth';
import { AuthService } from '../services/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthService.getInitialState());

  // Initialize auth state on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      const currentUser = await AuthService.getCurrentUser();
      
      setAuthState({
        user: currentUser,
        session: currentUser ? await AuthService.getSession() : null,
        isLoading: false,
        isAuthenticated,
        error: undefined,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await AuthService.loginWithCredentials(credentials);
      
      if (response.success) {
        setAuthState({
          user: response.data?.user || null,
          session: response.data || null,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);


  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await AuthService.signOut();
      
      if (success) {
        setAuthState(AuthService.getInitialState());
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Sign out failed'
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    clearError,
  };
};

export default useAuth;
