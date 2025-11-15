/**
 * Query Types
 *
 * Types for TanStack Query responses.
 * These types represent the shape of data returned from API routes.
 */

import type { ConsumptionData, QuickStat } from './ui';

/**
 * Consumption API response
 * Returned from /api/consumption endpoint
 */
export interface ConsumptionResponse {
  consumptionData: ConsumptionData;
  quickStats: QuickStat[];
}
