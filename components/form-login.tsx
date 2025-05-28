"use client"

import React, {  useState, useTransition } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { loginAction } from '@/actions/auth-action'
import { loginSchema } from '@/zod/login-schema'
import { useRouter } from 'next/navigation';
import { getSession } from "next-auth/react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Leaf } from 'lucide-react'
import Link from 'next/link'


function FormLogin() {

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
    const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    
  })

    async function onSubmit(values: z.infer<typeof loginSchema>) {
  
      startTransition(async() => {
        
        setError(null)
        const res = await loginAction(values)
        const session = await getSession()

        
        if (res === "Invalid credentials" || res === "An error occurred during sign in") {
          setError(res)
              form.reset()
          return
        }else{
          if (session?.user.role === "ADMIN") {
            console.log("Admin logged in")
            router.push("/admin")
            form.reset()
          }
          else if (session?.user.role === "USER") {
            console.log("User logged in")
              router.push("/dashboard")
              form.reset()
          }
           else {
            console.log("No session found")
          }

        }
      })
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                id="email"

              type="email"
              placeholder="tu@ejemplo.com"
              className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
              required
              {...field}
                 />
              </FormControl>
              <FormDescription>
                This is the email you will use to login.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                This is the password you will use to login.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
          <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-ecoblue hover:bg-ecoblue/90 text-white" disabled={isPending} >
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
            <Link href="/register" className="text-ecogreen hover:text-ecogreen/80 font-medium">
              Regístrate
            </Link>
          </div>
        </CardFooter>
        {error && (
          <FormMessage className="text-red-500">
            {error}
          </FormMessage>
        )}
      </form>
    </Form>
    </Card>
    </div>



  )
}

export default FormLogin