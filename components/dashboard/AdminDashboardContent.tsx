'use client';

import Link from 'next/link';
import { Zap, Droplets, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useElectricityBillsQuery, useWaterBillsQuery } from '@/lib/queries';

const quickLinks = [
  { name: 'Consumo Energético', href: '/admin/energy', icon: Zap },
  { name: 'Gestión de Agua', href: '/admin/water', icon: Droplets },
  { name: 'Reportes', href: '/admin/reports', icon: FileText },
];

const MAX_RECENT_ITEMS = 10;

function formatPeriod(periodStart: string, periodEnd: string): string {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  return `${start.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function AdminDashboardContent() {
  const {
    data: electricityData,
    isLoading: elecLoading,
    isError: elecError,
  } = useElectricityBillsQuery();
  const { data: waterData, isLoading: waterLoading, isError: waterError } = useWaterBillsQuery();

  const electricityBills = electricityData?.electricityBills ?? [];
  const waterBills = waterData?.waterBills ?? [];

  const recentElectricity = electricityBills.slice(0, 5).map((b) => ({
    type: 'electricity' as const,
    id: b.id,
    periodStart: b.periodStart,
    periodEnd: b.periodEnd,
    label: 'Luz',
    cost: b.totalCost,
    extra: `${b.totalKWh} kWh`,
  }));
  const recentWater = waterBills.slice(0, 5).map((b) => ({
    type: 'water' as const,
    id: b.id,
    periodStart: b.periodStart,
    periodEnd: b.periodEnd,
    label: 'Agua',
    cost: b.totalCost,
    extra: `${b.totalConsumption} m³`,
  }));
  const recentBills = [...recentElectricity, ...recentWater]
    .sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime())
    .slice(0, MAX_RECENT_ITEMS);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Panel de administración
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Resumen de facturas de luz y agua</p>
      </section>

      {/* Cards resumen */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <Zap className="h-5 w-5 text-ecoblue" />
              Facturas de luz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {elecLoading && <Skeleton className="h-8 w-32" />}
            {elecError && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Error al cargar facturas de luz.
              </p>
            )}
            {!elecLoading && !elecError && (
              <p className="text-slate-900 dark:text-slate-100">
                {electricityBills.length} período{electricityBills.length !== 1 ? 's' : ''} cargado
                {electricityBills.length !== 1 ? 's' : ''}
                {electricityBills.length > 0 && (
                  <span className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                    Último:{' '}
                    {formatPeriod(electricityBills[0].periodStart, electricityBills[0].periodEnd)} ·
                    S/ {electricityBills[0].totalCost.toFixed(2)}
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <Droplets className="h-5 w-5 text-ecogreen" />
              Facturas de agua
            </CardTitle>
          </CardHeader>
          <CardContent>
            {waterLoading && <Skeleton className="h-8 w-32" />}
            {waterError && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Error al cargar facturas de agua.
              </p>
            )}
            {!waterLoading && !waterError && (
              <p className="text-slate-900 dark:text-slate-100">
                {waterBills.length} período{waterBills.length !== 1 ? 's' : ''} cargado
                {waterBills.length !== 1 ? 's' : ''}
                {waterBills.length > 0 && (
                  <span className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                    Último: {formatPeriod(waterBills[0].periodStart, waterBills[0].periodEnd)} · S/{' '}
                    {waterBills[0].totalCost.toFixed(2)}
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Últimos períodos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Últimos períodos
        </h2>
        {(elecLoading || waterLoading) && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {!elecLoading && !waterLoading && recentBills.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Aún no hay facturas de luz ni agua cargadas.
          </p>
        )}
        {!elecLoading && !waterLoading && recentBills.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Período
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Detalle
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentBills.map((b) => (
                    <tr key={`${b.type}-${b.id}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                        {formatPeriod(b.periodStart, b.periodEnd)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {b.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {b.extra}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                        S/ {b.cost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                variant="outline"
                className="h-auto flex-col gap-2 border-slate-200 py-4 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                asChild
              >
                <Link href={link.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{link.name}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
