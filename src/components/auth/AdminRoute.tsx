"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/login")
      return
    }

    if (session.user.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    return null
  }

  return <>{children}</>
} 