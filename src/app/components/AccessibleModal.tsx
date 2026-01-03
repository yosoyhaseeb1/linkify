/**
 * Example: Accessible Modal Component
 * Demonstrates best practices for focus management and keyboard navigation
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, useRestoreFocus, useAnnouncer } from '../hooks/useAccessibility';
import { generateId } from '../utils/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  description
}: AccessibleModalProps) {
  const containerRef = useFocusTrap(isOpen);
  const announce = useAnnouncer();
  useRestoreFocus();

  const titleId = generateId('modal-title');
  const descId = generateId('modal-desc');

  // Announce when modal opens
  useEffect(() => {
    if (isOpen) {
      announce(`Dialog opened: ${title}`, 'assertive');
    }
  }, [isOpen, title, announce]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        announce('Dialog closed', 'polite');
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, announce]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
      >
        <div className="bg-card border border-border rounded-lg shadow-xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold text-foreground">
                {title}
              </h2>
              {description && (
                <p id={descId} className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-foreground">
            {children}
          </div>

          {/* Footer with action buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
