"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart3,
  Zap,
  Droplets,
  FileText,
  CreditCard,
  Bell,
  Settings,
  MessageSquare,
  Lightbulb,
  Calendar,
  LogOut,
  Menu,
  X,
  Leaf,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"

const navigation = [
  {
    name: "Dashboard",
    href: "/tenant/dashboard",
    icon: Home,
    current: false,
  },
  {
    name: "Mi Consumo",
    href: "/tenant/consumption",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Energía",
    href: "/tenant/energy",
    icon: Zap,
    current: false,
  },
  {
    name: "Agua",
    href: "/tenant/water",
    icon: Droplets,
    current: false,
  },
  {
    name: "Facturas",
    href: "/tenant/bills",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Reportes",
    href: "/tenant/reports",
    icon: FileText,
    current: false,
  },
  {
    name: "Alertas",
    href: "/tenant/alerts",
    icon: Bell,
    current: false,
  },
]

const secondaryNavigation = [
  {
    name: "Consejos de Ahorro",
    href: "/tenant/tips",
    icon: Lightbulb,
  },
  {
    name: "Mantenimiento",
    href: "/tenant/maintenance",
    icon: Calendar,
  },
  {
    name: "Mensajes",
    href: "/tenant/messages",
    icon: MessageSquare,
  },
  {
    name: "Mi Perfil",
    href: "/tenant/profile",
    icon: User,
  },
  {
    name: "Configuración",
    href: "/tenant/settings",
    icon: Settings,
  },
]

export function TenantSidebar() {
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
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Mi Dashboard</div>
      </div>
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
    const {data: session} = useSession()
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-ecogreen" />
          <div>
            <span className="text-xl font-bold text-ecoblue">EcoHome</span>
            <div className="text-xs text-[#343A40]/60 font-medium">Mi Hogar</div>
          </div>
        </div>
      </div>

      {/* User info card */}
      <div className="bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 rounded-lg p-4 border border-ecoblue/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ecoblue/20 flex items-center justify-center">
          {
            session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-ecoblue" />
            )
          }
          </div>
          <div>
            <p className="text-sm font-semibold text-[#343A40]">{session?.user?.name}</p>
            <p className="text-xs text-[#343A40]/70">Apartamento 3B</p>
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
              Herramientas
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
