import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import type { ConsumptionResponse } from '@/types';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * GET /api/consumption
 *
 * Returns consumption data for the authenticated user.
 * Uses ServiceContainer to maintain DDD boundaries and ensure business logic
 * stays in the application layer.
 *
 * @returns {Promise<NextResponse>} Consumption data response or error response
 */
export async function GET() {
  try {
    // Get authenticated session
    const session = await auth();

    if (!session?.user) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access consumption data',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Validate user ID exists
    if (!session.user.id) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'User ID is missing from session',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use ServiceContainer to fetch consumption data via DDD architecture
    // This maintains proper boundaries: API Route → ServiceContainer → Application → Domain → Infrastructure
    const result: ConsumptionResponse = await serviceContainer.consumption.getData.execute(
      session.user.id
    );

    return NextResponse.json<ConsumptionResponse>({
      consumptionData: result.consumptionData,
      quickStats: result.quickStats,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/consumption',
      method: 'GET',
    });
  }
}
