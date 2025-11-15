'use client';

import { User, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HeaderUserMenuProps = {
  userMenuItems?: React.ReactNode;
};

export function HeaderUserMenu({ userMenuItems }: HeaderUserMenuProps) {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-x-2 p-1 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 rounded-xl transition-all duration-200 hover:shadow-sm"
          aria-label="Menú de usuario"
          aria-haspopup="true"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-ecoblue/20 to-ecogreen/20 dark:from-ecoblue/30 dark:to-ecogreen/30 flex items-center justify-center ring-2 ring-ecoblue/20 dark:ring-ecoblue/30 shadow-sm">
            {session?.user?.image ? (
              <Image
                src={session.user.image || '/placeholder.svg'}
                alt={session.user.name || 'Usuario'}
                width={32}
                height={32}
                className="rounded-xl"
              />
            ) : (
              <User className="h-4 w-4 text-ecoblue dark:text-blue-400" />
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
  );
}
