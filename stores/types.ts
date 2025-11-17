/**
 * Store Types
 *
 * Re-exports UI types from centralized types location.
 * This file is kept for backward compatibility with existing imports.
 *
 * @deprecated Import directly from '@/types' instead:
 *   import type { Notification, QuickStat } from '@/types'
 */
export type {
  Notification,
  NotificationType,
  QuickStat,
  ConsumptionData,
  UserPreferences,
  UIState,
} from '@/types';
