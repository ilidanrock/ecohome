import { AdminRoute } from "@/components/auth/AdminRoute"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex">
          < DashboardSidebar isAdmin={true}/>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  )
} 