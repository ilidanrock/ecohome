"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BarChart3, Zap, Droplets, Settings, Lightbulb, LogOut, Leaf, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Mi Consumo", href: "/tenant/consumption", icon: BarChart3 },
  { name: "Energía", href: "/tenant/energy", icon: Zap },
  { name: "Agua", href: "/tenant/water", icon: Droplets },
]

const secondaryNavigation = [
  { name: "Consejos de Ahorro", href: "/tenant/tips", icon: Lightbulb },
  { name: "Mi Perfil", href: "/tenant/profile", icon: User },
  { name: "Configuración", href: "/tenant/settings", icon: Settings },
]

export function TenantSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
        {/* Logo */}
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-green-500">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-600">EcoHome</span>
              <div className="text-xs font-medium text-gray-600">Mi Hogar</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mx-4 mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100">
              {session?.user?.image ? (
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{session?.user?.name || "Usuario"}</p>
              <p className="text-xs text-gray-600">Apartamento 3B</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "w-full justify-start transition-all duration-200",
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Herramientas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "w-full justify-start transition-all duration-200",
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// Layout wrapper component
export function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Get current page name for mobile header
  const getCurrentPageName = () => {
    const currentNav = [...navigation, ...secondaryNavigation].find(
      (n) => pathname === n.href || pathname.startsWith(n.href),
    )
    return currentNav?.name || "Dashboard"
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <TenantSidebar />
        <SidebarInset className="flex-1">
          {/* Mobile header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 lg:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{getCurrentPageName()}</h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
