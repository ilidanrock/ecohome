'use client';

import { useState } from 'react';
import { TenantBreadcrumb } from '@/components/user/tenant-breadcrumb';
import { TenantHeader } from '@/components/user/tenant-header';
import { TenantSidebar } from '@/components/user/tenant-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type React from 'react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        className={cn(
          'min-h-screen w-full transition-colors duration-200',
          // Light mode
          'bg-slate-50',
          // Dark mode
          'dark:bg-slate-950'
        )}
      >
        <TenantSidebar
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
          onOpenSidebarChange={setSidebarOpen}
        />
        <div className="lg:pl-64">
          <TenantHeader onOpenSidebar={handleOpenSidebar} />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <TenantBreadcrumb />
              <div className="mt-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
