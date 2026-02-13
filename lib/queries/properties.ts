/**
 * Properties Queries
 *
 * TanStack Query hooks for admin properties (GET/POST /api/properties).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyListItem, PropertiesListResponse } from '@/types';
import { propertyKeys } from './keys';

async function fetchProperties(): Promise<PropertiesListResponse> {
  const response = await fetch('/api/properties', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Failed to fetch properties (${response.status})`
    );
  }
  return response.json();
}

/**
 * Hook to fetch properties managed by the current admin.
 */
export function usePropertiesQuery() {
  return useQuery({
    queryKey: propertyKeys.list(),
    queryFn: fetchProperties,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

async function createProperty(body: { name: string; address: string }): Promise<PropertyListItem> {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Failed to create property (${response.status})`
    );
  }
  return response.json();
}

/**
 * Hook to create a property (admin). Invalidates properties list on success.
 */
export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}
