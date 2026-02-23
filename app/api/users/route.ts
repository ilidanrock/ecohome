import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { usersQuerySchema } from '@/zod/user-schemas';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * GET /api/users
 * Search users (admin only). Query: role, search, limit.
 * Returns minimal DTOs for combobox: id, name, surname, email.
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
        message: 'Only administrators can search users',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = usersQuerySchema.safeParse({
      role: searchParams.get('role') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const message = Object.values(flat.fieldErrors).flat().join(' ') || 'Validation failed';
      return NextResponse.json(
        { code: ErrorCode.VALIDATION_ERROR, message },
        { status: 400 }
      );
    }

    const dtos = await serviceContainer.user.searchForAdmin.execute(parsed.data);
    return NextResponse.json(dtos);
  } catch (error) {
    return handleApiError(error, { endpoint: '/api/users', method: 'GET' });
  }
}
