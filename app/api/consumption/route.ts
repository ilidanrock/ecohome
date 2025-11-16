import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';

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
    const result = await serviceContainer.consumption.getData.execute(session.user.id);

    return NextResponse.json({
      consumptionData: result.consumptionData,
      quickStats: result.quickStats,
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
