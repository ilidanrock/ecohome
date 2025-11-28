'use client';

import type React from 'react';
import { Zap, Droplets, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderSearch } from './header-search';
import { HeaderNotifications } from './header-notifications';
import { HeaderUserMenu } from './header-user-menu';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import type { Notification, QuickStat } from '@/stores';

type HeaderProps = {
  variant?: 'default' | 'admin';
  quickStats?: QuickStat[];
  notifications?: Notification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onClearAllNotifications?: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  userMenuItems?: React.ReactNode;
  searchPlaceholder?: string;
  onOpenSidebar?: () => void;
};

export function Header({
  variant = 'default',
  quickStats = [],
  notifications = [],
  onSearch,
  onNotificationClick,
  onClearAllNotifications,
  onMarkAsRead,
  userMenuItems,
  searchPlaceholder = 'Buscar...',
  onOpenSidebar,
}: HeaderProps) {
  const isAdmin = variant === 'admin';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 shrink-0 items-center border-b shadow-sm backdrop-blur-xl transition-all duration-200',
        // Light mode colors - más distinguibles
        'bg-white/95 border-ecoblue/20',
        // Dark mode colors - mejor contraste
        'dark:bg-slate-900/95 dark:border-ecoblue/30',
        // Responsive padding
        'px-3 sm:px-4 md:px-6 lg:px-8'
      )}
      role="banner"
      aria-label="Navegación principal"
    >
      <div className="flex flex-1 gap-x-3 sm:gap-x-4 lg:gap-x-6 self-stretch items-center">
        {/* Mobile menu button - Solo visible en mobile y si hay callback */}
        {onOpenSidebar && (
          <button
            type="button"
              className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 lg:hidden',
              'bg-slate-100/80 dark:bg-slate-800/80',
              'text-slate-700 dark:text-slate-300',
              'border border-slate-200/60 dark:border-slate-700/60',
              'hover:bg-slate-200/80 dark:hover:bg-slate-700/80',
              'hover:text-slate-900 dark:hover:text-slate-200',
              'active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-ecoblue/50 focus:ring-offset-2',
              'shadow-sm'
            )}
            onClick={onOpenSidebar}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <HeaderSearch
              placeholder={searchPlaceholder}
          onSearch={onSearch}
          maxWidth={isAdmin ? 'xl' : 'md'}
        />
      </div>

      <div className="flex items-center gap-x-2 sm:gap-x-3 lg:gap-x-4">
        {/* Quick Stats - Solo para usuarios no admin */}
        {!isAdmin && quickStats.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            {quickStats.map((stat) => (
              <div
                key={stat.type}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm',
                  // Light mode
                  'bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700 border-slate-200/40',
                  // Dark mode - mejor contraste
                  'dark:from-slate-800/90 dark:to-slate-700/80 dark:text-slate-200 dark:border-slate-600/40'
                )}
                aria-label={`${stat.type === 'energy' ? 'Energía' : 'Agua'}: ${stat.value} ${stat.unit}, tendencia ${stat.trend === 'up' ? 'en aumento' : 'a la baja'}`}
              >
                <div
                  className={cn(
                    'p-1 rounded-lg',
                    stat.type === 'energy'
                      ? 'bg-amber-100 dark:bg-amber-900/40'
                      : 'bg-ecoblue/20 dark:bg-ecoblue/30'
                  )}
                >
                  {stat.type === 'energy' ? (
                    <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Droplets className="h-3.5 w-3.5 text-ecoblue dark:text-blue-400" />
                  )}
                </div>
                <span className="font-semibold">
                  {stat.value} {stat.unit}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                    stat.trend === 'up'
                      ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-400/40'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/40'
                  )}
                  aria-hidden="true"
                >
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        <HeaderNotifications
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onClearAllNotifications={onClearAllNotifications}
          onMarkAsRead={onMarkAsRead}
        />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <HeaderUserMenu userMenuItems={userMenuItems} />
      </div>
    </header>
  );
}
