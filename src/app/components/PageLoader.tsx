import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  /** Optional loading message. Defaults to "Loading page..." */
  message?: string;
  /** Show/hide the loading text. Defaults to true */
  showText?: boolean;
  /** Use full screen height. Defaults to true */
  fullScreen?: boolean;
}

/**
 * PageLoader - Loading fallback for lazy-loaded route components
 * 
 * Features:
 * - Full-page centered loader with smooth fade-in animation
 * - Animated spinner with pulse effect
 * - Uses theme CSS variables for consistent dark theme styling
 * - Prevents layout shift with min-height
 * - Customizable loading message
 * 
 * Used in React.Suspense fallback while page chunks are loading
 */
export function PageLoader({ 
  message = 'Loading page...', 
  showText = true,
  fullScreen = true 
}: PageLoaderProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-background animate-fade-in ${
        fullScreen ? 'min-h-screen' : 'min-h-[400px]'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner with pulse effect */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          
          {/* Spinning loader */}
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>

        {/* Optional loading text with fade effect */}
        {showText && (
          <div className="text-sm text-muted-foreground animate-pulse">
            {message}
          </div>
        )}
      </div>

      {/* Accessibility: Hidden text for screen readers */}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}

/**
 * PageLoaderSkeleton - Alternative skeleton loader for content areas
 * 
 * Used for partial page loads or content sections
 */
export function PageLoaderSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-muted/30 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-muted/20 rounded-lg animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 space-y-3">
              <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted/20 rounded animate-pulse" />
              <div className="h-3 w-full bg-muted/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="glass-card p-6 space-y-4">
          <div className="h-6 w-48 bg-muted/30 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted/30 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * InlineLoader - Small inline loader for button states or small sections
 */
export function InlineLoader({ size = 16 }: { size?: number }) {
  return (
    <Loader2 
      className="text-primary animate-spin" 
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
