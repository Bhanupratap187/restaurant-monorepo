// Re-export shared types
export * from '@restaurant-monorepo/shared-types';

// Dashboard-specific types
export interface DashboardStats {
  todayStats: Array<{
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }>;
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export interface AuthState {
  user: import('@restaurant-monorepo/shared-types').User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
