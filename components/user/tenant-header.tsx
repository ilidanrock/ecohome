'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/shared/header';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Types
type QuickStat = {
  type: 'energy' | 'water';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
};

// Mock data - replace with real API calls
const mockQuickStats: QuickStat[] = [
  { type: 'energy', value: '245', unit: 'kWh', trend: 'down' },
  { type: 'water', value: '1.2k', unit: 'L', trend: 'up' },
];

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

export function TenantHeader() {
  const router = useRouter();
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Load quick stats
  useEffect(() => {
    const loadStats = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQuickStats(mockQuickStats);
    };
    loadStats();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const userMenuItems = (
    <>
      <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
      <DropdownMenuItem>Configuración</DropdownMenuItem>
      <DropdownMenuItem>Soporte</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600">
        Cerrar Sesión
      </DropdownMenuItem>
    </>
  );

  return (
    <Header
      quickStats={quickStats}
      notifications={notifications}
      onSearch={handleSearch}
      onMarkAsRead={handleMarkAsRead}
      onClearAllNotifications={handleClearAllNotifications}
      userMenuItems={userMenuItems}
      searchPlaceholder="Buscar facturas, reportes..."
    />
  );
}
