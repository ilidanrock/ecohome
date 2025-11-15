/**
 * Base types shared across all stores
 */

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

export interface QuickStat {
  type: 'energy' | 'water';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  loading?: boolean;
}

export interface ConsumptionData {
  energy: {
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
  water: {
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
  lastUpdated?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  language: string;
  timezone: string;
}

export interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
}

