import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://staycationhavenph.com/api';
const SESSION_KEY = '@staycation_haven_session';

async function getAuthToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token ?? null;
  } catch {
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export interface RoomDiscount {
  id?: number;
  code: string;
  name?: string;
  percentage?: number;
  discountAmount?: number;
  type?: 'percentage' | 'fixed';
  minAmount?: number | null;
  validUntil?: string;
  status?: string;
  usageCount?: number;
}

export interface GetRoomDiscountsParams {
  havenId: string;
  userId?: number;
}

export const discountsService = {
  async getAllDiscounts(): Promise<RoomDiscount[]> {
    // Try multiple endpoint + auth combinations to work around backend issues
    const attempts = [
      // 1. Admin endpoint with Bearer token
      async () => {
        const headers = await authHeaders();
        return fetch(`${BASE_URL}/admin/discounts`, { headers, credentials: 'include' });
      },
      // 2. Admin endpoint with only cookies (like the web browser does)
      async () => fetch(`${BASE_URL}/admin/discounts`, { credentials: 'include' }),
      // 3. Base discounts endpoint with Bearer token
      async () => {
        const headers = await authHeaders();
        return fetch(`${BASE_URL}/discounts`, { headers, credentials: 'include' });
      },
    ];

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        if (!response.ok) continue;
        const raw = await response.text();
        if (!raw) continue;
        const data = JSON.parse(raw);
        const items: RoomDiscount[] = Array.isArray(data) ? data
          : Array.isArray(data.data) ? data.data
          : Array.isArray(data.discounts) ? data.discounts
          : Array.isArray(data.results) ? data.results
          : (data.id || data.code) ? [data] : [];
        if (items.length > 0) return items;
      } catch { continue; }
    }
    return [];
  },

  async getRoomDiscounts(params: GetRoomDiscountsParams): Promise<RoomDiscount[]> {
    const headers = await authHeaders();
    const query = new URLSearchParams({ havenId: String(params.havenId) });
    if (params.userId !== undefined) query.set('userId', String(params.userId));

    const response = await fetch(
      `${BASE_URL}/discounts/room-discounts?${query.toString()}`,
      { headers, credentials: 'include' }
    );

    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data && (data.error || data.message)) || `Failed to fetch discounts (${response.status})`);
    }

    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },
};

export default discountsService;
