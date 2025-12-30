import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { createElectricityBillSchema } from '@/zod/electricity-bill-schemas';
import { ElectricityBill } from '@/src/domain/ElectricityBill/ElectricityBill';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * POST /api/electricity-bills
 *
 * Creates a new electricity bill for a property.
 * Requires ADMIN authentication.
 *
 * Request body:
 * - propertyId: string (UUID)
 * - periodStart: string (ISO date)
 * - periodEnd: string (ISO date)
 * - totalKWh: number
 * - totalCost: number
 * - fileUrl?: string
 *
 * @returns {Promise<NextResponse>} Created electricity bill or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth();

    // Apply rate limiting
    const rateLimitResult = await rateLimiters.payments(request, session?.user?.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    if (!session?.user) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can create electricity bills',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Validate payload size
    const payloadSizeError = validatePayloadSize(request);
    if (payloadSizeError) {
      return payloadSizeError;
    }

    // Parse and validate request body
    let validatedData;
    try {
      const body = await request.json();
      validatedData = createElectricityBillSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ErrorResponse = {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid request data',
          level: getErrorLevelFromStatus(400),
          details: error.errors,
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    // Verify that the user is an administrator of the property
    const isAdmin = await serviceContainer.property.repository.isUserAdministrator(
      validatedData.propertyId,
      session.user.id
    );

    if (!isAdmin) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.FORBIDDEN,
        message: 'You are not an administrator of this property',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Create electricity bill entity
    const now = new Date();
    const electricityBill = new ElectricityBill(
      validatedData.propertyId,
      validatedData.periodStart,
      validatedData.periodEnd,
      validatedData.totalKWh,
      validatedData.totalCost,
      validatedData.fileUrl || null,
      now,
      now
    );

    // Save to database using repository
    const created = await serviceContainer.electricityBill.repository.create(electricityBill);

    return NextResponse.json(
      {
        id: created.id,
        propertyId: created.propertyId,
        periodStart: created.periodStart.toISOString(),
        periodEnd: created.periodEnd.toISOString(),
        totalKWh: Number(created.totalKWh),
        totalCost: Number(created.totalCost),
        fileUrl: created.fileUrl,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/electricity-bills',
      method: 'POST',
    });
  }
}
