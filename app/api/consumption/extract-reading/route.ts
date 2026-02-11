import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import { extractMeterReadingSchema } from '@/zod/ocr-schemas';
import { handleApiError, validatePayloadSize } from '@/lib/error-handler';
import { rateLimiters } from '@/lib/rate-limit';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

// Force Node.js runtime (required for OCR operations)
export const runtime = 'nodejs';

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
      const errorResponse: ErrorResponse = {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required to extract meter readings',
        level: getErrorLevelFromStatus(401),
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.FORBIDDEN,
        message: 'Only administrators can extract meter readings',
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
    const body = await request.json();
    const validationResult = extractMeterReadingSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request data',
        level: getErrorLevelFromStatus(400),
        details: validationResult.error.errors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
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
