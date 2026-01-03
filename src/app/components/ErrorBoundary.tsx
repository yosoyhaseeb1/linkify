import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components
 * Displays a friendly error UI and logs errors for debugging
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to the logger utility
    logger.error('Error Boundary caught an error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  title?: string;
  message?: string;
}

/**
 * Customizable error fallback UI component
 * Can be used standalone or with ErrorBoundary
 * @param error - The error that was caught
 * @param errorInfo - Additional error information from React
 * @param onReset - Callback to reset the error state
 * @param title - Custom error title (default: "Something went wrong")
 * @param message - Custom error message
 */
export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  title = 'Something went wrong',
  message,
}: ErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="glass-card rounded-xl max-w-2xl w-full p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-center mb-4">{title}</h1>

        {/* Error Message */}
        <p className="text-center text-muted-foreground mb-6">
          {message ||
            "We're sorry, but something unexpected happened. Please try reloading the page."}
        </p>

        {/* Try Again Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>

        {/* Development Mode Error Details */}
        {isDevelopment && error && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
              Error Details (Development Only)
            </summary>
            <div className="space-y-4">
              {/* Error Message */}
              <div>
                <h3 className="text-sm font-medium text-red-500 mb-2">Error:</h3>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <code className="text-sm text-red-400 break-all">
                    {error.toString()}
                  </code>
                </div>
              </div>

              {/* Stack Trace */}
              {error.stack && (
                <div>
                  <h3 className="text-sm font-medium text-orange-500 mb-2">
                    Stack Trace:
                  </h3>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg max-h-64 overflow-auto">
                    <pre className="text-xs text-orange-400 whitespace-pre-wrap break-all font-mono">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              )}

              {/* Component Stack */}
              {errorInfo?.componentStack && (
                <div>
                  <h3 className="text-sm font-medium text-yellow-500 mb-2">
                    Component Stack:
                  </h3>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-h-64 overflow-auto">
                    <pre className="text-xs text-yellow-400 whitespace-pre-wrap break-all font-mono">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please contact support or check the{' '}
            <a href="/help" className="text-primary hover:text-primary-hover underline">
              Help Center
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
