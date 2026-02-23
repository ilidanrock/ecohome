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
export {
  usePropertiesQuery,
  useCreatePropertyMutation,
  usePropertyQuery,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from './properties';

// Users (admin search)
export { useSearchUsersQuery } from './users';
export type { UserSearchResult } from './users';

// Rentals (property tenants)
export {
  usePropertyRentalsQuery,
  useCreateRentalMutation,
  useUpdateRentalMutation,
  useDeleteRentalMutation,
} from './rentals';
export type { PropertyRentalItem } from './rentals';

// Re-export query types from centralized types
export type { ConsumptionResponse } from '@/types';
