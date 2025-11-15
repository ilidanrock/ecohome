/**
 * Centralized exports for all TanStack Query hooks
 * This provides a single import point for all query hooks
 */

// Query Keys
export * from './keys';

// Consumption Queries
export {
  useConsumptionQuery,
  useConsumptionDataQuery,
  useQuickStatsQuery,
  useInvalidateConsumption,
} from './consumption';

// Re-export query types from centralized types
export type { ConsumptionResponse } from '@/types';
