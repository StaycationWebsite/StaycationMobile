import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'PHP'): string => {
  if (currency === 'PHP') {
    return `₱${new Intl.NumberFormat('en-US').format(amount)}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatDate = (
  date: string | Date,
  formatString = 'MMM dd, yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('en-US').format(num);

export const formatPercentage = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;
