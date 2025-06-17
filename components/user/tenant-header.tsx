"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Search, User, ChevronDown, Zap, Droplets, X, Settings, FileText, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { signOut, useSession } from "next-auth/react"
import { useSidebar } from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Types
interface QuickStat {
  type: "energy" | "water"
  value: string
  unit: string
  trend: "up" | "down" | "stable"
  loading?: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  timestamp: Date
  read: boolean
}

// Mock data - replace with real API calls
const mockQuickStats: QuickStat[] = [
  { type: "energy", value: "245", unit: "kWh", trend: "down" },
  { type: "water", value: "1.2k", unit: "L", trend: "up" },
]

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Factura disponible",
    message: "Tu factura de energía de diciembre ya está disponible",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
  },
  {
    id: "2",
    title: "Consumo elevado",
    message: "Tu consumo de agua ha aumentado un 15% esta semana",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    title: "Meta alcanzada",
    message: "¡Felicidades! Has reducido tu consumo energético un 10%",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
]

export function TenantHeader() {
  const { data: session } = useSession()
  const { isMobile } = useSidebar()
  const router = useRouter()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [quickStats, setQuickStats] = useState<QuickStat[]>([])
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [statsLoading, setStatsLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Load quick stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setQuickStats(mockQuickStats)
      setStatsLoading(false)
    }
    loadStats()
  }, [])

  // Debounced search
  // const debouncedSearch = useCallback(
  //   debounce((query: string) => {
  //     if (query.trim()) {
  //       router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
  //     }
  //   }, 300),
  //   [router],
  // )

  // useEffect(() => {
  //   debouncedSearch(searchQuery)
  // }, [searchQuery, debouncedSearch])

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 max-w-md" onSubmit={handleSearchSubmit}>
          <label htmlFor="search-field" className="sr-only">
            Buscar facturas, reportes y más
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-gray-400" />
            <Input
              id="search-field"
              className={cn(
                "h-full w-full border-gray-200 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200",
                searchFocused && "ring-2 ring-blue-500 border-blue-500",
              )}
              placeholder="Buscar facturas, reportes..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Quick stats */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-3">
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </>
            ) : (
              quickStats.map((stat) => (
                <div
                  key={stat.type}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer",
                    stat.type === "energy" ? "bg-blue-50 hover:bg-blue-100" : "bg-green-50 hover:bg-green-100",
                  )}
                  title={`Consumo de ${stat.type === "energy" ? "energía" : "agua"} actual`}
                >
                  {stat.type === "energy" ? (
                    <Zap className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Droplets className="h-4 w-4 text-green-600" />
                  )}
                  <span
                    className={cn("text-sm font-medium", stat.type === "energy" ? "text-blue-700" : "text-green-700")}
                  >
                    {stat.value} {stat.unit}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-gray-100 transition-colors duration-200"
              aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200",
                      !notification.read && "bg-blue-50/50",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.type === "info" && "bg-blue-500",
                          notification.type === "warning" && "bg-yellow-500",
                          notification.type === "success" && "bg-green-500",
                          notification.type === "error" && "bg-red-500",
                          notification.read && "bg-gray-300",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-x-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image || "/placeholder.svg"}
                    alt={`Foto de perfil de ${session.user.name}`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-medium text-gray-700 max-w-32 truncate">
                  {session?.user?.name || "Usuario"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">Apartamento 3B</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/tenant/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/tenant/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/tenant/bills" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Facturas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                Soporte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

