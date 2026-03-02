import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, LoginCredentials, AuthState, AuthResponse } from '../types/auth';
import { ApiService } from './api';

const SESSION_KEY = '@staycation_haven_session';

export class AuthService {
  private static normalizeUser(raw: any): User | null {
    if (!raw || typeof raw !== 'object') return null;

    const id = String(raw.id ?? raw.userId ?? raw._id ?? raw.uuid_id ?? '').trim();
    if (!id) return null;

    return {
      id,
      name: raw.name ?? raw.fullName ?? null,
      email: raw.email ?? null,
      image: raw.image ?? raw.avatar ?? null,
      role: raw.role ?? null,
    };
  }

  private static normalizeSession(raw: any): Session | null {
    if (!raw || typeof raw !== 'object') return null;

    const sessionSource = raw.data && typeof raw.data === 'object' ? raw.data : raw;
    const user = this.normalizeUser(sessionSource.user ?? sessionSource.profile ?? sessionSource.account ?? null);
    if (!user) return null;

    const expiresRaw = sessionSource.expires ?? sessionSource.expiresAt ?? sessionSource.expiry ?? null;
    const tokenRaw = sessionSource.token ?? sessionSource.accessToken ?? sessionSource.jwt ?? null;

    const expires =
      typeof expiresRaw === 'string' && expiresRaw.trim().length > 0
        ? expiresRaw
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const token = typeof tokenRaw === 'string' ? tokenRaw : '';

    return {
      user,
      expires,
      token,
    };
  }

  static getInitialState(): AuthState {
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  static async saveSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static async getSession(): Promise<Session | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  static async removeSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to remove session:', error);
    }
  }

  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const loginResponse = await ApiService.loginWithCredentials(credentials);
      if (loginResponse?.success === false) {
        return {
          success: false,
          error: loginResponse.error || 'Invalid credentials',
        };
      }

      let session = this.normalizeSession(loginResponse);

      // Some auth backends return only a success/redirect payload on sign-in.
      if (!session) {
        const sessionResponse = await ApiService.getSession();
        if (sessionResponse?.success !== false) session = this.normalizeSession(sessionResponse);
      }

      if (!session) {
        return {
          success: false,
          error: 'Login succeeded but no valid session was returned',
        };
      }

      await this.saveSession(session);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  static isSessionValid(session: Session): boolean {
    return new Date(session.expires) > new Date();
  }

  static async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session ? this.isSessionValid(session) : false;
  }

  static async signOut(): Promise<boolean> {
    try {
      await ApiService.signOut();
      await this.removeSession();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      await this.removeSession();
      return false;
    }
  }
}

export default AuthService;
