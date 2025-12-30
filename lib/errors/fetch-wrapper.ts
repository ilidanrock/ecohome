/**
 * Fetch wrapper with automatic error handling
 *
 * Wraps the native fetch API to automatically:
 * - Parse error responses
 * - Extract error codes and messages
 * - Show toast notifications
 * - Return standardized error responses
 */

import { ToastService } from './toast-service';
import type { ErrorResponse } from './types';
import { ErrorCode } from './error-codes';
import { getErrorCodeFromStatus, getErrorLevelFromStatus } from './error-level';
import { logger } from '@/lib/logger';

/**
 * Extended fetch options with error handling configuration
 */
export interface FetchOptions extends RequestInit {
  /**
   * Whether to show toast on error (default: true)
   */
  showToastOnError?: boolean;

  /**
   * Whether to show toast on success (default: false)
   */
  showToastOnSuccess?: boolean;

  /**
   * Custom success message
   */
  successMessage?: string;
}

/**
 * Extended Response with parsed error data
 */
export interface FetchResponse<T = unknown> extends Response {
  /**
   * Parsed JSON data
   */
  data?: T;

  /**
   * Error response if request failed
   */
  error?: ErrorResponse;
}

/**
 * Helper function to create ErrorResponse from status code and message
 * Reduces code duplication in error handling paths
 */
function createErrorResponse(
  statusCode: number,
  message: string,
  details?: unknown,
  errorId?: string
): ErrorResponse {
  const response: ErrorResponse = {
    code: getErrorCodeFromStatus(statusCode),
    message,
    level: getErrorLevelFromStatus(statusCode),
  };

  if (details !== undefined) {
    response.details = details;
  }

  if (errorId !== undefined) {
    response.errorId = errorId;
  }

  return response;
}

/**
 * Wrapped fetch function with automatic error handling
 */
export async function fetchWithErrorHandling<T = unknown>(
  url: string | URL | Request,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const {
    showToastOnError = true,
    showToastOnSuccess = false,
    successMessage,
    ...fetchOptions
  } = options;

  try {
    const response = await fetch(url, fetchOptions);

    // Try to parse response as JSON
    let data: T | undefined;
    let errorResponse: ErrorResponse | undefined;

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (isJson) {
      try {
        const json = await response.json();

        // Check if response contains error structure
        if (!response.ok && json.code && json.message && json.level) {
          errorResponse = json as ErrorResponse;
        } else if (!response.ok) {
          // Legacy error format or standard error
          errorResponse = createErrorResponse(
            response.status,
            json.message || json.error || `Request failed with status ${response.status}`,
            json.details,
            json.errorId
          );
        } else {
          data = json as T;
        }
      } catch {
        // If JSON parsing fails, create error response
        if (!response.ok) {
          errorResponse = createErrorResponse(
            response.status,
            `Request failed with status ${response.status}`
          );
        }
      }
    } else if (!response.ok) {
      // Non-JSON error response
      const text = await response.text().catch(() => '');
      errorResponse = createErrorResponse(
        response.status,
        text || `Request failed with status ${response.status}`
      );
    }

    // Create extended response without mutating original
    const extendedResponse = Object.assign(
      Object.create(Object.getPrototypeOf(response)),
      response,
      {
        data,
        error: errorResponse,
      }
    ) as FetchResponse<T>;

    // Handle errors
    if (!response.ok && errorResponse && showToastOnError) {
      logger.error('Fetch request failed', {
        url: typeof url === 'string' ? url : url.toString(),
        status: response.status,
        errorResponse,
      });
      ToastService.show(errorResponse);
    }

    // Handle success
    if (response.ok && showToastOnSuccess && successMessage) {
      ToastService.success(successMessage);
    }

    return extendedResponse;
  } catch (error) {
    // Network or other errors
    const errorResponse: ErrorResponse = {
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message:
        error instanceof Error ? error.message : 'Network error: Unable to connect to the server',
      level: 'error',
    };

    logger.error('Network error in fetch request', {
      url: typeof url === 'string' ? url : url.toString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (showToastOnError) {
      ToastService.show(errorResponse);
    }

    // Create a mock response for error case
    // Use Object.create to avoid read-only property issues
    const errorFetchResponse = Object.create(Response.prototype) as FetchResponse<T>;
    Object.defineProperty(errorFetchResponse, 'error', { value: errorResponse, writable: true });
    Object.defineProperty(errorFetchResponse, 'ok', { value: false, writable: true });
    Object.defineProperty(errorFetchResponse, 'status', { value: 0, writable: true });
    Object.defineProperty(errorFetchResponse, 'statusText', {
      value: 'Network Error',
      writable: true,
    });

    return errorFetchResponse;
  }
}

/**
 * Convenience function for GET requests
 */
export async function get<T = unknown>(
  url: string | URL | Request,
  options?: FetchOptions
): Promise<FetchResponse<T>> {
  return fetchWithErrorHandling<T>(url, { ...options, method: 'GET' });
}

/**
 * Convenience function for POST requests
 */
export async function post<T = unknown>(
  url: string | URL | Request,
  body?: unknown,
  options?: FetchOptions
): Promise<FetchResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience function for PUT requests
 */
export async function put<T = unknown>(
  url: string | URL | Request,
  body?: unknown,
  options?: FetchOptions
): Promise<FetchResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience function for DELETE requests
 */
export async function del<T = unknown>(
  url: string | URL | Request,
  options?: FetchOptions
): Promise<FetchResponse<T>> {
  return fetchWithErrorHandling<T>(url, { ...options, method: 'DELETE' });
}
