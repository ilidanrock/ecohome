import { withCORS } from '@/lib/cors';
import { redirect } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const token = await searchParams.get('token');

    if (!token) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'Token no proporcionado',
        level: getErrorLevelFromStatus(400),
      };
      return withCORS(request, NextResponse.json(errorResponse, { status: 400 }));
    }

    // Use ServiceContainer to verify email (maintains DDD boundaries)
    const result = await serviceContainer.verifyToken.verifyUserEmail.execute(token);

    if (!result.success) {
      let statusCode = 400;
      let errorCode = ErrorCode.BAD_REQUEST;

      if (result.error === 'Token no encontrado') {
        statusCode = 404;
        errorCode = ErrorCode.NOT_FOUND;
      } else if (result.error === 'Token expirado') {
        statusCode = 401;
        errorCode = ErrorCode.UNAUTHORIZED;
      }

      const errorResponse: ErrorResponse = {
        code: errorCode,
        message: result.error || 'Error al verificar el correo',
        level: getErrorLevelFromStatus(statusCode),
      };
      return withCORS(request, NextResponse.json(errorResponse, { status: statusCode }));
    }

    return redirect('/login?verified=true');
  } catch (error) {
    // Log error with context for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('[Verify Email API] Error verifying email', {
      message: errorMessage,
      stack: errorStack,
    });

    // Return appropriate error response
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse: ErrorResponse = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to verify email. Please try again later.',
      level: getErrorLevelFromStatus(500),
      ...(isDevelopment && {
        details: {
          message: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
      }),
    };

    return withCORS(request, NextResponse.json(errorResponse, { status: 500 }));
  }
}

export function OPTIONS(request: NextRequest) {
  return withCORS(request, new NextResponse(null, { status: 204 }));
}
