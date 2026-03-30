const BASE_URL = 'https://staycationhavenph.com/api';

export interface Booking {
  id: string;
  booking_id: string;
  user_id: string | null;
  room_name: string;
  check_in_date: string;
  check_out_date: string;
  check_in_time: string;
  check_out_time: string;
  adults: number;
  children: number;
  infants: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | string;
  rejection_reason: string | null;
  has_security_deposit: boolean;
  created_at: string;
  updated_at: string;
  source: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  valid_id_url: string | null;
  facebook_link: string | null;
  payment_method: string;
  payment_proof_url: string | null;
  payment_status: string;
  room_rate: string;
  add_ons_total: string;
  total_amount: string;
  down_payment: string;
  remaining_balance: string;
  security_deposit: string;
  deposit_status: string;
  security_deposit_payment_method: string | null;
  security_deposit_payment_proof_url: string | null;
  cleaning_status: string;
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const raw = await response.text();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export const bookingsService = {
  async getBookings(): Promise<Booking[]> {
    const response = await fetch(`${BASE_URL}/bookings`, { credentials: 'include' });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch bookings (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },
};

export default bookingsService;
