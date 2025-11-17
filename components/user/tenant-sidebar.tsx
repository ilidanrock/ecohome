'use client';

import type React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  Zap,
  Droplets,
  Settings,
  Lightbulb,
  LogOut,
  Leaf,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
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
} from '@/components/ui/sidebar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Mi Consumo', href: '/tenant/consumption', icon: BarChart3 },
  { name: 'Energía', href: '/tenant/energy', icon: Zap },
  { name: 'Agua', href: '/tenant/water', icon: Droplets },
];

const secondaryNavigation = [
  { name: 'Consejos de Ahorro', href: '/tenant/tips', icon: Lightbulb },
  { name: 'Mi Perfil', href: '/tenant/profile', icon: User },
  { name: 'Configuración', href: '/tenant/settings', icon: Settings },
];

type TenantSidebarProps = {
  onOpenSidebarChange?: (open: boolean) => void;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TenantSidebar(_props: TenantSidebarProps = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar
      className={cn(
        'border-r shadow-sm backdrop-blur-xl transition-all duration-300 ease-in-out z-[60]',
        // Light mode colors - consistentes con header
        'bg-white/95 border-ecoblue/20',
        // Dark mode colors - mejor contraste
        'dark:bg-slate-900/95 dark:border-ecoblue/30'
      )}
    >
      <SidebarHeader
        className={cn(
          'border-b backdrop-blur-sm',
          // Light mode
          'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 border-ecoblue/20',
          // Dark mode
          'dark:from-ecoblue/20 dark:to-ecogreen/20 dark:border-ecoblue/30'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ecoblue to-ecogreen shadow-md ring-2 ring-ecoblue/20 dark:ring-ecoblue/30">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-ecoblue dark:text-blue-400">EcoHome</span>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Mi Hogar</div>
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
                  src={session.user.image || '/placeholder.svg'}
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
                {session?.user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Apartamento 3B</p>
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
                      'w-full justify-start transition-all duration-200 rounded-xl',
                      pathname === item.href
                        ? // Active state
                          'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 text-ecoblue dark:text-blue-400 font-semibold shadow-sm border-l-2 border-ecoblue dark:border-blue-400'
                        : // Inactive state
                          'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-ecoblue dark:hover:text-blue-400'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          pathname === item.href
                            ? 'text-ecoblue dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-ecoblue dark:group-hover:text-blue-400'
                        )}
                      />
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
          <SidebarGroupLabel
            className={cn(
              'text-xs font-semibold uppercase tracking-wide',
              'text-slate-500 dark:text-slate-400'
            )}
          >
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
                      'w-full justify-start transition-all duration-200 rounded-xl',
                      pathname === item.href
                        ? // Active state
                          'bg-gradient-to-r from-ecoblue/10 to-ecogreen/10 text-ecoblue dark:text-blue-400 font-semibold shadow-sm border-l-2 border-ecoblue dark:border-blue-400'
                        : // Inactive state
                          'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-ecoblue dark:hover:text-blue-400'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          pathname === item.href
                            ? 'text-ecoblue dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-ecoblue dark:group-hover:text-blue-400'
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn('border-t p-2', 'border-slate-200/60 dark:border-slate-700/60')}>
        <SidebarMenu>
          <SidebarMenuItem>
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
                  'h-5 w-5 transition-colors duration-200',
                  'text-slate-500 dark:text-slate-400',
                  'group-hover:text-red-600 dark:group-hover:text-red-400'
                )}
              />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Layout wrapper component
export function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Get current page name for mobile header
  const getCurrentPageName = () => {
    const currentNav = [...navigation, ...secondaryNavigation].find(
      (n) => pathname === n.href || pathname.startsWith(n.href)
    );
    return currentNav?.name || 'Dashboard';
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <TenantSidebar />
        <SidebarInset className="flex-1">
          {/* Mobile header */}
          <header
            className={cn(
              'flex h-16 shrink-0 items-center gap-2 border-b px-4 shadow-sm backdrop-blur-xl transition-all duration-200 lg:hidden',
              // Light mode
              'bg-white/95 border-ecoblue/20',
              // Dark mode
              'dark:bg-slate-900/95 dark:border-ecoblue/30'
            )}
          >
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {getCurrentPageName()}
              </h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
