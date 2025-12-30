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

    // Safely format details for description (truncate if too long, avoid sensitive data)
    const formatDescription = (details: unknown): string | undefined => {
      if (!details) return undefined;

      try {
        const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
        // Truncate to 200 chars to avoid overly long descriptions
        return detailsStr.length > 200 ? `${detailsStr.slice(0, 200)}...` : detailsStr;
      } catch {
        return 'Error details unavailable';
      }
    };

    const description = formatDescription(response.details);

    switch (toastType) {
      case 'success':
        toast.success(message, {
          duration,
          description,
        });
        break;
      case 'error':
        toast.error(message, {
          duration,
          description,
        });
        break;
      case 'warning':
        toast.warning(message, {
          duration,
          description,
        });
        break;
      case 'info':
        toast.info(message, {
          duration,
          description,
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
