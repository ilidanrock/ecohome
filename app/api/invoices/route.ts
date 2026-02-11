import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { listInvoicesQuerySchema } from '@/zod/invoice-schemas';
import { handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';
import type { InvoicesListResponse } from '@/types';

/**
 * GET /api/invoices
 *
 * Returns invoices for the authenticated user (via their rentals).
 * Query: ?status=UNPAID | PAID (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to access invoices',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = listInvoicesQuerySchema.safeParse(searchParams);
    const options = parsed.success ? { status: parsed.data.status } : undefined;

    const invoices = await serviceContainer.invoice.getUserInvoices.execute(
      session.user.id,
      options
    );

    const response: InvoicesListResponse = { invoices };
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/invoices',
      method: 'GET',
    });
  }
}
