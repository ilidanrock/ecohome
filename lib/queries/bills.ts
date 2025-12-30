/**
 * Bills Queries
 *
 * TanStack Query hooks for electricity bills and service charges.
 */

import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { BillOCRResult } from '@/lib/ocr-service';
import { billKeys } from './keys';
import type { ErrorResponse } from '@/lib/errors/types';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorCodeFromStatus, getErrorLevelFromStatus } from '@/lib/errors/error-level';

/**
 * Base error class for bills API errors
 * Includes ErrorResponse structure for automatic toast handling
 */
export class BillsApiError extends Error {
  public readonly errorResponse: ErrorResponse;

  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
    errorResponse?: ErrorResponse
  ) {
    super(message);
    this.name = 'BillsApiError';

    // Create ErrorResponse from parameters or use provided one
    if (errorResponse) {
      this.errorResponse = errorResponse;
    } else {
      const code = statusCode ? getErrorCodeFromStatus(statusCode) : ErrorCode.INTERNAL_ERROR;
      const level = statusCode ? getErrorLevelFromStatus(statusCode) : 'error';
      this.errorResponse = {
        code,
        message,
        level,
        details: originalError,
      };
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BillsApiError);
    }
  }
}

/**
 * Network/connectivity error
 */
export class BillsNetworkError extends BillsApiError {
  constructor(originalError?: unknown) {
    super(
      'Network error: Unable to connect to the server. Please check your internet connection.',
      undefined,
      originalError
    );
    this.name = 'BillsNetworkError';
  }
}

/**
 * Client-side error (4xx status codes)
 */
export class BillsClientError extends BillsApiError {
  constructor(
    message: string,
    statusCode: number,
    public readonly details?: unknown
  ) {
    super(message, statusCode);
    this.name = 'BillsClientError';
  }
}

/**
 * Server-side error (5xx status codes)
 */
export class BillsServerError extends BillsApiError {
  constructor(
    message: string,
    statusCode: number,
    public readonly details?: unknown
  ) {
    super(message, statusCode);
    this.name = 'BillsServerError';
  }
}

/**
 * Mutation to extract bill information using OCR
 */
export function useExtractBillDataMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: BillOCRResult }, BillsApiError, { fileUrl: string }>(
    {
      mutationFn: async ({ fileUrl }) => {
        try {
          const response = await fetch('/api/electricity-bills/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUrl }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Check if errorData has ErrorResponse structure
            if (errorData.code && errorData.message && errorData.level) {
              throw new BillsApiError(
                errorData.message,
                response.status,
                errorData,
                errorData as ErrorResponse
              );
            }

            const errorMessage =
              errorData.message || `Failed to extract bill data: ${response.statusText}`;

            if (response.status >= 500) {
              throw new BillsServerError(errorMessage, response.status, errorData);
            } else {
              throw new BillsClientError(errorMessage, response.status, errorData);
            }
          }

          return response.json();
        } catch (error) {
          if (error instanceof BillsApiError) {
            throw error;
          }
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new BillsNetworkError(error);
          }
          throw new BillsApiError(
            error instanceof Error ? error.message : 'Unknown error occurred',
            undefined,
            error
          );
        }
      },
      onSuccess: () => {
        // Invalidate bills queries to refetch updated data
        queryClient.invalidateQueries({ queryKey: billKeys.all });
      },
    }
  );
}

/**
 * Mutation to create electricity bill with service charges
 */
export function useCreateElectricityBillWithChargesMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    {
      electricityBill: {
        id: string;
        propertyId: string;
        periodStart: string;
        periodEnd: string;
        totalKWh: number;
        totalCost: number;
        fileUrl: string | null;
      };
      serviceCharges: {
        id: string;
        electricityBillId: string;
        maintenanceAndReplacement: number;
        fixedCharge: number;
        compensatoryInterest: number;
        publicLighting: number;
        lawContribution: number;
        lateFee: number;
        previousMonthRounding: number;
        currentMonthRounding: number;
      };
    },
    BillsApiError,
    {
      propertyId: string;
      periodStart: string;
      periodEnd: string;
      totalKWh: number;
      totalCost: number;
      fileUrl?: string | null;
      serviceCharges: {
        maintenanceAndReplacement: number;
        fixedCharge: number;
        compensatoryInterest: number;
        publicLighting: number;
        lawContribution: number;
        lateFee: number;
        previousMonthRounding: number;
        currentMonthRounding: number;
      };
    }
  >({
    mutationFn: async (data) => {
      try {
        // First, create the electricity bill
        const billResponse = await fetch('/api/electricity-bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyId: data.propertyId,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            totalKWh: data.totalKWh,
            totalCost: data.totalCost,
            fileUrl: data.fileUrl,
          }),
        });

        if (!billResponse.ok) {
          const errorData = await billResponse.json().catch(() => ({}));

          // Check if errorData has ErrorResponse structure
          if (errorData.code && errorData.message && errorData.level) {
            throw new BillsApiError(
              errorData.message,
              billResponse.status,
              errorData,
              errorData as ErrorResponse
            );
          }

          const errorMessage =
            errorData.message || `Failed to create electricity bill: ${billResponse.statusText}`;

          if (billResponse.status >= 500) {
            throw new BillsServerError(errorMessage, billResponse.status, errorData);
          } else {
            throw new BillsClientError(errorMessage, billResponse.status, errorData);
          }
        }

        const electricityBill = await billResponse.json();

        // Then, create the service charges
        const chargesResponse = await fetch('/api/service-charges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            electricityBillId: electricityBill.id,
            ...data.serviceCharges,
          }),
        });

        if (!chargesResponse.ok) {
          const errorData = await chargesResponse.json().catch(() => ({}));

          // Check if errorData has ErrorResponse structure
          if (errorData.code && errorData.message && errorData.level) {
            throw new BillsApiError(
              errorData.message,
              chargesResponse.status,
              errorData,
              errorData as ErrorResponse
            );
          }

          const errorMessage =
            errorData.message || `Failed to create service charges: ${chargesResponse.statusText}`;

          if (chargesResponse.status >= 500) {
            throw new BillsServerError(errorMessage, chargesResponse.status, errorData);
          } else {
            throw new BillsClientError(errorMessage, chargesResponse.status, errorData);
          }
        }

        const serviceCharges = await chargesResponse.json();

        return {
          electricityBill,
          serviceCharges,
        };
      } catch (error) {
        if (error instanceof BillsApiError) {
          throw error;
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new BillsNetworkError(error);
        }
        throw new BillsApiError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          undefined,
          error
        );
      }
    },
    onSuccess: () => {
      // Invalidate bills queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}
