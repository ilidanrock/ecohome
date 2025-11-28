import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { signUpload } from '@/lib/cloudinary';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePayloadSize, handleApiError } from '@/lib/error-handler';
import type { NextRequest } from 'next/server';

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
    // Get authenticated session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required to generate signed URLs',
        },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimiters.cloudinary(request, session.user.id);
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
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    const { timestamp, signature } = signUpload(publicId, options);

    // Only return signature and timestamp
    // cloudName and apiKey are already available in the client via NEXT_PUBLIC_CLOUDINARY_* env vars
    // No need to expose them in every response
    return NextResponse.json({
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
