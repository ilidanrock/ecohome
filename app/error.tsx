"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Leaf, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log del error para debugging
    console.error(error)
  }, [error])

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-12 w-12 text-[#28A745]" />
            <span className="text-3xl font-bold text-[#007BFF]">EcoHome</span>
          </div>
        </div>

        {/* Error */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-red-500">¡Oops!</h1>
          <h2 className="text-2xl font-bold text-[#343A40]">Algo salió mal</h2>
          <p className="text-[#343A40]/70 text-lg">Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.</p>
        </div>

        {/* Ilustración de error */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200">
              <div className="text-red-500 text-4xl">⚠️</div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="outline" className="border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button asChild className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>

        {/* Información adicional para desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Información del error (solo en desarrollo):</h3>
            <p className="text-sm text-gray-600 font-mono">{error.message}</p>
            {error.digest && <p className="text-xs text-gray-500 mt-1">Digest: {error.digest}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
