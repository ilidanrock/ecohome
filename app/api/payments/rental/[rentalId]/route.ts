import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { prisma } from '@/prisma';

/**
 * GET /api/payments/rental/[rentalId]
 *
 * Returns all payments for a specific rental.
 * Uses ServiceContainer to maintain DDD boundaries.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing rentalId
 * @returns {Promise<NextResponse>} Payments array or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  try {
    // Get authenticated session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required to access payments',
        },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        {
          error: 'Invalid session',
          message: 'User ID is missing from session',
        },
        { status: 400 }
      );
    }

    const { rentalId } = await params;

    // Validate that the rental exists
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
    });

    if (!rental) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Rental not found',
        },
        { status: 404 }
      );
    }

    // Validate user access: Tenant can only see their own rentals, Admin can see all
    if (session.user.role !== 'ADMIN' && rental.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to access payments for this rental',
        },
        { status: 403 }
      );
    }

    // Get payments using ServiceContainer
    const payments = await serviceContainer.payment.getPaymentsByRental.execute(rentalId);

    return NextResponse.json(
      payments.map((payment) => ({
        id: payment.id,
        rentalId: payment.getRentalId(),
        invoiceId: payment.getInvoiceId(),
        amount: payment.getAmount(),
        paidAt: payment.getPaidAt().toISOString(),
        paymentMethod: payment.getPaymentMethod(),
        reference: payment.getReference(),
        receiptUrl: payment.getReceiptUrl(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Payment API] Error fetching rental payments:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch payments. Please try again later.',
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
