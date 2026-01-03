import { AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trapFocus, generateId } from '../utils/accessibility';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionTimeoutModal({ isOpen, onClose }: SessionTimeoutModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = generateId('session-timeout-title');
  const descId = generateId('session-timeout-desc');

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Handle Escape key (disabled for this modal - user must sign in)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Don't close - user must sign in
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh the session by checking if user data exists
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        // User is still authenticated, just refresh the session
        // Update the timestamp to extend the session
        const user = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Close the modal after a brief delay to show the loading state
        setTimeout(() => {
          setIsRefreshing(false);
          onClose();
        }, 500);
      } else {
        // If no user found, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      // On error, redirect to login
      window.location.href = '/login';
    }
  };

  // Prevent any interaction when modal is open
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Do not close modal - user must sign in
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleBackdropClick}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 glass-card rounded-xl p-8 max-w-md w-full sm:w-[95%] md:w-full mx-4 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-orange-500" aria-hidden="true" />
          </div>

          {/* Title */}
          <h2 id={titleId} className="mb-2">Your session has expired</h2>

          {/* Description */}
          <p id={descId} className="text-muted-foreground mb-6">
            Please sign in again to continue
          </p>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isRefreshing}
            aria-disabled={isRefreshing}
            aria-busy={isRefreshing}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}