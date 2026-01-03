/**
 * Test Scenarios for useCreateRun Optimistic Updates
 * 
 * This file contains test cases and edge cases to validate
 * the optimistic updates implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateRun } from './useRuns';

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Scenario 1: Happy Path - Successful Creation
 * 
 * Steps:
 * 1. User has 2 runs in cache
 * 2. User creates new run
 * 3. Optimistic update adds run immediately
 * 4. API call succeeds
 * 5. Cache refreshes with real data
 * 
 * Expected:
 * - UI shows 3 runs immediately
 * - Temp ID replaced with real ID
 * - No visual glitch
 */
export const scenario_HappyPath = {
  name: 'Happy Path - Successful Creation',
  
  initialCache: {
    runs: [
      { id: 'run_1', jobTitle: 'Engineer', company: 'TechCorp', status: 'completed' },
      { id: 'run_2', jobTitle: 'Designer', company: 'DesignCo', status: 'running' }
    ],
    totalCount: 2
  },
  
  newRunData: {
    jobUrl: 'https://linkedin.com/jobs/123',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    notes: 'Great opportunity'
  },
  
  timeline: [
    { time: 0, event: 'User clicks Create Run' },
    { time: 0, event: 'onMutate fires → Optimistic update', 
      cacheState: { totalCount: 3, runs: 3 } },
    { time: 500, event: 'API call in progress...', 
      uiState: 'Shows 3 runs (1 optimistic)' },
    { time: 1500, event: 'API returns success', 
      serverResponse: { id: 'run_abc123', status: 'queued' } },
    { time: 1500, event: 'onSettled fires → Invalidate cache' },
    { time: 1600, event: 'Background refetch completes', 
      cacheState: { totalCount: 3, runs: 3 } }
  ],
  
  assertions: [
    'Optimistic run appears at 0ms',
    'UI never shows loading spinner',
    'Temp ID (temp-xxx) replaced with real ID (run_abc123)',
    'Total count incremented correctly',
    'User sees instant feedback'
  ]
};

/**
 * Scenario 2: Error Path - Failed Creation
 * 
 * Steps:
 * 1. User has 2 runs in cache
 * 2. User creates new run
 * 3. Optimistic update adds run
 * 4. API call fails (network error)
 * 5. Rollback removes optimistic run
 * 
 * Expected:
 * - UI shows 3 runs briefly
 * - Error occurs
 * - UI reverts to 2 runs
 * - Error message shown
 */
export const scenario_ErrorPath = {
  name: 'Error Path - Failed Creation',
  
  initialCache: {
    runs: [
      { id: 'run_1', jobTitle: 'Engineer', company: 'TechCorp' },
      { id: 'run_2', jobTitle: 'Designer', company: 'DesignCo' }
    ],
    totalCount: 2
  },
  
  newRunData: {
    jobUrl: 'https://linkedin.com/jobs/456',
    jobTitle: 'Invalid Job',
    company: 'FailCorp'
  },
  
  timeline: [
    { time: 0, event: 'User clicks Create Run' },
    { time: 0, event: 'onMutate fires → Optimistic update', 
      cacheState: { totalCount: 3, runs: 3 } },
    { time: 500, event: 'API call in progress...', 
      uiState: 'Shows 3 runs (1 optimistic)' },
    { time: 1500, event: 'API returns 500 error', 
      error: 'Network request failed' },
    { time: 1500, event: 'onError fires → Rollback cache', 
      cacheState: { totalCount: 2, runs: 2 } },
    { time: 1500, event: 'Error toast shown', 
      uiState: 'Shows 2 runs (original state)' }
  ],
  
  assertions: [
    'Optimistic run appears at 0ms',
    'Optimistic run removed at 1500ms',
    'Cache restored to exact previous state',
    'Total count decremented back to 2',
    'Error message displayed to user',
    'No data corruption'
  ]
};

/**
 * Scenario 3: Race Condition - Concurrent Query
 * 
 * Steps:
 * 1. User navigates to /runs → query starts
 * 2. User immediately clicks Create Run (before query finishes)
 * 3. Optimistic update adds run
 * 4. Original query tries to complete (but cancelled)
 * 5. Create mutation succeeds
 * 
 * Expected:
 * - Original query cancelled
 * - Optimistic update not overwritten
 * - New run visible throughout
 */
export const scenario_RaceCondition = {
  name: 'Race Condition - Concurrent Query',
  
  timeline: [
    { time: 0, event: 'User navigates to /runs', 
      action: 'useRuns() query starts' },
    { time: 200, event: 'User clicks Create Run (query still loading)', 
      action: 'createRun() mutation fires' },
    { time: 200, event: 'cancelQueries() called', 
      result: 'Original query cancelled ✅' },
    { time: 200, event: 'Optimistic update applied', 
      cacheState: { runs: [optimisticRun] } },
    { time: 1000, event: 'Original query would have completed', 
      result: 'CANCELLED - does not overwrite cache ✅' },
    { time: 1500, event: 'Create mutation completes', 
      cacheState: { runs: [realRun] } },
    { time: 1500, event: 'invalidateQueries() → Fresh fetch' },
    { time: 2000, event: 'Fresh query completes', 
      cacheState: { runs: [realRun] } }
  ],
  
  assertions: [
    'Original query cancelled before completion',
    'Optimistic run never disappears',
    'No cache overwrites',
    'New run visible throughout',
    'Fresh data fetched at end'
  ]
};

/**
 * Scenario 4: Multiple Pages - Pagination
 * 
 * Steps:
 * 1. User has cached queries for page 1 and page 2
 * 2. User creates new run while viewing page 2
 * 3. Optimistic update applied to BOTH pages
 * 4. Mutation succeeds
 * 5. Both caches invalidated
 * 
 * Expected:
 * - Both pages updated optimistically
 * - New run appears on page 1 (most recent)
 * - Page counts adjusted correctly
 */
export const scenario_MultiplePagesOptimisticUpdate = {
  name: 'Multiple Pages - Pagination',
  
  initialCache: [
    {
      queryKey: ['runs', 'org_123', { page: 1, pageSize: 20 }],
      data: {
        runs: [/* 20 runs */],
        totalCount: 35
      }
    },
    {
      queryKey: ['runs', 'org_123', { page: 2, pageSize: 20 }],
      data: {
        runs: [/* 15 runs */],
        totalCount: 35
      }
    }
  ],
  
  timeline: [
    { time: 0, event: 'User on page 2, clicks Create Run' },
    { time: 0, event: 'setQueriesData updates BOTH queries', 
      result: {
        page1: { totalCount: 36, runs: 21 },
        page2: { totalCount: 36, runs: 16 }
      }
    },
    { time: 1500, event: 'Mutation succeeds' },
    { time: 1500, event: 'invalidateQueries invalidates BOTH' },
    { time: 1600, event: 'Both pages refetch', 
      result: {
        page1: { totalCount: 36, runs: 20 },  // New run at top
        page2: { totalCount: 36, runs: 16 }
      }
    }
  ],
  
  assertions: [
    'setQueriesData updates all matching queries',
    'Total count consistent across all pages',
    'New run appears on page 1 (sorted by date)',
    'Page 2 count adjusted if needed',
    'No pagination bugs'
  ]
};

/**
 * Scenario 5: Filter Active - Status Filter
 * 
 * Steps:
 * 1. User filters by status='completed'
 * 2. User creates new run (status='queued')
 * 3. Optimistic update adds run to cache
 * 4. But run doesn't match filter
 * 5. Mutation succeeds, refetch applies filter
 * 
 * Expected:
 * - Optimistic run briefly visible
 * - Refetch applies filter correctly
 * - New run not shown (doesn't match filter)
 */
export const scenario_FilterActive = {
  name: 'Filter Active - Status Filter',
  
  initialCache: {
    queryKey: ['runs', 'org_123', { page: 1, pageSize: 20, status: 'completed' }],
    data: {
      runs: [
        { id: 'run_1', status: 'completed' },
        { id: 'run_2', status: 'completed' }
      ],
      totalCount: 2
    }
  },
  
  newRunData: {
    jobTitle: 'New Job',
    company: 'New Company'
    // Optimistic status will be 'queued' (doesn't match filter)
  },
  
  timeline: [
    { time: 0, event: 'User creates run while filtering by "completed"' },
    { time: 0, event: 'Optimistic update adds run (status=queued)', 
      cacheState: { runs: 3, totalCount: 3 } },
    { time: 0, event: 'UI briefly shows 3 runs (including non-matching)', 
      uiState: 'Shows temp run (filter not applied yet)' },
    { time: 1500, event: 'Mutation succeeds, invalidate queries' },
    { time: 1600, event: 'Refetch applies filter', 
      cacheState: { runs: 2, totalCount: 2 } },
    { time: 1600, event: 'New run filtered out (status != completed)', 
      uiState: 'Shows 2 runs (original state)' }
  ],
  
  assertions: [
    'Optimistic update applied even with filter',
    'Filter re-applied on refetch',
    'New run correctly filtered out',
    'Count returns to 2 (no matching runs added)',
    'No UI confusion'
  ],
  
  improvement: 'Could skip optimistic update if status doesn\'t match filter'
};

/**
 * Scenario 6: Offline - No Network
 * 
 * Steps:
 * 1. User goes offline
 * 2. User creates new run
 * 3. Optimistic update adds run
 * 4. API call fails (network error)
 * 5. Rollback removes run
 * 
 * Expected:
 * - Optimistic update shows briefly
 * - Network error caught
 * - Rollback executed
 * - Offline message shown
 */
export const scenario_Offline = {
  name: 'Offline - No Network',
  
  timeline: [
    { time: 0, event: 'User goes offline', 
      state: 'navigator.onLine = false' },
    { time: 100, event: 'User clicks Create Run' },
    { time: 100, event: 'Optimistic update applied', 
      cacheState: { runs: [optimisticRun, ...existing] } },
    { time: 100, event: 'API call starts (will fail)' },
    { time: 500, event: 'Network error: Failed to fetch', 
      error: 'TypeError: Failed to fetch' },
    { time: 500, event: 'onError rollback', 
      cacheState: { runs: [...existing] } },
    { time: 500, event: 'Toast: "You are offline"', 
      uiState: 'Shows original state + error' }
  ],
  
  assertions: [
    'Optimistic update applied',
    'Network error caught',
    'Rollback successful',
    'User informed of offline state',
    'No data corruption'
  ],
  
  enhancement: 'Could queue mutations for offline sync'
};

/**
 * Scenario 7: Rapid Fire - Multiple Creates
 * 
 * Steps:
 * 1. User clicks Create Run 3 times rapidly
 * 2. 3 optimistic updates applied
 * 3. All 3 API calls in flight
 * 4. All 3 succeed
 * 5. Refetch shows all 3 new runs
 * 
 * Expected:
 * - All 3 optimistic updates applied
 * - All 3 mutations succeed
 * - Final state has all 3 new runs
 * - No duplicate IDs
 */
export const scenario_RapidFire = {
  name: 'Rapid Fire - Multiple Creates',
  
  timeline: [
    { time: 0, event: 'User clicks Create Run #1', 
      optimisticRun: { id: 'temp-1000' } },
    { time: 50, event: 'User clicks Create Run #2', 
      optimisticRun: { id: 'temp-1050' } },
    { time: 100, event: 'User clicks Create Run #3', 
      optimisticRun: { id: 'temp-1100' } },
    { time: 100, event: 'Cache state', 
      cacheState: { 
        runs: [
          { id: 'temp-1100' },
          { id: 'temp-1050' },
          { id: 'temp-1000' },
          ...existing
        ],
        totalCount: existing.length + 3
      }
    },
    { time: 1500, event: 'All 3 API calls complete', 
      responses: [
        { id: 'run_abc' },
        { id: 'run_def' },
        { id: 'run_ghi' }
      ]
    },
    { time: 1500, event: 'invalidateQueries → Refetch' },
    { time: 1600, event: 'Final cache state', 
      cacheState: {
        runs: [
          { id: 'run_ghi' },
          { id: 'run_def' },
          { id: 'run_abc' },
          ...existing
        ],
        totalCount: existing.length + 3
      }
    }
  ],
  
  assertions: [
    'All 3 optimistic updates applied',
    'No ID conflicts (temp-1000, temp-1050, temp-1100)',
    'All 3 mutations succeed',
    'Final state correct',
    'Proper ordering maintained'
  ]
};

// ============================================================================
// EDGE CASES
// ============================================================================

/**
 * Edge Case 1: Empty Cache
 * 
 * What if cache is empty when creating first run?
 */
export const edgeCase_EmptyCache = {
  name: 'Empty Cache - First Run',
  
  initialCache: null,  // No cached data
  
  timeline: [
    { time: 0, event: 'User creates first run (no cache)' },
    { time: 0, event: 'setQueriesData check: if (!old) return old', 
      result: 'Skip optimistic update ✅' },
    { time: 1500, event: 'Mutation succeeds' },
    { time: 1500, event: 'invalidateQueries → Fetch runs' },
    { time: 2000, event: 'Initial fetch completes', 
      cacheState: { runs: [newRun], totalCount: 1 } }
  ],
  
  handling: 'Gracefully skips optimistic update if no cache exists'
};

/**
 * Edge Case 2: Stale Cache
 * 
 * What if cache is very old when creating run?
 */
export const edgeCase_StaleCache = {
  name: 'Stale Cache',
  
  initialCache: {
    runs: [/* old data from 1 hour ago */],
    totalCount: 10,
    dataUpdatedAt: Date.now() - 3600000  // 1 hour old
  },
  
  timeline: [
    { time: 0, event: 'User creates run with stale cache' },
    { time: 0, event: 'Optimistic update on stale data', 
      cacheState: { runs: [optimistic, ...stale], totalCount: 11 } },
    { time: 1500, event: 'Mutation succeeds' },
    { time: 1500, event: 'invalidateQueries → Fresh fetch', 
      result: 'Fetches current data (not stale)' },
    { time: 2000, event: 'Fresh data replaces stale+optimistic', 
      cacheState: { runs: [newRun, ...current], totalCount: actual } }
  ],
  
  handling: 'invalidateQueries ensures fresh data, overwriting stale cache'
};

/**
 * Edge Case 3: Partial Failure
 * 
 * What if mutation succeeds but invalidate fails?
 */
export const edgeCase_PartialFailure = {
  name: 'Partial Failure - Invalidate Error',
  
  timeline: [
    { time: 0, event: 'User creates run' },
    { time: 0, event: 'Optimistic update' },
    { time: 1500, event: 'Mutation succeeds ✅' },
    { time: 1500, event: 'onSettled → invalidateQueries' },
    { time: 1500, event: 'Invalidate fails (network issue)', 
      error: 'Failed to refetch' },
    { time: 1500, event: 'Cache state', 
      cacheState: { 
        runs: [optimisticRun, ...existing],
        status: 'stale'
      }
    }
  ],
  
  result: 'Optimistic run visible with temp ID until next successful refetch',
  handling: 'User can manually refresh or wait for next automatic refetch'
};

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

/**
 * Performance Test: Large Dataset
 * 
 * How does optimistic update perform with 1000+ runs?
 */
export const perfTest_LargeDataset = {
  name: 'Large Dataset (1000 runs)',
  
  initialCache: {
    runs: Array.from({ length: 1000 }, (_, i) => ({
      id: `run_${i}`,
      jobTitle: `Job ${i}`,
      company: `Company ${i}`
    })),
    totalCount: 1000
  },
  
  operations: [
    { operation: 'Optimistic update', expectedTime: '<5ms' },
    { operation: 'Array spread [optimistic, ...1000]', expectedTime: '<3ms' },
    { operation: 'setQueriesData', expectedTime: '<10ms' },
    { operation: 'Total optimistic update', expectedTime: '<20ms' }
  ],
  
  assertions: [
    'Optimistic update fast even with 1000 runs',
    'No noticeable lag in UI',
    'Memory usage acceptable',
    'Re-renders efficient'
  ]
};

/**
 * Performance Test: Many Queries
 * 
 * How does optimistic update perform with 20+ cached queries?
 */
export const perfTest_ManyQueries = {
  name: 'Many Queries (20 cached queries)',
  
  cachedQueries: [
    // 10 pages
    ...Array.from({ length: 10 }, (_, i) => ({
      queryKey: ['runs', 'org_123', { page: i + 1, pageSize: 20 }]
    })),
    // 5 status filters
    ...['completed', 'running', 'failed', 'queued', 'all'].map(status => ({
      queryKey: ['runs', 'org_123', { page: 1, pageSize: 20, status }]
    })),
    // 5 combinations
    ...Array.from({ length: 5 }, (_, i) => ({
      queryKey: ['runs', 'org_123', { page: i + 1, pageSize: 10, status: 'completed' }]
    }))
  ],
  
  operations: [
    { operation: 'getQueriesData (20 queries)', expectedTime: '<10ms' },
    { operation: 'setQueriesData (20 queries)', expectedTime: '<50ms' },
    { operation: 'forEach rollback (20 queries)', expectedTime: '<30ms' },
    { operation: 'Total optimistic update', expectedTime: '<100ms' }
  ],
  
  assertions: [
    'All 20 queries updated in <100ms',
    'No UI blocking',
    'Efficient batch updates',
    'Memory usage acceptable'
  ]
};

export default {
  scenarios: [
    scenario_HappyPath,
    scenario_ErrorPath,
    scenario_RaceCondition,
    scenario_MultiplePagesOptimisticUpdate,
    scenario_FilterActive,
    scenario_Offline,
    scenario_RapidFire
  ],
  edgeCases: [
    edgeCase_EmptyCache,
    edgeCase_StaleCache,
    edgeCase_PartialFailure
  ],
  perfTests: [
    perfTest_LargeDataset,
    perfTest_ManyQueries
  ]
};
