import { ApiResponse, AuthProvider, LoginCredentials, AuthResponse, Session } from '../types/auth';

const API_BASE_URL = 'https://www.staycationhavenph.com/api/auth';

export class ApiService {
  private static async parseJsonSafely(response: Response): Promise<any | null> {
    const raw = await response.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private static extractAuthErrorFromUrl(data: any): string | null {
    if (!data || typeof data !== 'object' || typeof data.url !== 'string') return null;
    try {
      const parsed = new URL(data.url);
      const raw = parsed.searchParams.get('error');
      return raw ? decodeURIComponent(raw) : null;
    } catch {
      return null;
    }
  }

  // Get available authentication providers
  static async getAuthProviders(): Promise<ApiResponse<AuthProvider[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/providers`, {
        credentials: 'include',
      });
      const data = await this.parseJsonSafely(response);

      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `Failed to fetch auth providers (${response.status})`,
        };
      }

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await this.parseJsonSafely(response);
      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `Login failed (${response.status})`,
        };
      }

      const nextAuthError = this.extractAuthErrorFromUrl(data);
      if (nextAuthError) {
        return {
          success: false,
          error: nextAuthError,
        };
      }

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
      const response = await fetch(`${API_BASE_URL}/session`, {
        credentials: 'include',
      });
      const data = await this.parseJsonSafely(response);

      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `Failed to get session (${response.status})`,
        };
      }

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
        credentials: 'include',
      });
      const data = await this.parseJsonSafely(response);

      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `Sign out failed (${response.status})`,
        };
      }

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri,
        }),
      });

      const data = await this.parseJsonSafely(response);
      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `OAuth callback failed (${response.status})`,
        };
      }

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
