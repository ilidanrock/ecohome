
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';


export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
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
    "/api/auth/signout"
  ];


  // Allow access to public routes
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is logged in and tries to access login/register, redirect based on role
    if (session && isAuthRoute) {
      
      if (session.user.role === 'USER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (session.user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (session.user.role === 'NULL' && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return NextResponse.redirect(new URL('/select-role', request.url));
      }
    }
      // Handle role-based access control for protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/billing'];
  const adminRoutes = ['/admin'];

  // Check user access to protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && session?.user.role !== 'USER') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Check admin access to admin routes
  if (adminRoutes.some(route => pathname.startsWith(route)) && session?.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
    return NextResponse.next();
  }

  // If no session and not on a public route, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


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