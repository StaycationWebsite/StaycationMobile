export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export interface Session {
  user: User;
  expires: string;
  token: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'credentials';
  signinUrl: string;
  callbackUrl: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: Session;
  error?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Type definitions file - no default export needed
