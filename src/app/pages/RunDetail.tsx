import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Clock, CheckCircle, Star, Brain, TrendingUp, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useRun } from '../hooks/useRuns';

export function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatureFlags();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Fetch real run data from backend
  const { run: runData, isLoading: loading, error } = useRun(id);

  // Extract run and prospects from the response
  const run = runData?.run;
  const prospects = runData?.prospects || [];
  
  // Extract messages from prospects (first prospect's messages as drafts)
  const messages = prospects[0]?.messages || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const handleCancelRun = async () => {
    setCanceling(true);
    // Simulate canceling
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCanceling(false);
    setShowCancelDialog(false);
    toast.success('Run canceled successfully');
    navigate('/runs');
  };

  const handleRetryRun = async () => {
    setRetrying(true);
    // Simulate retrying
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRetrying(false);
    toast.success('Run retried successfully');
    navigate('/runs');
  };

  // Show error state if run not found
  if (!loading && error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="glass-card p-6 rounded-xl text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="mb-2">Run Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The run you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/runs')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            Back to Runs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {loading || !run ? (
        <>
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="w-24 h-4 mb-4" />
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="w-64 h-10 mb-2" />
                <Skeleton className="w-32 h-6" />
              </div>
            </div>
          </div>

          {/* Run Summary Skeleton */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <Skeleton className="w-32 h-8 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-24 h-4 mb-2" />
                  <Skeleton className="w-40 h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Prospects Skeleton */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <Skeleton className="w-48 h-8 mb-6" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="w-48 h-6 mb-2" />
                      <Skeleton className="w-32 h-4 mb-1" />
                      <Skeleton className="w-40 h-4 mb-2" />
                      <Skeleton className="w-full h-16 mt-3" />
                    </div>
                    <Skeleton className="w-28 h-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Drafts Skeleton */}
          <div className="glass-card p-6 rounded-xl mb-6">
            <Skeleton className="w-40 h-8 mb-6" />
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="w-32 h-6" />
                    <Skeleton className="w-20 h-8" />
                  </div>
                  <Skeleton className="w-full h-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Status Skeleton */}
          <div className="glass-card p-6 rounded-xl">
            <Skeleton className="w-40 h-8 mb-6" />
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div>
                <Skeleton className="w-32 h-4 mb-2" />
                <Skeleton className="w-24 h-6" />
              </div>
              <Skeleton className="w-40 h-10" />
            </div>
            <Skeleton className="w-full h-4 mt-4" />
          </div>
        </>
      ) : (
        <>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/runs')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Runs
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1>{run.jobTitle}</h1>
              {run.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : run.status === 'failed' ? (
                <XCircle className="w-6 h-6 text-destructive" />
              ) : (
                <Clock className="w-6 h-6 text-warning" />
              )}
            </div>
            <p className="text-muted-foreground">{run.company}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {(run.status === 'queued' || run.status === 'running') && (
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={canceling}
                className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {canceling ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Cancel Run</span>
              </button>
            )}
            
            {run.status === 'failed' && (
              <button
                onClick={() => {
                  setRetrying(true);
                  setTimeout(() => {
                    setRetrying(false);
                    toast.success('Run restarted successfully');
                  }, 2000);
                }}
                disabled={retrying}
                className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {retrying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Run Summary */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <h2 className="mb-4">Run Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Input Source</p>
            <p>{run.jobUrl || 'Manual Import'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created</p>
            <p>{formatDate(run.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="capitalize">{run.status}</p>
          </div>
        </div>
      </div>

      {/* AI Insights (if enabled) */}
      {isFeatureEnabled('aiCandidateMatching') && (
        <div className="glass-card p-6 rounded-xl mb-6 border-l-4 border-primary">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <h2>AI Insights</h2>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Pro Feature</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">Avg Match Score</span>
              </div>
              <p className="text-3xl font-semibold text-success">88%</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">High-Quality Leads</span>
              </div>
              <p className="text-3xl font-semibold">12/15</p>
            </div>
            <div className="p-4 bg-info/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-info" />
                <span className="text-sm text-muted-foreground">Est. Response Rate</span>
              </div>
              <p className="text-3xl font-semibold">24%</p>
            </div>
          </div>
        </div>
      )}

      {/* Prospects */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2>Prospects Found ({prospects.length})</h2>
          {isFeatureEnabled('aiCandidateMatching') && (
            <div className="text-sm text-muted-foreground">
              Sorted by AI Match Score
            </div>
          )}
        </div>
        {prospects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No prospects found yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prospects.map((prospect: any) => (
              <div
                key={prospect.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3>{prospect.name}</h3>
                      {prospect.relevanceScore && (
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{prospect.relevanceScore}%</span>
                        </div>
                      )}
                      {isFeatureEnabled('aiCandidateMatching') && prospect.aiMatchScore && (
                        <div className={`flex items-center gap-1 ${getScoreColor(prospect.aiMatchScore)}`}>
                          <Brain className="w-4 h-4" />
                          <span className="text-sm font-medium">{prospect.aiMatchScore}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{prospect.title || 'No title'}</p>
                    <p className="text-sm text-muted-foreground mb-2">{prospect.company || run.company}</p>
                    {isFeatureEnabled('aiCandidateMatching') && prospect.matchingReason && (
                      <div className="p-3 bg-info/5 rounded-lg mt-3">
                        <p className="text-xs text-muted-foreground mb-1">AI Matching Reason:</p>
                        <p className="text-sm">{prospect.matchingReason}</p>
                      </div>
                    )}
                  </div>
                  {prospect.linkedin_url && (
                    <a
                      href={prospect.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Drafts */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <h2 className="mb-6">Message Drafts</h2>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages drafted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="capitalize">{msg.type?.replace('-', ' ') || `Message ${index + 1}`}</h3>
                  <button
                    onClick={() => copyToClipboard(msg.content || msg.message || '')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content || msg.message || ''}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Status */}
      {run.campaignId && (
        <div className="glass-card p-6 rounded-xl">
          <h2 className="mb-6">Campaign Status</h2>
          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">HeyReach Campaign</p>
              <p className="font-mono">{run.campaignId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-warning/10 text-warning rounded text-sm">
                {run.campaignStatus ? run.campaignStatus.charAt(0).toUpperCase() + run.campaignStatus.slice(1) : 'Draft'}
              </span>
              <a
                href={`https://app.heyreach.io/campaigns/${run.campaignId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]"
              >
                <span>View in HeyReach</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Campaign is paused by default. Review and activate in HeyReach when ready.
          </p>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this run? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRun}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {canceling ? 'Canceling...' : 'Cancel Run'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}