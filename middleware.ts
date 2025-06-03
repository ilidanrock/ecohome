import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();

  const { nextUrl } = request;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/api/auth/verify-email', '/register-success'];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si no hay sesión, redirigir a login
  if (!session) {
    const loginUrl = new URL('/login', nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Protección de rutas de administrador
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isAdminRoute && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
  }

  // Protección de rutas de usuario
  const userRoutes = ['/dashboard', '/profile', '/billing'];
  const isUserRoute = userRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isUserRoute && session.user.role !== 'USER') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
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
