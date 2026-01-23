/**
 * React Query Configuration
 * Centralized QueryClient setup with optimized defaults
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time - data stays in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests 2 times
      retry: 2,
      
      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})
