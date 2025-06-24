
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';


export async function middleware(request: NextRequest) {
  console.log('=== Inicio de Middleware ===');
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}${request.nextUrl.search}`);
  
  const session = await auth();
  console.log('Sesión:', session ? 'Activa' : 'Inactiva');
  if (session) {
    console.log('Usuario:', session.user?.email);
    console.log('Rol:', session.user?.role);
  }
  
  const { pathname } = request.nextUrl;
  console.log('Pathname:', pathname);

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
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith("/api/auth"));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (session && isAuthRoute) {
    console.log('Usuario autenticado intentando acceder a ruta de autenticación');
    if (session.user.role === 'USER') {
      console.log('Redirigiendo a /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (session.user.role === 'ADMIN') {
      console.log('Redirigiendo a /admin');
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (session.user.role === 'NULL' && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/select-role', request.url));
    }
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }
 
  
  

  

  // If no session and not on a public route, redirect to login
  if (!session) {
    console.log('No hay sesión activa, redirigiendo a /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle role-based access control for protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/billing'];
  const adminRoutes = ['/admin'];
  

  // Check user access to protected routes
  const isAccessingProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isAccessingProtectedRoute) {
    console.log('Ruta protegida detectada');
    if (session.user.role !== 'USER') {
      console.log('Usuario sin rol USER intentando acceder a ruta protegida');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    console.log('Acceso a ruta protegida concedido');
  }

  // Check admin access to admin routes
  const isAccessingAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isAccessingAdminRoute) {
    console.log('Ruta de administrador detectada');
    if (session.user.role !== 'ADMIN') {
      console.log('Usuario sin rol ADMIN intentando acceder a ruta de administrador');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    console.log('Acceso a ruta de administrador concedido');
  }
  
  console.log('Acceso concedido a:', pathname);
  console.log('=== Fin de Middleware ===\n');
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
