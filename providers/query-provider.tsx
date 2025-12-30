'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryCache, createMutationCache } from '@/lib/errors/query-error-interceptor';

/**
 * QueryClient configuration
 *
 * This QueryClient instance is created once at module level and reused
 * throughout the application lifecycle. The configuration ensures:
 * - Optimal caching with 1 minute staleTime and 5 minute gcTime
 * - Reduced unnecessary refetches (refetchOnWindowFocus: false)
 * - Retry strategy with exponential backoff
 * - Single instance for better performance
 */
const queryClient = new QueryClient({
  queryCache: createQueryCache(),
  mutationCache: createMutationCache(),
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      retry: 1, // Only retry once on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Only retry once on mutation failure
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
