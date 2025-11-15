'use client';

import { useState } from 'react';
import { Bell, Info, AlertTriangle, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/stores';
import { formatTimestamp } from '@/stores/utils';

type HeaderNotificationsProps = {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onClearAllNotifications?: () => void;
  onMarkAsRead?: (notificationId: string) => void;
};

export function HeaderNotifications({
  notifications = [],
  onNotificationClick,
  onClearAllNotifications,
  onMarkAsRead,
}: HeaderNotificationsProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 transition-all duration-200 hover:scale-105 active:scale-95"
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
              className="h-7 text-xs text-ecoblue hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
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
                      'bg-blue-100 text-ecoblue dark:bg-blue-900/40 dark:text-blue-400',
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
  );
}
