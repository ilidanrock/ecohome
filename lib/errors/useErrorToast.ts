'use client';

import { useCallback } from 'react';
import { ToastService } from './toast-service';
import type { ToastConfig } from './types';
import { ErrorCode } from './error-codes';

/**
 * Hook for manual error toast display
 *
 * Provides convenient methods to show toasts manually when needed
 */
export function useErrorToast() {
  const showSuccess = useCallback(
    (message: string, code?: string | ErrorCode, duration?: number) => {
      ToastService.success(message, code, duration);
    },
    []
  );

  const showError = useCallback((message: string, code?: string | ErrorCode, duration?: number) => {
    ToastService.error(message, code, duration);
  }, []);

  const showWarning = useCallback(
    (message: string, code?: string | ErrorCode, duration?: number) => {
      ToastService.warning(message, code, duration);
    },
    []
  );

  const showInfo = useCallback((message: string, code?: string | ErrorCode, duration?: number) => {
    ToastService.info(message, code, duration);
  }, []);

  const showAdvisory = useCallback(
    (message: string, code?: string | ErrorCode, duration?: number) => {
      ToastService.warning(message, code, duration);
    },
    []
  );

  const showManual = useCallback((config: ToastConfig) => {
    ToastService.showManual(config);
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAdvisory,
    showManual,
  };
}
