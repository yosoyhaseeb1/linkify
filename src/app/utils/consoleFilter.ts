/**
 * Console filter utility to suppress known non-critical warnings
 * This runs before any components load to intercept console output
 */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

/**
 * Initialize console filters to suppress known informational warnings
 * This is safe to use in development/testing environments
 */
export function initConsoleFilters() {
  // Filter console.warn
  console.warn = function (...args: any[]) {
    const message = args[0]?.toString() || '';
    
    // Suppress Clerk development key warning (informational only)
    if (
      message.includes('Clerk has been loaded with development keys') ||
      message.includes('Development instances have strict usage limits') ||
      message.includes('clerk.com/docs/deployments/overview')
    ) {
      return; // Suppress this specific warning
    }
    
    // Allow all other warnings through
    originalWarn.apply(console, args);
  };

  // Filter console.error if needed (currently passing all through)
  console.error = function (...args: any[]) {
    const message = args[0]?.toString() || '';
    
    // Add any error filters here if needed
    // Currently passing all errors through
    
    originalError.apply(console, args);
  };
}

/**
 * Restore original console methods
 * Useful for testing or debugging
 */
export function restoreConsole() {
  console.warn = originalWarn;
  console.error = originalError;
}
