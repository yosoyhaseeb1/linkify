import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  PauseCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign,
  MapPin,
  Building,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Plus,
  User,
  Clock
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { ErrorBanner } from '../components/ErrorBanner';
import { motion } from 'motion/react';

type JobStatus = 'open' | 'on_hold' | 'closed_filled' | 'closed_lost';

interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  assignedRecruiter: string;
  startDate: string;
  daysOpen: number;
  source: string;
  location: string;
  feeType: string;
  estimatedValue: string;
  dealId: string;
  jobPostUrl?: string;
}

const statusConfig: Record<JobStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  open: {
    label: 'Open',
    icon: Briefcase,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  on_hold: {
    label: 'On Hold',
    icon: PauseCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  closed_filled: {
    label: 'Closed - Filled',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  closed_lost: {
    label: 'Closed - Lost',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20'
  }
};

export function Jobs() {
  const { user, getToken } = useAuth();
  const { currentOrg } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const loadData = async () => {
    if (!user?.id || !currentOrg?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setIsRetrying(false);

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/user-data/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setJobs(userData.jobs || []);
        console.log(`✅ Loaded ${userData.jobs?.length || 0} jobs for user ${user.id}`);
      } else {
        console.error('Failed to fetch jobs:', await response.text());
        setError(true);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, currentOrg?.id]);

  const handleRetry = () => {
    setIsRetrying(true);
    loadData();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    open: jobs.filter((j) => j.status === 'open').length,
    onHold: jobs.filter((j) => j.status === 'on_hold').length,
    filled: jobs.filter((j) => j.status === 'closed_filled').length,
    lost: jobs.filter((j) => j.status === 'closed_lost').length
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2">Jobs</h1>
          <p className="text-muted-foreground">
            Manage roles you're actively recruiting for
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Job Manually
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mb-1">{stats.open}</div>
          <p className="text-sm text-muted-foreground">Open Jobs</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <PauseCircle className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="mb-1">{stats.onHold}</div>
          <p className="text-sm text-muted-foreground">On Hold</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="mb-1">{stats.filled}</div>
          <p className="text-sm text-muted-foreground">Filled</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="mb-1">{stats.lost}</div>
          <p className="text-sm text-muted-foreground">Lost</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="on_hold">On Hold</option>
              <option value="closed_filled">Closed - Filled</option>
              <option value="closed_lost">Closed - Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Table Header - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/30 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Job Title</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assigned To</div>
          <div className="col-span-1">Days Open</div>
          <div className="col-span-2">Source</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4">
                  {/* Mobile Skeleton */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Skeleton className="w-3/4 h-4 mb-2" />
                        <Skeleton className="w-1/2 h-3" />
                      </div>
                      <Skeleton className="w-20 h-6 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-full h-3" />
                    </div>
                  </div>

                  {/* Desktop Skeleton */}
                  <div className="hidden md:block md:col-span-3">
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-2/3 h-3" />
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center">
                    <Skeleton className="w-full h-4" />
                  </div>
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <Skeleton className="w-32 h-8 rounded-lg" />
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center">
                    <Skeleton className="w-full h-4" />
                  </div>
                  <div className="hidden md:block md:col-span-1 self-center">
                    <Skeleton className="w-8 h-4" />
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center">
                    <Skeleton className="w-full h-4" />
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="p-6">
              <ErrorBanner
                message="Failed to load jobs. Please try again."
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Briefcase}
                headline={searchQuery || statusFilter !== 'all' ? 'No jobs found' : 'No active jobs'}
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Jobs are created when pipeline deals are won.'
                }
              />
            </div>
          ) : (
            filteredJobs.map((job) => {
              const config = statusConfig[job.status];
              // Safety check: if status is invalid, skip this job
              if (!config) {
                console.warn(`Invalid job status: ${job.status} for job ${job.id}`);
                return null;
              }
              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium mb-1">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {job.assignedRecruiter}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.daysOpen} days open
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block md:col-span-3">
                    <div className="font-medium mb-1">{job.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center">
                    {job.company}
                  </div>
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <span className={`px-3 py-1.5 rounded-lg text-sm border ${config.bgColor} ${config.color} flex items-center gap-2`}>
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </span>
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center text-sm">
                    {job.assignedRecruiter}
                  </div>
                  <div className="hidden md:block md:col-span-1 self-center text-sm">
                    {job.daysOpen}
                  </div>
                  <div className="hidden md:block md:col-span-2 self-center text-sm text-muted-foreground">
                    {job.source}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex gap-3">
          <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-500 mb-1">
              How Jobs Work
            </h4>
            <p className="text-sm text-muted-foreground">
              Jobs are automatically created when a Pipeline deal moves to "Won/Signed" status. 
              Each won deal creates one job by default, inheriting company details, role title, 
              hiring manager, and context from your outreach. You can also add jobs manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}