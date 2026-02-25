import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import type { TenantRentalsResponse } from '@/types';

/**
 * GET /api/tenant/rentals
 *
 * Returns rentals for the authenticated user (tenant) with property details.
 * Each item includes property name, address, and rental dates.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access your rentals',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const rentals = await serviceContainer.rental.listForTenant.execute(session.user.id);
    const response: TenantRentalsResponse = { rentals };
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/tenant/rentals',
      method: 'GET',
    });
  }
}
