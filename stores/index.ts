/**
 * Centralized exports for all Zustand stores
 *
 * This provides a single import point for all store hooks, types, and utilities.
 * All Zustand stores should be exported from this file to maintain consistency
 * and avoid import issues throughout the application.
 *
 * Usage:
 *   import { useNotificationsStore, useUIStore, useUserPreferencesStore } from '@/stores';
 *   import type { Notification, QuickStat } from '@/stores';
 *   import { formatTimestamp } from '@/stores';
 *
 * @deprecated For types, import directly from '@/types' instead:
 *   import type { Notification, QuickStat } from '@/types'
 */

// ============================================================================
// Zustand Stores
// ============================================================================
// All client-side UI state management stores
// Note: Server data should use TanStack Query, not Zustand stores

export { useNotificationsStore } from './notifications/useNotificationsStore';
export { useUIStore } from './ui/useUIStore';
export { useUserPreferencesStore } from './user/useUserPreferencesStore';

// ============================================================================
// Types (re-exported for backward compatibility)
// ============================================================================
// @deprecated Import directly from '@/types' instead
export type {
  Notification,
  NotificationType,
  QuickStat,
  ConsumptionData,
  UserPreferences,
  UIState,
} from '@/types';

// ============================================================================
// Utilities
// ============================================================================
// Shared utility functions for store operations
export {
  formatTimestamp,
  generateNotificationId,
  isRecentNotification,
  sortNotificationsByDate,
  STORAGE_PREFIX,
} from './utils';
