import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { getRuns, createRun, getRun } from '../services/apiService';

/**
 * Options for configuring the useRuns hook
 */
interface UseRunsOptions {
  /** Page number for pagination (default: 1) */
  page?: number;
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Filter runs by status (e.g., 'active', 'completed', 'failed') */
  status?: string;
}

/**
 * Hook to fetch all runs for the current organization with pagination support
 * 
 * @param options - Optional configuration for pagination and filtering
 * @param options.page - Page number for pagination (default: 1)
 * @param options.pageSize - Number of items per page (default: 20)
 * @param options.status - Filter runs by status
 * 
 * @returns Object containing:
 *   - runs: Array of run objects for the current page
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch the data
 *   - totalCount: Total number of runs across all pages
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { runs, isLoading, totalCount } = useRuns();
 * 
 * // With pagination
 * const { runs, isLoading, totalCount } = useRuns({ page: 2, pageSize: 10 });
 * 
 * // With status filter
 * const { runs, isLoading, totalCount } = useRuns({ 
 *   page: 1, 
 *   pageSize: 20, 
 *   status: 'active' 
 * });
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     {runs.map(run => <RunCard key={run.id} run={run} />)}
 *     <Pagination 
 *       currentPage={page} 
 *       totalCount={totalCount} 
 *       pageSize={pageSize}
 *     />
 *   </div>
 * );
 * ```
 */
export function useRuns(options: UseRunsOptions = {}) {
  const { page = 1, pageSize = 20, status } = options;
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['runs', orgId, { page, pageSize, status }],
    queryFn: async () => {
      // Call API with pagination params
      // Note: The backend getRuns currently does client-side pagination
      // When backend adds native pagination, this will automatically work
      const response = await getRuns(getToken, page, pageSize);
      
      // Client-side status filtering until backend supports it
      if (status && response.runs) {
        const filteredRuns = response.runs.filter(
          (run: any) => run.status === status
        );
        return {
          runs: filteredRuns,
          totalCount: filteredRuns.length,
        };
      }
      
      return response; // { runs: Run[], totalCount: number }
    },
    // Only fetch when we have an organization ID
    enabled: !!orgId,
  });

  return {
    runs: data?.runs || [],
    isLoading,
    error,
    refetch,
    totalCount: data?.totalCount || 0,
  };
}

/**
 * Hook to create a new run with optimistic updates
 * 
 * Features:
 * - Optimistic UI updates (immediate feedback)
 * - Automatic rollback on error
 * - Cache invalidation on success
 * - Prevents race conditions with cancelQueries
 * 
 * @returns Object containing:
 *   - createRun: Mutation function to create a new run
 *   - isCreating: Boolean indicating if the mutation is in progress
 *   - error: Error object if the mutation failed
 * 
 * @example
 * ```tsx
 * const { createRun, isCreating, error } = useCreateRun();
 * 
 * const handleSubmit = async (formData) => {
 *   try {
 *     const newRun = await createRun({
 *       jobUrl: formData.jobUrl,
 *       jobTitle: formData.jobTitle,
 *       company: formData.company,
 *       notes: formData.notes,
 *     });
 *     console.log('Created run:', newRun);
 *     // UI already shows the new run optimistically!
 *   } catch (err) {
 *     console.error('Failed to create run:', err);
 *     // UI automatically rolled back to previous state
 *   }
 * };
 * ```
 */
export function useCreateRun() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = currentOrg?.id;

  const mutation = useMutation({
    mutationFn: async (data: {
      jobUrl: string;
      jobTitle: string;
      company: string;
      notes?: string;
    }) => {
      // API call to create run
      return await createRun(data, getToken);
    },
    
    // Optimistic update before the mutation starts
    onMutate: async (newRunData) => {
      // Cancel any outgoing refetches to prevent race conditions
      // This ensures our optimistic update won't be overwritten
      await queryClient.cancelQueries({ queryKey: ['runs', orgId] });
      
      // Snapshot the previous value for rollback
      // We need to get all queries that match the runs pattern since we have pagination
      const previousRunsQueries = queryClient.getQueriesData({ 
        queryKey: ['runs', orgId] 
      });
      
      // Create optimistic run object with temporary ID
      const optimisticRun = {
        id: `temp-${Date.now()}`,
        jobUrl: newRunData.jobUrl,
        jobTitle: newRunData.jobTitle,
        company: newRunData.company,
        notes: newRunData.notes,
        status: 'queued',
        createdAt: new Date().toISOString(),
        prospectsFound: 0,
        campaignStatus: 'draft',
      };
      
      // Optimistically update all runs queries (all pages/filters)
      // This ensures the new run appears immediately in the UI
      queryClient.setQueriesData(
        { queryKey: ['runs', orgId] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            runs: [optimisticRun, ...(old.runs || [])],
            totalCount: (old.totalCount || 0) + 1,
          };
        }
      );
      
      // Return context with previous state for rollback
      return { previousRunsQueries };
    },
    
    // Rollback on error
    onError: (err, newRunData, context) => {
      // Restore all queries to their previous state
      if (context?.previousRunsQueries) {
        context.previousRunsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    
    // Always refetch after mutation settles (success or error)
    onSettled: () => {
      // Invalidate all runs queries to ensure data is fresh
      // This will trigger a background refetch for any active queries
      queryClient.invalidateQueries({ queryKey: ['runs', orgId] });
    },
  });

  return {
    createRun: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to fetch a single run by ID
 * 
 * @param runId - The unique identifier of the run to fetch
 * 
 * @returns Object containing:
 *   - run: Run object with full details including prospects and messages
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 * 
 * @example
 * ```tsx
 * const { run, isLoading, error } = useRun('run_123');
 * 
 * if (isLoading) return <div>Loading run details...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!run) return <div>Run not found</div>;
 * 
 * return (
 *   <div>
 *     <h1>{run.jobTitle} at {run.company}</h1>
 *     <p>Status: {run.status}</p>
 *     <ProspectsList prospects={run.prospects} />
 *   </div>
 * );
 * ```
 */
export function useRun(runId: string | undefined) {
  const { getToken } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['run', runId],
    queryFn: async () => {
      if (!runId) {
        throw new Error('Run ID is required');
      }
      return await getRun(runId, getToken);
    },
    // Only fetch when we have a runId
    enabled: !!runId,
  });

  return {
    run: data,
    isLoading,
    error,
  };
}