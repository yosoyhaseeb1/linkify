/**
 * Focus Trap Component
 * Traps keyboard focus within a container for modals, dialogs, and popovers
 */

import { useEffect, useRef } from 'react';
import { trapFocus, handleEscapeKey } from '../utils/accessibility';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
  className?: string;
}

export function FocusTrap({ 
  children, 
  active = true, 
  onEscape,
  className 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (onEscape) {
        handleEscapeKey(e, onEscape);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
