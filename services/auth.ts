import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, LoginCredentials, AuthState, AuthResponse } from '../types/auth';
import { ApiService } from './api';

const SESSION_KEY = '@staycation_haven_session';

export class AuthService {
  // Initialize auth state
  static getInitialState(): AuthState {
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  // Save session to AsyncStorage
  static async saveSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Get session from AsyncStorage
  static async getSession(): Promise<Session | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // Remove session from AsyncStorage
  static async removeSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to remove session:', error);
    }
  }

  // Login with email and password (Mocked for now)
  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockSession: Session = {
      user: {
        id: 'admin-123',
        name: 'Staycation Admin',
        email: credentials.email || 'admin@staycationhavenph.com',
        role: 'admin',
        image: null
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      token: 'mock-jwt-token-for-admin'
    };
    
    await this.saveSession(mockSession);
    
    return {
      success: true,
      data: mockSession
    };
  }

  // Check if session is valid
  static isSessionValid(session: Session): boolean {
    return new Date(session.expires) > new Date();
  }

  // Get current authenticated user
  static async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session ? this.isSessionValid(session) : false;
  }

  // Sign out user
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
