/**
 * Invoices Queries
 *
 * TanStack Query hooks for tenant invoices (GET /api/invoices).
 */

import { useQuery } from '@tanstack/react-query';
import type { InvoicesListResponse } from '@/types';
import { invoiceKeys } from './keys';

async function fetchInvoices(options?: {
  status?: 'PAID' | 'UNPAID';
}): Promise<InvoicesListResponse> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  const url = `/api/invoices${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch invoices (${response.status})`);
  }
  return response.json();
}

/**
 * Hook to fetch invoices for the current user (tenant).
 * @param options - Optional filter by status (e.g. UNPAID for pending)
 */
export function useInvoicesQuery(options?: { status?: 'PAID' | 'UNPAID' }) {
  return useQuery({
    queryKey: invoiceKeys.list(options?.status ? { status: options.status } : undefined),
    queryFn: () => fetchInvoices(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}
