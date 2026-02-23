'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyQuery, useUpdatePropertyMutation } from '@/lib/queries';
import { updatePropertySchema, type UpdatePropertyInput } from '@/zod/property-schemas';

export function EditPropertyForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const { data: property, isLoading, isError } = usePropertyQuery(propertyId);
  const updateMutation = useUpdatePropertyMutation(propertyId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePropertyInput>({
    resolver: zodResolver(updatePropertySchema),
    values: property ? { name: property.name, address: property.address } : undefined,
    defaultValues: { name: '', address: '' },
  });

  const onSubmit = (data: UpdatePropertyInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => router.push('/admin/properties'),
    });
  };

  if (isLoading || !property) {
    return (
      <Card className="min-w-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-10 w-24 flex-1 sm:flex-none" />
            <Skeleton className="h-10 w-32 flex-1 sm:flex-none" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="min-w-0 border-amber-200 dark:border-amber-800">
        <CardContent className="px-4 py-6 sm:px-6">
          <p className="text-amber-700 dark:text-amber-400">
            No se pudo cargar la propiedad o no tienes permiso para editarla.
          </p>
          <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
            <Link href="/admin/properties">Volver a propiedades</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg text-slate-900 dark:text-slate-100 sm:text-xl">
          Editar propiedad
        </CardTitle>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Modifica el nombre o la dirección
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
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
