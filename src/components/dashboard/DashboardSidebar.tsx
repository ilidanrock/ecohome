"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

interface SidebarProps {
  isAdmin?: boolean
}

export function DashboardSidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()

  const userLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/dashboard/orders",
      label: "Mis Pedidos",
      icon: ShoppingCart,
    },
    {
      href: "/dashboard/profile",
      label: "Perfil",
      icon: Users,
    },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      icon: Settings,
    },
  ]

  const adminLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/admin/products",
      label: "Productos",
      icon: Package,
    },
    {
      href: "/admin/orders",
      label: "Pedidos",
      icon: ShoppingCart,
    },
    {
      href: "/admin/users",
      label: "Usuarios",
      icon: Users,
    },
    {
      href: "/admin/analytics",
      label: "Analíticas",
      icon: BarChart3,
    },
    {
      href: "/admin/settings",
      label: "Configuración",
      icon: Settings,
    },
  ]

  const links = isAdmin ? adminLinks : userLinks

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex-1 space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100",
                    pathname === link.href
                      ? "bg-gray-100 text-[#007BFF]"
                      : "text-gray-600"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 