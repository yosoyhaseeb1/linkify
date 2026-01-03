import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorBanner({ message, onRetry, isRetrying = false }: ErrorBannerProps) {
  return (
    <div 
      role="alert" 
      aria-live="assertive"
      aria-atomic="true"
      className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-destructive font-medium">
            <span className="sr-only">Error: </span>
            {message}
          </p>
        </div>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          aria-label={isRetrying ? 'Retrying, please wait' : 'Retry loading'}
          aria-disabled={isRetrying}
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
}

// Screen reader only utility class
const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
