import { Search, X, Zap, Users, Briefcase, ListTodo, TrendingUp, MessageSquare, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/accessibility';

interface SearchResult {
  id: string;
  type: 'run' | 'contact' | 'task' | 'deal' | 'job';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  icon: any;
  iconColor: string;
}

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'run',
    title: 'Senior Software Engineer @ TechCorp',
    subtitle: 'Run',
    description: 'Completed • 3 hours ago',
    url: '/runs/1',
    icon: Zap,
    iconColor: 'text-blue-500'
  },
  {
    id: '2',
    type: 'contact',
    title: 'Sarah Chen',
    subtitle: 'Contact',
    description: 'VP Engineering @ TechCorp',
    url: '/contacts',
    icon: Users,
    iconColor: 'text-purple-500'
  },
  {
    id: '3',
    type: 'task',
    title: 'Follow up with Michael Roberts',
    subtitle: 'Task',
    description: 'Due tomorrow',
    url: '/tasks',
    icon: ListTodo,
    iconColor: 'text-orange-500'
  },
  {
    id: '4',
    type: 'deal',
    title: 'Dr. Lisa Wang - AI Solutions Inc',
    subtitle: 'Pipeline Deal',
    description: 'Proposal Sent • €22,000',
    url: '/pipeline',
    icon: TrendingUp,
    iconColor: 'text-green-500'
  },
  {
    id: '5',
    type: 'job',
    title: 'Senior Product Manager',
    subtitle: 'Job',
    description: 'Open • 3 applicants',
    url: '/jobs',
    icon: Briefcase,
    iconColor: 'text-cyan-500'
  },
  {
    id: '6',
    type: 'run',
    title: 'Full Stack Engineer @ StartupXYZ',
    subtitle: 'Run',
    description: 'Running • Started 30 mins ago',
    url: '/runs/2',
    icon: Zap,
    iconColor: 'text-blue-500'
  },
  {
    id: '7',
    type: 'contact',
    title: 'Michael Roberts',
    subtitle: 'Contact',
    description: 'Head of Product @ InnovateLabs',
    url: '/contacts',
    icon: Users,
    iconColor: 'text-purple-500'
  },
  {
    id: '8',
    type: 'deal',
    title: 'James Park - CloudTech Systems',
    subtitle: 'Pipeline Deal',
    description: 'Signed Mandate • €20,000',
    url: '/pipeline',
    icon: TrendingUp,
    iconColor: 'text-green-500'
  }
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const titleId = generateId('global-search-modal-title');
  const descId = generateId('global-search-modal-desc');

  const filteredResults = searchQuery
    ? MOCK_SEARCH_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_SEARCH_RESULTS;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && filteredResults.length > 0) {
      e.preventDefault();
      handleSelectResult(filteredResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    navigate(result.url);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-xl max-w-2xl w-full sm:w-[95%] md:w-full max-h-[70vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {/* Hidden title for screen readers */}
        <h2 id={titleId} className="sr-only">Global Search</h2>
        <p id={descId} className="sr-only">
          Search for runs, contacts, tasks, deals, and jobs across your workspace
        </p>
        
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search runs, contacts, tasks, deals, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-10 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-base"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted border border-border rounded">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="px-2 py-1 bg-muted border border-border rounded">Enter</kbd>
            <span>Select</span>
            <kbd className="px-2 py-1 bg-muted border border-border rounded">Esc</kbd>
            <span>Close</span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No results found' : 'Start typing to search...'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${
                      index === selectedIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          index === selectedIndex
                            ? 'bg-primary-foreground/20'
                            : 'bg-muted'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            index === selectedIndex ? 'text-primary-foreground' : result.iconColor
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              index === selectedIndex ? 'text-primary-foreground' : ''
                            }`}
                          >
                            {result.title}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                              index === selectedIndex
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {result.subtitle}
                          </span>
                        </div>
                        {result.description && (
                          <p
                            className={`text-xs truncate ${
                              index === selectedIndex
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          index === selectedIndex
                            ? 'text-primary-foreground opacity-100'
                            : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
            </span>
            <div className="flex items-center gap-2">
              <span>Powered by Lynqio Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}