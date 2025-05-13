
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "../auth"

export default async function middleware(request: NextRequest) {
  const session = await auth()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/error"]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Si no hay sesión y no es una ruta pública, redirigir al login
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Protección de rutas de administrador
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protección de rutas de usuario
  const userRoutes = ["/dashboard", "/profile", "/billing"]
  const isUserRoute = userRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isUserRoute && !session.user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

// Configurar qué rutas deben ser protegidas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
} 