import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { extractMeterReadingSchema } from '@/zod/ocr-schemas';
import { handleApiError } from '@/lib/error-handler';
import { rateLimiters } from '@/lib/rate-limit';
import { MAX_PAYLOAD_SIZE } from '@/lib/error-handler';

/**
 * POST /api/consumption/extract-reading
 *
 * Extracts meter reading from an image using OCR (OpenAI Vision).
 * Requires authentication and admin role.
 *
 * @returns {Promise<NextResponse>} Updated consumption with OCR data or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const session = await auth();
    const rateLimitResult = await rateLimiters.ocrExtraction(
      request as unknown as NextRequest,
      session?.user?.id
    );
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Validate authentication
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required to extract meter readings',
        },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can extract meter readings',
        },
        { status: 403 }
      );
    }

    // Validate payload size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        {
          error: 'Payload too large',
          message: `Request body must be smaller than ${MAX_PAYLOAD_SIZE} bytes`,
        },
        { status: 413 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = extractMeterReadingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { consumptionId, imageUrl } = validationResult.data;

    // Execute OCR extraction use case
    const updatedConsumption = await serviceContainer.consumption.extractMeterReading.execute(
      consumptionId,
      imageUrl
    );

    return NextResponse.json({
      success: true,
      consumption: {
        id: updatedConsumption.id,
        energyReading: updatedConsumption.energyReading,
        ocrExtracted: updatedConsumption.ocrExtracted,
        ocrConfidence: updatedConsumption.ocrConfidence,
        ocrRawText: updatedConsumption.ocrRawText,
        extractedAt: updatedConsumption.extractedAt,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/consumption/extract-reading',
      method: 'POST',
    });
  }
}
