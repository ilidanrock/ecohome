'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/shared/header';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  useNotificationsStore,
  useConsumptionStore,
  type Notification,
} from '@/stores';

export function TenantHeader() {
  const router = useRouter();

  // Zustand stores
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const quickStats = useConsumptionStore((state) => state.quickStats);
  const fetchConsumptionData = useConsumptionStore((state) => state.fetchConsumptionData);

  // Initialize data on mount
  useEffect(() => {
    // Initialize mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Factura disponible',
        message: 'Tu factura de energía de diciembre ya está disponible',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
      },
      {
        id: '2',
        title: 'Consumo elevado',
        message: 'Tu consumo de agua ha aumentado un 15% esta semana',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
      },
      {
        id: '3',
        title: 'Meta alcanzada',
        message: '¡Felicidades! Has reducido tu consumo energético un 10%',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
      },
    ];

    // Add mock notifications to store if empty
    if (notifications.length === 0) {
      mockNotifications.forEach((notif) => {
        useNotificationsStore.getState().addNotification(
          notif.title,
          notif.message,
          notif.type
        );
      });
    }

    // Fetch consumption data
    fetchConsumptionData();
  }, [fetchConsumptionData, notifications.length]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const userMenuItems = (
    <>
      <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
      <DropdownMenuItem>Configuración</DropdownMenuItem>
      <DropdownMenuItem>Soporte</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-red-600 dark:text-red-400"
      >
        Cerrar Sesión
      </DropdownMenuItem>
    </>
  );

  return (
    <Header
      quickStats={quickStats}
      notifications={notifications}
      onSearch={handleSearch}
      onNotificationClick={handleNotificationClick}
      onClearAllNotifications={markAllAsRead}
      onMarkAsRead={markAsRead}
      userMenuItems={userMenuItems}
      searchPlaceholder="Buscar facturas, reportes..."
    />
  );
}
