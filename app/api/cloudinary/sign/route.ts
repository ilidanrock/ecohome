import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { signUpload, getSignedImageUrl } from '@/lib/cloudinary';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import type { NextRequest } from 'next/server';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorLevelFromStatus } from '@/lib/errors/error-level';
import type { ErrorResponse } from '@/lib/errors/types';

/**
 * POST /api/cloudinary/sign
 *
 * Generates a signed URL for Cloudinary uploads.
 * Requires authentication to prevent unauthorized access.
 *
 * Request body:
 * - publicId: string (required)
 * - options?: object (optional Cloudinary options)
 *
 * @returns {Promise<NextResponse>} Signed URL data or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session (optional for signing existing image URLs)
    const session = await auth();

    // Apply rate limiting (use user ID if authenticated, otherwise use IP)
    const rateLimitResult = await rateLimiters.cloudinary(request, session?.user?.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Validate payload size
    const payloadSizeError = validatePayloadSize(request);
    if (payloadSizeError) {
      return payloadSizeError;
    }

    const { publicId, options = {} } = await request.json();

    if (!publicId) {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.BAD_REQUEST,
        message: 'publicId is required',
        level: getErrorLevelFromStatus(400),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Generate signed URL using the utility function
    const signedUrl = getSignedImageUrl(publicId, options);
    const { signature, timestamp } = signUpload(publicId, options);

    // Return the complete signed URL along with signature and timestamp for client-side use if needed
    return NextResponse.json({
      url: signedUrl,
      signature,
      timestamp,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/cloudinary/sign',
      method: 'POST',
    });
  }
}

// Solo permitir POST
export function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
