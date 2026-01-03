/**
 * Development Mode Indicator
 * Shows a small badge when using development Clerk keys
 * Helps developers understand they're in dev mode
 */

import { clerkPublishableKey } from '../../utils/clerk/info';

export function DevModeIndicator() {
  // Only show if using test/development keys
  const isDevelopmentKey = clerkPublishableKey?.startsWith('pk_test_');
  
  // Don't show in production or if no key
  if (!isDevelopmentKey) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-yellow-500/90 backdrop-blur-sm text-black rounded-full text-xs font-medium shadow-lg flex items-center gap-2"
      role="status"
      aria-label="Development mode indicator"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" aria-hidden="true" />
      <span>Development Mode</span>
      
      {/* Tooltip on hover */}
      <div className="dev-mode-tooltip">
        <div className="text-xs">
          Using Clerk development keys.
          <br />
          This is normal during development.
        </div>
      </div>
      
      <style jsx>{`
        .dev-mode-tooltip {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 0.5rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        
        div:hover .dev-mode-tooltip {
          opacity: 1;
        }
        
        @media (max-width: 640px) {
          .dev-mode-tooltip {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
