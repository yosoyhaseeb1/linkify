import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { getProspects, getProspectsByRun, updateProspectStage, getPipeline } from '../services/apiService';

/**
 * Hook to fetch all prospects for the current organization
 * 
 * Note: The backend currently returns all prospects for the org. 
 * Pagination parameters are prepared for future backend implementation.
 * 
 * @param options - Optional configuration
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page (default: 50)
 * 
 * @returns Object containing:
 *   - prospects: Array of prospect objects
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch the data
 *   - totalCount: Total number of prospects (currently same as prospects.length)
 * 
 * @example
 * ```tsx
 * const { prospects, isLoading, error, totalCount } = useProspects({ 
 *   page: 1, 
 *   limit: 25 
 * });
 * 
 * if (isLoading) return <div>Loading prospects...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <p>Showing {prospects.length} of {totalCount} prospects</p>
 *     {prospects.map(prospect => (
 *       <ProspectCard key={prospect.id} prospect={prospect} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useProspects(options?: { page?: number; limit?: number }) {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;
  const page = options?.page || 1;
  const limit = options?.limit || 50;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['prospects', orgId, page, limit],
    queryFn: async () => {
      // Note: Backend doesn't support pagination yet, returns all prospects
      // When backend adds pagination, modify this to pass page/limit as query params
      const allProspects = await getProspects(getToken);
      
      // Client-side pagination for now
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProspects = allProspects.slice(startIndex, endIndex);
      
      return {
        prospects: paginatedProspects,
        totalCount: allProspects.length,
      };
    },
    // Only fetch when we have an organization ID
    enabled: !!orgId,
  });

  return {
    prospects: data?.prospects || [],
    isLoading,
    error,
    refetch,
    totalCount: data?.totalCount || 0,
  };
}

/**
 * Hook to fetch prospects for a specific run
 * 
 * @param runId - The unique identifier of the run
 * 
 * @returns Object containing:
 *   - prospects: Array of prospect objects for the specific run
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 * 
 * @example
 * ```tsx
 * const { prospects, isLoading, error } = useProspectsByRun('run_abc123');
 * 
 * if (isLoading) return <div>Loading decision makers...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <h2>Top 3 Decision Makers</h2>
 *     {prospects.map((prospect, idx) => (
 *       <div key={prospect.id}>
 *         <span className="rank">#{idx + 1}</span>
 *         <h3>{prospect.name}</h3>
 *         <p>{prospect.title} at {prospect.company}</p>
 *         <a href={prospect.linkedinUrl} target="_blank">LinkedIn Profile</a>
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useProspectsByRun(runId: string | undefined) {
  const { getToken } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['prospects', 'run', runId],
    queryFn: async () => {
      if (!runId) {
        throw new Error('Run ID is required');
      }
      return await getProspectsByRun(runId, getToken);
    },
    // Only fetch when we have a runId
    enabled: !!runId,
  });

  return {
    prospects: data || [],
    isLoading,
    error,
  };
}

/**
 * Hook to update a prospect's pipeline stage
 * 
 * @returns Object containing:
 *   - updateProspect: Mutation function to update a prospect's stage
 *   - isUpdating: Boolean indicating if the mutation is in progress
 *   - error: Error object if the mutation failed
 * 
 * Valid pipeline stages:
 * - 'invite_sent': LinkedIn invite has been sent
 * - 'connected': Prospect accepted the invite
 * - 'conversation_started': Initial message sent
 * - 'qualification': Qualifying the prospect
 * - 'proposal_sent': Proposal or pitch sent
 * - 'signed_mandate': Deal closed / mandate signed
 * - 'lost': Prospect declined or went cold
 * 
 * @example
 * ```tsx
 * const { updateProspect, isUpdating, error } = useUpdateProspect();
 * 
 * const handleStageChange = async (prospectId: string, newStage: string) => {
 *   try {
 *     await updateProspect({
 *       prospectId,
 *       stage: newStage,
 *       notes: 'Follow up scheduled for next week',
 *     });
 *     toast.success('Prospect stage updated!');
 *   } catch (err) {
 *     toast.error('Failed to update prospect');
 *   }
 * };
 * 
 * return (
 *   <button 
 *     onClick={() => handleStageChange('prospect_123', 'connected')}
 *     disabled={isUpdating}
 *   >
 *     Mark as Connected
 *   </button>
 * );
 * ```
 */
export function useUpdateProspect() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = currentOrg?.id;

  const mutation = useMutation({
    mutationFn: async (data: {
      prospectId: string;
      stage: string;
      notes?: string;
    }) => {
      const { prospectId, ...updateData } = data;
      return await updateProspectStage(prospectId, updateData, getToken);
    },
    onSuccess: (data, variables) => {
      // Invalidate all prospect-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['prospects', orgId] });
      
      // Also invalidate pipeline query since stage affects pipeline view
      queryClient.invalidateQueries({ queryKey: ['pipeline', orgId] });
      
      // If we know which run this prospect belongs to, invalidate that too
      // (The backend response doesn't include runId, so we'd need to track it separately)
      queryClient.invalidateQueries({ queryKey: ['prospects', 'run'] });
    },
  });

  return {
    updateProspect: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to fetch pipeline data with prospects organized by stage
 * 
 * This is a specialized prospect query that returns prospects grouped by 
 * their current pipeline stage (invite_sent, connected, etc.)
 * 
 * @returns Object containing:
 *   - prospects: Array of all prospects in the pipeline
 *   - stageCounts: Object with counts per stage
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch the data
 * 
 * @example
 * ```tsx
 * const { prospects, stageCounts, isLoading } = usePipelineProspects();
 * 
 * return (
 *   <div>
 *     <div className="stage-overview">
 *       <div>Invite Sent: {stageCounts.invite_sent || 0}</div>
 *       <div>Connected: {stageCounts.connected || 0}</div>
 *       <div>In Conversation: {stageCounts.conversation_started || 0}</div>
 *     </div>
 *     
 *     <div className="pipeline-board">
 *       {prospects
 *         .filter(p => p.stage === 'connected')
 *         .map(prospect => (
 *           <ProspectCard key={prospect.id} prospect={prospect} />
 *         ))}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function usePipelineProspects() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pipeline', orgId],
    queryFn: async () => {
      return await getPipeline(getToken);
    },
    // Only fetch when we have an organization ID
    enabled: !!orgId,
  });

  return {
    prospects: data?.prospects || [],
    stageCounts: data?.stageCounts || {},
    isLoading,
    error,
    refetch,
  };
}