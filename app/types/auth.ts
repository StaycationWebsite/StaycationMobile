// ============================================================
// SINGLE SOURCE OF TRUTH for all auth-related types
// Use this file everywhere in the project
// ============================================================

export type UserRole = 'admin' | 'csr' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  phone?: string;
  properties?: string[];
}

export interface Session {
  user: User;
  expires: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: string;
}

export interface AuthResponse {
  success: boolean;
  data?: Session;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
