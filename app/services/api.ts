import { ApiResponse, AuthProvider, LoginCredentials, AuthResponse, Session } from '../types/auth';

const API_BASE_URL = 'https://www.staycationhavenph.com/api/auth';

export class ApiService {
  // Get available authentication providers
  static async getAuthProviders(): Promise<ApiResponse<AuthProvider[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch auth providers'
      };
    }
  }

  // Login with email and password
  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signin/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Get current session
  static async getSession(): Promise<ApiResponse<Session>> {
    try {
      const response = await fetch(`${API_BASE_URL}/session`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session'
      };
    }
  }

  // Sign out
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  // Handle OAuth callback (receives tokens from Google/other providers)
  static async handleOAuthCallback(
    code: string,
    provider: string,
    redirectUri: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/callback/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed'
      };
    }
  }

}

export default ApiService;
