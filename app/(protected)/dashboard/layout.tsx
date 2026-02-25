'use client';

import { TenantBreadcrumb } from '@/components/user/tenant-breadcrumb';
import { TenantHeader } from '@/components/user/tenant-header';
import { TenantSidebar } from '@/components/user/tenant-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type React from 'react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const handleOpenSidebar = () => {
    // SidebarTrigger / Header button calls setOpenMobile from useSidebar
    void 0;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        className={cn(
          'flex min-h-svh w-full transition-colors duration-200',
          'bg-slate-50 dark:bg-slate-950'
        )}
      >
        <TenantSidebar onOpenSidebarChange={handleOpenSidebar} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TenantHeader onOpenSidebar={handleOpenSidebar} />
          <main className="flex-1 overflow-auto py-4 sm:py-6">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
              <TenantBreadcrumb />
              <div className="mt-4 sm:mt-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
