import type React from 'react';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';
import { AdminSidebar } from '@/components/admin/admin-siderbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F8F9FA]">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
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
