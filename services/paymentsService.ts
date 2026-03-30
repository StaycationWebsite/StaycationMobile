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

async function parseJsonSafely(response: Response): Promise<any | null> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  payment_name: string;
  payment_method: 'bank_transfer' | 'cash' | 'mobile_wallet' | string;
  provider: string;
  account_details: string;
  payment_qr_link: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentParams {
  booking_id: number;
  amount: number;
  payment_method: string;
  reference_number?: string;
}

export interface BookingPayment {
  id: string;
  booking_id: string;
  booking_fk: string;
  payment_method: string;
  payment_proof_url: string | null;
  room_rate: string;
  add_ons_total: string;
  total_amount: string;
  down_payment: string;
  amount_paid: string;
  remaining_balance: string;
  payment_status: 'pending_down_payment' | 'approved_down_payment' | 'pending_full_payment' | 'fully_paid' | 'rejected' | string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  security_deposit: string;
  deposit_status: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  facebook_link: string | null;
  valid_id_url: string | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const paymentsService = {
  // GET /api/booking-payments
  async getBookingPayments(): Promise<BookingPayment[]> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/booking-payments`, {
      headers,
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch payments (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },

  // GET /api/payment-methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await fetch(`${BASE_URL}/payment-methods`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch payment methods (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },

  // GET /api/booking-payments/[id]
  async getBookingPayment(id: number): Promise<BookingPayment> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/booking-payments/${id}`, {
      headers,
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch payment (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    return Array.isArray(data?.data) ? data.data : (data?.data ?? data);
  },

  // POST /api/booking-payments
  async createPayment(params: CreatePaymentParams): Promise<BookingPayment> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/booking-payments`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Payment creation failed (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    return data?.data ?? data;
  },

  // PUT /api/payment-methods/[id]
  async updatePaymentMethod(
    id: string,
    params: { booking_id?: number; amount?: number; payment_method?: string; [key: string]: any }
  ): Promise<any> {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/payment-methods/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Update failed (${response.status})`);
    }
    return await parseJsonSafely(response);
  },
};

export default paymentsService;
