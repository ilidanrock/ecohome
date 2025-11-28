import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { generateInvoicesSchema } from '@/zod/electricity-bill-schemas';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { prisma } from '@/prisma';

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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can generate invoices',
        },
        { status: 403 }
      );
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
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'Invalid request data',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify that the user is an administrator of the property
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
      include: { administrators: true },
    });

    if (!property) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Property not found',
        },
        { status: 404 }
      );
    }

    const isAdmin = property.administrators.some((admin) => admin.id === session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You are not an administrator of this property',
        },
        { status: 403 }
      );
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

