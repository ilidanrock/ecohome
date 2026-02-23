import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { updateRentalBodySchema } from '@/zod/rental-schemas';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

async function requirePropertyAdmin(
  propertyId: string,
  session: { user: { id: string; role?: string } }
): Promise<NextResponse | null> {
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can manage rentals',
        level: getErrorLevelFromStatus(403),
      } as ErrorResponse,
      { status: 403 }
    );
  }
  const isAdmin = await serviceContainer.property.repository.isUserAdministrator(
    propertyId,
    session.user.id
  );
  if (!isAdmin) {
    return NextResponse.json(
      {
        code: ErrorCode.FORBIDDEN,
        message: 'You are not an administrator of this property',
        level: getErrorLevelFromStatus(403),
      } as ErrorResponse,
      { status: 403 }
    );
  }
  return null;
}

/**
 * PATCH /api/rentals/[id]
 * Update a rental (dates). Admin must be administrator of the property.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required',
          level: getErrorLevelFromStatus(401),
        } as ErrorResponse,
        { status: 401 }
      );
    }

    const { id: rentalId } = await params;
    const rental = await serviceContainer.rental.getRentalById.execute(rentalId);
    if (!rental) {
      return NextResponse.json(
        {
          code: ErrorCode.NOT_FOUND,
          message: 'Rental not found',
          level: getErrorLevelFromStatus(404),
        } as ErrorResponse,
        { status: 404 }
      );
    }

    const authError = await requirePropertyAdmin(rental.getPropertyId(), session);
    if (authError) return authError;

    const sizeError = validatePayloadSize(request);
    if (sizeError) return sizeError;

    const body = await request.json();
    const parsed = updateRentalBodySchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const message = Object.values(flat.fieldErrors).flat().join(' ') || 'Validation failed';
      return NextResponse.json(
        { code: ErrorCode.VALIDATION_ERROR, message },
        { status: 400 }
      );
    }

    const updated = await serviceContainer.rental.update.execute({
      rentalId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      updatedById: session.user.id,
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.getUserId(),
      propertyId: updated.getPropertyId(),
      startDate: updated.getStartDate().toISOString(),
      endDate: updated.getEndDate()?.toISOString() ?? null,
    });
  } catch (error) {
    return handleApiError(error, { endpoint: '/api/rentals/[id]', method: 'PATCH' });
  }
}

/**
 * DELETE /api/rentals/[id]
 * Soft-delete a rental (dar de baja). Admin must be administrator of the property.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required',
          level: getErrorLevelFromStatus(401),
        } as ErrorResponse,
        { status: 401 }
      );
    }

    const { id: rentalId } = await params;
    const rental = await serviceContainer.rental.getRentalById.execute(rentalId);
    if (!rental) {
      return NextResponse.json(
        {
          code: ErrorCode.NOT_FOUND,
          message: 'Rental not found',
          level: getErrorLevelFromStatus(404),
        } as ErrorResponse,
        { status: 404 }
      );
    }

    const authError = await requirePropertyAdmin(rental.getPropertyId(), session);
    if (authError) return authError;

    await serviceContainer.rental.delete.execute({
      rentalId,
      deletedById: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, { endpoint: '/api/rentals/[id]', method: 'DELETE' });
  }
}
