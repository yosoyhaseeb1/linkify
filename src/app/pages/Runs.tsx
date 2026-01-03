import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, PlayCircle, CheckCircle, Clock, AlertCircle, ExternalLink, Calendar as CalendarIcon, Building2, User, MoreVertical, X, XCircle } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useRuns } from '../hooks/useRuns';
import { Pagination as PaginationComponent } from '../components/Pagination';
import { logger } from '../utils/logger';
import { SkeletonTableRow, Skeleton } from '../components/Skeleton';

export function Runs() {
  const { currentOrg } = useOrganization();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Use React Query hook for data fetching
  // Note: We fetch all runs and do client-side filtering/pagination since backend
  // doesn't support search, status filter, or date filter yet
  const { runs: allRuns, isLoading: loading, error: queryError, totalCount } = useRuns({ 
    page: 1, 
    pageSize: 999  // Fetch all runs for client-side filtering
  });
  const error = !!queryError;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'running':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'queued':
        return <AlertCircle className="w-5 h-5 text-info" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-success/10 text-success',
      running: 'bg-warning/10 text-warning',
      failed: 'bg-destructive/10 text-destructive',
      queued: 'bg-info/10 text-info'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCampaignStatusBadge = (status: string) => {
    // Handle undefined or null status
    if (!status) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
          N/A
        </span>
      );
    }
    
    const styles = {
      live: 'bg-success/10 text-success',
      paused: 'bg-warning/10 text-warning',
      draft: 'bg-muted text-muted-foreground'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isWithinDateRange = (dateString: string, filter: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (filter) {
      case 'today':
        return date >= today;
      case 'yesterday':
        return date >= yesterday && date < today;
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return date >= last7Days;
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return date >= last30Days;
      default:
        return true;
    }
  };

  const filteredRuns = allRuns
    .filter(
      (run) =>
        (run.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.company.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'all' || run.status === statusFilter) &&
        (dateFilter === 'all' || isWithinDateRange(run.createdAt, dateFilter))
    );

  // Count active filters
  const activeFiltersCount = [
    statusFilter !== 'all' ? 1 : 0,
    dateFilter !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRuns.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRuns = filteredRuns.slice(startIndex, endIndex);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1>Runs</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your automation runs
          </p>
        </div>
        <Link
          to="/runs/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          New Run
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title or company..."
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <CheckCircle className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full lg:w-48 appearance-none pl-11 pr-10 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                statusFilter !== 'all' 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-input'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="completed">✓ Completed</option>
              <option value="running">⏳ Running</option>
              <option value="failed">✗ Failed</option>
              <option value="queued">⏸ Queued</option>
            </select>
            {statusFilter !== 'all' ? (
              <button
                onClick={() => setStatusFilter('all')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded transition-colors group/clear"
                title="Clear filter"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover/clear:text-destructive transition-colors" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <CalendarIcon className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`w-full lg:w-48 appearance-none pl-11 pr-10 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                dateFilter !== 'all' 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-input'
              }`}
            >
              <option value="all">All Dates</option>
              <option value="today">📅 Today</option>
              <option value="yesterday">📆 Yesterday</option>
              <option value="last7days">📊 Last 7 Days</option>
              <option value="last30days">📈 Last 30 Days</option>
            </select>
            {dateFilter !== 'all' ? (
              <button
                onClick={() => setDateFilter('all')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded transition-colors group/clear"
                title="Clear filter"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover/clear:text-destructive transition-colors" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          {/* Clear All Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all whitespace-nowrap font-medium group/clearall"
              title="Clear all filters"
            >
              <X className="w-4 h-4 group-hover/clearall:rotate-90 transition-transform" />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>

        {/* Results Count */}
        {(searchQuery || activeFiltersCount > 0) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span>
                {filteredRuns.length} {filteredRuns.length === 1 ? 'result' : 'results'} found
              </span>
            </div>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Runs Table - Desktop */}
      <div className="glass-card rounded-xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Job Title / Company</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Created</th>
                <th className="px-6 py-4 text-left text-sm">Prospects</th>
                <th className="px-6 py-4 text-left text-sm">Campaign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-2">
                    <ErrorBanner
                      message="Failed to load runs. Please try again."
                      onRetry={() => logger.error('Retry loading runs')}
                      isRetrying={false}
                    />
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-2">
                    <EmptyState
                      icon={PlayCircle}
                      headline="No runs yet"
                      description={searchQuery ? 'Try adjusting your search query.' : 'Create your first automation run.'}
                      actionLabel={searchQuery ? undefined : 'New Run'}
                      onAction={searchQuery ? undefined : () => window.location.href = '/runs/new'}
                    />
                  </td>
                </tr>
              ) : (
                paginatedRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link to={`/runs/${run.id}`} className="block hover:text-primary transition-colors">
                        <div className="font-medium">{run.jobTitle}</div>
                        <div className="text-sm text-muted-foreground">{run.company}</div>
                        {run.error && (
                          <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {run.error}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(run.status)}
                        {getStatusBadge(run.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(run.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">{run.prospectsFound}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getCampaignStatusBadge(run.campaignStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Runs Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <Skeleton className="w-48 h-5 mb-2" />
                <Skeleton className="w-32 h-4 mb-3" />
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-20 h-6 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-6 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="glass-card rounded-xl p-4">
            <ErrorBanner
              message="Failed to load runs. Please try again."
              onRetry={() => logger.error('Retry loading runs')}
              isRetrying={false}
            />
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="glass-card rounded-xl p-4">
            <EmptyState
              icon={PlayCircle}
              headline="No runs yet"
              description={searchQuery ? 'Try adjusting your search query.' : 'Create your first automation run.'}
              actionLabel={searchQuery ? undefined : 'New Run'}
              onAction={searchQuery ? undefined : () => window.location.href = '/runs/new'}
            />
          </div>
        ) : (
          paginatedRuns.map((run) => (
            <Link
              key={run.id}
              to={`/runs/${run.id}`}
              className="block glass-card rounded-xl p-4 hover:bg-muted/20 transition-colors"
            >
              {/* Header */}
              <div className="mb-3">
                <div className="font-medium mb-1">{run.jobTitle}</div>
                <div className="text-sm text-muted-foreground">{run.company}</div>
                {run.error && (
                  <div className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {run.error}
                  </div>
                )}
              </div>

              {/* Status & Date Row */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(run.status)}
                  {getStatusBadge(run.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(run.createdAt)}
                </div>
              </div>

              {/* Prospects & Campaign Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Prospects:</span>
                  <span className="font-semibold text-primary">{run.prospectsFound}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Campaign:</span>
                  {getCampaignStatusBadge(run.campaignStatus)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}