import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { DomainError } from '@/src/domain/errors/DomainError';
import { logger } from './logger';

/**
 * Maximum payload size in bytes (1MB)
 */
export const MAX_PAYLOAD_SIZE = 1024 * 1024;

/**
 * Error Handler Utility
 *
 * Provides consistent error handling across API routes:
 * - Generates unique error IDs for tracking
 * - Logs stack traces only on server (never exposed to client)
 * - Returns appropriate HTTP status codes
 * - Exposes minimal information to clients
 */

interface ErrorContext {
  userId?: string;
  endpoint?: string;
  [key: string]: unknown;
}

/**
 * Handle errors in API routes
 *
 * @param error - The error that occurred
 * @param context - Additional context for logging
 * @returns NextResponse with appropriate error information
 */
export function handleApiError(error: unknown, context: ErrorContext = {}): NextResponse {
  // Generate unique error ID for tracking
  const errorId = randomUUID();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Extract error information
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorName = error instanceof Error ? error.name : 'Error';

  // Log error with full context (server-side only)
  // Using structured logging for better parsing
  logger.error(`API Error ${errorId}`, {
    errorId,
    name: errorName,
    message: errorMessage,
    stack: errorStack, // Stack trace only in server logs
    ...context,
  });

  // Handle domain errors specifically
  if (error instanceof DomainError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
        ...(isDevelopment && {
          errorId,
          details: {
            name: errorName,
            ...context,
          },
        }),
      },
      {
        status: error.statusCode,
        headers: {
          'X-Error-ID': errorId,
        },
      }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.',
      ...(isDevelopment && {
        errorId,
        details: {
          message: errorMessage,
          name: errorName,
          ...context,
        },
      }),
    },
    {
      status: 500,
      headers: {
        'X-Error-ID': errorId,
      },
    }
  );
}

/**
 * Validate request payload size
 *
 * @param request - Next.js request object
 * @returns NextResponse with 413 error if payload too large, null if valid
 */
export function validatePayloadSize(request: Request): NextResponse | null {
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    if (isNaN(size) || size > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        {
          error: 'Payload Too Large',
          message: `Request payload exceeds maximum size of ${MAX_PAYLOAD_SIZE / 1024}KB`,
          maxSize: MAX_PAYLOAD_SIZE,
        },
        { status: 413 }
      );
    }
  }

  return null;
}
