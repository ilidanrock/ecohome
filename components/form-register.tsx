'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import { signUpSchema } from '@/zod/register-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerAction } from '@/actions/auth-action';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './forms/PasswordInput';
import { signIn } from 'next-auth/react';
import { GoogleIcon } from './icons/google';
import type { ErrorAuthTypes } from '@/types';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<ErrorAuthTypes | string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      surname: '',
      role: 'USER', // Default role
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    startTransition(async () => {
      setError(undefined);
      const res = await registerAction(values);
      console.log(res);

      if (!res.success) {
        setError(res.error);
        form.reset();
        return;
      }
      router.push('/register-success');
    });
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg border-0">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Juan"
                        required
                        className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Pérez"
                        required
                        className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@ejemplo.com"
                        required
                        className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue">
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Propietario</SelectItem>
                          <SelectItem value="USER">Inquilino</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        required
                        className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        required
                        className="rounded-lg border-lightgray bg-white focus:border-ecoblue focus:ring-ecoblue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-ecoblue hover:bg-ecoblue/90 text-white"
              disabled={isPending}
            >
              Crear cuenta
            </Button>
            <Button
              type="button"
              className="w-full border-ecogreen text-white hover:bg-ecoblue/90"
              onClick={() => signIn('google')}
            >
              <GoogleIcon className="h-4 w-4 " />
              Registrarse con Google
            </Button>
            <div className="text-center text-sm text-darkgray/70">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-ecogreen hover:text-ecogreen/80 font-medium">
                Iniciar sesión
              </Link>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
