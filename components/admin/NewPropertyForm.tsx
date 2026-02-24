'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastService } from '@/lib/errors/toast-service';
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
      onSuccess: () => {
        ToastService.success('Propiedad creada');
        router.push('/admin/properties');
      },
      onError: (err) => {
        ToastService.error(err instanceof Error ? err.message : 'Error al crear la propiedad');
      },
    });
  };

  return (
    <Card className="min-w-0">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg text-foreground sm:text-xl">Nueva propiedad</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Completa los datos de la propiedad</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
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
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">
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
              <p className="text-sm text-destructive" role="alert">
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
