import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { createElectricityBillSchema } from '@/zod/electricity-bill-schemas';
import { ElectricityBill } from '@/src/domain/ElectricityBill/ElectricityBill';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';

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
          message: 'Only administrators can create electricity bills',
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
      validatedData = createElectricityBillSchema.parse(body);
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

    // Save to database using repository (we'll add this to ServiceContainer later)
    // For now, using Prisma directly
    const created = await prisma.electricityBill.create({
      data: {
        propertyId: electricityBill.propertyId,
        periodStart: electricityBill.periodStart,
        periodEnd: electricityBill.periodEnd,
        totalKWh: electricityBill.totalKWh,
        totalCost: electricityBill.totalCost,
        fileUrl: electricityBill.fileUrl,
      },
    });

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

