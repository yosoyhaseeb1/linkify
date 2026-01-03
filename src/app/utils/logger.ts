/**
 * Centralized logging utility for Lynqio
 * Only logs in development mode (import.meta.env.DEV)
 * Provides consistent formatting with emoji prefixes
 * Can be extended to send logs to services like LogRocket, Sentry, etc.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages
   * Only appears in development mode
   * @param message - Message to log
   * @param args - Additional data to log
   * @example logger.info('User logged in', { userId: user.id })
   */
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },

  /**
   * Log success messages
   * Only appears in development mode
   * @param message - Message to log
   * @param args - Additional data to log
   * @example logger.success('Data saved successfully', { count: 10 })
   */
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  },

  /**
   * Log warning messages
   * Only appears in development mode
   * @param message - Message to log
   * @param args - Additional data to log
   * @example logger.warn('Cache miss', { key: 'user-data' })
   */
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },

  /**
   * Log error messages
   * ALWAYS logs, even in production
   * Can be extended to send to error tracking services
   * @param message - Message to log
   * @param args - Additional data to log (typically error object)
   * @example logger.error('API request failed', error)
   */
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
    // In production, you could send to error tracking service here
    // Example: Sentry.captureException(args[0]);
  },

  /**
   * Log debug messages (verbose)
   * Only appears in development mode
   * @param message - Message to log
   * @param args - Additional data to log
   * @example logger.debug('Token payload', { org_id: 'org_123' })
   */
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }
};