/**
 * PageLoader Component Usage Examples
 * 
 * This file documents all loader variants available in Lynqio
 * for different loading scenarios throughout the app.
 */

import { PageLoader, PageLoaderSkeleton, InlineLoader } from '../components/PageLoader';
import { Suspense, lazy } from 'react';

// ============================================================================
// 1. DEFAULT PAGE LOADER (Code-Split Routes)
// ============================================================================
// Used in App.tsx with React.lazy() for route-based code splitting

const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));

export function RouteExample() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  );
}

// ============================================================================
// 2. CUSTOM MESSAGE LOADER
// ============================================================================
// Use when you want to show a specific loading message

export function CustomMessageExample() {
  return (
    <Suspense fallback={<PageLoader message="Loading analytics data..." />}>
      {/* Your component */}
    </Suspense>
  );
}

// ============================================================================
// 3. LOADER WITHOUT TEXT
// ============================================================================
// Clean spinner-only loader (useful in compact spaces)

export function NoTextExample() {
  return (
    <Suspense fallback={<PageLoader showText={false} />}>
      {/* Your component */}
    </Suspense>
  );
}

// ============================================================================
// 4. PARTIAL HEIGHT LOADER
// ============================================================================
// Use for content sections (not full-page)

export function PartialHeightExample() {
  return (
    <div className="glass-card p-6">
      <h2>My Section</h2>
      <Suspense fallback={<PageLoader fullScreen={false} message="Loading section..." />}>
        {/* Your lazy-loaded component */}
      </Suspense>
    </div>
  );
}

// ============================================================================
// 5. SKELETON LOADER (Content Preview)
// ============================================================================
// Shows content structure while loading (better perceived performance)

export function SkeletonExample() {
  return (
    <Suspense fallback={<PageLoaderSkeleton />}>
      {/* Your data-heavy component */}
    </Suspense>
  );
}

// ============================================================================
// 6. INLINE LOADER (Buttons, Small Sections)
// ============================================================================
// Small spinner for buttons, inline states, etc.

export function InlineExample() {
  const isLoading = true;
  
  return (
    <div>
      {/* Inside buttons */}
      <button className="btn-primary" disabled={isLoading}>
        {isLoading ? (
          <>
            <InlineLoader size={16} />
            <span className="ml-2">Processing...</span>
          </>
        ) : (
          'Submit'
        )}
      </button>

      {/* Inline with text */}
      <p className="flex items-center gap-2">
        <InlineLoader size={14} />
        Fetching latest data...
      </p>

      {/* Custom size */}
      <div className="flex justify-center">
        <InlineLoader size={24} />
      </div>
    </div>
  );
}

// ============================================================================
// 7. CONDITIONAL RENDERING
// ============================================================================
// Use loader as conditional state (not just Suspense)

export function ConditionalExample() {
  const { data, isLoading, error } = useSomeQuery();

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState />;
  }

  return <div>{/* Render data */}</div>;
}

// ============================================================================
// 8. NESTED SUSPENSE BOUNDARIES
// ============================================================================
// Multiple loaders for different sections

export function NestedExample() {
  return (
    <div>
      <Suspense fallback={<PageLoader message="Loading header..." fullScreen={false} />}>
        <Header />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<PageLoader message="Loading stats..." fullScreen={false} />}>
          <StatsWidget />
        </Suspense>
        
        <Suspense fallback={<PageLoader message="Loading charts..." fullScreen={false} />}>
          <ChartsWidget />
        </Suspense>
      </div>

      <Suspense fallback={<PageLoaderSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}

// ============================================================================
// ACCESSIBILITY NOTES
// ============================================================================
/**
 * All loaders include:
 * - role="status" for screen readers
 * - aria-live="polite" for announcements
 * - aria-label="Loading" for context
 * - Hidden descriptive text with .sr-only class
 * 
 * WCAG 2.1 Level AA compliant
 */

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================
/**
 * 1. Use PageLoader for full-page lazy loading (routes)
 * 2. Use PageLoaderSkeleton for data-heavy lists/tables
 * 3. Use InlineLoader for small UI elements (buttons, badges)
 * 4. Avoid nesting too many Suspense boundaries (performance)
 * 5. Set reasonable timeouts for loader states
 * 6. Consider showing skeleton after 200ms delay
 */

// ============================================================================
// WHEN TO USE EACH LOADER
// ============================================================================
/**
 * PageLoader (Default):
 * ✓ Lazy-loaded routes
 * ✓ Full-page async operations
 * ✓ Initial app load
 * ✗ Tables/lists (use skeleton)
 * ✗ Buttons (use inline)
 * 
 * PageLoaderSkeleton:
 * ✓ Data tables
 * ✓ Content-heavy pages
 * ✓ Dashboards with multiple widgets
 * ✗ Simple text loads
 * ✗ Button states
 * 
 * InlineLoader:
 * ✓ Button loading states
 * ✓ Inline text status
 * ✓ Small UI elements
 * ✗ Full-page loads
 * ✗ Major content sections
 */

export {}; // Make this a module
