'use client';

import Link from 'next/link';
import { Building2, Pencil, Plus } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertiesQuery, useDeletePropertyMutation } from '@/lib/queries';
import type { PropertyListItem } from '@/types';

function PropertyCard({ p }: { p: PropertyListItem }) {
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base text-slate-900 dark:text-slate-100">
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-ecoblue" />
            {p.name}
          </span>
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href={`/admin/properties/${p.id}/edit`} aria-label={`Editar ${p.name}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <p>{p.address}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Creado: {formatDate(p.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}

function PropertyRow({ p }: { p: PropertyListItem }) {
  const deleteMutation = useDeletePropertyMutation(p.id);

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la propiedad "${p.name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(undefined, {
        onError: (err) => {
          alert(err instanceof Error ? err.message : 'Error al eliminar');
        },
      });
    }
  };

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.address}</td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500">
        {formatDate(p.createdAt)}
      </td>
      <td className="px-4 py-3 flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/properties/${p.id}/edit`}>Editar</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
        </Button>
      </td>
    </tr>
  );
}

export function AdminPropertiesContent() {
  const { data, isLoading, isError } = usePropertiesQuery();
  const properties = data?.properties ?? [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Propiedades</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gestiona las propiedades que administras
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/admin/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva propiedad
          </Link>
        </Button>
      </section>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="py-6">
            <p className="text-amber-700 dark:text-amber-400">
              Error al cargar propiedades. Intenta de nuevo.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && properties.length === 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No hay propiedades. Crea la primera.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva propiedad
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && properties.length > 0 && (
        <>
          {/* Mobile/tablet: cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {properties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden lg:block border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Fecha creación
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-20">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <PropertyRow key={p.id} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
