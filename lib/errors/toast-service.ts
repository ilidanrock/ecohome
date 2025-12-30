'use client';

import { toast } from 'sonner';
import type { ErrorResponse, ToastConfig } from './types';
import { getToastTypeFromCode, getToastDuration } from './error-mapper';
import { ErrorCode } from './error-codes';

/**
 * Global Toast Service
 *
 * Provides centralized toast notification management with automatic
 * error level detection and appropriate styling.
 */
export class ToastService {
  /**
   * Show toast from ErrorResponse
   * Automatically determines toast type based on error level
   */
  static show(response: ErrorResponse): void {
    const toastType = getToastTypeFromCode(response.code);
    const duration = getToastDuration(response.level);

    // Build toast message with code if available
    const message =
      response.code && response.code !== ErrorCode.INTERNAL_ERROR
        ? `${response.message} (${response.code})`
        : response.message;

    switch (toastType) {
      case 'success':
        toast.success(message, {
          duration,
          description: response.details ? JSON.stringify(response.details) : undefined,
        });
        break;
      case 'error':
        toast.error(message, {
          duration,
          description: response.details ? JSON.stringify(response.details) : undefined,
        });
        break;
      case 'warning':
        toast.warning(message, {
          duration,
          description: response.details ? JSON.stringify(response.details) : undefined,
        });
        break;
      case 'info':
        toast.info(message, {
          duration,
          description: response.details ? JSON.stringify(response.details) : undefined,
        });
        break;
      default:
        toast.error(message, { duration });
    }
  }

  /**
   * Show toast manually with custom configuration
   */
  static showManual(config: ToastConfig): void {
    const toastType = config.code
      ? getToastTypeFromCode(config.code)
      : config.level === 'success'
        ? 'success'
        : config.level === 'error'
          ? 'error'
          : config.level === 'advisory'
            ? 'warning'
            : 'error';

    const duration = config.duration ?? getToastDuration(config.level);

    const message = config.code ? `${config.message} (${config.code})` : config.message;

    switch (toastType) {
      case 'success':
        toast.success(message, { duration });
        break;
      case 'error':
        toast.error(message, { duration });
        break;
      case 'warning':
        toast.warning(message, { duration });
        break;
      case 'info':
        toast.info(message, { duration });
        break;
      default:
        toast.error(message, { duration });
    }
  }

  /**
   * Show success toast
   */
  static success(message: string, code?: string | ErrorCode, duration?: number): void {
    const toastMessage = code ? `${message} (${code})` : message;
    toast.success(toastMessage, { duration: duration ?? 3000 });
  }

  /**
   * Show error toast
   */
  static error(message: string, code?: string | ErrorCode, duration?: number): void {
    const toastMessage = code ? `${message} (${code})` : message;
    toast.error(toastMessage, { duration: duration ?? 5000 });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, code?: string | ErrorCode, duration?: number): void {
    const toastMessage = code ? `${message} (${code})` : message;
    toast.warning(toastMessage, { duration: duration ?? 4000 });
  }

  /**
   * Show info toast
   */
  static info(message: string, code?: string | ErrorCode, duration?: number): void {
    const toastMessage = code ? `${message} (${code})` : message;
    toast.info(toastMessage, { duration: duration ?? 4000 });
  }
}
