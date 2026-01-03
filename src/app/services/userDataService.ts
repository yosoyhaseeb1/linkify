/**
 * User Data Service
 * Handles fetching and saving user-scoped data (contacts, tasks, jobs)
 * Uses two-token auth: Supabase anon key + Clerk JWT
 * Each user gets their own isolated workspace
 * Includes simple cache to reduce redundant API calls
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5`;

interface UserData {
  contacts: any[];
  tasks: any[];
  jobs: any[];
}

// Simple in-memory cache
const dataCache = new Map<string, { data: UserData; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

/**
 * Fetch user-specific data from backend
 * Returns empty arrays for new users, includes caching for performance
 * 
 * @param userId - The user's Clerk ID
 * @param token - Clerk JWT token for authentication
 * @param forceRefresh - Skip cache if true
 * @returns Promise with contacts, tasks, and jobs arrays
 * 
 * @example
 * ```tsx
 * const token = await getToken();
 * const data = await fetchUserData(user.id, token);
 * console.log(data.contacts, data.tasks, data.jobs);
 * ```
 */
export async function fetchUserData(
  userId: string, 
  token: string,
  forceRefresh = false
): Promise<UserData> {
  // Check cache first
  if (!forceRefresh) {
    const cached = dataCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Using cached data for user ${userId}`);
      return cached.data;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-clerk-token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const data = await response.json();
    const userData: UserData = {
      contacts: data.contacts || [],
      tasks: data.tasks || [],
      jobs: data.jobs || [],
    };

    // Cache the data
    dataCache.set(userId, { data: userData, timestamp: Date.now() });
    console.log(`✅ Fetched and cached data for user ${userId}`);

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Return empty data on error (fallback for new users)
    return {
      contacts: [],
      tasks: [],
      jobs: [],
    };
  }
}

/**
 * Clear cache for a specific user (call after updates)
 * @param userId - The user's Clerk ID to clear cache for
 */
export function clearUserDataCache(userId: string) {
  dataCache.delete(userId);
  console.log(`🗑️ Cleared cache for user ${userId}`);
}

/**
 * Save user contacts to backend
 * Automatically clears cache to ensure fresh data on next fetch
 * 
 * @param userId - The user's Clerk ID
 * @param token - Clerk JWT token
 * @param contacts - Array of contact objects to save
 * @returns Promise resolving to true on success, false on error
 * 
 * @example
 * ```tsx
 * const success = await saveUserContacts(user.id, token, contacts);
 * if (success) toast.success('Contacts saved');
 * ```
 */
export async function saveUserContacts(
  userId: string, 
  token: string,
  contacts: any[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}/contacts`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-clerk-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Server error response:', errorData);
      throw new Error(`Failed to save contacts: ${errorData.details || errorData.error || response.statusText}`);
    }

    console.log(`✅ Saved ${contacts.length} contacts for user ${userId}`);
    
    // Clear cache to force refresh on next fetch
    clearUserDataCache(userId);
    
    return true;
  } catch (error) {
    console.error('Error saving user contacts:', error);
    return false;
  }
}

/**
 * Save user tasks to backend
 * Automatically clears cache to ensure fresh data on next fetch
 * 
 * @param userId - The user's Clerk ID
 * @param token - Clerk JWT token
 * @param tasks - Array of task objects to save
 * @returns Promise resolving to true on success, false on error
 */
export async function saveUserTasks(
  userId: string, 
  token: string,
  tasks: any[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}/tasks`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-clerk-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save tasks: ${response.statusText}`);
    }

    console.log(`✅ Saved ${tasks.length} tasks for user ${userId}`);
    
    // Clear cache to force refresh on next fetch
    clearUserDataCache(userId);
    
    return true;
  } catch (error) {
    console.error('Error saving user tasks:', error);
    return false;
  }
}

/**
 * Save user jobs to backend
 * Automatically clears cache to ensure fresh data on next fetch
 * 
 * @param userId - The user's Clerk ID
 * @param token - Clerk JWT token
 * @param jobs - Array of job objects to save
 * @returns Promise resolving to true on success, false on error
 */
export async function saveUserJobs(
  userId: string, 
  token: string,
  jobs: any[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}/jobs`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'x-clerk-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobs }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save jobs: ${response.statusText}`);
    }

    console.log(`✅ Saved ${jobs.length} jobs for user ${userId}`);
    
    // Clear cache to force refresh on next fetch
    clearUserDataCache(userId);
    
    return true;
  } catch (error) {
    console.error('Error saving user jobs:', error);
    return false;
  }
}