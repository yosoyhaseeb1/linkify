import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage onboarding state for new users
 * 
 * Tracks whether a user has completed onboarding and provides
 * functions to control the onboarding flow.
 * 
 * @returns {Object} Onboarding state and control functions
 * @property {boolean} showOnboarding - Whether to display onboarding modal
 * @property {boolean} hasCompleted - Whether user has completed onboarding
 * @property {Function} completeOnboarding - Mark onboarding as complete
 * @property {Function} restartOnboarding - Show onboarding again
 * @property {Function} skipOnboarding - Skip and mark as complete
 * 
 * @example
 * const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
 * 
 * return (
 *   <>
 *     {showOnboarding && (
 *       <OnboardingModal 
 *         onComplete={completeOnboarding}
 *         onSkip={skipOnboarding}
 *       />
 *     )}
 *   </>
 * );
 */
export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `onboarding_completed_${user.id}`;
      const completed = localStorage.getItem(key) === 'true';
      setHasCompleted(completed);
      
      // Show onboarding if not completed
      // Add small delay to let the UI settle
      if (!completed) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      setHasCompleted(true);
      setShowOnboarding(false);
    }
  };

  const restartOnboarding = () => {
    setShowOnboarding(true);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    showOnboarding,
    hasCompleted,
    completeOnboarding,
    restartOnboarding,
    skipOnboarding,
  };
}
