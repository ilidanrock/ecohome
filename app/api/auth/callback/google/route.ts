import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');


    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    // If we have a code, the OAuth flow is complete
    if (code) {
      console.log("OAuth flow complete");
      // The auth library handles the code exchange internally
      // We just need to redirect to the success page
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If no code and no error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
    );
  }
}
