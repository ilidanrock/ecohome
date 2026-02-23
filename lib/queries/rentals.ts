/**
 * Property rentals (tenants) queries and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalKeys, propertyKeys } from './keys';
import type { ErrorResponse } from '@/lib/errors/types';

export type PropertyRentalItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string | null;
};

async function fetchPropertyRentals(propertyId: string): Promise<PropertyRentalItem[]> {
  const res = await fetch(`/api/properties/${propertyId}/rentals`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Failed to fetch rentals (${res.status})`);
  }
  return res.json();
}

export function usePropertyRentalsQuery(propertyId: string | null) {
  return useQuery({
    queryKey: [...rentalKeys.lists(), 'byProperty', propertyId] as const,
    queryFn: () => fetchPropertyRentals(propertyId!),
    enabled: !!propertyId,
    staleTime: 60 * 1000,
  });
}

export type CreateRentalParams = {
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate?: Date | null;
};

async function createRental(params: CreateRentalParams): Promise<{ id: string }> {
  const res = await fetch('/api/rentals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId: params.propertyId,
      userId: params.userId,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate ? new Date(params.endDate).toISOString() : null,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Failed to create rental (${res.status})`;
    const err = new Error(message) as Error & { errorResponse?: ErrorResponse };
    if (
      body &&
      typeof body === 'object' &&
      'code' in body &&
      'message' in body &&
      'level' in body
    ) {
      err.errorResponse = body as ErrorResponse;
    }
    throw err;
  }
  return res.json();
}

export function useCreateRentalMutation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: Omit<CreateRentalParams, 'propertyId'>) =>
      createRental({ ...params, propertyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.all });
      queryClient.invalidateQueries({ queryKey: [...rentalKeys.lists(), 'byProperty', propertyId] });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

export type UpdateRentalParams = {
  rentalId: string;
  startDate?: Date;
  endDate?: Date | null;
};

async function updateRental(params: UpdateRentalParams): Promise<void> {
  const body: { startDate?: string; endDate?: string | null } = {};
  if (params.startDate !== undefined) body.startDate = params.startDate.toISOString();
  if (params.endDate !== undefined) body.endDate = params.endDate ? params.endDate.toISOString() : null;
  const res = await fetch(`/api/rentals/${params.rentalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Failed to update rental (${res.status})`;
    const err = new Error(message) as Error & { errorResponse?: ErrorResponse };
    if (
      body &&
      typeof body === 'object' &&
      'code' in body &&
      'message' in body &&
      'level' in body
    ) {
      err.errorResponse = body as ErrorResponse;
    }
    throw err;
  }
}

export function useUpdateRentalMutation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.all });
      queryClient.invalidateQueries({ queryKey: [...rentalKeys.lists(), 'byProperty', propertyId] });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

async function deleteRental(rentalId: string): Promise<void> {
  const res = await fetch(`/api/rentals/${rentalId}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Failed to delete rental (${res.status})`;
    const err = new Error(message) as Error & { errorResponse?: ErrorResponse };
    if (
      body &&
      typeof body === 'object' &&
      'code' in body &&
      'message' in body &&
      'level' in body
    ) {
      err.errorResponse = body as ErrorResponse;
    }
    throw err;
  }
}

export function useDeleteRentalMutation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalKeys.all });
      queryClient.invalidateQueries({ queryKey: [...rentalKeys.lists(), 'byProperty', propertyId] });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}
