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
    <div className="max-w-sm">
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@gmail.com" {...field} />
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
        <Button type="submit" aria-disabled={isPending}>Submit</Button>
        {error && (
          <FormMessage className="text-red-500">
            {error}
          </FormMessage>
        )}
      </form>
    </Form>
    </div>

  )
}

export default FormLogin