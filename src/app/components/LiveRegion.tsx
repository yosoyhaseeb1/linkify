/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 * Use for status messages, notifications, and loading states
 */

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number; // Auto-clear message after X milliseconds
}

export function LiveRegion({ 
  message, 
  priority = 'polite',
  clearAfter 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clearAfter || !message) return;

    const timer = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = '';
      }
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  if (!message) return null;

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
