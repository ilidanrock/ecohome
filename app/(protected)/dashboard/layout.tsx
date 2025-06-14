import { TenantBreadcrumb } from "@/components/user/tenant-breadcrumb"
import { TenantHeader } from "@/components/user/tenant-header"
import { TenantSidebar } from "@/components/user/tenant-sidebar"
import type React from "react"


export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <TenantSidebar />
      <div className="lg:pl-64">
        <TenantHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TenantBreadcrumb />
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
