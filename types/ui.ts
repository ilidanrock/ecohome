/**
 * UI Types
 *
 * Types related to user interface, notifications, consumption data,
 * and user preferences. These types are used in components and stores.
 */

/**
 * Notification type variants
 */
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

/**
 * Notification interface
 * Used for client-side notifications (toasts, alerts)
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

/**
 * Quick stat for dashboard display
 * Shows energy or water consumption with trend
 */
export interface QuickStat {
  type: 'energy' | 'water';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  loading?: boolean;
}

/**
 * Consumption data structure
 * Contains energy and water consumption information
 */
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

/**
 * User preferences
 * Stored in Zustand with persistence
 */
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

/**
 * UI state
 * Temporary UI state (sidebar, modals, loading)
 */
export interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
}
