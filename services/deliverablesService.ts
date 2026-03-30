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

export interface DeliverableItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total_price: number;
  formatted_price: string;
  formatted_total: string;
  status: string;
  delivered_at: string | null;
  handled_by: string | null;
  notes: string | null;
}

export interface DeliverableRecord {
  id: string;
  deliverable_id: string;
  booking_id: string;
  booking_uuid: string;
  guest: string;
  guest_email: string | null;
  guest_phone: string | null;
  haven: string;
  tower: string;
  items: DeliverableItem[];
  grand_total: number;
  formatted_grand_total: string;
  overall_status: string;
  checkin_date: string;
  checkout_date: string;
  created_at: string;
}

export const deliverablesService = {
  async getAllDeliverables(): Promise<DeliverableRecord[]> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/admin/deliverables`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deliverables (${response.status})`);
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch deliverables');
    return Array.isArray(data.data) ? data.data : [];
  },

  async updateStatus(deliverableId: string, newStatus: string): Promise<void> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/admin/deliverables`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({ deliverableId, newStatus }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Failed to update status (${response.status})`);
    }
  },

  async performAction(deliverableId: string, action: 'delivered' | 'cancelled' | 'refunded'): Promise<void> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/admin/deliverables`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ deliverableId, action }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Failed to perform action (${response.status})`);
    }
  },
};

export default deliverablesService;
