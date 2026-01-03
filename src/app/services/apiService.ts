/**
 * API Service - Helper for making authenticated backend API calls with Clerk JWT tokens
 * 
 * IMPORTANT: Supabase Edge Functions have built-in JWT auth that intercepts the Authorization header.
 * To use Clerk JWTs instead, we:
 * 1. Send Supabase anon key in Authorization header (to pass Supabase's gateway)
 * 2. Send Clerk JWT in x-clerk-token header (for our custom middleware to verify)
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { logger } from '../utils/logger';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5`;

/**
 * Make an authenticated API request to the backend
 * @param endpoint - API endpoint (e.g., '/runs' or '/org-runs/:orgId')
 * @param options - Fetch options (method, body, etc.)
 * @param getToken - Function to retrieve Clerk JWT token from AuthContext
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit,
  getToken: () => Promise<string | null>
): Promise<T> {
  const clerkToken = await getToken();
  
  if (!clerkToken) {
    throw new Error('Authentication required - no valid token available');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      // Use Supabase anon key to pass gateway (not for auth - just to get through)
      'Authorization': `Bearer ${publicAnonKey}`,
      // Send Clerk JWT in custom header for our middleware to verify
      'x-clerk-token': clerkToken,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`API error on ${endpoint}:`, errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return null as T;
}

/**
 * GET request helper
 * @param endpoint - API endpoint path
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise resolving to the response data
 * @throws Error if authentication fails or request fails
 */
export async function apiGet<T = any>(
  endpoint: string,
  getToken: () => Promise<string | null>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' }, getToken);
}

/**
 * POST request helper
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise resolving to the response data
 * @throws Error if authentication fails or request fails
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  getToken: () => Promise<string | null>
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * PUT request helper
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise resolving to the response data
 * @throws Error if authentication fails or request fails
 */
export async function apiPut<T = any>(
  endpoint: string,
  body: any,
  getToken: () => Promise<string | null>
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * PATCH request helper
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise resolving to the response data
 * @throws Error if authentication fails or request fails
 */
export async function apiPatch<T = any>(
  endpoint: string,
  body: any,
  getToken: () => Promise<string | null>
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * DELETE request helper
 * @param endpoint - API endpoint path
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise resolving to the response data
 * @throws Error if authentication fails or request fails
 */
export async function apiDelete<T = any>(
  endpoint: string,
  getToken: () => Promise<string | null>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' }, getToken);
}

// ============================================================================
// Domain-Specific API Functions
// ============================================================================

/**
 * Fetches all runs for the current organization
 * Note: Backend doesn't support pagination yet, returns all runs.
 * When backend adds pagination, modify this to pass page/limit as query params.
 * @param getToken - Function to retrieve Clerk JWT token (org ID extracted from JWT)
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 20)
 * @returns Promise<{ runs: any[], totalCount: number }> - Paginated runs with total count
 * @throws Error if authentication fails or request fails
 */
export async function getRuns(
  getToken: () => Promise<string | null>,
  page: number = 1,
  limit: number = 20
): Promise<{ runs: any[], totalCount: number }> {
  const response = await apiGet<{ runs: any[] }>('/runs', getToken);
  const allRuns = response.runs || [];
  
  // Client-side pagination for now
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRuns = allRuns.slice(startIndex, endIndex);
  
  return {
    runs: paginatedRuns,
    totalCount: allRuns.length,
  };
}

/**
 * Creates a new run for finding decision makers from a LinkedIn job post
 * @param data - Run creation data including jobUrl, jobTitle, company, and optional notes
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - The created run object with id and initial status
 * @throws Error if authentication fails, validation fails, or request fails
 */
export async function createRun(
  data: {
    jobUrl: string;
    jobTitle: string;
    company: string;
    notes?: string;
  },
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiPost('/runs', data, getToken);
}

/**
 * Fetches a single run by ID with full details including prospects and messages
 * @param runId - The unique identifier of the run
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - Run object with nested prospects and message history
 * @throws Error if authentication fails, run not found, or request fails
 */
export async function getRun(
  runId: string,
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiGet(`/runs/${runId}`, getToken);
}

/**
 * Fetches all prospects (decision makers) found across all runs for the organization
 * Note: This uses the pipeline endpoint which returns prospects with their pipeline stages
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any[]> - Array of prospect objects with contact info and engagement status
 * @throws Error if authentication fails or request fails
 */
export async function getProspects(
  getToken: () => Promise<string | null>
): Promise<any[]> {
  const response = await getPipeline(getToken);
  return response.prospects || [];
}

/**
 * Fetches all messages drafted and sent to prospects
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any[]> - Array of message objects with content, status, and prospect details
 * @throws Error if authentication fails or request fails
 */
export async function getMessages(
  getToken: () => Promise<string | null>
): Promise<any[]> {
  const response = await apiGet<{ messages: any[] }>('/messages', getToken);
  return response.messages || [];
}

/**
 * Fetches pipeline data showing prospect stages and deal flow
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - Pipeline data with stage counts and conversion metrics
 * @throws Error if authentication fails or request fails
 */
export async function getPipeline(
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiGet('/pipeline', getToken);
}

/**
 * Fetches analytics data for the organization including run success rates and engagement metrics
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - Analytics object with metrics, trends, and performance data
 * @throws Error if authentication fails or request fails
 */
export async function getAnalytics(
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiGet('/analytics', getToken);
}

/**
 * Fetches prospects by run ID
 * @param runId - The run ID to fetch prospects for
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any[]> - Array of prospect objects for the specific run
 * @throws Error if authentication fails or request fails
 */
export async function getProspectsByRun(
  runId: string,
  getToken: () => Promise<string | null>
): Promise<any[]> {
  const response = await getRun(runId, getToken);
  return response.prospects || [];
}

/**
 * Updates a prospect's pipeline stage
 * @param prospectId - The prospect ID to update
 * @param data - Update data including stage and optional notes
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - Update confirmation with new stage
 * @throws Error if authentication fails, validation fails, or request fails
 */
export async function updateProspectStage(
  prospectId: string,
  data: {
    stage: string;
    notes?: string;
  },
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiPut(`/prospects/${prospectId}/stage`, data, getToken);
}

/**
 * Fetches messages by prospect ID
 * Note: Messages are currently embedded in prospect objects.
 * This function extracts message data from the prospect record.
 * @param prospectId - The prospect ID to fetch messages for
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - Message object with connection request and follow-ups
 * @throws Error if authentication fails or request fails
 */
export async function getMessagesByProspect(
  prospectId: string,
  getToken: () => Promise<string | null>
): Promise<any> {
  // Messages are stored as part of the prospect data
  // The backend stores them as `message:${prospectId}` but we access them through pipeline
  // For now, we'll need to get this data from the pipeline endpoint
  const pipeline = await getPipeline(getToken);
  const prospect = pipeline.prospects?.find((p: any) => p.id === prospectId);
  return prospect?.message || null;
}

/**
 * Sends a message to a prospect (manual override)
 * Note: Messages are typically generated by AI through Make.com webhooks.
 * This endpoint allows manual message creation/editing.
 * @param prospectId - The prospect ID to send message to
 * @param data - Message data including connection request and follow-ups
 * @param getToken - Function to retrieve Clerk JWT token
 * @returns Promise<any> - The created/updated message
 * @throws Error if authentication fails, validation fails, or request fails
 */
export async function sendMessage(
  prospectId: string,
  data: {
    connectionRequest?: string;
    followUp1?: string;
    followUp2?: string;
    followUp3?: string;
  },
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiPost(`/messages/${prospectId}`, data, getToken);
}