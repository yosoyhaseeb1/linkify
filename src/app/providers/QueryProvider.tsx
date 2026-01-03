import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for the application
 * 
 * Default configuration:
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - gcTime: 30 minutes - Cached data is kept for 30 minutes after becoming unused
 * - retry: 1 - Failed queries are retried once
 * - refetchOnWindowFocus: false - Queries don't automatically refetch when window regains focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cached data is garbage collected after 30 minutes of being unused
      gcTime: 30 * 60 * 1000,
      
      // Retry failed queries once
      retry: 1,
      
      // Don't refetch queries when window regains focus
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider component that wraps the application with React Query
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
