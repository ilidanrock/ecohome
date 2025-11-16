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
 * Base error class for consumption API errors
 */
export class ConsumptionApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ConsumptionApiError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConsumptionApiError);
    }
  }
}

/**
 * Network/connectivity error
 */
export class ConsumptionNetworkError extends ConsumptionApiError {
  constructor(originalError?: unknown) {
    super(
      'Network error: Unable to connect to the server. Please check your internet connection.',
      undefined,
      originalError
    );
    this.name = 'ConsumptionNetworkError';
  }
}

/**
 * Client-side error (4xx status codes)
 */
export class ConsumptionClientError extends ConsumptionApiError {
  constructor(
    message: string,
    statusCode: number,
    public readonly details?: unknown
  ) {
    super(message, statusCode);
    this.name = 'ConsumptionClientError';
  }
}

/**
 * Server-side error (5xx status codes)
 */
export class ConsumptionServerError extends ConsumptionApiError {
  constructor(
    message: string,
    statusCode: number,
    public readonly details?: unknown
  ) {
    super(message, statusCode);
    this.name = 'ConsumptionServerError';
  }
}

/**
 * Fetch consumption data from the API
 *
 * @throws {ConsumptionNetworkError} When network request fails
 * @throws {ConsumptionClientError} When server returns 4xx status
 * @throws {ConsumptionServerError} When server returns 5xx status
 */
async function fetchConsumptionData(): Promise<ConsumptionResponse> {
  try {
    const response = await fetch('/api/consumption', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage = `Failed to fetch consumption data (${statusCode})`;
      let errorDetails: unknown;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('[Consumption API Error]', {
          statusCode,
          message: errorMessage,
          details: errorDetails,
        });
      }

      // Categorize error by status code
      if (statusCode >= 500) {
        throw new ConsumptionServerError(errorMessage, statusCode, errorDetails);
      } else if (statusCode >= 400) {
        throw new ConsumptionClientError(errorMessage, statusCode, errorDetails);
      } else {
        throw new ConsumptionApiError(errorMessage, statusCode, errorDetails);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error instanceof ConsumptionApiError) {
      throw error;
    }

    // Check if it's a network error (no response received)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ConsumptionNetworkError(error);
    }

    // Re-throw as generic API error if we can't categorize it
    throw new ConsumptionApiError(
      'An unexpected error occurred while fetching consumption data',
      undefined,
      error
    );
  }
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
