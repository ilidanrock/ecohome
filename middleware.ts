
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/register-success",
    "/api/auth/signin",
    "/api/auth/csrf",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/callback/google",
    "/api/auth/verify-email",
    "/api/auth/send-email",
  ];

  // Permitir todas las rutas de autenticación de NextAuth
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Permitir rutas públicas
  if (publicRoutes.includes(pathname) || 
      pathname.startsWith('/_next/') || 
      pathname.endsWith('.css') || 
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.ico')) {
    return NextResponse.next();
  }

  const session = await auth()

  if (!session) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  const protectedRoutes = ['/dashboard', '/profile', '/billing']

  if (protectedRoutes.some(route => nextUrl.pathname.startsWith(route)) && session.user.role !== 'USER') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
  }

  const adminRoutes = ['/admin']

  if (adminRoutes.some(route => nextUrl.pathname.startsWith(route)) && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl))
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
