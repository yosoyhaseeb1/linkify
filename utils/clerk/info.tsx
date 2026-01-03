/* Clerk configuration for Figma Make environment */

// In Figma Make preview, environment variables don't always load reliably
// Publishable keys are safe to include in frontend code (they're designed to be public)
// For production deployment, these would be loaded from environment variables

// Fallback to hardcoded DEVELOPMENT key for Figma Make preview environment
// NOTE: This is a test/development key and shows a Clerk warning - this is expected and safe
const HARDCODED_PUBLISHABLE_KEY = 'pk_test_ZGVjaWRpbmctdmlwZXItNjcuY2xlcmsuYWNjb3VudHMuZGV2JA';

// Try to get from environment variable first, fallback to hardcoded
export const clerkPublishableKey = 
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) || 
  HARDCODED_PUBLISHABLE_KEY;

// Check if we're in development and the key might not be loaded yet
export const isClerkConfigured = () => {
  const key = clerkPublishableKey;
  if (!key) {
    console.warn('⚠️ No Clerk publishable key available');
    return false;
  }
  return true;
};

// Determine if using development or production key
const isDevelopmentKey = clerkPublishableKey?.startsWith('pk_test_');

// Log configuration status on module load
console.log('🔐 Clerk Configuration Status:');
console.log('- Environment:', isDevelopmentKey ? 'Development (Expected for Figma Make)' : 'Production');
console.log('- Key Source:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Environment Variable' : 'Hardcoded Fallback');
console.log('- Key Available:', !!clerkPublishableKey);
if (clerkPublishableKey) {
  console.log('- Key Preview:', clerkPublishableKey.substring(0, 20) + '...');
  console.log('✅ Clerk is ready');
  if (isDevelopmentKey) {
    console.log('ℹ️ Development key detected - Clerk warning is expected and safe');
  }
} else {
  console.log('❌ Clerk configuration missing');
}