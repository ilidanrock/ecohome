import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { uuidParamSchema } from '@/zod/payment-schemas';
import { DomainError } from '@/src/domain/errors/DomainError';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

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
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access payments',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (!session.user.id) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'User ID is missing from session',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { invoiceId } = await params;

    // Validate UUID format
    try {
      uuidParamSchema.parse(invoiceId);
    } catch {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid invoice ID format',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate that the invoice exists and user has access (using ServiceContainer maintains DDD boundaries)
    try {
      const invoice = await serviceContainer.invoice.getInvoiceById.execute(
        invoiceId,
        session.user.id,
        session.user.role
      );

      if (!invoice) {
        const errorResponse: ErrorResponse = {
          code: ErrorCode.NOT_FOUND,
          message: 'Invoice not found',
          level: getErrorLevelFromStatus(404),
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
    } catch (error) {
      // Handle domain errors (including permission errors)
      if (error instanceof DomainError) {
        return handleApiError(error, {
          endpoint: '/api/payments/invoice/[invoiceId]',
          method: 'GET',
          userId: session.user.id,
        });
      }
      throw error; // Re-throw other errors
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
    return handleApiError(error, {
      endpoint: '/api/payments/invoice/[invoiceId]',
      method: 'GET',
    });
  }
}
