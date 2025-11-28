import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import type { ConsumptionResponse } from '@/types';
import { handleApiError } from '@/lib/error-handler';

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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required to access consumption data',
        },
        { status: 401 }
      );
    }

    // Validate user ID exists
    if (!session.user.id) {
      return NextResponse.json(
        {
          error: 'Invalid session',
          message: 'User ID is missing from session',
        },
        { status: 400 }
      );
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
