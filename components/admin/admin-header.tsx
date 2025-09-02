'use client';

import { LogOut, Settings, HelpCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/shared/header';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function AdminHeader() {
  const userMenuItems = (
    <>
      <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        Configuración
      </DropdownMenuItem>
      <DropdownMenuItem>
        <HelpCircle className="mr-2 h-4 w-4" />
        Soporte
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </DropdownMenuItem>
    </>
  );

  return <Header variant="admin" userMenuItems={userMenuItems} searchPlaceholder="Buscar..." />;
}
