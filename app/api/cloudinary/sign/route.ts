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
    console.error('Error signing Cloudinary URL:', error);
    return NextResponse.json({ error: 'Error generating signed URL' }, { status: 500 });
  }
}

// Solo permitir POST
export function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
