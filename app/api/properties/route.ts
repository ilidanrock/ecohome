import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { createPropertySchema, propertiesListQuerySchema } from '@/zod/property-schemas';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { logMutationSuccess } from '@/lib/logger';
import { rateLimiters } from '@/lib/rate-limit';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import type { PropertyListItem, PropertiesListResponse } from '@/types';

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

/**
 * GET /api/properties
 *
 * Lists properties managed by the authenticated admin.
 * Query: page (default 1), limit (default 10, max 50), search (optional, filters by name or address).
 */
export async function GET(request: NextRequest) {
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
        message: 'Only administrators can list properties',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = propertiesListQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });
    const { page, limit, search } = parsed.success
      ? parsed.data
      : { page: 1, limit: 10, search: undefined };

    const { properties, total } = await serviceContainer.property.listForAdminPaginated.execute(
      session.user.id,
      { page, limit, search }
    );

    const response: PropertiesListResponse = {
      properties: properties.map(toPropertyListItem),
      total,
      page,
      limit,
    };
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties',
      method: 'GET',
    });
  }
}

/**
 * POST /api/properties
 *
 * Creates a new property and assigns the current user as administrator.
 * Body: { name: string, address: string }
 */
export async function POST(request: NextRequest) {
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
        message: 'Only administrators can create properties',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const rateLimitResult = await rateLimiters.mutations(request, session.user.id);
    if (!rateLimitResult.success) return rateLimitResult.response;

    const sizeError = validatePayloadSize(request);
    if (sizeError) return sizeError;

    const body = await request.json();
    const parsed = createPropertySchema.safeParse(body);
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
    const created = await serviceContainer.property.create.execute(name, address, session.user.id);

    logMutationSuccess({
      action: 'property_created',
      entityType: 'Property',
      entityId: created.id,
      performedById: session.user.id,
      endpoint: '/api/properties',
      method: 'POST',
    });
    const item: PropertyListItem = toPropertyListItem(created);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/properties',
      method: 'POST',
    });
  }
}
