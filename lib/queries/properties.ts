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

async function fetchProperty(id: string): Promise<PropertyListItem> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Failed to fetch property (${response.status})`
    );
  }
  return response.json();
}

/**
 * Hook to fetch a single property by id (admin). Only returns if current user is admin of the property.
 */
export function usePropertyQuery(id: string | null) {
  return useQuery({
    queryKey: propertyKeys.detail(id ?? ''),
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

async function updateProperty(
  id: string,
  body: { name: string; address: string }
): Promise<PropertyListItem> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Failed to update property (${response.status})`
    );
  }
  return response.json();
}

/**
 * Hook to update a property (admin). Invalidates list and detail on success.
 */
export function useUpdatePropertyMutation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; address: string }) => updateProperty(propertyId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
    },
  });
}

async function deleteProperty(id: string): Promise<void> {
  const response = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Failed to delete property (${response.status})`
    );
  }
}

/**
 * Hook to soft-delete a property (admin). Invalidates list and detail on success.
 */
export function useDeletePropertyMutation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
    },
  });
}
