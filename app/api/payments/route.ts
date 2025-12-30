import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import type { PaymentMethod } from '@/src/domain/Payment/Payment';
import { createPaymentSchema } from '@/zod/payment-schemas';
import { ZodError } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { DomainError } from '@/src/domain/errors/DomainError';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

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
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to create payments',
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
        const errorResponse: ErrorResponse = {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid request data',
          level: getErrorLevelFromStatus(400),
          details: error.errors,
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'Failed to parse request body',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { type, rentalId, invoiceId, amount, paidAt, paymentMethod, reference, receiptUrl } =
      validatedData;

    // TypeScript type narrowing: after Zod validation, we know these are defined based on type
    // Add explicit checks to satisfy TypeScript's type checker
    if (type === 'rental') {
      if (!rentalId) {
        const errorResponse: ErrorResponse = {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'rentalId is required when type is "rental"',
          level: getErrorLevelFromStatus(400),
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Type assertion: after validation, rentalId is guaranteed to be a string
      const validatedRentalId: string = rentalId;

      // Validate user access using ServiceContainer (maintains DDD boundaries)
      try {
        const rental = await serviceContainer.rental.getRentalById.execute(
          validatedRentalId,
          session.user.id,
          session.user.role
        );

        if (!rental) {
          const errorResponse: ErrorResponse = {
            code: ErrorCode.NOT_FOUND,
            message: 'Rental not found',
            level: getErrorLevelFromStatus(404),
          };
          return NextResponse.json(errorResponse, { status: 404 });
        }
      } catch (error) {
        // Handle domain errors
        if (error instanceof DomainError) {
          return handleApiError(error, {
            endpoint: '/api/payments',
            method: 'POST',
            userId: session.user.id,
            type: 'rental',
          });
        }
        // Handle permission errors from use cases (legacy error format)
        if (error instanceof Error && error.message.includes('permission')) {
          const errorResponse: ErrorResponse = {
            code: ErrorCode.FORBIDDEN,
            message: error.message,
            level: getErrorLevelFromStatus(403),
          };
          return NextResponse.json(errorResponse, { status: 403 });
        }
        throw error; // Re-throw other errors
      }

      // Parse paidAt date
      const paidAtDate = new Date(paidAt);

      // Create payment using ServiceContainer
      const payment = await serviceContainer.payment.createRentalPayment.execute(
        validatedRentalId,
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
        const errorResponse: ErrorResponse = {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'invoiceId is required when type is "invoice"',
          level: getErrorLevelFromStatus(400),
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Type assertion: after validation, invoiceId is guaranteed to be a string
      const validatedInvoiceId: string = invoiceId;

      // Validate user access using ServiceContainer (maintains DDD boundaries)
      try {
        const invoice = await serviceContainer.invoice.getInvoiceById.execute(
          validatedInvoiceId,
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
            endpoint: '/api/payments',
            method: 'POST',
            userId: session.user.id,
            type: 'invoice',
          });
        }
        // Handle permission errors from use cases (legacy error format)
        if (error instanceof Error && error.message.includes('permission')) {
          const errorResponse: ErrorResponse = {
            code: ErrorCode.FORBIDDEN,
            message: error.message,
            level: getErrorLevelFromStatus(403),
          };
          return NextResponse.json(errorResponse, { status: 403 });
        }
        throw error; // Re-throw other errors
      }

      // Parse paidAt date
      const paidAtDate = new Date(paidAt);

      // Create payment using ServiceContainer
      const payment = await serviceContainer.payment.createServicePayment.execute(
        validatedInvoiceId,
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
