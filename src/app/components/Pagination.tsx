import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
}

/**
 * Reusable Pagination Component
 * 
 * Features:
 * - Previous/Next navigation buttons
 * - Smart page number display with ellipsis
 * - Page X of Y indicator
 * - Optional page size selector (10, 20, 50, 100)
 * - Keyboard navigation (Arrow Left/Right)
 * - Dark theme optimized with accent color
 * - Fully accessible
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   pageSize={20}
 *   onPageSizeChange={setPageSize}
 *   showPageSizeSelector
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
  showPageSizeSelector = false,
}: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Keyboard navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (event.key === 'ArrowLeft' && !isFirstPage) {
        event.preventDefault();
        onPageChange(currentPage - 1);
      } else if (event.key === 'ArrowRight' && !isLastPage) {
        event.preventDefault();
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isFirstPage, isLastPage, onPageChange]);

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start: show 1, 2, 3, 4, ..., last
        pages.push(2, 3, 4);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end: show 1, ..., last-3, last-2, last-1, last
        pages.push('ellipsis');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    // Reset to first page when changing page size
    onPageChange(1);
  };

  return (
    <nav aria-label="Pagination" role="navigation" className="pagination-container">
      <div className="pagination-wrapper">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="page-size-selector">
            <label htmlFor="pageSize" className="page-size-label">
              Show
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="page-size-label">per page</span>
          </div>
        )}

        {/* Pagination controls */}
        <div className="pagination-controls" role="list">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={isFirstPage}
            className="pagination-button pagination-nav"
            aria-label="Go to previous page"
            aria-disabled={isFirstPage}
            title="Previous page (Arrow Left)"
            role="listitem"
          >
            <ChevronLeft className="pagination-icon" aria-hidden="true" />
            <span className="pagination-nav-text">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="pagination-pages" role="list">
            {pageNumbers.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="pagination-ellipsis"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`pagination-button pagination-page ${
                    currentPage === page ? 'active' : ''
                  }`}
                  aria-label={`${currentPage === page ? 'Current page, page' : 'Go to page'} ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  role="listitem"
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={isLastPage}
            className="pagination-button pagination-nav"
            aria-label="Go to next page"
            aria-disabled={isLastPage}
            title="Next page (Arrow Right)"
            role="listitem"
          >
            <span className="pagination-nav-text">Next</span>
            <ChevronRight className="pagination-icon" aria-hidden="true" />
          </button>
        </div>

        {/* Page info */}
        <div className="pagination-info" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Page {currentPage} of {totalPages}</span>
          <span aria-hidden="true">
            Page <span className="pagination-info-highlight">{currentPage}</span> of{' '}
            <span className="pagination-info-highlight">{totalPages}</span>
          </span>
        </div>
      </div>

      <style jsx>{`
        .pagination-container {
          width: 100%;
          padding: 1rem 0;
        }

        .pagination-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .pagination-wrapper {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        /* Page size selector */
        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .page-size-label {
          color: var(--muted-foreground);
        }

        .page-size-select {
          padding: 0.375rem 0.75rem;
          background-color: var(--input-background);
          border: 1px solid var(--border);
          border-radius: calc(var(--radius) - 4px);
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-size-select:hover {
          border-color: var(--accent-foreground);
        }

        .page-size-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--ring);
        }

        /* Pagination controls */
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          min-width: 2.5rem;
          height: 2.5rem;
          background-color: transparent;
          border: 1px solid var(--border);
          border-radius: calc(var(--radius) - 4px);
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: var(--accent);
          border-color: var(--accent-foreground);
          color: var(--accent-foreground);
        }

        .pagination-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .pagination-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--ring);
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Navigation buttons (Previous/Next) */
        .pagination-nav {
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          min-width: auto;
        }

        .pagination-nav-text {
          font-size: 0.875rem;
        }

        .pagination-icon {
          width: 1rem;
          height: 1rem;
        }

        @media (max-width: 640px) {
          .pagination-nav-text {
            display: none;
          }

          .pagination-nav {
            padding: 0.5rem;
            min-width: 2.5rem;
          }
        }

        /* Page number buttons */
        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-page {
          font-size: 0.875rem;
        }

        .pagination-page.active {
          background-color: var(--primary);
          border-color: var(--primary);
          color: var(--primary-foreground);
          font-weight: var(--font-weight-medium);
        }

        .pagination-page.active:hover {
          background-color: var(--primary-hover);
          border-color: var(--primary-hover);
          color: var(--primary-foreground);
        }

        /* Ellipsis */
        .pagination-ellipsis {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          color: var(--muted-foreground);
          font-size: 1rem;
          user-select: none;
        }

        /* Page info */
        .pagination-info {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .pagination-info-highlight {
          color: var(--foreground);
          font-weight: var(--font-weight-medium);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .pagination-pages {
            gap: 0.125rem;
          }

          .pagination-button {
            min-width: 2.25rem;
            height: 2.25rem;
            padding: 0.375rem;
            font-size: 0.8125rem;
          }

          .pagination-ellipsis {
            width: 2.25rem;
            height: 2.25rem;
          }
        }

        /* Keyboard hint for desktop users */
        @media (hover: hover) and (pointer: fine) {
          .pagination-nav:not(:disabled):hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.25rem 0.5rem;
            background-color: var(--popover);
            border: 1px solid var(--border);
            border-radius: calc(var(--radius) - 6px);
            color: var(--popover-foreground);
            font-size: 0.75rem;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            animation: fadeIn 0.2s ease 0.5s forwards;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Focus styles for accessibility */
        .pagination-button:focus-visible,
        .page-size-select:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        
        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </nav>
  );
}
