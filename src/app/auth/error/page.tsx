import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#343A40]">Error de Autenticación</CardTitle>
        <CardDescription className="text-[#343A40]/70">
          Ha ocurrido un error durante el proceso de autenticación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-[#343A40]/70">
          Por favor, intenta iniciar sesión nuevamente o contacta al administrador si el problema persiste.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button asChild className="w-full bg-[#007BFF] hover:bg-[#007BFF]/90 text-white">
          <Link href="/auth/login">
            Volver al inicio de sesión
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 