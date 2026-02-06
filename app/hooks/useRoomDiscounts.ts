import { useState, useEffect } from 'react';

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

interface DiscountResponse {
  data: Discount[];
}

interface BestDiscount extends Discount {
  savings: number;
  discountedPrice: number;
}

export const useRoomDiscounts = (havenId: string) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://www.staycationhavenph.com/api/discounts/room-discounts?havenId=${havenId}`
        );
        const data: DiscountResponse = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setDiscounts(data.data);
        }
      } catch (err) {
        console.error('Error fetching discounts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch discounts');
      } finally {
        setLoading(false);
      }
    };

    if (havenId) {
      fetchDiscounts();
    }
  }, [havenId]);

  const calculateBestDiscount = (basePrice: number): BestDiscount | null => {
    if (!discounts || discounts.length === 0) return null;

    return discounts.reduce((best: BestDiscount | null, discount: Discount) => {
      let savings = 0;

      if (discount.discount_type === 'percentage') {
        savings = basePrice * (discount.discount_value / 100);
      } else {
        savings = discount.discount_value;
      }

      if (discount.min_booking_amount && basePrice < discount.min_booking_amount) {
        return best;
      }

      const discountedPrice = basePrice - savings;
      const discountObj: BestDiscount = { ...discount, savings, discountedPrice };

      if (!best || savings > best.savings) {
        return discountObj;
      }
      return best;
    }, null);
  };

  return {
    discounts,
    loading,
    error,
    calculateBestDiscount,
  };
};
