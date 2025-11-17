/**
 * Centralized Type Exports
 *
 * This is the single source of truth for all types in the application.
 * Import types from here: `import type { User, Role } from '@/types'`
 *
 * Organization:
 * - domain: Domain models and enums (User, Role, PaymentStatus)
 * - api: API response types and error types
 * - ui: UI-related types (notifications, consumption, preferences)
 * - queries: TanStack Query response types
 */

// Domain Types
export type { User, Role } from './domain';
export type { PaymentStatus } from './domain';

// API Types
export type { ResponseAPI, ErrorAuthTypes } from './api';

// UI Types
export type {
  Notification,
  NotificationType,
  QuickStat,
  ConsumptionData,
  UserPreferences,
  UIState,
} from './ui';

// Query Types
export type { ConsumptionResponse } from './queries';
