"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Leaf, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"



export default function RegisterSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente después de 10 segundos
    const timer = setTimeout(() => {
      router.push(`/login`)
    }, 10000)

    return () => clearTimeout(timer)
  }, [ router])

  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-[#28A745]" />
            <span className="text-2xl font-bold text-[#007BFF]">EcoHome</span>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#28A745]/10 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-[#28A745]" />
          </div>
        </div>

        <CardTitle className="text-2xl font-bold text-[#343A40]">¡Registro exitoso!</CardTitle>
        <CardDescription className="text-[#343A40]/70">
          Tu cuenta ha sido creada. Ahora necesitas verificar tu correo electrónico.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="bg-[#007BFF]/10 border-[#007BFF]/20 text-[#007BFF]">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Revisa tu email:</strong> Te hemos enviado un enlace de verificación a{" "}
            <span className="font-semibold">{"email"}</span>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-[#F8F9FA] rounded-lg p-4">
            <h4 className="font-semibold text-[#343A40] mb-2">Próximos pasos:</h4>
            <ol className="text-sm text-[#343A40]/70 space-y-1">
              <li>1. Revisa tu bandeja de entrada (y spam)</li>
              <li>2. Haz clic en el enlace de verificación</li>
              <li>3. Inicia sesión en tu cuenta</li>
            </ol>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/login")}
              className="text-[#343A40]/70 hover:text-[#007BFF]"
            >
              ¿Ya verificaste tu email? Iniciar sesión
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
