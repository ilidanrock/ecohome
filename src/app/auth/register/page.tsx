"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import { useActionState } from "react"
import { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/forms/PasswordInput"

import { signUpSchema } from "@/zod/sign-up-schema"

export default function RegisterPage() {
  const [error, formAction] = useActionState<string | undefined, FormData>(
    async (prevState, formData) => {
      try {
        await signUpSchema.parseAsync({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        })

        return ""
      } catch (err) {
        const error = err as Error

        if (err instanceof ZodError && err.errors[0]?.message) {
          return err.errors[0].message
        } else {
          return `${error.message.replace("Read more at https://errors.authjs.dev#credentialssignin", "")}`
        }
      }
    },
    ""
  )

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-ecogreen" />
              <span className="text-2xl font-bold text-ecoblue">EcoHome</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-darkgray">Crear cuenta</CardTitle>
          <CardDescription className="text-darkgray/70">
            Regístrate para comenzar a gestionar tu consumo energético
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-darkgray">
                Nombre completo
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan Pérez"
                className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-darkgray">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@ejemplo.com"
                className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-darkgray">
                Contraseña
              </Label>
              <PasswordInput />
              <p className="text-xs text-gray-500">
                La contraseña debe tener entre 8 y 32 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-darkgray">
                Confirmar contraseña
              </Label>
              <PasswordInput name="confirmPassword" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-ecoblue hover:bg-ecoblue/90 text-white">
              Crear cuenta
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-ecogreen text-ecogreen hover:bg-ecogreen/10"
            >
              Registrarse con Google
            </Button>
            <div className="text-center text-sm text-darkgray/70">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="text-ecogreen hover:text-ecogreen/80 font-medium">
                Iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
