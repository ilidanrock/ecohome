import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { handleApiError } from '@/lib/error-handler';
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
        message: 'Only administrators can access this property',
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
 * GET /api/properties/[id]/rentals
 * List active rentals (tenants) for the property. Admin must be administrator of the property.
 */
export async function GET(
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

    const { id: propertyId } = await params;
    const authError = await requirePropertyAdmin(propertyId, session);
    if (authError) return authError;

    const list = await serviceContainer.rental.listByPropertyId.execute(propertyId);
    return NextResponse.json(list);
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties/[id]/rentals',
      method: 'GET',
    });
  }
}
