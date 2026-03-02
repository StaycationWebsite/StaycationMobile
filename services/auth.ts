import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, LoginCredentials, AuthState, AuthResponse } from '../types/auth';
import { ApiService } from './api';

const SESSION_KEY = '@staycation_haven_session';

export class AuthService {

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

    await new Promise(resolve => setTimeout(resolve, 800));

    const isAdmin = credentials.email?.toLowerCase().includes('admin');
    const isCSR = credentials.email?.toLowerCase().includes('csr');

    let role: 'admin' | 'csr' = 'admin';
    let userName = 'Admin User';

    if (isCSR) {
      role = 'csr';
      userName = 'CSR User';
    } else if (isAdmin) {
      role = 'admin';
      userName = 'Admin User';
    }

    const mockSession: Session = {
      user: {
        id: `${role}-123`,
        name: userName,
        email: credentials.email || 'admin@staycationhavenph.com',
        role: role,
        image: null
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      token: `mock-jwt-token-for-${role}`
    };
    
    await this.saveSession(mockSession);
    
    return {
      success: true,
      data: mockSession
    };
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
      await this.removeSession();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  }

}

export default AuthService;