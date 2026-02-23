'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Pencil, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyQuery, useUpdatePropertyMutation } from '@/lib/queries';
import { updatePropertySchema } from '@/zod/property-schemas';

export function AdminPropertyDetail({ propertyId }: { propertyId: string }) {
  const { data: property, isLoading, isError } = usePropertyQuery(propertyId);
  const updateMutation = useUpdatePropertyMutation(propertyId);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (property) {
      setName(property.name);
      setAddress(property.address);
    }
  }, [property]);

  const handleSave = () => {
    const result = updatePropertySchema.safeParse({ name: name.trim(), address: address.trim() });
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setNameError(fieldErrors.name?.[0] ?? null);
      setAddressError(fieldErrors.address?.[0] ?? null);
      return;
    }
    setNameError(null);
    setAddressError(null);
    updateMutation.mutate(result.data, {
      onSuccess: () => {
        // Data is invalidated and refetched by the mutation
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : 'Error al guardar');
      },
    });
  };

  const hasChanges =
    property && (name.trim() !== property.name || address.trim() !== property.address);

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
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
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
            No se pudo cargar la propiedad o no tienes permiso para verla.
          </p>
          <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
            <Link href="/admin/properties">Volver a propiedades</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/admin/properties" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/admin/properties/${propertyId}/edit`} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Ir al formulario de edición
          </Link>
        </Button>
      </div>

      <Card className="min-w-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100 sm:text-xl">
            <Building2 className="h-5 w-5 text-ecoblue" />
            Detalle de la propiedad
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Actualiza nombre o dirección aquí y guarda los cambios
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="space-y-2">
            <Label htmlFor="detail-name" className="text-slate-700 dark:text-slate-300">
              Nombre
            </Label>
            <Input
              id="detail-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Ej. Edificio Norte"
              className="w-full"
              autoComplete="off"
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {nameError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-address" className="text-slate-700 dark:text-slate-300">
              Dirección
            </Label>
            <Input
              id="detail-address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (addressError) setAddressError(null);
              }}
              placeholder="Ej. Av. Principal 123"
              className="w-full"
              autoComplete="off"
              aria-invalid={!!addressError}
            />
            {addressError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {addressError}
              </p>
            )}
          </div>
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Creado: {formatDate(property.createdAt)} · Última actualización:{' '}
              {formatDate(property.updatedAt)}
            </p>
          </div>
          {hasChanges && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setName(property.name);
                  setAddress(property.address);
                  setNameError(null);
                  setAddressError(null);
                }}
                disabled={updateMutation.isPending}
              >
                Deshacer
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          )}
          {!hasChanges && updateMutation.isSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400">Cambios guardados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
