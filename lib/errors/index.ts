/**
 * Error handling utilities
 *
 * Centralized exports for error handling system
 */

// Types
export type { ErrorLevel, ErrorResponse, ToastConfig, ApiErrorResponse } from './types';

// Error codes
export { ErrorCode } from './error-codes';

// Error mappers
export {
  getErrorLevel,
  getToastType,
  getToastTypeFromCode,
  getToastDuration,
} from './error-mapper';

// Error level helpers
export {
  getErrorLevelFromStatus,
  getErrorLevelFromError,
  getErrorCodeFromStatus,
  isSuccessCode,
} from './error-level';

// Toast service
export { ToastService } from './toast-service';

// Hooks
export { useErrorToast } from './useErrorToast';

// Form error handlers
export {
  useFormErrorHandler,
  getFirstFormError,
  showFormErrors,
  showServerFormErrors,
} from './form-error-handler';

// Fetch wrapper
export {
  fetchWithErrorHandling,
  get,
  post,
  put,
  del,
  type FetchOptions,
  type FetchResponse,
} from './fetch-wrapper';

// Query error interceptors
export {
  handleQueryError,
  handleMutationError,
  createQueryCache,
  createMutationCache,
} from './query-error-interceptor';
