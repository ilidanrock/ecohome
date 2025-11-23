import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { prisma } from '@/prisma';

/**
 * GET /api/payments/invoice/[invoiceId]
 *
 * Returns all payments for a specific invoice.
 * Uses ServiceContainer to maintain DDD boundaries.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing invoiceId
 * @returns {Promise<NextResponse>} Payments array or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
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

    const { invoiceId } = await params;

    // Validate that the invoice exists and get rental info
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { rental: true },
    });

    if (!invoice) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    // Validate user access: Tenant can only see their own invoices, Admin can see all
    if (session.user.role !== 'ADMIN' && invoice.rental.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to access payments for this invoice',
        },
        { status: 403 }
      );
    }

    // Get payments using ServiceContainer
    const payments = await serviceContainer.payment.getPaymentsByInvoice.execute(invoiceId);

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

    console.error('[Payment API] Error fetching invoice payments:', {
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
