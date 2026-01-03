/**
 * Custom React hooks for accessibility features
 */

import { useEffect, useRef, useCallback } from 'react';
import { trapFocus, announce } from '../utils/accessibility';

/**
 * Hook to trap focus within a modal/dialog
 * @param isOpen - Whether the modal is open
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);
    return cleanup;
  }, [isOpen]);

  return containerRef;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
}

/**
 * Hook to restore focus when component unmounts
 * Useful for modals/dialogs that should return focus to trigger element
 */
export function useRestoreFocus() {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);
}

/**
 * Hook to manage keyboard shortcuts
 * @param shortcuts - Object mapping key combinations to callbacks
 * @param enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.altKey && 'Alt',
        e.shiftKey && 'Shift',
        e.metaKey && 'Meta',
        e.key
      ]
        .filter(Boolean)
        .join('+');

      const callback = shortcuts[key];
      if (callback) {
        e.preventDefault();
        callback(e);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = 
    useReducedMotionState();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

function useReducedMotionState() {
  const [state, setState] = useState(false);
  return [state, setState] as const;
}

// Import useState at the top if needed
import { useState } from 'react';
