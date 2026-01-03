/**
 * Environment utilities and validation
 */

import { clerkPublishableKey } from '../../../utils/clerk/info';

/**
 * Check if running in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

/**
 * Get environment name
 */
export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (import.meta.env.MODE === 'test') return 'test';
  if (isProduction()) return 'production';
  return 'development';
};

/**
 * Log environment information (development only)
 */
export const logEnvironmentInfo = () => {
  if (!isDevelopment()) return;

  const isDevKey = clerkPublishableKey?.startsWith('pk_test_');
  const hasEnvVar = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  console.log(
    '%c🔧 Development Environment',
    'background: #06B6D4; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  
  if (isDevKey) {
    console.log(
      '%c✓ Using Clerk development keys (expected in development)',
      'color: #10B981; font-weight: 500;'
    );
  }

  if (!hasEnvVar && clerkPublishableKey) {
    console.log(
      '%cℹ️ Using fallback Clerk key (Figma Make environment)',
      'color: #06B6D4; font-weight: 500;'
    );
  }
  
  console.log(
    '%cℹ️ Switch to production keys when deploying',
    'color: #94a3b8; font-style: italic;'
  );
};

/**
 * Validate required environment variables
 * Returns true if all required configs are present
 */
export const validateEnvironment = (): boolean => {
  // Check if Clerk key is available (either from env or fallback)
  if (!clerkPublishableKey) {
    console.error(
      '❌ Missing required configuration: Clerk publishable key'
    );
    return false;
  }
  
  // All validations passed
  return true;
};
