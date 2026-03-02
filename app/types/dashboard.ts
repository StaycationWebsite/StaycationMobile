export interface Activity {
  id: string;
  type: 'booking' | 'payment' | 'deposit' | 'inventory' | 'message';
  status: 'success' | 'warning' | 'error' | 'pending' | 'info';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  badge?: number;
  route?: string;
}

export interface Stat {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  iconColor?: string;
  subtitle?: string;
}

export interface DashboardData {
  stats: Stat[];
  activities: Activity[];
  quickActions: QuickAction[];
}
