import { UserRoute } from "@/components/auth/UserRoute"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex">
          <DashboardSidebar isAdmin={false} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </UserRoute>
  )
} 