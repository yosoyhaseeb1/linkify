import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { getMessages, getMessagesByProspect, sendMessage, getPipeline } from '../services/apiService';

/**
 * Hook to fetch all messages for the current organization
 * 
 * Messages in Lynqio are AI-generated outreach sequences containing:
 * - Connection Request: Initial LinkedIn invite message
 * - Follow-up 1: First follow-up after connection
 * - Follow-up 2: Second follow-up if no response
 * - Follow-up 3: Final follow-up (optional)
 * 
 * Note: The backend currently returns all messages for the org.
 * Pagination parameters are prepared for future backend implementation.
 * 
 * @param options - Optional configuration
 * @param options.page - Page number for pagination (default: 1)
 * @param options.limit - Number of items per page (default: 50)
 * 
 * @returns Object containing:
 *   - messages: Array of message objects
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch the data
 * 
 * @example
 * ```tsx
 * const { messages, isLoading, error, refetch } = useMessages({ 
 *   page: 1, 
 *   limit: 25 
 * });
 * 
 * if (isLoading) return <div>Loading messages...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div className="message-list">
 *     {messages.map(message => (
 *       <MessageCard key={message.prospectId} message={message} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMessages(options?: { page?: number; limit?: number }) {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;
  const page = options?.page || 1;
  const limit = options?.limit || 50;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', orgId, page, limit],
    queryFn: async () => {
      // Note: Messages are embedded in prospect data via pipeline endpoint
      // We use getPipeline to get all prospects with their messages
      const pipeline = await getPipeline(getToken);
      const allMessages = pipeline.prospects
        ?.filter((p: any) => p.message)
        .map((p: any) => ({
          ...p.message,
          prospectId: p.id,
          prospectName: p.name,
          prospectTitle: p.title,
          prospectCompany: p.company,
          prospectLinkedinUrl: p.linkedinUrl,
        })) || [];
      
      // Client-side pagination for now
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMessages = allMessages.slice(startIndex, endIndex);
      
      return {
        messages: paginatedMessages,
        totalCount: allMessages.length,
      };
    },
    // Only fetch when we have an organization ID
    enabled: !!orgId,
  });

  return {
    messages: data?.messages || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch messages for a specific prospect
 * 
 * Returns the AI-generated message sequence for a single prospect including:
 * - Connection request message
 * - Follow-up message sequence (1-3 messages)
 * - Generation timestamp
 * 
 * @param prospectId - The unique identifier of the prospect
 * 
 * @returns Object containing:
 *   - message: Message object with connection request and follow-ups
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 * 
 * @example
 * ```tsx
 * const { message, isLoading, error } = useMessagesByProspect('prospect_abc123');
 * 
 * if (isLoading) return <div>Loading message sequence...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!message) return <div>No messages generated yet</div>;
 * 
 * return (
 *   <div className="message-sequence">
 *     <div className="message-step">
 *       <h3>Connection Request</h3>
 *       <p>{message.connectionRequest}</p>
 *     </div>
 *     
 *     {message.followUp1 && (
 *       <div className="message-step">
 *         <h3>Follow-up #1</h3>
 *         <p>{message.followUp1}</p>
 *       </div>
 *     )}
 *     
 *     {message.followUp2 && (
 *       <div className="message-step">
 *         <h3>Follow-up #2</h3>
 *         <p>{message.followUp2}</p>
 *       </div>
 *     )}
 *     
 *     {message.followUp3 && (
 *       <div className="message-step">
 *         <h3>Follow-up #3 (Final)</h3>
 *         <p>{message.followUp3}</p>
 *       </div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useMessagesByProspect(prospectId: string | undefined) {
  const { getToken } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['messages', 'prospect', prospectId],
    queryFn: async () => {
      if (!prospectId) {
        throw new Error('Prospect ID is required');
      }
      return await getMessagesByProspect(prospectId, getToken);
    },
    // Only fetch when we have a prospectId
    enabled: !!prospectId,
  });

  return {
    message: data,
    isLoading,
    error,
  };
}

/**
 * Hook to send or update a message for a prospect
 * 
 * This mutation allows manual creation/editing of AI-generated messages.
 * Typically, messages are auto-generated by Make.com webhooks, but this
 * hook enables manual overrides when needed.
 * 
 * @returns Object containing:
 *   - sendMessage: Mutation function to send/update a message
 *   - isSending: Boolean indicating if the mutation is in progress
 *   - error: Error object if the mutation failed
 * 
 * @example
 * ```tsx
 * const { sendMessage, isSending, error } = useSendMessage();
 * 
 * const handleManualEdit = async () => {
 *   try {
 *     await sendMessage({
 *       prospectId: 'prospect_abc123',
 *       connectionRequest: 'Hi [Name], I noticed you work in...',
 *       followUp1: 'Hi [Name], following up on my connection request...',
 *       followUp2: 'Hi [Name], wanted to reach out one more time...',
 *       followUp3: 'Hi [Name], this is my final follow-up...',
 *     });
 *     toast.success('Message updated successfully!');
 *   } catch (err) {
 *     toast.error('Failed to update message');
 *   }
 * };
 * 
 * return (
 *   <div>
 *     <MessageEditor onSave={handleManualEdit} />
 *     <button onClick={handleManualEdit} disabled={isSending}>
 *       {isSending ? 'Saving...' : 'Save Message'}
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useSendMessage() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = currentOrg?.id;

  const mutation = useMutation({
    mutationFn: async (data: {
      prospectId: string;
      connectionRequest?: string;
      followUp1?: string;
      followUp2?: string;
      followUp3?: string;
    }) => {
      const { prospectId, ...messageData } = data;
      return await sendMessage(prospectId, messageData, getToken);
    },
    onSuccess: (data, variables) => {
      // Invalidate all message-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['messages', orgId] });
      
      // Invalidate the specific prospect's message query
      queryClient.invalidateQueries({ 
        queryKey: ['messages', 'prospect', variables.prospectId] 
      });
      
      // Also invalidate pipeline since messages affect prospect display
      queryClient.invalidateQueries({ queryKey: ['pipeline', orgId] });
      
      // Invalidate prospects queries since messages are embedded in prospect data
      queryClient.invalidateQueries({ queryKey: ['prospects', orgId] });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to fetch all prospects with their messages (pipeline view)
 * 
 * This is a convenience hook that combines prospect and message data,
 * perfect for displaying message sequences in a pipeline or table view.
 * 
 * @returns Object containing:
 *   - prospectsWithMessages: Array of prospects including their message sequences
 *   - isLoading: Boolean indicating if the query is loading
 *   - error: Error object if the query failed
 *   - refetch: Function to manually refetch the data
 * 
 * @example
 * ```tsx
 * const { prospectsWithMessages, isLoading } = useProspectsWithMessages();
 * 
 * return (
 *   <table>
 *     <thead>
 *       <tr>
 *         <th>Prospect</th>
 *         <th>Connection Request</th>
 *         <th>Follow-ups</th>
 *         <th>Status</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       {prospectsWithMessages.map(prospect => (
 *         <tr key={prospect.id}>
 *           <td>{prospect.name}</td>
 *           <td>{prospect.message?.connectionRequest || 'Not generated'}</td>
 *           <td>
 *             {prospect.message?.followUp1 ? '✓' : '−'} 
 *             {prospect.message?.followUp2 ? '✓' : '−'}
 *             {prospect.message?.followUp3 ? '✓' : '−'}
 *           </td>
 *           <td>{prospect.stage}</td>
 *         </tr>
 *       ))}
 *     </tbody>
 *   </table>
 * );
 * ```
 */
export function useProspectsWithMessages() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['prospects-with-messages', orgId],
    queryFn: async () => {
      const pipeline = await getPipeline(getToken);
      return pipeline.prospects || [];
    },
    // Only fetch when we have an organization ID
    enabled: !!orgId,
  });

  return {
    prospectsWithMessages: data || [],
    isLoading,
    error,
    refetch,
  };
}