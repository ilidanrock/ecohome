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
 * This function implements comprehensive error handling with proper categorization:
 * - Network errors: Occur when the fetch request fails entirely (no response received)
 * - Client errors (4xx): User/request issues (unauthorized, bad request, etc.)
 * - Server errors (5xx): Server-side problems (internal errors, service unavailable)
 *
 * Error categorization rationale:
 * - 4xx errors indicate client-side issues that the user can potentially fix
 * - 5xx errors indicate server-side problems that require backend attention
 * - Network errors occur before any HTTP response is received
 *
 * @throws {ConsumptionNetworkError} When network request fails (no response received)
 * @throws {ConsumptionClientError} When server returns 4xx status (client-side issues)
 * @throws {ConsumptionServerError} When server returns 5xx status (server-side issues)
 */
async function fetchConsumptionData(): Promise<ConsumptionResponse> {
  try {
    // Attempt to fetch consumption data from the API
    const response = await fetch('/api/consumption', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response indicates an error (status not in 200-299 range)
    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage = `Failed to fetch consumption data (${statusCode})`;
      let errorDetails: unknown;

      // Try to extract error details from the response body
      // The API may return structured error information in JSON format
      try {
        const errorData = await response.json();
        // Prefer specific error messages from the API response
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON (e.g., plain text error), use status text
        // This handles cases where the server returns non-JSON error responses
        errorMessage = response.statusText || errorMessage;
      }

      // Log error for debugging (only in development mode)
      // This helps developers identify issues during development
      // Note: In Next.js, NODE_ENV is available in both server and client
      const isDevelopment =
        typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

      if (isDevelopment) {
        // Build log message with guaranteed values
        const logParts = [
          '[Consumption API Error]',
          `Status: ${statusCode}`,
          `Message: ${errorMessage || 'No error message available'}`,
        ];

        // Add details if available and not empty
        if (
          errorDetails !== undefined &&
          errorDetails !== null &&
          (typeof errorDetails !== 'object' ||
            (typeof errorDetails === 'object' && Object.keys(errorDetails).length > 0))
        ) {
          logParts.push(`Details: ${JSON.stringify(errorDetails)}`);
        }

        console.error(...logParts);
      }

      // Categorize error by HTTP status code range
      // This categorization helps components handle errors appropriately:
      // - 5xx errors: Server problems - show generic error, may retry
      // - 4xx errors: Client problems - show specific message, user action may help
      // - Other errors: Unexpected status codes - treat as generic API error
      if (statusCode >= 500) {
        // Server-side errors (500-599): Database issues, server crashes, etc.
        // These require backend attention and are typically not user-fixable
        throw new ConsumptionServerError(errorMessage, statusCode, errorDetails);
      } else if (statusCode >= 400) {
        // Client-side errors (400-499): Bad requests, unauthorized, not found, etc.
        // These may be user-fixable (e.g., authentication, invalid input)
        throw new ConsumptionClientError(errorMessage, statusCode, errorDetails);
      } else {
        // Unexpected status codes (300-399, etc.): Redirects or other non-error codes
        // Treat as generic API error since we expected a successful response
        throw new ConsumptionApiError(errorMessage, statusCode, errorDetails);
      }
    }

    // Success: Parse and return the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Error handling flow:
    // 1. If error is already a ConsumptionApiError (categorized above), re-throw it
    // 2. If it's a network error (TypeError from fetch), wrap as ConsumptionNetworkError
    // 3. Otherwise, wrap as generic ConsumptionApiError for unexpected errors

    // Re-throw already categorized errors (from the if (!response.ok) block above)
    if (error instanceof ConsumptionApiError) {
      throw error;
    }

    // Detect network errors: These occur when fetch() fails before receiving a response
    // Common causes: No internet connection, CORS issues, DNS failures, timeout
    // TypeError with 'fetch' in message is the standard indicator of network failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ConsumptionNetworkError(error);
    }

    // Fallback: Wrap unexpected errors as generic API error
    // This handles edge cases like JSON parsing errors or other unexpected exceptions
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
