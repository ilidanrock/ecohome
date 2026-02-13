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

// Invoices Queries
export { useInvoicesQuery } from './invoices';

// Bills Queries
export {
  useExtractBillDataMutation,
  useCreateElectricityBillWithChargesMutation,
  useElectricityBillsQuery,
  useWaterBillsQuery,
} from './bills';

// Properties Queries
export { usePropertiesQuery, useCreatePropertyMutation } from './properties';

// Re-export query types from centralized types
export type { ConsumptionResponse } from '@/types';
