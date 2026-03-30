const BASE_URL = 'https://staycationhavenph.com/api';

export interface CleaningTask {
  cleaning_id: string;
  booking_id: string;
  haven: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  cleaning_status: 'pending' | 'assigned' | 'in_progress' | 'completed' | string;
  assigned_cleaner_id: string | null;
  cleaner_first_name: string | null;
  cleaner_last_name: string | null;
  cleaner_employment_id: string | null;
  cleaning_time_in: string | null;
  cleaning_time_out: string | null;
  cleaned_at: string | null;
  inspected_at: string | null;
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const raw = await response.text();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export const cleaningService = {
  async getCleaningTasks(): Promise<CleaningTask[]> {
    const response = await fetch(`${BASE_URL}/cleaning-tasks`, { credentials: 'include' });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch cleaning tasks (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },
};

export default cleaningService;
