import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';
import type { ConsumptionData, QuickStat } from '@/types';

/**
 * GET /api/consumption
 *
 * Returns consumption data for the authenticated user.
 * Currently returns mock data - replace with actual database queries.
 */
export async function GET() {
  try {
    // Get authenticated session
    const session = await getServerSession(auth);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Replace with actual database queries
    // Example:
    // const consumptionData = await prisma.consumption.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { createdAt: 'desc' },
    // });

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
    console.error('Error fetching consumption data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
