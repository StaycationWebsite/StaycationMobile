const BASE_URL = 'https://staycationhavenph.com/api';

export interface InventoryItem {
  item_id: string;
  item_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_type: string;
  price_per_unit: string;
  last_restocked: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;
  created_at: string;
  updated_at: string;
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const raw = await response.text();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    const response = await fetch(`${BASE_URL}/inventory`, { credentials: 'include' });
    if (!response.ok) {
      const data = await parseJsonSafely(response);
      throw new Error((data?.error || data?.message) ?? `Failed to fetch inventory (${response.status})`);
    }
    const data = await parseJsonSafely(response);
    if (!data) return [];
    return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
  },

  async addItem(payload: {
    item_name: string;
    category: string;
    current_stock: number;
    minimum_stock: number;
    unit_type: string;
  }): Promise<InventoryItem> {
    const response = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) throw new Error((data?.error || data?.message) ?? `Failed to add item (${response.status})`);
    return data?.data ?? data;
  },

  async updateItem(itemId: string, payload: {
    item_name?: string;
    current_stock?: number;
    minimum_stock?: number;
    unit_type?: string;
  }): Promise<InventoryItem> {
    const response = await fetch(`${BASE_URL}/inventory/${itemId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) throw new Error((data?.error || data?.message) ?? `Failed to update item (${response.status})`);
    return data?.data ?? data;
  },

  async restockItem(itemId: string, quantity: number, note?: string): Promise<InventoryItem> {
    const response = await fetch(`${BASE_URL}/inventory/${itemId}/restock`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, note }),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) throw new Error((data?.error || data?.message) ?? `Failed to restock item (${response.status})`);
    return data?.data ?? data;
  },
};

export default inventoryService;
