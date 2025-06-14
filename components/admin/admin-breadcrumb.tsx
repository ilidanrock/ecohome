"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const routeNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/analytics": "Estadísticas",
  "/admin/users": "Usuarios",
  "/admin/properties": "Propiedades",
  "/admin/energy": "Consumo Energético",
  "/admin/water": "Gestión de Agua",
  "/admin/reports": "Reportes",
  "/admin/alerts": "Alertas",
  "/admin/notifications": "Notificaciones",
  "/admin/settings": "Configuración",
  "/admin/security": "Seguridad",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/")
    const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === pathSegments.length - 1

    return {
      name,
      path,
      isLast,
    }
  })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/admin/dashboard" className="text-[#343A40]/60 hover:text-ecoblue transition-colors">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-[#343A40]/40 mx-2" />
            {breadcrumb.isLast ? (
              <span className="text-sm font-medium text-[#343A40]">{breadcrumb.name}</span>
            ) : (
              <Link
                href={breadcrumb.path}
                className={cn(
                  "text-sm font-medium text-[#343A40]/60 hover:text-ecoblue transition-colors",
                  breadcrumb.isLast && "text-[#343A40] cursor-default",
                )}
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
