'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/analytics': 'Estadísticas',
  '/admin/users': 'Usuarios',
  '/admin/properties': 'Propiedades',
  '/admin/properties/new': 'Nueva propiedad',
  '/admin/energy': 'Consumo Energético',
  '/admin/water': 'Gestión de Agua',
  '/admin/reports': 'Reportes',
  '/admin/alerts': 'Alertas',
  '/admin/notifications': 'Notificaciones',
  '/admin/settings': 'Configuración',
  '/admin/security': 'Seguridad',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return {
      name,
      path,
      isLast,
    };
  });

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-y-1 gap-x-1 text-sm">
        <li>
          <Link
            href="/admin/dashboard"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded p-0.5"
          >
            <Home className="h-4 w-4" aria-hidden />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.path} className="flex items-center gap-x-1 min-w-0">
            <ChevronRight
              className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden
            />
            {breadcrumb.isLast ? (
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.path}
                className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors truncate"
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
