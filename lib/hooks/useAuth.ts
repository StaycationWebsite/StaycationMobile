import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
} from '../redux/slices/authSlice';
import { User, UserRole, LoginCredentials } from '../types/auth';
import { ApiService } from '../api';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

function roleFromEmail(email: string): UserRole {
  if (email.toLowerCase().includes('csr')) return 'csr';
  return 'guest';
}

function normalizeOAuthUser(raw: Record<string, unknown>, fallbackEmail: string): User {
  const email = String(raw.email ?? fallbackEmail ?? '');
  const role = (raw.role as UserRole) || roleFromEmail(email);
  return {
    id: String(raw.id ?? raw.sub ?? `oauth-${Date.now()}`),
    email: email || fallbackEmail || 'user@unknown',
    name: String(raw.name ?? (email.split('@')[0] || 'User')),
    role,
    image: (raw.image as string | null | undefined) ?? (raw.picture as string | null | undefined) ?? null,
  };
}

function parseOAuthApiPayload(
  payload: unknown,
  hints?: { email?: string; name?: string }
): { user: User; token: string; refreshToken: string } | null {
  if (!payload || typeof payload !== 'object') return null;
  const o = payload as Record<string, unknown>;
  if (o.success === false) return null;
  const nested = (o.data ?? o.session) as Record<string, unknown> | undefined;
  const userRaw =
    (o.user as Record<string, unknown> | undefined) ??
    (nested?.user as Record<string, unknown> | undefined);
  const token =
    (o.token as string | undefined) ??
    (nested?.token as string | undefined) ??
    (nested?.accessToken as string | undefined) ??
    (o.accessToken as string | undefined);
  const refreshToken =
    (o.refreshToken as string | undefined) ??
    (nested?.refreshToken as string | undefined) ??
    '';
  if (!token) return null;
  if (userRaw) {
    const emailHint =
      typeof userRaw.email === 'string'
        ? userRaw.email
        : typeof o.email === 'string'
          ? o.email
          : hints?.email ?? '';
    return {
      user: normalizeOAuthUser(userRaw, emailHint),
      token: String(token),
      refreshToken: String(refreshToken ?? ''),
    };
  }
  if (hints?.email) {
    return {
      user: normalizeOAuthUser(
        { email: hints.email, name: hints.name ?? hints.email.split('@')[0] },
        hints.email
      ),
      token: String(token),
      refreshToken: String(refreshToken ?? ''),
    };
  }
  return null;
}

function isApiFailure(x: unknown): x is { success: false; error?: string } {
  return typeof x === 'object' && x !== null && 'success' in x && (x as { success: unknown }).success === false;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const continueAsGuest = () => {
    dispatch(
      setCredentials({
        user: {
          id: `guest-${Date.now()}`,
          email: 'guest@staycationhaven.ph',
          name: 'Guest',
          role: 'guest',
        },
        token: `guest-token-${Date.now()}`,
        refreshToken: '',
      })
    );
  };

  const register = async (payload: RegisterPayload): Promise<LoginResult> => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const raw = await ApiService.registerEmailPassword({
        email: payload.email,
        password: payload.password,
        name: payload.fullName.trim() || payload.email.split('@')[0] || 'User',
      });
      if (isApiFailure(raw)) {
        const message = raw.error || 'Registration failed';
        dispatch(setError(message));
        return { success: false, error: message };
      }
      const parsed = parseOAuthApiPayload(raw, {
        email: payload.email.trim(),
        name: payload.fullName.trim(),
      });
      if (parsed) {
        dispatch(
          setCredentials({
            user: parsed.user,
            token: parsed.token,
            refreshToken: parsed.refreshToken,
          })
        );
        return { success: true };
      }
      const message = 'Registration succeeded but response format was unexpected (expected token and user).';
      dispatch(setError(message));
      return { success: false, error: message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const raw = await ApiService.loginEmailPassword(credentials);
      if (isApiFailure(raw)) {
        const message = raw.error || 'Login failed';
        dispatch(setError(message));
        return { success: false, error: message };
      }
      const parsed = parseOAuthApiPayload(raw, { email: credentials.email.trim() });
      if (parsed) {
        dispatch(
          setCredentials({
            user: parsed.user,
            token: parsed.token,
            refreshToken: parsed.refreshToken,
          })
        );
        return { success: true };
      }
      const message = 'Login succeeded but response format was unexpected (expected token and user).';
      dispatch(setError(message));
      return { success: false, error: message };
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

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string): Promise<LoginResult> => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const raw = (await ApiService.loginWithGoogleIdToken(idToken)) as unknown;
        const parsed = parseOAuthApiPayload(raw);
        if (parsed) {
          dispatch(
            setCredentials({
              user: parsed.user,
              token: parsed.token,
              refreshToken: parsed.refreshToken,
            })
          );
          return { success: true };
        }
        const errObj = raw as Record<string, unknown> | null;
        const message =
          (errObj?.error as string) ||
          (errObj?.message as string) ||
          'Google sign-in failed. Check API response shape (user + token).';
        dispatch(setError(message));
        return { success: false, error: message };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const signInWithOAuthCode = useCallback(
    async (provider: 'google' | 'facebook', code: string, redirectUri: string): Promise<LoginResult> => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const raw = (await ApiService.handleOAuthCallback(code, provider, redirectUri)) as unknown;
        const parsed = parseOAuthApiPayload(raw);
        if (parsed) {
          dispatch(
            setCredentials({
              user: parsed.user,
              token: parsed.token,
              refreshToken: parsed.refreshToken,
            })
          );
          return { success: true };
        }
        const errObj = raw as Record<string, unknown> | null;
        const message =
          (errObj?.error as string) ||
          (errObj?.message as string) ||
          'Could not complete sign-in. Check API / OAuth settings.';
        dispatch(setError(message));
        return { success: false, error: message };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign-in failed';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const deleteAccount = useCallback(async (): Promise<LoginResult> => {
    if (!token || token.startsWith('guest-token')) {
      const message = 'Sign in with a full account to delete it.';
      dispatch(setError(message));
      return { success: false, error: message };
    }
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const result = await ApiService.deleteAccount(token);
      if (!result.success) {
        const message = result.error || 'Could not delete account';
        dispatch(setError(message));
        return { success: false, error: message };
      }
      dispatch(logoutAction());
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not delete account';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, token]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    continueAsGuest,
    signInWithGoogleIdToken,
    signInWithOAuthCode,
    deleteAccount,
    logout,
    clearError,
  };
};
