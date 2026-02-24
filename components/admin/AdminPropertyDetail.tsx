'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePropertyQuery,
  useUpdatePropertyMutation,
  usePropertyRentalsQuery,
  useCreateRentalMutation,
  useUpdateRentalMutation,
  useDeleteRentalMutation,
} from '@/lib/queries';
import type { UserSearchResult } from '@/lib/queries';
import { ToastService } from '@/lib/errors/toast-service';
import { updatePropertySchema } from '@/zod/property-schemas';
import { TenantCombobox } from './TenantCombobox';
import { DatePickerField } from './DatePickerField';

export function AdminPropertyDetail({ propertyId }: { propertyId: string }) {
  const { data: property, isLoading, isError } = usePropertyQuery(propertyId);
  const updateMutation = useUpdatePropertyMutation(propertyId);
  const { data: rentals = [], isLoading: rentalsLoading } = usePropertyRentalsQuery(propertyId);
  const createRentalMutation = useCreateRentalMutation(propertyId);
  const updateRentalMutation = useUpdateRentalMutation(propertyId);
  const deleteRentalMutation = useDeleteRentalMutation(propertyId);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<UserSearchResult | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState('');
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [confirmUnassignRental, setConfirmUnassignRental] = useState<{
    id: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (property) {
      setName(property.name);
      setAddress(property.address);
    }
  }, [property]);

  const hasPropertyChanges =
    property && (name.trim() !== property.name || address.trim() !== property.address);

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPropertyChanges) return;
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
        ToastService.success('Propiedad actualizada');
      },
      onError: (err) => {
        ToastService.error(err instanceof Error ? err.message : 'Error al guardar');
      },
    });
  };

  const canAddRental = selectedTenant !== null && startDate.trim() !== '';
  const handleAddRental = () => {
    if (!canAddRental) return;
    createRentalMutation.mutate(
      {
        userId: selectedTenant!.id,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      {
        onSuccess: () => {
          setSelectedTenant(null);
          setEndDate('');
          const d = new Date();
          setStartDate(d.toISOString().slice(0, 10));
          ToastService.success('Inquilino asignado');
        },
        onError: (err) => {
          ToastService.error(err instanceof Error ? err.message : 'Error al asignar inquilino');
        },
      }
    );
  };

  const handleRevert = () => {
    if (property) {
      setName(property.name);
      setAddress(property.address);
      setNameError(null);
      setAddressError(null);
    }
  };

  const startEdit = (r: { id: string; startDate: string; endDate: string | null }) => {
    setEditingRentalId(r.id);
    setEditStartDate(r.startDate.slice(0, 10));
    setEditEndDate(r.endDate ? r.endDate.slice(0, 10) : '');
  };

  const cancelEdit = () => {
    setEditingRentalId(null);
  };

  const saveEdit = () => {
    if (!editingRentalId) return;
    updateRentalMutation.mutate(
      {
        rentalId: editingRentalId,
        startDate: new Date(editStartDate),
        endDate: editEndDate ? new Date(editEndDate) : null,
      },
      {
        onSuccess: () => {
          setEditingRentalId(null);
          ToastService.success('Fechas actualizadas');
        },
        onError: (err) => {
          ToastService.error(err instanceof Error ? err.message : 'Error al actualizar fechas');
        },
      }
    );
  };

  const openUnassignConfirm = (r: { id: string; userName: string }) => {
    setConfirmUnassignRental(r);
  };

  const confirmUnassign = () => {
    if (!confirmUnassignRental) return;
    const { id } = confirmUnassignRental;
    setConfirmUnassignRental(null);
    deleteRentalMutation.mutate(id, {
      onSuccess: () => {
        ToastService.success('Asignación dada de baja');
      },
      onError: (err) => {
        ToastService.error(err instanceof Error ? err.message : 'Error al dar de baja');
      },
    });
  };

  if (isLoading || !property) {
    return (
      <Card className="min-w-0">
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
      </div>

      <Card className="min-w-0 w-full">
        <form onSubmit={handlePropertySubmit} className="min-w-0">
          <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground sm:text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Detalle de la propiedad
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Edita nombre y dirección aquí. Para añadir o editar inquilinos, usa la sección más
              abajo.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="detail-name" className="text-foreground">
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
                  <p className="text-sm text-destructive" role="alert">
                    {nameError}
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="detail-address" className="text-foreground">
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
                  <p className="text-sm text-destructive" role="alert">
                    {addressError}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Creado: {formatDate(property.createdAt)} · Última actualización:{' '}
              {formatDate(property.updatedAt)}
            </p>

            <div className="space-y-3">
              <Label className="text-foreground">Inquilinos asignados</Label>
              {rentalsLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
              {!rentalsLoading && rentals.length > 0 && (
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
                      {rentals.map((r) => {
                        const isEditing = editingRentalId === r.id;
                        const isBusy =
                          (isEditing && updateRentalMutation.isPending) ||
                          deleteRentalMutation.isPending;
                        return (
                          <tr key={r.id} className="border-b border-border last:border-0">
                            <td className="px-2 py-2 text-foreground sm:px-3">
                              <span className="block truncate" title={r.userName}>
                                {r.userName}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-muted-foreground sm:px-3">
                              <span className="block truncate" title={r.userEmail}>
                                {r.userEmail}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-muted-foreground sm:px-3">
                              {isEditing ? (
                                <DatePickerField
                                  value={editStartDate ? new Date(editStartDate) : null}
                                  onChange={(d) =>
                                    setEditStartDate(d ? d.toISOString().slice(0, 10) : '')
                                  }
                                  disabled={updateRentalMutation.isPending}
                                  placeholder="Desde"
                                  className="h-9 w-full max-w-full"
                                />
                              ) : (
                                <span className="block truncate">{formatDate(r.startDate)}</span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-muted-foreground sm:px-3">
                              {isEditing ? (
                                <DatePickerField
                                  value={editEndDate ? new Date(editEndDate) : null}
                                  onChange={(d) =>
                                    setEditEndDate(d ? d.toISOString().slice(0, 10) : '')
                                  }
                                  disabled={updateRentalMutation.isPending}
                                  placeholder="Hasta (opcional)"
                                  className="h-9 w-full max-w-full"
                                />
                              ) : (
                                <span className="block truncate">
                                  {r.endDate ? formatDate(r.endDate) : '—'}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-right sm:px-3">
                              {isEditing ? (
                                <div className="flex flex-shrink-0 justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    className="h-8 w-8 shrink-0 p-0"
                                    onClick={saveEdit}
                                    disabled={updateRentalMutation.isPending}
                                    title="Guardar"
                                    aria-label="Guardar cambios"
                                  >
                                    {updateRentalMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 shrink-0 p-0"
                                    onClick={cancelEdit}
                                    disabled={updateRentalMutation.isPending}
                                    title="Cancelar"
                                    aria-label="Cancelar edición"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-shrink-0 justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 p-0"
                                    onClick={() => startEdit(r)}
                                    disabled={isBusy}
                                    title="Editar fechas"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 p-0 text-destructive hover:text-destructive"
                                    onClick={() => openUnassignConfirm(r)}
                                    disabled={isBusy}
                                    title="Dar de baja"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!rentalsLoading && rentals.length === 0 && (
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
                    excludedUserIds={rentals.map((r) => r.userId)}
                    placeholder="Buscar por nombre o email..."
                    disabled={updateMutation.isPending || createRentalMutation.isPending}
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
                    disabled={updateMutation.isPending || createRentalMutation.isPending}
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
                    disabled={updateMutation.isPending || createRentalMutation.isPending}
                    placeholder="Opcional"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddRental}
                  disabled={!canAddRental || createRentalMutation.isPending}
                  className="w-full sm:w-auto shrink-0"
                >
                  {createRentalMutation.isPending ? (
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

            {hasPropertyChanges && (
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleRevert}
                  disabled={updateMutation.isPending}
                >
                  Deshacer
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            )}
          </CardContent>
        </form>
      </Card>

      <ConfirmDialog
        open={!!confirmUnassignRental}
        onOpenChange={(open) => !open && setConfirmUnassignRental(null)}
        title="Dar de baja asignación"
        description={
          confirmUnassignRental
            ? `¿Dar de baja la asignación de ${confirmUnassignRental.userName}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        onConfirm={confirmUnassign}
        loading={deleteRentalMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
