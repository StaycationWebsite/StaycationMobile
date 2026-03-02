import { ApiResponse, AuthProvider, LoginCredentials, AuthResponse } from '../types/auth';
import { API_CONFIG } from '../../constants/config';

export class ApiService {
  static async getAuthProviders(): Promise<ApiResponse<AuthProvider[]>> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/providers`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch auth providers',
      };
    }
  }

  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/signin/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  static async signOut(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/signout`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  static async handleOAuthCallback(
    code: string,
    provider: string,
    redirectUri: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/callback/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed',
      };
    }
  }
}

export default ApiService;
