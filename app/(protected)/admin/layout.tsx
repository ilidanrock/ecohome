'use client';

import type React from 'react';
import { useState } from 'react';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';
import { AdminSidebar } from '@/components/admin/admin-siderbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-background transition-colors duration-200">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        onOpenSidebarChange={setSidebarOpen}
      />
      <div className="lg:pl-64">
        <AdminHeader onOpenSidebar={handleOpenSidebar} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AdminBreadcrumb />
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
