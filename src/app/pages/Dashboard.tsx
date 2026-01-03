import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { logger } from '../utils/logger';
import { useRuns } from '../hooks/useRuns';
import { useProspects } from '../hooks/useProspects';
import { Target, CheckCircle2, Trophy, PlayCircle, Plus, ArrowRight, Circle, Calendar, Building2 } from 'lucide-react';
import { SkeletonDashboardWidget, SkeletonText } from '../components/Skeleton';
import { WarmupProgress } from '../components/WarmupProgress';

export function Dashboard() {
  const { currentOrg, usage, loadingOrg } = useOrganization();
  const { user, getToken } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Use React Query hooks for data fetching
  const { runs, isLoading: runsLoading } = useRuns();
  const { prospects, isLoading: prospectsLoading } = useProspects();

  // Combined loading state
  const loading = runsLoading || prospectsLoading;
  
  // Calculate pipeline stats from actual contacts data
  const pipelineStats = {
    conversation_started: contacts.filter(c => c.stage === 'conversation_started').length,
    qualification: contacts.filter(c => c.stage === 'qualification').length,
    proposal_sent: contacts.filter(c => c.stage === 'proposal_sent').length,
    signed_mandate: contacts.filter(c => c.stage === 'signed_mandate').length,
    lost: contacts.filter(c => c.stage === 'lost').length
  };

  const totalActiveDeals = pipelineStats.conversation_started + pipelineStats.qualification + 
                           pipelineStats.proposal_sent + pipelineStats.signed_mandate;

  // Calculate weekly tasks
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const tasksThisWeek = tasks.filter(t => new Date(t.created_at) >= weekAgo).length;

  // Get today's tasks
  const today = new Date().toDateString();
  const tasksData = tasks
    .filter(t => !t.completed)
    .filter(t => {
      const dueDate = new Date(t.due_date).toDateString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dueDate === today || dueDate === tomorrow.toDateString();
    })
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      title: t.title,
      prospect: t.prospect_name,
      company: t.prospect_company,
      due: new Date(t.due_date).toDateString() === today ? 'Today' : 'Tomorrow',
      overdue: new Date(t.due_date) < new Date(),
      priority: t.priority
    }));

  // Get recent runs (last 3)
  const recentRuns = runs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(run => ({
      id: run.id,
      jobTitle: run.jobTitle,
      company: run.company,
      status: run.status,
      date: formatTimeAgo(run.createdAt)
    }));

  const conversionRate = ((pipelineStats.signed_mandate / (totalActiveDeals + pipelineStats.signed_mandate + pipelineStats.lost)) * 100).toFixed(0);

  // Show message when no organization exists
  if (!loadingOrg && !currentOrg) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or join an organization to use Lynqio.
            </p>
            <div className="space-y-3 text-left">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-semibold mb-2">🏢 Create an Organization</p>
                <p className="text-sm text-muted-foreground">
                  Go to your Clerk Dashboard to create a new organization, or use the Clerk components to set one up.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-semibold mb-2">👥 Join an Organization</p>
                <p className="text-sm text-muted-foreground">
                  Ask your team admin to send you an invitation to join their organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-5 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-lg">Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs text-muted-foreground">{isOnline ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
          
          {/* Warmup Progress - Compact Header Version */}
          <div className="relative">
            <WarmupProgress />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Welcome back{user ? `, ${(user.firstName || user.email?.split('@')[0] || '').charAt(0).toUpperCase() + (user.firstName || user.email?.split('@')[0] || '').slice(1).toLowerCase()}` : ''}</p>
      </div>

      {loading || loadingOrg ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Hero Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 flex-shrink-0">
            {[...Array(4)].map((_, i) => (
              <SkeletonDashboardWidget key={i} />
            ))}
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-3 min-h-0">
              {/* Pipeline Overview Skeleton */}
              <div className="glass-card rounded-xl p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <SkeletonText width="40%" height={18} className="mb-1" />
                    <SkeletonText width="60%" height={12} />
                  </div>
                  <SkeletonText width="150px" height={32} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-2">
                      <SkeletonText width="80%" height={12} className="mb-1" />
                      <SkeletonText width="50%" height={20} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Runs Skeleton */}
              <div className="glass-card rounded-xl p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <SkeletonText width="120px" height={18} />
                  <SkeletonText width="70px" height={12} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                      <SkeletonText width="80px" height={12} className="mb-1.5" />
                      <SkeletonText width="100%" height={12} className="mb-1" />
                      <SkeletonText width="75%" height={10} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks Skeleton */}
            <div className="lg:col-span-4 glass-card rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
              <div className="mb-3 flex-shrink-0">
                <SkeletonText width="140px" height={18} className="mb-1" />
                <SkeletonText width="180px" height={12} />
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                    <SkeletonText width={14} height={14} className="flex-shrink-0 mt-0.5 rounded-full" />
                    <div className="flex-1">
                      <SkeletonText width="100%" height={12} className="mb-1.5" />
                      <SkeletonText width="66%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 flex-shrink-0">
        {/* Active Deals */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <Link
              to="/pipeline"
              className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mb-2">
            <div className="text-2xl">{totalActiveDeals}</div>
            <p className="text-sm text-muted-foreground">Active Deals</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {pipelineStats.signed_mandate} signed, {pipelineStats.lost} lost
          </div>
        </div>

        {/* Tasks Due */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-1.5 bg-orange-500/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-orange-500" />
            </div>
            <Link
              to="/tasks"
              className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mb-2">
            <div className="text-2xl">{tasksData.filter(t => t.due === 'Today').length}</div>
            <p className="text-sm text-muted-foreground">Tasks Due Today</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {tasksThisWeek} total tasks this week
          </div>
        </div>

        {/* Placements */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <Trophy className="w-4 h-4 text-green-500" />
            </div>
            <Link
              to="/pipeline"
              className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mb-2">
            <div className="text-2xl">{pipelineStats.signed_mandate}</div>
            <p className="text-sm text-muted-foreground">Signed this month</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {contacts.length} total contacts
          </div>
        </div>

        {/* Runs Remaining */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <PlayCircle className="w-4 h-4 text-purple-500" />
            </div>
            <Link
              to="/runs/new"
              className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              New Run
              <Plus className="w-3 h-3" />
            </Link>
          </div>
          <div className="mb-2">
            <div className="text-2xl">{usage.runsLimit - usage.runsUsed}</div>
            <p className="text-sm text-muted-foreground">Runs Remaining</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {usage.runsUsed} of {usage.runsLimit} used this month
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column - Pipeline Overview + Recent Runs */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-0">
          {/* Pipeline Overview */}
          <div className="glass-card rounded-xl p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base mb-0.5">Pipeline Overview</h2>
                <p className="text-xs text-muted-foreground">Track your deals across stages</p>
              </div>
              <Link
                to="/pipeline"
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary-hover transition-colors text-center"
              >
                View Full Pipeline
              </Link>
            </div>

            {/* Kanban Board */}
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-2">
              {/* Conversation Started */}
              <div className="bg-muted/30 rounded-lg p-2.5 flex items-center justify-between lg:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium">Conversation</span>
                </div>
                <div className="text-xl font-semibold">{pipelineStats.conversation_started}</div>
              </div>

              {/* Qualification */}
              <div className="bg-muted/30 rounded-lg p-2.5 flex items-center justify-between lg:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium">Qualification</span>
                </div>
                <div className="text-xl font-semibold">{pipelineStats.qualification}</div>
              </div>

              {/* Proposal Sent */}
              <div className="bg-muted/30 rounded-lg p-2.5 flex items-center justify-between lg:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs font-medium">Proposal</span>
                </div>
                <div className="text-xl font-semibold">{pipelineStats.proposal_sent}</div>
              </div>

              {/* Signed Mandate (WON) */}
              <div className="bg-emerald-500/10 rounded-lg p-2.5 border border-emerald-500/20 flex items-center justify-between lg:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-500">Signed</span>
                </div>
                <div className="text-xl font-semibold text-emerald-500">{pipelineStats.signed_mandate}</div>
              </div>

              {/* Lost */}
              <div className="bg-muted/30 rounded-lg p-2.5 flex items-center justify-between lg:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-xs font-medium">Lost</span>
                </div>
                <div className="text-xl font-semibold text-muted-foreground">{pipelineStats.lost}</div>
              </div>
            </div>
          </div>

          {/* Recent Runs - Order 3 on mobile, normal on desktop */}
          <div className="glass-card rounded-xl p-4 order-3 lg:order-none flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-base">Recent Runs</h2>
              <Link
                to="/runs"
                className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentRuns.length === 0 ? (
              <div className="text-center text-muted-foreground flex-1 flex flex-col items-center justify-center py-4">
                <PlayCircle className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm mb-3">No runs yet</p>
                <Link
                  to="/runs/new"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Run
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    to={`/runs/${run.id}`}
                    className="block p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Left: Status & Job Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">Completed</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">{run.jobTitle}</span>
                          <span className="text-sm text-muted-foreground flex-shrink-0">at</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{run.company}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Date & Arrow */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{run.date}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Due Today - Order 2 on mobile, normal on desktop */}
        <div className="lg:col-span-4 glass-card rounded-xl p-4 order-2 lg:order-none flex flex-col min-h-0 overflow-hidden">
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-base mb-0.5">Tasks Due Today</h2>
            <p className="text-xs text-muted-foreground">{tasksData.filter(t => t.due === 'Today').length} tasks need your attention</p>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {tasksData.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center py-4">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All caught up! No tasks due today.</p>
              </div>
            ) : (
              <>
                {tasksData.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg"
                  >
                    <button className="flex-shrink-0 mt-0.5">
                      <Circle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs mb-1">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{task.prospect}</span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span className={task.due === 'Today' ? 'text-orange-500' : ''}>{task.due}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'just now';
  }
}