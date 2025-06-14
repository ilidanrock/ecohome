"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building2,
  Users,
  Settings,
  FileText,
  Bell,
  Zap,
  Droplets,
  Shield,
  LogOut,
  Menu,
  X,
  Leaf,
  Home,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    current: false,
  },
  {
    name: "Estadísticas",
    href: "/admin/analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Usuarios",
    href: "/admin/users",
    icon: Users,
    current: false,
  },
  {
    name: "Propiedades",
    href: "/admin/properties",
    icon: Building2,
    current: false,
  },
  {
    name: "Consumo Energético",
    href: "/admin/energy",
    icon: Zap,
    current: false,
  },
  {
    name: "Gestión de Agua",
    href: "/admin/water",
    icon: Droplets,
    current: false,
  },
  {
    name: "Reportes",
    href: "/admin/reports",
    icon: FileText,
    current: false,
  },
  {
    name: "Alertas",
    href: "/admin/alerts",
    icon: AlertTriangle,
    current: false,
  },
  {
    name: "Notificaciones",
    href: "/admin/notifications",
    icon: Bell,
    current: false,
  },
]

const secondaryNavigation = [
  {
    name: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Seguridad",
    href: "/admin/security",
    icon: Shield,
  },
]

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("relative z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent pathname={pathname} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
      </div>
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-[#28A745]" />
          <div>
            <span className="text-xl font-bold text-[#007BFF]">EcoHome</span>
            <div className="text-xs text-[#343A40]/60 font-medium">Admin Panel</div>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-[#007BFF]/10 text-[#007BFF] border-r-2 border-[#007BFF]"
                        : "text-[#343A40]/70 hover:text-[#007BFF] hover:bg-[#007BFF]/5",
                      "group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-all duration-200",
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-[#007BFF]" : "text-[#343A40]/60 group-hover:text-[#007BFF]",
                        "h-5 w-5 shrink-0",
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <div className="text-xs font-semibold leading-6 text-[#343A40]/60 uppercase tracking-wide">
              Configuración
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-[#007BFF]/10 text-[#007BFF] border-r-2 border-[#007BFF]"
                        : "text-[#343A40]/70 hover:text-[#007BFF] hover:bg-[#007BFF]/5",
                      "group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-all duration-200",
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-[#007BFF]" : "text-[#343A40]/60 group-hover:text-[#007BFF]",
                        "h-5 w-5 shrink-0",
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#343A40]/70 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
