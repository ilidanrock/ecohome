import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { uuidParamSchema } from '@/zod/payment-schemas';
import { DomainError } from '@/src/domain/errors/DomainError';
import { handleApiError } from '@/lib/error-handler';

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

    // Validate UUID format
    try {
      uuidParamSchema.parse(rentalId);
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid rental ID format',
        },
        { status: 400 }
      );
    }

    // Validate that the rental exists and user has access (using ServiceContainer maintains DDD boundaries)
    try {
      const rental = await serviceContainer.rental.getRentalById.execute(
        rentalId,
        session.user.id,
        session.user.role
      );

      if (!rental) {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Rental not found',
          },
          { status: 404 }
        );
      }
    } catch (error) {
      // Handle domain errors (including permission errors)
      if (error instanceof DomainError) {
        return handleApiError(error, {
          endpoint: '/api/payments/rental/[rentalId]',
          method: 'GET',
          userId: session.user.id,
        });
      }
      // Handle permission errors from use cases (legacy error format)
      if (error instanceof Error && error.message.includes('permission')) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: error.message,
          },
          { status: 403 }
        );
      }
      throw error; // Re-throw other errors
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
    return handleApiError(error, {
      endpoint: '/api/payments/rental/[rentalId]',
      method: 'GET',
    });
  }
}
