'use client';

import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantRentalsQuery } from '@/lib/queries';
import { formatDate } from '@/lib/format';

export default function TenantPropertiesPage() {
  const { data: rentals, isLoading, isError } = useTenantRentalsQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Building2 className="h-5 w-5 text-ecoblue" />
            Mis propiedades asignadas
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Propiedades en las que estás registrado como inquilino y período de asignación.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No se pudo cargar la lista de propiedades. Reintenta más tarde.
            </p>
          )}
          {!isLoading && !isError && rentals && rentals.length === 0 && (
            <p className="text-slate-600 dark:text-slate-400">
              Aún no tienes propiedades asignadas. Contacta al administrador para que te asigne una.
            </p>
          )}
          {!isLoading && !isError && rentals && rentals.length > 0 && (
            <ul className="space-y-4">
              {rentals.map((r) => (
                <li
                  key={r.rentalId}
                  className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-ecoblue" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {r.propertyName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {r.propertyAddress}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        Asignado desde {formatDate(r.startDate)}
                        {r.endDate ? ` hasta ${formatDate(r.endDate)}` : ' (vigente)'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
