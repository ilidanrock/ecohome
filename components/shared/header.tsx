'use client';

import type React from 'react';

import {
  Bell,
  Search,
  User,
  ChevronDown,
  X,
  Zap,
  Droplets,
  Info,
  AlertTriangle,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type QuickStat = {
  type: 'energy' | 'water';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  loading?: boolean;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
};

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
}: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = variant === 'admin';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  return (
    <header
      className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-slate-200/60 bg-white/80 px-4 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/80 sm:px-6 lg:px-8 transition-all duration-200"
      role="banner"
      aria-label="Navegación principal"
    >
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form
          className={cn('flex w-full', isAdmin ? 'max-w-xl' : 'max-w-md')}
          onSubmit={handleSearchSubmit}
        >
          <label htmlFor="search-field" className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative w-full group">
            <Search
              className={cn(
                'pointer-events-none absolute inset-y-0 left-3 h-full w-4 transition-colors duration-200',
                searchFocused
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            />
            <Input
              id="search-field"
              className={cn(
                'h-full w-full border-slate-200/60 bg-slate-50/50 pl-10 pr-10 text-slate-900 placeholder:text-slate-500 dark:text-slate-100 dark:border-slate-700/60 dark:bg-slate-800/50 dark:placeholder:text-slate-400 sm:text-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
                searchFocused && 'shadow-lg shadow-blue-500/10 dark:shadow-blue-400/10',
                isAdmin &&
                  'rounded-lg border-0 ring-1 ring-inset ring-slate-300/60 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:ring-slate-700/60 dark:focus:ring-blue-400'
              )}
              placeholder={searchPlaceholder}
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
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 dark:text-slate-300 dark:focus:ring-blue-400/20 dark:focus:ring-offset-slate-900 transition-all duration-200"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-x-3 lg:gap-x-4">
        {!isAdmin && quickStats.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            {quickStats.map((stat) => (
              <div
                key={stat.type}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-700/60 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200/40 dark:border-slate-700/40 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                aria-label={`${stat.type === 'energy' ? 'Energía' : 'Agua'}: ${stat.value} ${stat.unit}, tendencia ${stat.trend === 'up' ? 'en aumento' : 'a la baja'}`}
              >
                <div
                  className={cn(
                    'p-1 rounded-lg',
                    stat.type === 'energy'
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  )}
                >
                  {stat.type === 'energy' ? (
                    <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Droplets className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <span className="font-semibold">
                  {stat.value} {stat.unit}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                    stat.trend === 'up'
                      ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-400/30'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-400/30'
                  )}
                  aria-hidden="true"
                >
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
              </div>
            ))}
          </div>
        )}

        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={
                unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'Notificaciones'
              }
              aria-haspopup="true"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/25 animate-pulse border-2 border-white dark:border-slate-900"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Ver notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-[calc(100vh-8rem)] overflow-y-auto border-slate-200/60 dark:border-slate-700/60 shadow-xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notificaciones
              </h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAllNotifications?.();
                  }}
                >
                  Marcar todo como leído
                </Button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            {notifications.length > 0 ? (
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg p-3 text-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-sm',
                      !notification.read &&
                        'bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/40 dark:border-blue-800/40'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm',
                        notification.type === 'info' &&
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
                        notification.type === 'warning' &&
                          'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
                        notification.type === 'success' &&
                          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
                        notification.type === 'error' &&
                          'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      )}
                    >
                      {notification.type === 'info' && <Info className="h-4 w-4" />}
                      {notification.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {notification.type === 'success' && <Check className="h-4 w-4" />}
                      {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {notification.title}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Sin notificaciones
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Te avisaremos cuando tengas algo nuevo.
                </p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-x-2 p-1 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 rounded-xl transition-all duration-200 hover:shadow-sm"
              aria-label="Menú de usuario"
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center ring-2 ring-blue-200/50 dark:ring-blue-800/50 shadow-sm">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image || '/placeholder.svg'}
                    alt={session.user.name || 'Usuario'}
                    width={32}
                    height={32}
                    className="rounded-xl"
                  />
                ) : (
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {session?.user?.name || 'Usuario'}
                </span>
                <ChevronDown
                  className="ml-1 h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </span>
              <span className="sr-only">Menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl backdrop-blur-xl"
          >
            <DropdownMenuLabel className="font-normal px-3 py-2" id="user-menu-label">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                  {session?.user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200/60 dark:bg-slate-700/60" />
            {userMenuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
