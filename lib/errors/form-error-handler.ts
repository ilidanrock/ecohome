'use client';

import { useEffect } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { ToastService } from './toast-service';
import { ErrorCode } from './error-codes';

/**
 * Hook to handle form errors and show toasts
 *
 * Automatically shows toast notifications when form validation errors occur
 */
export function useFormErrorHandler<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  options?: {
    /**
     * Whether to show toast on validation errors (default: true)
     */
    showToastOnError?: boolean;

    /**
     * Whether to show toast on submit errors (default: true)
     */
    showToastOnSubmitError?: boolean;
  }
) {
  const { showToastOnError = true, showToastOnSubmitError = true } = options || {};
  const { formState } = form;

  // Handle validation errors
  useEffect(() => {
    if (showToastOnError && formState.errors && Object.keys(formState.errors).length > 0) {
      const firstError = Object.values(formState.errors)[0];
      if (firstError?.message) {
        ToastService.error(String(firstError.message), ErrorCode.VALIDATION_ERROR);
      }
    }
  }, [formState.errors, showToastOnError]);

  // Handle submit errors
  useEffect(() => {
    if (showToastOnSubmitError && formState.isSubmitSuccessful) {
      // Form submitted successfully - could show success toast if needed
      // This is optional and can be customized
    }
  }, [formState.isSubmitSuccessful, showToastOnSubmitError]);
}

/**
 * Extract first error message from form errors
 */
export function getFirstFormError<T extends Record<string, unknown>>(
  errors: FieldErrors<T>
): string | null {
  const firstError = Object.values(errors)[0];
  return firstError?.message ? String(firstError.message) : null;
}

/**
 * Show toast for form validation errors
 */
export function showFormErrors<T extends Record<string, unknown>>(errors: FieldErrors<T>): void {
  const firstError = getFirstFormError(errors);
  if (firstError) {
    ToastService.error(firstError, ErrorCode.VALIDATION_ERROR);
  }
}

/**
 * Show toast for server-side form validation errors
 */
export function showServerFormErrors(errors: Record<string, string[]>): void {
  const firstErrorKey = Object.keys(errors)[0];
  const firstErrorMessages = errors[firstErrorKey];

  if (firstErrorMessages && firstErrorMessages.length > 0) {
    ToastService.error(`${firstErrorKey}: ${firstErrorMessages[0]}`, ErrorCode.VALIDATION_ERROR);
  }
}
