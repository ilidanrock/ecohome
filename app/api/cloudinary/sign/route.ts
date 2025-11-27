import { NextResponse } from 'next/server';
import { signUpload } from '@/lib/cloudinary';

// Solo permitir solicitudes POST
export async function POST(request: Request) {
  try {
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
    // Log error with context for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Cloudinary Sign API] Error signing URL:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error response
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate signed URL. Please try again later.',
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

// Solo permitir POST
export function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
