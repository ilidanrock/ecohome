import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';
import type { ConsumptionData, QuickStat } from '@/types';

/**
 * GET /api/consumption
 *
 * Returns consumption data for the authenticated user.
 * Currently returns mock data - replace with actual database queries.
 *
 * @returns {Promise<NextResponse>} Consumption data response or error response
 */
export async function GET() {
  try {
    // Get authenticated session
    const session = await getServerSession(auth);

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

    // TODO: Replace with actual database queries via serviceContainer
    // Example:
    // const consumptionData = await serviceContainer.consumption.getData.execute(session.user.id);
    // This maintains DDD boundaries and ensures business logic stays in the application layer

    // Mock data for now
    const mockData: ConsumptionData = {
      energy: {
        value: 245,
        unit: 'kWh',
        trend: 'down',
      },
      water: {
        value: 1200,
        unit: 'L',
        trend: 'up',
      },
      lastUpdated: new Date(),
    };

    const mockQuickStats: QuickStat[] = [
      {
        type: 'energy',
        value: '245',
        unit: 'kWh',
        trend: 'down',
      },
      {
        type: 'water',
        value: '1.2k',
        unit: 'L',
        trend: 'up',
      },
    ];

    return NextResponse.json({
      consumptionData: mockData,
      quickStats: mockQuickStats,
    });
  } catch (error) {
    // Log error with context for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Consumption API] Error fetching consumption data:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error response
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch consumption data. Please try again later.',
        ...(isDevelopment && {
          details: {
            message: errorMessage,
            ...(errorStack && { stack: errorStack }),
          },
        }),
      },
      { status: 500 }
    );
  }
}
