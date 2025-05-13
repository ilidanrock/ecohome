"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import { useState } from "react"
import { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/forms/PasswordInput"
import { signInAction } from "@/actions/signIn"
import { signInSchema } from "@/zod/sign-in-schema"

export default function LoginPage() {
  const [error, setError] = useState<string>("")

  async function handleSubmit(formData: FormData) {
    try {

      await signInSchema.parseAsync({
        email: formData.get("email"),
        password: formData.get("password"),
      })

      await signInAction(formData)
    } catch (err) {
      const error = err as Error

      if (err instanceof ZodError && err.errors[0]?.message) {
        setError(err.errors[0].message)
      } else {
        setError(`${error.message.replace("Read more at https://errors.authjs.dev#credentialssignin", "")}`)
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md shadow-lg border-0 ">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-ecogreen" />
            <span className="text-2xl font-bold text-ecoblue">EcoHome</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-darkgray">Iniciar Sesión</CardTitle>
        <CardDescription className="text-darkgray/70">
          Accede a tu cuenta para gestionar tu consumo energético
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-darkgray">
                Contraseña
              </Label>
              <Link href="#" className="text-sm text-ecoblue hover:text-ecoblue/80 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <PasswordInput />
            <p className="text-xs text-gray-500">
              La contraseña debe tener entre 8 y 32 caracteres
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-ecoblue hover:bg-ecoblue/90 text-white">
            Iniciar Sesión
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-ecogreen text-ecogreen hover:bg-ecogreen/10"
          >
            Iniciar con Google
          </Button>
          <div className="text-center text-sm text-darkgray/70">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-ecogreen hover:text-ecogreen/80 font-medium">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
    </div>

  )
}

