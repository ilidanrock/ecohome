"use client"

import { Bell, Search, User, ChevronDown, Zap, Droplets } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

export function TenantHeader() {
    const {data: session} = useSession()
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Buscar
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
          <Input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Buscar facturas, reportes..."
            type="search"
            name="search"
          />
        </form>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-ecoblue/10 rounded-full">
            <Zap className="h-4 w-4 text-ecoblue" />
            <span className="text-sm font-medium text-ecoblue">245 kWh</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-ecogreen/10 rounded-full">
            <Droplets className="h-4 w-4 text-ecogreen" />
            <span className="text-sm font-medium text-ecogreen">1.2k L</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            2
          </Badge>
        </Button>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-x-2 text-sm font-semibold text-gray-900">
              <div className="h-8 w-8 rounded-full bg-ecoblue/10 flex items-center justify-center">
              {session?.user?.image ? (
                <Image
                  src={session?.user?.image}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-ecoblue" />
              )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-medium text-gray-700">{session?.user?.name}</span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">Apartamento 3B</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuItem>Facturas</DropdownMenuItem>
            <DropdownMenuItem>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600">Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
