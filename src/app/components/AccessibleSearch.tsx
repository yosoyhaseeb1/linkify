/**
 * Example: Accessible Search Component
 * Demonstrates proper search accessibility with ARIA roles and labels
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { generateId } from '../utils/accessibility';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface AccessibleSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  ariaLabel?: string;
}

export function AccessibleSearch({
  placeholder = 'Search...',
  onSearch,
  results = [],
  isLoading = false,
  ariaLabel = 'Search'
}: AccessibleSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsId = generateId('search-results');
  const inputId = generateId('search-input');
  const liveRegionId = generateId('search-live');

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        onSearch(query);
      }, 300); // Debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpanded || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;

      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          // Handle selection
          console.log('Selected:', results[selectedIndex]);
          setIsExpanded(false);
          setQuery('');
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsExpanded(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" role="search" aria-label={ariaLabel}>
      {/* Screen reader instructions */}
      <div className="sr-only" id={`${inputId}-instructions`}>
        Type to search. Use arrow keys to navigate results, Enter to select, Escape to close.
      </div>

      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
        
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="searchbox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsExpanded(e.target.value.trim().length > 0);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim()) setIsExpanded(true);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-describedby={`${inputId}-instructions`}
          aria-expanded={isExpanded}
          aria-controls={resultsId}
          aria-activedescendant={
            selectedIndex >= 0 ? `result-${results[selectedIndex]?.id}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full pl-10 pr-10 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isExpanded && (
        <div
          id={resultsId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div 
              role="status" 
              aria-live="polite"
              className="p-4 text-center text-muted-foreground"
            >
              <span>Loading results...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  id={`result-${result.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => {
                    console.log('Selected:', result);
                    setIsExpanded(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-0 ${
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium text-foreground">
                    {result.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.type}
                  </div>
                </div>
              ))}
            </>
          ) : query.trim() ? (
            <div 
              role="status"
              className="p-4 text-center text-muted-foreground"
            >
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Live Region for Screen Readers */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && 'Searching...'}
        {!isLoading && query && results.length > 0 && 
          `${results.length} result${results.length !== 1 ? 's' : ''} found`}
        {!isLoading && query && results.length === 0 && 
          'No results found'}
      </div>
    </div>
  );
}
