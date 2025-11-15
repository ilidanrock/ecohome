/**
 * Centralized exports for all Zustand stores
 * This provides a single import point for all store hooks and types
 */

// Types
export type {
  Notification,
  NotificationType,
  QuickStat,
  ConsumptionData,
  UserPreferences,
  UIState,
} from './types';

// Utilities
export {
  formatTimestamp,
  generateNotificationId,
  isRecentNotification,
  sortNotificationsByDate,
  STORAGE_PREFIX,
} from './utils';

// Stores
export { useNotificationsStore } from './notifications/useNotificationsStore';
export { useUIStore } from './ui/useUIStore';
export { useUserPreferencesStore } from './user/useUserPreferencesStore';
export { useConsumptionStore } from './consumption/useConsumptionStore';

