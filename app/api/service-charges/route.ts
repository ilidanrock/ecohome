import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { createServiceChargesSchema } from '@/zod/service-charges-schemas';
import { ServiceCharges } from '@/src/domain/ServiceCharges/ServiceCharges';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * POST /api/service-charges
 *
 * Creates service charges for an electricity bill.
 * Requires ADMIN authentication.
 *
 * Request body:
 * - electricityBillId: string (UUID)
 * - maintenanceAndReplacement: number
 * - fixedCharge: number
 * - compensatoryInterest: number
 * - publicLighting: number
 * - lawContribution: number
 * - lateFee: number
 * - previousMonthRounding: number
 * - currentMonthRounding: number
 *
 * @returns {Promise<NextResponse>} Created service charges or error response
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
        message: 'Only administrators can create service charges',
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
      validatedData = createServiceChargesSchema.parse(body);
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

    // Verify that the electricity bill exists
    const electricityBill = await serviceContainer.electricityBill.repository.findById(
      validatedData.electricityBillId
    );

    if (!electricityBill) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.NOT_FOUND,
        message: 'Electricity bill not found',
        level: getErrorLevelFromStatus(404),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify that the user is an administrator of the property
    const isAdmin = await serviceContainer.property.repository.isUserAdministrator(
      electricityBill.propertyId,
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

    // Check if service charges already exist
    const existing = await serviceContainer.serviceCharges.repository.findByElectricityBillId(
      validatedData.electricityBillId
    );

    if (existing) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.CONFLICT,
        message: 'Service charges already exist for this electricity bill',
        level: getErrorLevelFromStatus(409),
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Create service charges entity
    const now = new Date();
    const serviceCharges = new ServiceCharges(
      validatedData.electricityBillId,
      validatedData.maintenanceAndReplacement,
      validatedData.fixedCharge,
      validatedData.compensatoryInterest,
      validatedData.publicLighting,
      validatedData.lawContribution,
      validatedData.lateFee,
      validatedData.previousMonthRounding,
      validatedData.currentMonthRounding,
      now,
      now
    );

    // Save to database using repository
    const created = await serviceContainer.serviceCharges.repository.create(serviceCharges);

    return NextResponse.json(
      {
        id: created.id,
        electricityBillId: created.electricityBillId,
        maintenanceAndReplacement: Number(created.maintenanceAndReplacement),
        fixedCharge: Number(created.fixedCharge),
        compensatoryInterest: Number(created.compensatoryInterest),
        publicLighting: Number(created.publicLighting),
        lawContribution: Number(created.lawContribution),
        lateFee: Number(created.lateFee),
        previousMonthRounding: Number(created.previousMonthRounding),
        currentMonthRounding: Number(created.currentMonthRounding),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/service-charges',
      method: 'POST',
    });
  }
}
