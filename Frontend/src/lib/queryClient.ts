import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration with optimized caching and retry policies
 * Optimized for performance with intelligent cache management
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      // Resources: 2 minutes (frequently updated)
      // Activities: 1 minute (audit data changes less frequently)
      staleTime: 2 * 60 * 1000,
      
      // Garbage collection time: how long unused data stays in cache
      // Keep data longer for better UX when navigating back
      gcTime: 15 * 60 * 1000,
      
      // Retry configuration with smart error handling
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        
        // Retry up to 2 times for other errors (reduced for performance)
        return failureCount < 2;
      },
      
      // Exponential backoff for retries (faster initial retry)
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
      
      // Reduce refetch frequency for better performance
      refetchOnWindowFocus: false, // Disabled for better performance
      
      // Refetch on reconnect for data consistency
      refetchOnReconnect: true,
      
      // Smart refetch on mount - only if data is stale
      refetchOnMount: 'stale',
      
      // Network mode for better offline handling
      networkMode: 'online',
      
      // Reduce background refetch interval
      refetchInterval: false, // Disabled by default, can be overridden per query
    },
    mutations: {
      // Retry mutations once for network errors only
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        
        // Only retry once for mutations to avoid duplicate operations
        return failureCount < 1;
      },
      
      // Faster retry for mutations
      retryDelay: 500,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

export default queryClient;