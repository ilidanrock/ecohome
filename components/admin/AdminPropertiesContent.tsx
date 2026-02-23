'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Pencil, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertiesQuery, useDeletePropertyMutation } from '@/lib/queries';
import type { PropertyListItem } from '@/types';

const PAGE_SIZE = 10;

function PropertyCard({ p }: { p: PropertyListItem }) {
  return (
    <Card className="min-w-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle className="flex items-start justify-between gap-2 text-base text-slate-900 dark:text-slate-100">
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-5 w-5 shrink-0 text-ecoblue" />
            <span className="truncate">{p.name}</span>
          </span>
          <Button asChild variant="ghost" size="sm" className="h-9 min-h-9 w-9 shrink-0 p-0 sm:h-auto sm:min-h-0 sm:w-auto sm:p-2" aria-label={`Editar ${p.name}`}>
            <Link href={`/admin/properties/${p.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 sm:px-6 sm:pb-6">
        <p className="line-clamp-2 break-words">{p.address}</p>
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
      <td className="min-w-[120px] px-3 py-3 font-medium text-slate-900 dark:text-slate-100 lg:px-4">
        <span className="block truncate max-w-[180px]" title={p.name}>{p.name}</span>
      </td>
      <td className="min-w-[140px] px-3 py-3 text-slate-600 dark:text-slate-400 lg:px-4">
        <span className="block truncate max-w-[220px]" title={p.address}>{p.address}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500 dark:text-slate-500 lg:px-4">
        {formatDate(p.createdAt)}
      </td>
      <td className="whitespace-nowrap px-3 py-3 lg:px-4">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 min-w-0 px-2 text-xs sm:text-sm">
            <Link href={`/admin/properties/${p.id}/edit`}>Editar</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 min-w-0 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 sm:text-sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '…' : 'Eliminar'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="hidden lg:block border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:px-4">
                Nombre
              </th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:px-4">
                Dirección
              </th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 lg:px-4">
                Fecha creación
              </th>
              <th className="px-3 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-20 lg:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <td className="px-3 py-3 lg:px-4">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="px-3 py-3 lg:px-4">
                  <Skeleton className="h-5 w-40" />
                </td>
                <td className="px-3 py-3 lg:px-4">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="px-3 py-3 lg:px-4">
                  <Skeleton className="h-8 w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AdminPropertiesContent() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  const { data, isLoading, isError } = usePropertiesQuery({
    page,
    limit: PAGE_SIZE,
    search: searchApplied || undefined,
  });

  const properties = data?.properties ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchApplied(searchInput.trim());
    setPage(1);
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-w-0 space-y-6">
      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            Propiedades
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gestiona las propiedades que administras
          </p>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/admin/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva propiedad
          </Link>
        </Button>
      </section>

      <section className="min-w-0">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full flex-col gap-2 sm:flex-row sm:max-w-md"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por nombre o dirección..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-w-0 pl-9"
              aria-label="Buscar propiedades"
            />
          </div>
          <Button type="submit" variant="secondary" size="default" className="w-full sm:w-auto">
            Buscar
          </Button>
        </form>
      </section>

      {isLoading && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
            {Array.from({ length: 5 }).map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl sm:h-32" />
            ))}
          </div>
          <TableSkeleton rows={PAGE_SIZE} />
        </>
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
              {searchApplied ? 'No hay resultados para tu búsqueda.' : 'No hay propiedades. Crea la primera.'}
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
          <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-2 sm:gap-4 lg:hidden">
            {properties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>

          <Card className="hidden lg:block border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:px-4">
                      Nombre
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:px-4">
                      Dirección
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 lg:px-4">
                      Fecha creación
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-20 lg:px-4">
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

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {from}–{to} de {total}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="h-9 min-w-0 shrink-0 px-2 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
                Anterior
              </Button>
              <span className="shrink-0 text-sm text-slate-600 dark:text-slate-400 px-1 sm:px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page >= totalPages}
                aria-label="Página siguiente"
                className="h-9 min-w-0 shrink-0 px-2 sm:px-3"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
