# JSDoc Documentation Summary

This document summarizes all JSDoc documentation added to the Lynqio codebase.

---

## 📚 **Files with Comprehensive JSDoc**

### **1. Contexts**

#### **`/src/app/contexts/AuthContext.tsx`**

**AuthProvider Component:**
```typescript
/**
 * Authentication Provider Component
 * Wraps the application and provides authentication context
 * Uses Clerk for authentication and JWT token management
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components to render
 * @returns React element with auth context provider
 */
```

**useAuth Hook:**
```typescript
/**
 * Hook to access authentication context
 * Provides user info, auth state, and token management
 * @returns AuthContextType with user, loading state, and auth functions
 * @throws Error if used outside of AuthProvider
 */
```

**getToken Method:**
```typescript
/**
 * Gets a fresh JWT token for API authentication
 * Uses the "supabase" template configured in Clerk Dashboard
 * @param options - Optional config, use { skipCache: true } for fresh token
 * @returns Promise<string | null> - JWT token or null if not authenticated
 */
```

---

#### **`/src/app/contexts/OrganizationContext.tsx`**

**OrganizationProvider Component:**
```typescript
/**
 * Organization Provider Component
 * Manages multi-tenant organization state and Clerk integration
 * Handles org switching, member management, and backend sync
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components to render
 */
```

**useOrganization Hook:**
```typescript
/**
 * Hook to access organization context
 * Must be used within an OrganizationProvider
 * @returns OrganizationContextType with org data, members, and management functions
 * @throws Error if used outside of OrganizationProvider
 */
```

**OrganizationContextType Interface:**
```typescript
/**
 * Organization context value type
 * @property organizations - List of organizations the user belongs to
 * @property currentOrg - Currently active organization
 * @property switchOrganization - Function to switch to a different org
 * @property members - Members of the current organization
 * @property usage - Current usage statistics and limits for the organization
 * @property inviteMember - Function to invite a new member to the organization
 * @property removeMember - Function to remove a member from the organization
 * @property updateMemberRole - Function to update a member's role (Admin or Member)
 * @property loadingMembers - Whether members are currently being loaded
 * @property loadingOrg - Whether organization data is currently being loaded
 * @property isCurrentUserAdmin - Function to check if current user is admin
 * @property currentUserMember - The current user's member object in the organization
 */
```

---

### **2. Hooks**

#### **`/src/app/hooks/useRuns.ts`**

**File Header:**
```typescript
/**
 * React Query hooks for managing runs data
 * Provides caching, optimistic updates, and automatic refetching
 */
```

**useRuns Hook:**
```typescript
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
 * ```
 */
```

**useCreateRun Hook:**
```typescript
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
```

**useRun Hook:**
```typescript
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
```

---

### **3. Services**

#### **`/src/app/services/userDataService.ts`**

**File Header:**
```typescript
/**
 * User Data Service
 * Handles fetching and saving user-scoped data (contacts, tasks, jobs)
 * Uses two-token auth: Supabase anon key + Clerk JWT
 * Each user gets their own isolated workspace
 * Includes simple cache to reduce redundant API calls
 */
```

**fetchUserData Function:**
```typescript
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
```

**clearUserDataCache Function:**
```typescript
/**
 * Clear cache for a specific user (call after updates)
 * @param userId - The user's Clerk ID to clear cache for
 */
```

**saveUserContacts Function:**
```typescript
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
```

---

### **4. Utils**

#### **`/src/app/utils/logger.ts`**

**File Header:**
```typescript
/**
 * Centralized logging utility for Lynqio
 * Only logs in development mode (import.meta.env.DEV)
 * Provides consistent formatting with emoji prefixes
 * Can be extended to send logs to services like LogRocket, Sentry, etc.
 */
```

**logger.info:**
```typescript
/**
 * Log informational messages
 * Only appears in development mode
 * @param message - Message to log
 * @param args - Additional data to log
 * @example logger.info('User logged in', { userId: user.id })
 */
```

**logger.success:**
```typescript
/**
 * Log success messages
 * Only appears in development mode
 * @param message - Message to log
 * @param args - Additional data to log
 * @example logger.success('Data saved successfully', { count: 10 })
 */
```

**logger.warn:**
```typescript
/**
 * Log warning messages
 * Only appears in development mode
 * @param message - Message to log
 * @param args - Additional data to log
 * @example logger.warn('Cache miss', { key: 'user-data' })
 */
```

**logger.error:**
```typescript
/**
 * Log error messages
 * ALWAYS logs, even in production
 * Can be extended to send to error tracking services
 * @param message - Message to log
 * @param args - Additional data to log (typically error object)
 * @example logger.error('API request failed', error)
 */
```

**logger.debug:**
```typescript
/**
 * Log debug messages (verbose)
 * Only appears in development mode
 * @param message - Message to log
 * @param args - Additional data to log
 * @example logger.debug('Token payload', { org_id: 'org_123' })
 */
```

---

## 📖 **JSDoc Best Practices Used**

### **1. Component Documentation**
```typescript
/**
 * Brief component description
 * Additional details about functionality
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components
 * @returns React element
 */
```

### **2. Hook Documentation**
```typescript
/**
 * Hook description
 * 
 * @param param1 - Parameter description
 * @returns Object with properties and functions
 * @throws Error if conditions not met
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useHook();
 * ```
 */
```

### **3. Function Documentation**
```typescript
/**
 * Function description
 * 
 * @param arg1 - First argument
 * @param arg2 - Second argument
 * @returns Return value description
 * 
 * @example
 * ```tsx
 * const result = myFunction(arg1, arg2);
 * ```
 */
```

### **4. Interface Documentation**
```typescript
/**
 * Interface description
 * @property prop1 - Property description
 * @property prop2 - Property description
 */
interface MyInterface {
  prop1: string;
  prop2: number;
}
```

---

## 🎯 **Benefits of JSDoc**

### **1. IDE IntelliSense**
- Autocomplete with descriptions
- Parameter hints
- Type information
- Usage examples

### **2. Documentation Generation**
- Can generate docs with TypeDoc
- API reference automatically created
- Always in sync with code

### **3. Developer Experience**
- Clear usage examples
- Reduces need for external docs
- Easier onboarding for new developers
- Self-documenting code

### **4. Type Safety**
- Complements TypeScript
- Validates parameter types
- Catches errors early

---

## 📝 **Usage Examples**

### **In VSCode (Hover)**
When hovering over `useAuth()`:
```
Hook to access authentication context
Provides user info, auth state, and token management

Returns: AuthContextType with user, loading state, and auth functions
Throws: Error if used outside of AuthProvider
```

### **In VSCode (Autocomplete)**
When typing `logger.`:
```
info    - Log informational messages (dev only)
success - Log success messages (dev only)
warn    - Log warning messages (dev only)
error   - Log error messages (always)
debug   - Log debug messages (dev only)
```

### **In VSCode (Parameter Hints)**
When typing `fetchUserData(`:
```
fetchUserData(userId: string, token: string, forceRefresh?: boolean)

userId: The user's Clerk ID
token: Clerk JWT token for authentication
forceRefresh: Skip cache if true
```

---

## 🚀 **Next Steps**

### **Additional Files to Document**
- [ ] `/src/app/services/apiService.ts` - Main API service
- [ ] `/src/app/components/DashboardLayout.tsx` - Layout component
- [ ] `/src/app/components/Pagination.tsx` - Pagination component
- [ ] `/src/app/hooks/useProspects.ts` - Prospects hook
- [ ] `/src/app/hooks/useMessages.ts` - Messages hook

### **Documentation Enhancements**
- [ ] Add more usage examples
- [ ] Document error handling patterns
- [ ] Add performance tips
- [ ] Include troubleshooting guides

---

## 📚 **Resources**

- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html#jsdoc)

---

**Last Updated:** December 28, 2024
