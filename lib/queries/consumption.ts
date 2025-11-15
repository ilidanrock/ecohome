/**
 * Consumption Queries
 *
 * TanStack Query hooks for consumption data.
 * These hooks replace the Zustand store for server-side consumption data.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ConsumptionResponse } from '@/types';
import { consumptionKeys } from './keys';

/**
 * Fetch consumption data from the API
 */
async function fetchConsumptionData(): Promise<ConsumptionResponse> {
  const response = await fetch('/api/consumption', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch consumption data');
  }

  return response.json();
}

/**
 * Hook to fetch consumption data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useConsumptionQuery();
 * ```
 */
export function useConsumptionQuery() {
  return useQuery({
    queryKey: consumptionKeys.quickStats(),
    queryFn: fetchConsumptionData,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache data for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    retry: 1, // Retry once on failure
  });
}

/**
 * Hook to get only consumption data (without quick stats)
 */
export function useConsumptionDataQuery() {
  const { data, ...rest } = useConsumptionQuery();
  return {
    ...rest,
    data: data?.consumptionData,
  };
}

/**
 * Hook to get only quick stats
 */
export function useQuickStatsQuery() {
  const { data, ...rest } = useConsumptionQuery();
  return {
    ...rest,
    data: data?.quickStats ?? [],
  };
}

/**
 * Hook to invalidate consumption queries
 * Useful after mutations that affect consumption data
 */
export function useInvalidateConsumption() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: consumptionKeys.all });
  };
}
