import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../../constants/config';

interface Discount {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount?: number;
  start_date: string;
  end_date: string;
}

interface BestDiscount extends Discount {
  savings: number;
  discountedPrice: number;
}

export const useRoomDiscounts = (havenId: string) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!havenId) return;

    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_CONFIG.DISCOUNT_API}/room-discounts?havenId=${havenId}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setDiscounts(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch discounts');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [havenId]);

  const calculateBestDiscount = useCallback(
    (basePrice: number): BestDiscount | null => {
      if (!discounts.length) return null;

      return discounts.reduce((best: BestDiscount | null, discount: Discount) => {
        if (discount.min_booking_amount && basePrice < discount.min_booking_amount) {
          return best;
        }

        const savings =
          discount.discount_type === 'percentage'
            ? basePrice * (discount.discount_value / 100)
            : discount.discount_value;

        const discountedPrice = Math.max(0, basePrice - savings);
        const current: BestDiscount = { ...discount, savings, discountedPrice };

        return !best || savings > best.savings ? current : best;
      }, null);
    },
    [discounts]
  );

  return { discounts, loading, error, calculateBestDiscount };
};
