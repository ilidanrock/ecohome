"use client";

import {  useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { loginAction } from "@/actions/auth-action";
import { loginSchema } from "@/zod/login-schema";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "./forms/PasswordInput";
import { Session } from "next-auth";
import { GoogleIcon } from "./icons/google";

enum Error {
  InvalidCredentials = "Contraseña invalida",
  VerifyEmail = "Verifica tu correo",
  InvalidEmail = "Email no encontrado",
  UserGoogle = "Usuario registrado con Google"
}

export function FormLogin() {
  const [error, setError] = useState<string | null | undefined>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();


  

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  

  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === 'true'
  const allErrorValues = Object.values(Error) as string[] ;

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      setError(null);
      const res = await loginAction(values);

      
      
      if ( allErrorValues.includes(res as string)) {
        setError(res);
        form.reset();
        return;
      }
      const session = await getSession() as Session
      
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
        form.reset();
      }
      if (session?.user?.role === "USER") {
        router.push("/dashboard");
        form.reset();
      }
    });
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
          <CardTitle className="text-2xl font-bold text-darkgray">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-darkgray/70">
            Accede a tu cuenta para gestionar tu consumo energético
          </CardDescription>
          {verified && (
          <div className="mx-6 mb-4">
            <div className="bg-ecogreen/10 border border-ecogreen/20 text-ecogreen rounded-lg p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">¡Correo verificado exitosamente!</p>
                <p className="text-xs text-ecogreen/80 mt-1">Ya puedes iniciar sesión con tu cuenta</p>
              </div>
            </div>
          </div>
        )}
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-6 py-4"
          >
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
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the password you will use to login.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-ecoblue hover:bg-ecoblue/90 text-white"
                disabled={isPending}
              >
                Iniciar Sesión
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-ecogreen text-ecogreen hover:bg-ecogreen/10"
                onClick={() => {

                    signIn("google")

                }}
              >
                <GoogleIcon className="h-4 w-4 " />
                Iniciar con Google
              </Button>
              <div className="text-center text-sm text-darkgray/70">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/register"
                  className="text-ecogreen hover:text-ecogreen/80 font-medium"
                >
                  Regístrate
                </Link>
              </div>
            </CardFooter>
            {error && (
              <FormMessage className="text-red-500">{error}</FormMessage>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default FormLogin;
