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

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
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
