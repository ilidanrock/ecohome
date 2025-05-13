"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { useState } from 'react';

function TanstackProvider({children}: {children: React.ReactNode}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 1000 * 60 * 5, // 5 minutes
            },
        },
    }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
       { false && <ReactQueryDevtools initialIsOpen={false} />}
      
    </QueryClientProvider>
  )
}

export default TanstackProvider