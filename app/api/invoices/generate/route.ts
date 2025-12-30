import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { generateInvoicesSchema } from '@/zod/electricity-bill-schemas';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * POST /api/invoices/generate
 *
 * Generates invoices for all active rentals and administrators of a property
 * based on an electricity bill and water cost.
 * Requires ADMIN authentication.
 *
 * Request body:
 * - propertyId: string (UUID)
 * - electricityBillId: string (UUID)
 * - month: number (1-12)
 * - year: number
 * - waterCost: number
 *
 * @returns {Promise<NextResponse>} List of created invoices or error response
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
        message: 'Only administrators can generate invoices',
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
      validatedData = generateInvoicesSchema.parse(body);
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

    // Execute use case
    const invoices = await serviceContainer.invoice.createInvoicesForProperty.execute(
      validatedData.propertyId,
      validatedData.electricityBillId,
      validatedData.month,
      validatedData.year,
      validatedData.waterCost
    );

    return NextResponse.json(
      {
        invoices: invoices.map((invoice) => ({
          id: invoice.id,
          rentalId: invoice.getRentalId(),
          month: invoice.getMonth(),
          year: invoice.getYear(),
          waterCost: invoice.waterCost,
          energyCost: invoice.energyCost,
          totalCost: invoice.getTotalCost(),
          status: invoice.getStatus(),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/invoices/generate',
      method: 'POST',
    });
  }
}
