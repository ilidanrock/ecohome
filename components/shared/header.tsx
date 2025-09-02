'use client';

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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { signOut, useSession } from 'next-auth/react';
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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form
          className={cn('flex w-full', isAdmin ? 'max-w-xl' : 'max-w-md')}
          onSubmit={handleSearchSubmit}
        >
          <label htmlFor="search-field" className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-gray-400" />
            <Input
              id="search-field"
              className={cn(
                'h-full w-full border-gray-200 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200',
                searchFocused && 'ring-2 ring-blue-500 border-blue-500',
                isAdmin &&
                  'rounded-md border-0 bg-white py-1.5 pl-10 pr-3 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500'
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
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-gray-400" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {!isAdmin && quickStats.length > 0 && (
          <div className="hidden md:flex items-center gap-3">
            {quickStats.map((stat) => (
              <div
                key={stat.type}
                className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700"
              >
                {stat.type === 'energy' ? (
                  <Zap className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Droplets className="h-4 w-4 text-blue-500" />
                )}
                <span>
                  {stat.value} {stat.unit}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-1.5 text-xs font-medium',
                    stat.trend === 'up' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  )}
                >
                  {stat.trend === 'up' ? '↑' : '↓'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-[calc(100vh-8rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <h3 className="text-sm font-medium">Notificaciones</h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAllNotifications?.();
                  }}
                >
                  Marcar todo como leído
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              <div className="space-y-1 p-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm transition-colors hover:bg-gray-50',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                        notification.type === 'info' && 'bg-blue-100 text-blue-600',
                        notification.type === 'warning' && 'bg-yellow-100 text-yellow-600',
                        notification.type === 'success' && 'bg-green-100 text-green-600',
                        notification.type === 'error' && 'bg-red-100 text-red-600'
                      )}
                    >
                      {notification.type === 'info' && <Info className="h-3.5 w-3.5" />}
                      {notification.type === 'warning' && <AlertTriangle className="h-3.5 w-3.5" />}
                      {notification.type === 'success' && <Check className="h-3.5 w-3.5" />}
                      {notification.type === 'error' && <XCircle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-gray-500">{notification.message}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin notificaciones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Te avisaremos cuando tengas algo nuevo.
                </p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-x-2 p-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {session?.user?.name || 'Usuario'}
                </span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userMenuItems ? (
              userMenuItems
            ) : (
              <>
                <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuItem>Soporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
