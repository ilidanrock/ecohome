/**
 * User search for admin (combobox, server search).
 */

import { useQuery } from '@tanstack/react-query';
import { userKeys } from './keys';

export type UserSearchResult = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

async function fetchUsers(params: { role?: string; search?: string; limit?: number }): Promise<UserSearchResult[]> {
  const sp = new URLSearchParams();
  if (params.role) sp.set('role', params.role);
  if (params.search && params.search.trim()) sp.set('search', params.search.trim());
  if (params.limit != null) sp.set('limit', String(params.limit));
  const url = `/api/users${sp.toString() ? `?${sp.toString()}` : ''}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Failed to fetch users (${res.status})`);
  }
  return res.json();
}

/**
 * Search users (admin). Use with debounced search term for combobox.
 */
export function useSearchUsersQuery(params: { role?: string; search: string; limit?: number }) {
  const { role = 'USER', search, limit = 20 } = params;
  return useQuery({
    queryKey: userKeys.list({ role, search: search.trim(), limit }),
    queryFn: () => fetchUsers({ role, search: search.trim() || undefined, limit }),
    enabled: true,
    staleTime: 30 * 1000,
  });
}
