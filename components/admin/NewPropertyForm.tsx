'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Building2, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastService } from '@/lib/errors/toast-service';
import { useCreatePropertyMutation, createRental } from '@/lib/queries';
import { rentalKeys, propertyKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import { createPropertySchema, type CreatePropertyInput } from '@/zod/property-schemas';
import { formatDate } from '@/lib/format';
import { TenantCombobox } from './TenantCombobox';
import { DatePickerField } from './DatePickerField';
import type { UserSearchResult } from '@/lib/queries';

type TenantAssignment = {
  userId: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
};

export function NewPropertyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useCreatePropertyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: { name: '', address: '' },
  });

  const [assignments, setAssignments] = useState<TenantAssignment[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<UserSearchResult | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState('');

  const canAddRental = selectedTenant !== null && startDate.trim() !== '';
  const addAssignment = () => {
    if (!canAddRental) return;
    const userName =
      [selectedTenant!.name, selectedTenant!.surname].filter(Boolean).join(' ').trim() ||
      selectedTenant!.email;
    setAssignments((prev) => [
      ...prev,
      {
        userId: selectedTenant!.id,
        userName,
        userEmail: selectedTenant!.email,
        startDate,
        endDate,
      },
    ]);
    setSelectedTenant(null);
    setEndDate('');
    const d = new Date();
    setStartDate(d.toISOString().slice(0, 10));
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePropertyInput) => {
    createMutation.mutate(data, {
      async onSuccess(createdProperty) {
        const { id: propertyId } = createdProperty;
        if (assignments.length === 0) {
          ToastService.success('Propiedad creada');
          router.push('/admin/properties');
          return;
        }
        try {
          for (const a of assignments) {
            await createRental({
              propertyId,
              userId: a.userId,
              startDate: new Date(a.startDate),
              endDate: a.endDate ? new Date(a.endDate) : null,
            });
          }
          queryClient.invalidateQueries({ queryKey: rentalKeys.all });
          queryClient.invalidateQueries({ queryKey: propertyKeys.all });
          ToastService.success(
            assignments.length === 1
              ? 'Propiedad creada con 1 inquilino asignado'
              : `Propiedad creada con ${assignments.length} inquilinos asignados`
          );
        } catch (err) {
          ToastService.error(err instanceof Error ? err.message : 'Error al asignar inquilinos');
        }
        router.push('/admin/properties');
      },
      onError: (err) => {
        ToastService.error(err instanceof Error ? err.message : 'Error al crear la propiedad');
      },
    });
  };

  const { isPending } = createMutation;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/admin/properties" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </div>

      <Card className="min-w-0 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
          <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground sm:text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Nueva propiedad
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa los datos de la propiedad y, si quieres, asigna inquilinos desde ya.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
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
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
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
                  disabled={isPending}
                />
                {errors.address && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Se registrará la fecha de creación al guardar.
            </p>

            <div className="space-y-3">
              <Label className="text-foreground">Inquilinos asignados</Label>
              {assignments.length > 0 ? (
                <div className="min-w-0 rounded-md border border-border">
                  <table className="w-full min-w-0 table-fixed text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="w-[18%] px-2 py-2 font-semibold text-foreground sm:px-3">
                          Nombre
                        </th>
                        <th className="w-[18%] px-2 py-2 font-semibold text-foreground sm:px-3">
                          Email
                        </th>
                        <th className="w-[26%] px-2 py-2 font-semibold text-muted-foreground sm:px-3">
                          Desde
                        </th>
                        <th className="w-[26%] px-2 py-2 font-semibold text-muted-foreground sm:px-3">
                          Hasta
                        </th>
                        <th className="w-[12%] px-2 py-2 font-semibold text-muted-foreground text-right sm:px-3">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => (
                        <tr
                          key={`${a.userId}-${a.startDate}-${i}`}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-2 py-2 text-foreground sm:px-3">
                            <span className="block truncate" title={a.userName}>
                              {a.userName}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground sm:px-3">
                            <span className="block truncate" title={a.userEmail}>
                              {a.userEmail}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground sm:px-3">
                            <span className="block truncate">{formatDate(a.startDate)}</span>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground sm:px-3">
                            <span className="block truncate">
                              {a.endDate ? formatDate(a.endDate) : '—'}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right sm:px-3">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeAssignment(i)}
                              disabled={isPending}
                              title="Quitar"
                              aria-label="Quitar inquilino"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay inquilinos asignados. Usa el bloque «Nueva asignación» de abajo para
                  añadir uno.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
              <div>
                <Label className="text-base font-medium text-foreground">Nueva asignación</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Añade un inquilino a esta propiedad: elige el usuario, la fecha de inicio y, si
                  quieres, la de fin. Solo aparecen usuarios que aún no están asignados.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                <div className="min-w-0 space-y-2">
                  <Label className="text-foreground">Inquilino</Label>
                  <TenantCombobox
                    value={selectedTenant}
                    onSelect={setSelectedTenant}
                    excludedUserIds={assignments.map((a) => a.userId)}
                    placeholder="Buscar por nombre o email..."
                    disabled={isPending}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="rental-start" className="text-foreground">
                    Desde
                  </Label>
                  <DatePickerField
                    id="rental-start"
                    value={startDate ? new Date(startDate) : null}
                    onChange={(d) => setStartDate(d ? d.toISOString().slice(0, 10) : '')}
                    disabled={isPending}
                    placeholder="Elegir fecha"
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="rental-end" className="text-foreground">
                    Hasta (opcional)
                  </Label>
                  <DatePickerField
                    id="rental-end"
                    value={endDate ? new Date(endDate) : null}
                    onChange={(d) => setEndDate(d ? d.toISOString().slice(0, 10) : '')}
                    disabled={isPending}
                    placeholder="Opcional"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addAssignment}
                  disabled={!canAddRental || isPending}
                  className="w-full sm:w-auto shrink-0"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Añadiendo…
                    </>
                  ) : (
                    'Añadir inquilino'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push('/admin/properties')}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando…
                  </>
                ) : (
                  'Crear propiedad'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
