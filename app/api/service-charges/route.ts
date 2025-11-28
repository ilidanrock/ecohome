import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { createServiceChargesSchema } from '@/zod/service-charges-schemas';
import { ServiceCharges } from '@/src/domain/ServiceCharges/ServiceCharges';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';

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
          message: 'Only administrators can create service charges',
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
      validatedData = createServiceChargesSchema.parse(body);
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

    // Verify that the electricity bill exists and user is admin of the property
    const electricityBill = await prisma.electricityBill.findUnique({
      where: { id: validatedData.electricityBillId },
      include: {
        property: {
          include: { administrators: true },
        },
      },
    });

    if (!electricityBill) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Electricity bill not found',
        },
        { status: 404 }
      );
    }

    const isAdmin = electricityBill.property.administrators.some(
      (admin) => admin.id === session.user.id
    );
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You are not an administrator of this property',
        },
        { status: 403 }
      );
    }

    // Check if service charges already exist
    const existing = await prisma.serviceCharges.findUnique({
      where: { electricityBillId: validatedData.electricityBillId },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Service charges already exist for this electricity bill',
        },
        { status: 409 }
      );
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

    // Save to database
    const created = await prisma.serviceCharges.create({
      data: {
        electricityBillId: serviceCharges.electricityBillId,
        maintenanceAndReplacement: serviceCharges.maintenanceAndReplacement,
        fixedCharge: serviceCharges.fixedCharge,
        compensatoryInterest: serviceCharges.compensatoryInterest,
        publicLighting: serviceCharges.publicLighting,
        lawContribution: serviceCharges.lawContribution,
        lateFee: serviceCharges.lateFee,
        previousMonthRounding: serviceCharges.previousMonthRounding,
        currentMonthRounding: serviceCharges.currentMonthRounding,
      },
    });

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

