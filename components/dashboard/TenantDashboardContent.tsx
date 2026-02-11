'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Zap, Droplets, FileText, BarChart3, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickStatsQuery, useInvoicesQuery } from '@/lib/queries';

const quickLinks = [
  { name: 'Mi Consumo', href: '/tenant/consumption', icon: BarChart3 },
  { name: 'Energía', href: '/tenant/energy', icon: Zap },
  { name: 'Agua', href: '/tenant/water', icon: Droplets },
  { name: 'Consejos', href: '/tenant/tips', icon: Lightbulb },
];

export function TenantDashboardContent() {
  const { data: session } = useSession();
  const { data: quickStats, isLoading: statsLoading, isError: statsError } = useQuickStatsQuery();
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError: invoicesError,
  } = useInvoicesQuery();

  const name = session?.user?.name ?? session?.user?.email ?? 'Usuario';
  const firstName = typeof name === 'string' ? name.split(/\s+/)[0] : 'Usuario';
  const unpaid = invoicesData?.invoices?.filter((i) => i.status === 'UNPAID') ?? [];
  const unpaidTotal = unpaid.reduce((sum, i) => sum + i.totalCost, 0);

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hola, {firstName}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Resumen de tu consumo y facturación
        </p>
      </section>

      {/* Grid: Consumo + Facturación */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card Consumo */}
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <Zap className="h-5 w-5 text-ecoblue" />
              Consumo del período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading && (
              <>
                <Skeleton className="mb-2 h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </>
            )}
            {statsError && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No se pudo cargar el consumo. Reintenta más tarde.
              </p>
            )}
            {!statsLoading && !statsError && quickStats && quickStats.length > 0 && (
              <>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {quickStats[0]?.value ?? 0} {quickStats[0]?.unit ?? 'kWh'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tendencia:{' '}
                  {quickStats[0]?.trend === 'up'
                    ? 'Subiendo'
                    : quickStats[0]?.trend === 'down'
                      ? 'Bajando'
                      : 'Estable'}
                </p>
              </>
            )}
            {!statsLoading && !statsError && quickStats && quickStats.length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aún no hay consumo registrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card Facturación */}
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
              <FileText className="h-5 w-5 text-ecogreen" />
              Estado de facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading && (
              <>
                <Skeleton className="mb-2 h-8 w-32" />
                <Skeleton className="h-4 w-40" />
              </>
            )}
            {invoicesError && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No se pudo cargar las facturas. Reintenta más tarde.
              </p>
            )}
            {!invoicesLoading && !invoicesError && unpaid.length > 0 && (
              <>
                <p className="text-slate-900 dark:text-slate-100">
                  Tienes {unpaid.length} factura{unpaid.length !== 1 ? 's' : ''} pendiente
                  {unpaid.length !== 1 ? 's' : ''} · S/ {unpaidTotal.toFixed(2)}
                </p>
                <Button asChild className="mt-2 bg-ecoblue hover:bg-ecoblue/90">
                  <Link href="/tenant/consumption">Ver / Pagar</Link>
                </Button>
              </>
            )}
            {!invoicesLoading &&
              !invoicesError &&
              unpaid.length === 0 &&
              invoicesData?.invoices &&
              invoicesData.invoices.length > 0 && (
                <p className="text-slate-600 dark:text-slate-400">Al día con tus pagos</p>
              )}
            {!invoicesLoading &&
              !invoicesError &&
              (!invoicesData?.invoices || invoicesData.invoices.length === 0) && (
                <p className="text-slate-600 dark:text-slate-400">Sin facturas registradas</p>
              )}
          </CardContent>
        </Card>
      </section>

      {/* Accesos rápidos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
