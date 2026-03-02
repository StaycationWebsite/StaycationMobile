import { ApiResponse, AuthProvider, LoginCredentials, AuthResponse } from '../types/auth';
import { API_CONFIG } from '../../constants/config';

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

  private static extractUrl(data: any): string | null {
    if (!data || typeof data !== 'object' || typeof data.url !== 'string') return null;
    return data.url;
  }

  private static async getCsrfToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/csrf`, {
        credentials: 'include',
      });
      const data = await this.parseJsonSafely(response);
      if (!response.ok) return null;
      const token = data?.csrfToken;
      return typeof token === 'string' && token.trim().length > 0 ? token : null;
    } catch {
      return null;
    }
  }

  static async getAuthProviders(): Promise<ApiResponse<AuthProvider[]>> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/providers`, {
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
        error: error instanceof Error ? error.message : 'Failed to fetch auth providers',
      };
    }
  }

  static async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const csrfToken = await this.getCsrfToken();
      if (!csrfToken) {
        return {
          success: false,
          error: 'Unable to initialize secure login. Please try again.',
        };
      }

      const body = new URLSearchParams();
      body.append('email', credentials.email);
      body.append('password', credentials.password);
      body.append('csrfToken', csrfToken);
      body.append('json', 'true');
      body.append('callbackUrl', 'https://www.staycationhavenph.com/');

      const response = await fetch(`${API_CONFIG.AUTH_API}/callback/credentials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await this.parseJsonSafely(response);
      if (!response.ok) {
        const nextAuthError = this.extractAuthErrorFromUrl(data);
        return {
          success: false,
          error:
            nextAuthError ||
            (data && (data.error || data.message)) ||
            `Login failed (${response.status})`,
        };
      }

      const nextAuthError = this.extractAuthErrorFromUrl(data);
      if (nextAuthError) {
        return {
          success: false,
          error: nextAuthError,
        };
      }

      const url = this.extractUrl(data);
      if (url && url.includes('/signin')) {
        return {
          success: false,
          error: 'Login did not complete. Please verify credentials and security checks.',
        };
      }

      return {
        success: true,
      };
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
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
        error: error instanceof Error ? error.message : 'OAuth callback failed',
      };
    }
  }

  static async getSession(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/session`, {
        credentials: 'include',
      });
      const data = await this.parseJsonSafely(response);
      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.error || data.message)) || `Failed to get session (${response.status})`,
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  }
}

export default ApiService;
