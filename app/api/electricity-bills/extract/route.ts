import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { extractBillInformation } from '@/lib/ocr-service';
import { extractBillDataSchema } from '@/zod/bill-ocr-schemas';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * POST /api/electricity-bills/extract
 *
 * Extracts bill information from a PDF/image using OCR.
 * Requires ADMIN authentication.
 *
 * Request body:
 * - fileUrl: string (URL of the bill PDF/image in Cloudinary)
 *
 * @returns {Promise<NextResponse>} Extracted bill data or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth();

    // Apply rate limiting
    const rateLimitResult = await rateLimiters.billExtraction(request, session?.user?.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    if (!session?.user) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can extract bill information',
        level: getErrorLevelFromStatus(403),
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Validate payload size
    const payloadSizeError = validatePayloadSize(request);
    if (payloadSizeError) {
      return payloadSizeError;
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid JSON in request body',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate with Zod
    const validationResult = extractBillDataSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request data',
        level: getErrorLevelFromStatus(400),
        details: validationResult.error.errors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { fileUrl } = validationResult.data;

    // Extract bill information using OCR
    const extractedData = await extractBillInformation(fileUrl);

    return NextResponse.json(
      {
        success: true,
        data: extractedData,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/electricity-bills/extract',
      method: 'POST',
    });
  }
}

// Only allow POST
export function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
