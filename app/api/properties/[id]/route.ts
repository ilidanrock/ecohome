import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * DELETE /api/properties/[id]
 *
 * Soft deletes a property (sets deletedAt and deletedById).
 * Requires ADMIN and the user must be an administrator of the property.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

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
        message: 'Only administrators can delete properties',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const { id: propertyId } = await params;

    const isAdmin = await serviceContainer.property.repository.isUserAdministrator(
      propertyId,
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

    const property = await serviceContainer.property.repository.findById(propertyId);
    if (!property) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.NOT_FOUND,
        message: 'Property not found',
        level: getErrorLevelFromStatus(404),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    await serviceContainer.property.delete.execute(propertyId, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties/[id]',
      method: 'DELETE',
    });
  }
}
