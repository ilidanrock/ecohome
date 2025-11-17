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

type AdminSidebarProps = {
  onOpenSidebarChange?: (open: boolean) => void;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
};

export function AdminSidebar({
  onOpenSidebarChange,
  sidebarOpen: externalSidebarOpen,
  onSidebarOpenChange,
}: AdminSidebarProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Use external state if provided, otherwise use internal state
  const sidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = onSidebarOpenChange || setInternalSidebarOpen;

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    onOpenSidebarChange?.(false);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          'relative z-50 lg:hidden',
          sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Overlay with fade animation */}
        <div
          className={cn(
            'fixed inset-0 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-sm transition-all duration-300 ease-in-out',
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleCloseSidebar}
        />
        {/* Sidebar with slide animation */}
        <div className="fixed inset-0 flex pointer-events-none">
          <div
            className={cn(
              'relative flex w-full max-w-xs flex-1 transition-transform duration-300 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="relative flex-1 pointer-events-auto">
              <SidebarContent pathname={pathname} session={session} />
              {/* Close button inside sidebar (top right) */}
              <button
                type="button"
                className={cn(
                  'absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 lg:hidden',
                  'bg-slate-100/80 dark:bg-slate-800/80',
                  'text-slate-600 dark:text-slate-400',
                  'hover:bg-slate-200/80 dark:hover:bg-slate-700/80',
                  'hover:text-slate-900 dark:hover:text-slate-200',
                  'active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-ecoblue/50',
                  'shadow-sm backdrop-blur-sm'
                )}
                onClick={handleCloseSidebar}
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-[60] lg:flex lg:w-64 lg:flex-col transition-all duration-300 ease-in-out">
        <SidebarContent pathname={pathname} session={session} />
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
    <div
      className={cn(
        'flex h-full flex-col border-r shadow-sm backdrop-blur-xl transition-all duration-200',
        // Light mode colors - consistentes con header
        'bg-white/95 border-ecoblue/20',
        // Dark mode colors - mejor contraste
        'dark:bg-slate-900/95 dark:border-ecoblue/30'
      )}
    >
      <div
        className={cn(
          'border-b px-4 backdrop-blur-sm',
          // Light mode
          'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 border-ecoblue/20',
          // Dark mode
          'dark:from-ecoblue/20 dark:to-ecogreen/20 dark:border-ecoblue/30'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ecoblue to-ecogreen shadow-md ring-2 ring-ecoblue/20 dark:ring-ecoblue/30">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-ecoblue dark:text-blue-400">EcoHome</span>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div
          className={cn(
            'mx-4 mb-4 rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all duration-200',
            // Light mode
            'bg-gradient-to-r from-slate-50/80 to-slate-100/60 border-slate-200/40',
            // Dark mode
            'dark:from-slate-800/90 dark:to-slate-700/80 dark:border-slate-600/40'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ring-2 shadow-sm',
                // Light mode
                'bg-gradient-to-br from-ecoblue/20 to-ecogreen/20 ring-ecoblue/20',
                // Dark mode
                'dark:from-ecoblue/30 dark:to-ecogreen/30 dark:ring-ecoblue/30'
              )}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-xl object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-ecoblue dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'truncate text-sm font-semibold',
                  'text-slate-900 dark:text-slate-100'
                )}
              >
                {session?.user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Administrador</p>
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
                'group flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                pathname === item.href
                  ? // Active state
                    'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 text-ecoblue dark:text-blue-400 font-semibold shadow-sm border-l-2 border-ecoblue dark:border-blue-400'
                  : // Inactive state
                    'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-ecoblue dark:hover:text-blue-400'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                  pathname === item.href
                    ? 'text-ecoblue dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-ecoblue dark:group-hover:text-blue-400'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={cn('border-t px-2 py-4', 'border-slate-200/60 dark:border-slate-700/60')}>
          <div
            className={cn(
              'text-xs font-semibold uppercase tracking-wider px-4 mb-2',
              'text-slate-500 dark:text-slate-400'
            )}
          >
            Configuración
          </div>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  pathname === item.href
                    ? // Active state
                      'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 text-ecoblue dark:text-blue-400 font-semibold shadow-sm border-l-2 border-ecoblue dark:border-blue-400'
                    : // Inactive state
                      'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-ecoblue dark:hover:text-blue-400'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                    pathname === item.href
                      ? 'text-ecoblue dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-ecoblue dark:group-hover:text-blue-400'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className={cn('p-4 border-t', 'border-slate-200/60 dark:border-slate-700/60')}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start transition-all duration-200',
            'text-slate-700 dark:text-slate-300',
            'hover:bg-red-50/80 dark:hover:bg-red-900/20',
            'hover:text-red-600 dark:hover:text-red-400'
          )}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut
            className={cn(
              'mr-3 h-5 w-5 transition-colors duration-200',
              'text-slate-500 dark:text-slate-400',
              'group-hover:text-red-600 dark:group-hover:text-red-400'
            )}
          />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
