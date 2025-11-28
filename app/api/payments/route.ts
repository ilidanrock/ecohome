import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import type { PaymentMethod } from '@/src/domain/Payment/Payment';
import { createPaymentSchema } from '@/zod/payment-schemas';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * POST /api/payments
 *
 * Creates a new payment for either a rental (alquiler) or an invoice (servicios).
 * Uses ServiceContainer to maintain DDD boundaries.
 *
 * Request body:
 * - type: 'rental' | 'invoice'
 * - rentalId?: string (required if type is 'rental')
 * - invoiceId?: string (required if type is 'invoice')
 * - amount: number
 * - paidAt: string (ISO date)
 * - paymentMethod: PaymentMethod
 * - reference?: string
 * - receiptUrl?: string
 *
 * @returns {Promise<NextResponse>} Created payment or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth();

    // Apply rate limiting
    const rateLimitResult = await rateLimiters.payments(request, session?.user?.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required to create payments',
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

    // Validate payload size
    const payloadSizeError = validatePayloadSize(request);
    if (payloadSizeError) {
      return payloadSizeError;
    }

    // Parse and validate request body using Zod schema
    let validatedData;
    try {
      const body = await request.json();
      validatedData = createPaymentSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation error
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'Invalid request data',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Failed to parse request body',
        },
        { status: 400 }
      );
    }

    const { type, rentalId, invoiceId, amount, paidAt, paymentMethod, reference, receiptUrl } =
      validatedData;

    // TypeScript type narrowing: after Zod validation, we know these are defined based on type
    // Add explicit checks to satisfy TypeScript's type checker
    if (type === 'rental') {
      if (!rentalId) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'rentalId is required when type is "rental"',
          },
          { status: 400 }
        );
      }

      // Validate user access using ServiceContainer (maintains DDD boundaries)
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
        // Handle permission errors from use cases
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

      // Parse paidAt date
      const paidAtDate = new Date(paidAt);

      // Create payment using ServiceContainer
      const payment = await serviceContainer.payment.createRentalPayment.execute(
        rentalId,
        amount,
        paidAtDate,
        paymentMethod as PaymentMethod,
        reference || null,
        receiptUrl || null
      );

      return NextResponse.json(
        {
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
        },
        { status: 201 }
      );
    } else {
      // type === 'invoice'
      if (!invoiceId) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'invoiceId is required when type is "invoice"',
          },
          { status: 400 }
        );
      }

      // Validate user access using ServiceContainer (maintains DDD boundaries)
      try {
        const invoice = await serviceContainer.invoice.getInvoiceById.execute(
          invoiceId,
          session.user.id,
          session.user.role
        );

        if (!invoice) {
          return NextResponse.json(
            {
              error: 'Not found',
              message: 'Invoice not found',
            },
            { status: 404 }
          );
        }
      } catch (error) {
        // Handle domain errors (including permission errors)
        if (error instanceof DomainError) {
          return handleApiError(error, {
            endpoint: '/api/payments',
            method: 'POST',
            userId: session.user.id,
            type: 'invoice',
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

      // Parse paidAt date
      const paidAtDate = new Date(paidAt);

      // Create payment using ServiceContainer
      const payment = await serviceContainer.payment.createServicePayment.execute(
        invoiceId,
        amount,
        paidAtDate,
        paymentMethod as PaymentMethod,
        reference || null,
        receiptUrl || null
      );

      return NextResponse.json(
        {
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
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/payments',
      method: 'POST',
    });
  }
}
