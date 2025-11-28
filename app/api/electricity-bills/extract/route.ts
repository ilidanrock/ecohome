import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { extractBillInformation } from '@/lib/ocr-service';
import { extractBillDataSchema } from '@/zod/bill-ocr-schemas';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';

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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can extract bill information',
        },
        { status: 403 }
      );
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
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validationResult = extractBillDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
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
