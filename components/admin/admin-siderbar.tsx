'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
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
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    current: false,
  },
  {
    name: 'Estadísticas',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    current: false,
  },
  {
    name: 'Propiedades',
    href: '/admin/properties',
    icon: Building2,
    current: false,
  },
  {
    name: 'Consumo Energético',
    href: '/admin/energy',
    icon: Zap,
    current: false,
  },
  {
    name: 'Gestión de Agua',
    href: '/admin/water',
    icon: Droplets,
    current: false,
  },
  {
    name: 'Reportes',
    href: '/admin/reports',
    icon: FileText,
    current: false,
  },
  {
    name: 'Alertas',
    href: '/admin/alerts',
    icon: AlertTriangle,
    current: false,
  },
  {
    name: 'Notificaciones',
    href: '/admin/notifications',
    icon: Bell,
    current: false,
  },
];

const secondaryNavigation = [
  {
    name: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Seguridad',
    href: '/admin/security',
    icon: Shield,
  },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn('relative z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent pathname={pathname} session={session} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} session={session} />
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

function SidebarContent({ pathname, session }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50 px-4">
        {/* Logo */}
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-green-500">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-600">EcoHome</span>
              <div className="text-xs font-medium text-gray-600">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mx-4 mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
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
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-600">Administrador</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                'group flex items-center px-4 py-2.5 text-sm rounded-r-md transition-colors duration-200'
              )}
            >
              <item.icon
                className={cn(
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-500 group-hover:text-blue-600',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-2 py-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 mb-2">
            Configuración
          </div>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                  'group flex items-center px-4 py-2.5 text-sm rounded-r-md transition-colors duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 group-hover:text-blue-600',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-red-600" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
