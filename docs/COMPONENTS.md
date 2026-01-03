# Component Documentation

## Layout Components

### DashboardLayout
Main app layout with sidebar navigation and content area.
- Props: children (ReactNode)
- Features: Skip link, keyboard navigation, responsive sidebar

### ErrorBoundary
Catches JavaScript errors in child components.
- Props: children, fallback (optional)
- Shows friendly error UI with retry option

## UI Components

### Pagination
Reusable pagination with page numbers and size selector.
- Props: currentPage, totalPages, onPageChange, pageSize, onPageSizeChange
- Accessibility: ARIA labels, keyboard navigation

### Skeleton
Loading placeholder components.
- Variants: SkeletonText, SkeletonCard, SkeletonAvatar
- Props: width, height, className

### ErrorBanner
Error display with retry functionality.
- Props: message, onRetry, isRetrying
- Accessibility: role="alert", aria-live="assertive"

## Context Providers

### AuthProvider
Clerk authentication context.
- Provides: user, loading, getToken, signOut, clerkOrgRole

### OrganizationProvider
Multi-tenant organization context.
- Provides: currentOrg, organizations, members, switchOrganization

### ThemeProvider
Dark/light theme management.
- Provides: theme, setTheme, toggleTheme

## Custom Hooks

### useRuns
Fetch and manage runs with React Query.
- Options: page, pageSize, status
- Returns: runs, isLoading, error, refetch

### useProspects
Fetch prospects with pagination and filtering.
- Options: page, pageSize, runId, stage
- Returns: prospects, totalCount, isLoading

### useMessages
Real-time message fetching.
- Options: channel
- Returns: messages, sendMessage, isLoading
