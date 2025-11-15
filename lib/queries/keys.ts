/**
 * Query Keys Factory
 *
 * Centralized query keys for TanStack Query cache management.
 * This ensures consistent key structure across the application.
 *
 * Usage:
 *   - consumptionKeys.all -> ['consumption']
 *   - consumptionKeys.detail(id) -> ['consumption', 'detail', id]
 *   - consumptionKeys.list(filters) -> ['consumption', 'list', filters]
 */

export const consumptionKeys = {
  all: ['consumption'] as const,
  lists: () => [...consumptionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...consumptionKeys.lists(), filters] as const,
  details: () => [...consumptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...consumptionKeys.details(), id] as const,
  quickStats: () => [...consumptionKeys.all, 'quickStats'] as const,
};

export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...billKeys.lists(), filters] as const,
  details: () => [...billKeys.all, 'detail'] as const,
  detail: (id: string) => [...billKeys.details(), id] as const,
};

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

export const rentalKeys = {
  all: ['rentals'] as const,
  lists: () => [...rentalKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...rentalKeys.lists(), filters] as const,
  details: () => [...rentalKeys.all, 'detail'] as const,
  detail: (id: string) => [...rentalKeys.details(), id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...notificationKeys.lists(), filters] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};
