import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { updatePropertySchema } from '@/zod/property-schemas';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import type { PropertyListItem } from '@/types';

function toPropertyListItem(p: {
  id: string;
  getName: () => string;
  getAddress: () => string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string | null;
  updatedById?: string | null;
}): PropertyListItem {
  return {
    id: p.id,
    name: p.getName(),
    address: p.getAddress(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    createdById: p.createdById ?? undefined,
    updatedById: p.updatedById ?? undefined,
  };
}

async function requirePropertyAdmin(
  propertyId: string,
  session: { user: { id: string; role?: string } }
) {
  if (session.user.role !== 'ADMIN') {
    const errorResponse: ErrorResponse = {
      code: ErrorCode.FORBIDDEN,
      message: 'Only administrators can access this property',
      level: getErrorLevelFromStatus(403),
    };
    return { response: NextResponse.json(errorResponse, { status: 403 }) as NextResponse };
  }
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
    return { response: NextResponse.json(errorResponse, { status: 403 }) as NextResponse };
  }
  return { response: null };
}

/**
 * GET /api/properties/[id]
 *
 * Returns a single property if the current user is an administrator of it.
 */
export async function GET(
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

    const { id: propertyId } = await params;

    const authResult = await requirePropertyAdmin(propertyId, session);
    if (authResult.response) return authResult.response;

    const property = await serviceContainer.property.getById.execute(propertyId);
    if (!property) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.NOT_FOUND,
        message: 'Property not found',
        level: getErrorLevelFromStatus(404),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    return NextResponse.json(toPropertyListItem(property));
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties/[id]',
      method: 'GET',
    });
  }
}

/**
 * PATCH /api/properties/[id]
 *
 * Updates a property's name and address. Requires ADMIN and user must be an administrator of the property.
 * Body: { name: string, address: string }
 */
export async function PATCH(
  request: NextRequest,
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

    const { id: propertyId } = await params;

    const authResult = await requirePropertyAdmin(propertyId, session);
    if (authResult.response) return authResult.response;

    const sizeError = validatePayloadSize(request);
    if (sizeError) return sizeError;

    const body = await request.json();
    const parsed = updatePropertySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = first.name?.[0] ?? first.address?.[0] ?? 'Datos inválidos';
      return NextResponse.json(
        {
          code: ErrorCode.VALIDATION_ERROR,
          message,
          level: getErrorLevelFromStatus(400),
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, address } = parsed.data;
    const updated = await serviceContainer.property.update.execute(
      propertyId,
      name,
      address,
      session.user.id
    );

    if (!updated) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.NOT_FOUND,
        message: 'Property not found',
        level: getErrorLevelFromStatus(404),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    return NextResponse.json(toPropertyListItem(updated));
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties/[id]',
      method: 'PATCH',
    });
  }
}

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

    const { id: propertyId } = await params;

    const authResult = await requirePropertyAdmin(propertyId, session);
    if (authResult.response) return authResult.response;

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
