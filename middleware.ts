import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/register-success',
    '/select-role',
    '/api/auth/signin',
    '/api/auth/csrf',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/callback/google',
    '/api/auth/verify-email',
    '/api/auth/send-email',
    '/api/auth/signout',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // ============================================
  // STEP 1: Handle public routes
  // ============================================
  if (isPublicRoute) {
    // If user is already logged in and tries to access login/register pages,
    // redirect them to their appropriate dashboard based on role
    if (session && isAuthRoute) {
      if (session.user.role === 'USER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (session.user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (session.user.role === 'NULL') {
        return NextResponse.redirect(new URL('/select-role', request.url));
      }
    }
    // Public routes are accessible without authentication
    return NextResponse.next();
  }

  // ============================================
  // STEP 2: Authentication check for protected routes
  // ============================================
  // If route is not public and user is not authenticated, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ============================================
  // STEP 3: Role-Based Access Control (RBAC)
  // ============================================
  // Define protected routes that require specific roles
  const protectedRoutes = ['/dashboard', '/profile', '/billing'];
  const adminRoutes = ['/admin'];

  // Check if route requires USER role
  const requiresUserRole = protectedRoutes.some((route) => pathname.startsWith(route));
  if (requiresUserRole && session.user.role !== 'USER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Check if route requires ADMIN role
  const requiresAdminRole = adminRoutes.some((route) => pathname.startsWith(route));
  if (requiresAdminRole && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // User is authenticated and has required role, allow access
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
