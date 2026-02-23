'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePropertyMutation } from '@/lib/queries';
import { createPropertySchema, type CreatePropertyInput } from '@/zod/property-schemas';

export function NewPropertyForm() {
  const router = useRouter();
  const createMutation = useCreatePropertyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: { name: '', address: '' },
  });

  const onSubmit = (data: CreatePropertyInput) => {
    createMutation.mutate(data, {
      onSuccess: () => router.push('/admin/properties'),
    });
  };

  return (
    <Card className="min-w-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg text-slate-900 dark:text-slate-100 sm:text-xl">
          Nueva propiedad
        </CardTitle>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Completa los datos de la propiedad
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
              Nombre
            </Label>
            <Input
              id="name"
              placeholder="Ej. Edificio Norte"
              {...register('name')}
              className="w-full"
              autoComplete="off"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">
              Dirección
            </Label>
            <Input
              id="address"
              placeholder="Ej. Av. Principal 123"
              {...register('address')}
              className="w-full"
              autoComplete="off"
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push('/admin/properties')}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando…' : 'Crear propiedad'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
