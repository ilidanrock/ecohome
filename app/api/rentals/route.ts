import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { createRentalBodySchema } from '@/zod/rental-schemas';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { logMutationSuccess } from '@/lib/logger';
import { rateLimiters } from '@/lib/rate-limit';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import { RentalAlreadyExistsError } from '@/src/domain/Rental/errors/RentalErrors';

async function requirePropertyAdmin(
  propertyId: string,
  session: { user: { id: string; role?: string } }
): Promise<NextResponse | null> {
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can create rentals',
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
 * POST /api/rentals
 * Create a rental (assign tenant to property). Admin must be administrator of the property.
 * Body: { userId, propertyId, startDate, endDate? }
 */
export async function POST(request: NextRequest) {
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

    const rateLimitResult = await rateLimiters.mutations(request, session.user.id);
    if (!rateLimitResult.success) return rateLimitResult.response;

    const sizeError = validatePayloadSize(request);
    if (sizeError) return sizeError;

    const body = await request.json();
    const parsed = createRentalBodySchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const message = Object.values(flat.fieldErrors).flat().join(' ') || 'Validation failed';
      return NextResponse.json({ code: ErrorCode.VALIDATION_ERROR, message }, { status: 400 });
    }

    const authError = await requirePropertyAdmin(parsed.data.propertyId, session);
    if (authError) return authError;

    const rental = await serviceContainer.rental.create.execute({
      propertyId: parsed.data.propertyId,
      userId: parsed.data.userId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      createdById: session.user.id,
    });

    logMutationSuccess({
      action: 'rental_created',
      entityType: 'Rental',
      entityId: rental.id,
      performedById: session.user.id,
      endpoint: '/api/rentals',
      method: 'POST',
    });
    return NextResponse.json(
      {
        id: rental.id,
        userId: rental.getUserId(),
        propertyId: rental.getPropertyId(),
        startDate: rental.getStartDate().toISOString(),
        endDate: rental.getEndDate()?.toISOString() ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RentalAlreadyExistsError) {
      return NextResponse.json(
        {
          code: ErrorCode.CONFLICT,
          message: error.message,
          level: getErrorLevelFromStatus(409),
        } as ErrorResponse,
        { status: 409 }
      );
    }
    // Prisma unique constraint (userId, propertyId) — e.g. soft-deleted rental still in DB
    const isPrismaUniqueError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002';
    if (isPrismaUniqueError) {
      return NextResponse.json(
        {
          code: ErrorCode.CONFLICT,
          message: 'Este inquilino ya está asignado a esta propiedad.',
          level: getErrorLevelFromStatus(409),
        } as ErrorResponse,
        { status: 409 }
      );
    }
    return handleApiError(error, { endpoint: '/api/rentals', method: 'POST' });
  }
}
