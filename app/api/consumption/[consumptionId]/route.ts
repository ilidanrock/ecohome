import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { updateMeterReadingSchema } from '@/zod/consumption-schemas';
import { handleApiError } from '@/lib/error-handler';
import { rateLimiters } from '@/lib/rate-limit';
import { MAX_PAYLOAD_SIZE } from '@/lib/error-handler';
import { z } from 'zod';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import { DomainError } from '@/src/domain/errors/DomainError';

const uuidParamSchema = z.object({
  consumptionId: z.string().uuid('Consumption ID must be a valid UUID'),
});

/**
 * GET /api/consumption/[consumptionId]
 *
 * Gets a specific consumption record by ID.
 * Requires authentication. Admin can access any, tenant can only access their own.
 *
 * @returns {Promise<NextResponse>} Consumption data or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ consumptionId: string }> }
) {
  try {
    const { consumptionId } = await params;
    const session = await auth();

    // Validate authentication
    if (!session?.user) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access consumption data',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Validate UUID parameter
    const paramValidation = uuidParamSchema.safeParse({ consumptionId });
    if (!paramValidation.success) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid consumption ID',
        level: getErrorLevelFromStatus(400),
        details: paramValidation.error.errors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get consumption by ID using ServiceContainer
    const consumption = await serviceContainer.consumption.getById.execute(consumptionId);

    if (!consumption) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.NOT_FOUND,
        message: 'Consumption not found',
        level: getErrorLevelFromStatus(404),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Authorization check: Admin can access any, tenant can only access their own
    if (session.user.role !== 'ADMIN') {
      // For tenants, verify they own the rental for this consumption
      try {
        const rental = await serviceContainer.rental.getRentalById.execute(
          consumption.rentalId,
          session.user.id,
          session.user.role
        );

        if (!rental) {
          const errorResponse: ErrorResponse = {
            code: ErrorCode.FORBIDDEN,
            message: 'You do not have permission to access this consumption',
            level: getErrorLevelFromStatus(403),
          };
          return NextResponse.json(errorResponse, { status: 403 });
        }
      } catch (error) {
        // Handle domain errors
        if (error instanceof DomainError) {
          return handleApiError(error, {
            endpoint: '/api/consumption/[consumptionId]',
            method: 'GET',
            userId: session.user.id,
          });
        }
        throw error; // Re-throw other errors
      }
    }

    return NextResponse.json({
      id: consumption.id,
      rentalId: consumption.rentalId,
      month: consumption.month,
      year: consumption.year,
      previousReading: consumption.previousReading,
      energyReading: consumption.energyReading,
      meterImageUrl: consumption.meterImageUrl,
      ocrExtracted: consumption.ocrExtracted,
      ocrConfidence: consumption.ocrConfidence,
      ocrRawText: consumption.ocrRawText,
      extractedAt: consumption.extractedAt,
      createdAt: consumption.createdAt,
      updatedAt: consumption.updatedAt,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/consumption/[consumptionId]',
      method: 'GET',
    });
  }
}

/**
 * PUT /api/consumption/[consumptionId]
 *
 * Updates meter reading manually.
 * Requires authentication and admin role.
 *
 * @returns {Promise<NextResponse>} Updated consumption or error response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ consumptionId: string }> }
) {
  try {
    const { consumptionId } = await params;
    const session = await auth();

    // Rate limiting
    const rateLimitResult = await rateLimiters.updateMeterReading(request, session?.user?.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Validate authentication
    if (!session?.user) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to update meter readings',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can update meter readings',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Validate UUID parameter
    const paramValidation = uuidParamSchema.safeParse({ consumptionId });
    if (!paramValidation.success) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid consumption ID',
        level: getErrorLevelFromStatus(400),
        details: paramValidation.error.errors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate payload size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.PAYLOAD_TOO_LARGE,
        message: `Request body must be smaller than ${MAX_PAYLOAD_SIZE} bytes`,
        level: getErrorLevelFromStatus(413),
      };
      return NextResponse.json(errorResponse, { status: 413 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateMeterReadingSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request data',
        level: getErrorLevelFromStatus(400),
        details: validationResult.error.errors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { energyReading, previousReading } = validationResult.data;

    // Execute update use case
    const updatedConsumption = await serviceContainer.consumption.updateMeterReading.execute(
      consumptionId,
      energyReading,
      session.user.id,
      previousReading ?? null
    );

    return NextResponse.json({
      success: true,
      consumption: {
        id: updatedConsumption.id,
        energyReading: updatedConsumption.energyReading,
        previousReading: updatedConsumption.previousReading,
        ocrExtracted: updatedConsumption.ocrExtracted,
        ocrConfidence: updatedConsumption.ocrConfidence,
        updatedAt: updatedConsumption.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/consumption/[consumptionId]',
      method: 'PUT',
    });
  }
}
