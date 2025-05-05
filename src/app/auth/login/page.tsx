import Link from "next/link"
import { Leaf } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/forms/PasswordInput"


export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-[#28A745]" />
            <span className="text-2xl font-bold text-[#007BFF]">EcoHome</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[#343A40]">Iniciar Sesión</CardTitle>
        <CardDescription className="text-[#343A40]/70">
          Accede a tu cuenta para gestionar tu consumo energético
        </CardDescription>
      </CardHeader>
      <form action="/api/login">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#343A40]">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@ejemplo.com"
              className="rounded-lg border-[#F8F9FA] bg-white focus:border-[#007BFF] focus:ring-[#007BFF]"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#343A40]">
                Contraseña
              </Label>
              <Link href="#" className="text-sm text-[#007BFF] hover:text-[#007BFF]/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <PasswordInput />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#007BFF]/90 text-white">
            Iniciar Sesión
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-[#28A745] text-[#28A745] hover:bg-[#28A745]/10"
          >
            Iniciar con Google
          </Button>
          <div className="text-center text-sm text-[#343A40]/70">
            ¿No tienes una cuenta?{" "}
            <Link href="#" className="text-[#28A745] hover:text-[#28A745]/80 font-medium">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

