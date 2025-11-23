import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { prisma } from '@/prisma';
import type { PaymentMethod } from '@/src/domain/Payment/Payment';

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

    // Parse request body
    const body = await request.json();
    const { type, rentalId, invoiceId, amount, paidAt, paymentMethod, reference, receiptUrl } =
      body;

    // Validate required fields
    if (!type || (type !== 'rental' && type !== 'invoice')) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: "Type must be either 'rental' or 'invoice'",
        },
        { status: 400 }
      );
    }

    if (type === 'rental' && !rentalId) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'rentalId is required for rental payments',
        },
        { status: 400 }
      );
    }

    if (type === 'invoice' && !invoiceId) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'invoiceId is required for invoice payments',
        },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    if (!paidAt) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'paidAt is required',
        },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['YAPE', 'CASH', 'BANK_TRANSFER'].includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'paymentMethod must be YAPE, CASH, or BANK_TRANSFER',
        },
        { status: 400 }
      );
    }

    // Validate user access
    if (type === 'rental') {
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

      // Tenant can only create payments for their own rentals
      // Admin can create payments for any rental
      if (session.user.role !== 'ADMIN' && rental.userId !== session.user.id) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You do not have permission to create payments for this rental',
          },
          { status: 403 }
        );
      }
    } else if (type === 'invoice') {
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

      // Tenant can only create payments for their own invoices
      // Admin can create payments for any invoice
      if (session.user.role !== 'ADMIN' && invoice.rental.userId !== session.user.id) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You do not have permission to create payments for this invoice',
          },
          { status: 403 }
        );
      }
    }

    // Parse paidAt date
    const paidAtDate = new Date(paidAt);

    // Create payment using ServiceContainer
    let payment;
    if (type === 'rental') {
      payment = await serviceContainer.payment.createRentalPayment.execute(
        rentalId,
        amount,
        paidAtDate,
        paymentMethod as PaymentMethod,
        reference || null,
        receiptUrl || null
      );
    } else {
      payment = await serviceContainer.payment.createServicePayment.execute(
        invoiceId,
        amount,
        paidAtDate,
        paymentMethod as PaymentMethod,
        reference || null,
        receiptUrl || null
      );
    }

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Payment API] Error creating payment:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create payment. Please try again later.',
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
