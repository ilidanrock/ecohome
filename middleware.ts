
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {

  const session = await auth()

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/register-success",
    "/select-role",
    "/api/auth/signin",
    "/api/auth/csrf",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/callback/google",
    "/api/auth/verify-email",
    "/api/auth/send-email",
  ];

  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const protectedRoutes = ['/dashboard', '/profile', '/billing']

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && session.user.role !== 'USER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  const adminRoutes = ['/admin']

  if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/api/:path*',
    '/trpc/:path*',
  ],
};
