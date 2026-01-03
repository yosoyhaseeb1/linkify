import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, Filter, ArrowUpDown, Loader2, AlertCircle, Linkedin, Mail, Clock, Building2, TrendingUp, Users, Plus, X, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserData, saveUserContacts } from '../services/userDataService';
import { useProspects } from '../hooks/useProspects';
import { Pagination } from '../components/Pagination';
import { logger } from '../utils/logger';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorBanner } from '../components/ErrorBanner';
import { DealValueInput } from '../components/DealValueInput';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { CustomFieldsPanel } from '../components/CustomFieldsPanel';
import { ParticleBackground } from '../components/ParticleBackground';

type ProspectStage = 'conversation_started' | 'qualification' | 'proposal_sent' | 'signed_mandate' | 'lost';

interface Prospect {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedin_url: string;
  email: string;
  stage: ProspectStage;
  run_id: string;
  organization_id: string;
  notes: string;
  last_activity_at: string;
  deal_value?: string;
  job_title?: string;
}

const STAGES: { id: ProspectStage; label: string; color: string; textColor: string }[] = [
  { id: 'conversation_started', label: 'Conversation Started', color: 'bg-blue-500/20', textColor: 'text-blue-500' },
  { id: 'qualification', label: 'Qualification', color: 'bg-purple-500/20', textColor: 'text-purple-500' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-orange-500/20', textColor: 'text-orange-500' },
  { id: 'signed_mandate', label: 'Signed Mandate', color: 'bg-emerald-500/20', textColor: 'text-emerald-500' },
  { id: 'lost', label: 'Lost / Not a Fit', color: 'bg-gray-500/20', textColor: 'text-gray-500' }
];

interface ProspectCardProps {
  prospect: Prospect;
  onViewDetails: (prospect: Prospect) => void;
  isUpdating?: boolean;
}

function ProspectCard({ prospect, onViewDetails, isUpdating = false }: ProspectCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'prospect',
    item: { id: prospect.id, stage: prospect.stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`bg-card border border-border rounded-lg p-3 cursor-move hover:shadow-lg transition-all relative ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate mb-1">{prospect.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{prospect.title}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Building2 className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{prospect.company}</span>
      </div>

      {prospect.job_title && (
        <div className="text-xs text-muted-foreground mb-2 truncate">
          Role: {prospect.job_title}
        </div>
      )}

      {prospect.deal_value && (
        <div className="text-xs font-medium text-green-500 mb-2">
          {prospect.deal_value}
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span>{new Date(prospect.last_activity_at).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <button
          onClick={() => onViewDetails(prospect)}
          className="flex-1 px-2 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary-hover transition-colors"
        >
          View
        </button>
        <a
          href={prospect.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-accent rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
        <a
          href={`mailto:${prospect.email}`}
          className="p-1.5 hover:bg-accent rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
}

interface StageColumnProps {
  stage: typeof STAGES[0];
  prospects: Prospect[];
  onDrop: (prospectId: string, newStage: ProspectStage) => void;
  onViewDetails: (prospect: Prospect) => void;
  updatingProspectId?: string | null;
}

function StageColumn({ stage, prospects, onDrop, onViewDetails, updatingProspectId }: StageColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'prospect',
    drop: (item: { id: string; stage: ProspectStage }) => {
      if (item.stage !== stage.id) {
        onDrop(item.id, stage.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  const totalValue = prospects.reduce((sum, p) => {
    const value = parseFloat(p.deal_value?.replace(/[€,]/g, '') || '0');
    return sum + value;
  }, 0);

  return (
    <div className="flex-1 min-w-[252px] flex flex-col h-full">
      <div className={`glass-card rounded-t-lg p-3 ${stage.color} border-b border-border flex-shrink-0`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</h3>
          <span className={`text-xs ${stage.textColor}`}>{prospects.length}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          €{totalValue.toLocaleString()}
        </div>
      </div>
      <div
        ref={drop}
        className={`glass-card rounded-b-lg border-t-0 p-3 space-y-3 transition-colors overflow-y-auto flex-1 ${
          isOver ? 'bg-accent/50' : ''
        }`}
      >
        {prospects.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            onViewDetails={onViewDetails}
            isUpdating={updatingProspectId === prospect.id}
          />
        ))}
        {prospects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No deals in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export function Pipeline() {
  const { user, getToken } = useAuth(); // Get current user
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ProspectStage | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'activity'>('activity');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    linkedin_url: '',
    job_title: '',
    deal_value: '',
    notes: ''
  });
  const [dealErrors, setDealErrors] = useState({
    name: '',
    title: '',
    company: '',
    email: ''
  });

  // Handler functions for deal form validation
  const handleDealFieldChange = (field: 'name' | 'title' | 'company' | 'email', value: string) => {
    setNewDeal(prev => ({ ...prev, [field]: value }));
  };

  const handleDealFieldBlur = (field: 'name' | 'title' | 'company' | 'email') => {
    const error = validateDealField(field, newDeal[field]);
    setDealErrors(prev => ({ ...prev, [field]: error }));
  };

  // Load user-specific pipeline data
  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      setProspects([]);
      return;
    }

    setLoading(true);
    setError(false);
    setIsRetrying(false);
    
    try {
      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token');
        setError(true);
        setLoading(false);
        return;
      }
      
      const userData = await fetchUserData(user.id, token);
      // Pipeline data is stored in contacts with stage information
      const pipelineProspects = (userData.contacts || []).filter((c: any) => c.stage);
      setProspects(pipelineProspects);
      console.log(`✅ Loaded ${pipelineProspects.length} pipeline prospects for user ${user.id}`);
    } catch (err) {
      console.error('Error loading pipeline:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, getToken]);

  // Auto-refresh when page becomes visible (e.g., switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  const handleRetry = () => {
    setIsRetrying(true);
    loadData();
  };

  const handleDrop = (prospectId: string, newStage: ProspectStage) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;

    const oldStageIndex = STAGES.findIndex((s) => s.id === prospect.stage);
    const newStageIndex = STAGES.findIndex((s) => s.id === newStage);

    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId
          ? { ...p, stage: newStage, last_activity_at: new Date().toISOString() }
          : p
      )
    );

    // Special fireworks celebration for PLACED (WON) stage!
    if (newStage === 'signed_mandate') {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Fire from two sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    } 
    // Regular confetti for other forward movements
    else if (newStageIndex > oldStageIndex && newStage !== 'lost') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999
      });
    }
  };

  const filteredProspects = prospects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const prospectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredProspects.filter((p) => p.stage === stage.id);
    return acc;
  }, {} as Record<ProspectStage, Prospect[]>);

  const handleAddDeal = () => {
    // Validate all required fields
    const errors = {
      name: validateDealField('name', newDeal.name),
      title: validateDealField('title', newDeal.title),
      company: validateDealField('company', newDeal.company),
      email: validateDealField('email', newDeal.email)
    };

    if (Object.values(errors).some(error => error !== '')) {
      setDealErrors(errors);
      return;
    }

    const deal: Prospect = {
      id: String(Date.now()),
      name: newDeal.name,
      title: newDeal.title,
      company: newDeal.company,
      email: newDeal.email,
      linkedin_url: newDeal.linkedin_url,
      job_title: newDeal.job_title,
      deal_value: newDeal.deal_value,
      notes: newDeal.notes,
      stage: 'conversation_started',
      run_id: 'manual',
      organization_id: 'org1',
      last_activity_at: new Date().toISOString()
    };

    setProspects([...prospects, deal]);
    setShowAddDeal(false);
    setNewDeal({
      name: '',
      title: '',
      company: '',
      email: '',
      linkedin_url: '',
      job_title: '',
      deal_value: '',
      notes: ''
    });
  };

  const totalDeals = prospects.length;
  const totalValue = prospects.reduce((sum, p) => {
    const value = parseFloat(p.deal_value?.replace(/[€,]/g, '') || '0');
    return sum + value;
  }, 0);
  const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <ParticleBackground />
      <div className="h-screen flex flex-col relative z-10">
        {/* Fixed Header Section - Stats and Search */}
        <div className="sticky top-0 z-10 flex-shrink-0 p-6 space-y-3 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg relative overflow-hidden">
          {/* Particle background in header */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <ParticleBackground />
          </div>
          
          {/* Header */}
          <div className="relative z-10">
            <h1 className="mb-1">Pipeline</h1>
            <p className="text-muted-foreground text-sm">
              Manage your deals with drag-and-drop pipeline view
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 relative z-10">
            <div className="glass-card rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Total Deals</span>
                </div>
                <div className="text-lg">{totalDeals}</div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-muted-foreground">Total Value</span>
                </div>
                <div className="text-lg">€{totalValue.toLocaleString()}</div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Avg Deal Value</span>
                </div>
                <div className="text-lg">€{Math.round(averageDealValue).toLocaleString()}</div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Active Stages</span>
                </div>
                <div className="text-lg">
                  {Object.values(prospectsByStage).filter((stage) => stage.length > 0).length}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="glass-card rounded-lg p-3 relative z-10">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                />
              </div>

              {/* Add Deal Button */}
              <button
                onClick={() => setShowAddDeal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Pipeline Columns - Only this scrolls horizontally */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-6 pb-6">
          {loading ? (
            <div className="flex gap-3 h-full min-h-full">
              {STAGES.map((stage) => (
                <div key={stage.id} className="flex-1 min-w-[252px] flex flex-col h-full">
                  <div className={`glass-card rounded-t-lg p-3 ${stage.color} border-b border-border flex-shrink-0`}>
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-6 h-4" />
                    </div>
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div className="glass-card rounded-b-lg border-t-0 p-3 space-y-3 overflow-y-auto flex-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-3">
                        <Skeleton className="w-3/4 h-4 mb-2" />
                        <Skeleton className="w-1/2 h-3 mb-3" />
                        <Skeleton className="w-full h-3 mb-2" />
                        <Skeleton className="w-2/3 h-3 mb-2" />
                        <Skeleton className="w-16 h-3 mb-3" />
                        <div className="flex items-center gap-1 pt-2 border-t border-border">
                          <Skeleton className="flex-1 h-7 rounded" />
                          <Skeleton className="w-7 h-7 rounded" />
                          <Skeleton className="w-7 h-7 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="pt-6">
              <ErrorBanner
                message="Failed to load pipeline. Please try again."
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
              {/* Dimmed content underneath */}
              <div className="opacity-30 pointer-events-none">
                <div className="flex gap-3 h-full min-h-full">
                  {STAGES.map((stage) => (
                    <div key={stage.id} className="flex-1 min-w-[252px] flex flex-col h-full">
                      <div className={`glass-card rounded-t-lg p-3 ${stage.color} border-b border-border flex-shrink-0`}>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</h3>
                          <span className={`text-xs ${stage.textColor}`}>0</span>
                        </div>
                        <div className="text-xs text-muted-foreground">€0</div>
                      </div>
                      <div className="glass-card rounded-b-lg border-t-0 p-3 space-y-3 overflow-y-auto flex-1">
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No deals in this stage
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
          <div className="flex gap-3 h-full min-h-full">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                prospects={prospectsByStage[stage.id]}
                onDrop={handleDrop}
                onViewDetails={setSelectedProspect}
              />
            ))}
          </div>
          )}
        </div>

        {/* Prospect Detail Modal */}
        {selectedProspect && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedProspect(null)}
          >
            <div
              className="glass-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="mb-0">{selectedProspect.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        STAGES.find(s => s.id === selectedProspect.stage)?.color || 'bg-gray-500/20'
                      } ${STAGES.find(s => s.id === selectedProspect.stage)?.textColor || 'text-gray-500'}`}>
                        {STAGES.find(s => s.id === selectedProspect.stage)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{selectedProspect.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{selectedProspect.company}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProspect(null)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Information */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm mb-3 font-medium">Contact Information</h3>
                  <div className="space-y-2">
                    <a
                      href={`mailto:${selectedProspect.email}`}
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{selectedProspect.email}</span>
                    </a>
                    <a
                      href={selectedProspect.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Deal Value Section */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm mb-3 font-medium flex items-center gap-2">
                    💰 Deal Information
                  </h3>
                  <DealValueInput
                    prospectId={selectedProspect.id}
                    initialValue={parseFloat(selectedProspect.deal_value?.replace(/[€$£,]/g, '') || '0')}
                    initialCurrency="EUR"
                    onUpdate={(value, currency) => {
                      console.log('Deal updated:', value, currency);
                      // Optionally refresh prospect data here
                    }}
                  />
                </div>

                {/* Custom Fields Section */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm mb-3 font-medium flex items-center gap-2">
                    📋 Custom Fields
                  </h3>
                  <CustomFieldsPanel
                    prospectId={selectedProspect.id}
                    onFieldUpdate={() => {
                      console.log('Field updated');
                      // Optionally refresh prospect data here
                    }}
                  />
                </div>

                {/* Notes Section */}
                {selectedProspect.notes && (
                  <div className="glass-card rounded-xl p-4">
                    <h3 className="text-sm mb-2 font-medium">Notes</h3>
                    <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                      {selectedProspect.notes}
                    </div>
                  </div>
                )}

                {/* Activity Timeline Section */}
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm mb-3 font-medium flex items-center gap-2">
                    📅 Activity Timeline
                  </h3>
                  <ActivityTimeline
                    prospectId={selectedProspect.id}
                    onActivityAdded={() => {
                      console.log('Activity added');
                      // Optionally refresh prospect data here
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Deal Modal */}
        {showAddDeal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddDeal(false)}
          >
            <div
              className="glass-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-2">Add New Deal</h2>
                    <p className="text-sm text-muted-foreground">
                      Manually add a new deal to your pipeline
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddDeal(false)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={newDeal.name}
                      onChange={(e) => handleDealFieldChange('name', e.target.value)}
                      onBlur={() => handleDealFieldBlur('name')}
                      className={`w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm ${
                        dealErrors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., John Smith"
                    />
                    {dealErrors.name && (
                      <p className="text-xs text-red-500 mt-1">{dealErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Job Title *</label>
                    <input
                      type="text"
                      value={newDeal.title}
                      onChange={(e) => handleDealFieldChange('title', e.target.value)}
                      onBlur={() => handleDealFieldBlur('title')}
                      className={`w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm ${
                        dealErrors.title ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., VP Engineering"
                    />
                    {dealErrors.title && (
                      <p className="text-xs text-red-500 mt-1">{dealErrors.title}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Company *</label>
                    <input
                      type="text"
                      value={newDeal.company}
                      onChange={(e) => handleDealFieldChange('company', e.target.value)}
                      onBlur={() => handleDealFieldBlur('company')}
                      className={`w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm ${
                        dealErrors.company ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., TechCorp Inc"
                    />
                    {dealErrors.company && (
                      <p className="text-xs text-red-500 mt-1">{dealErrors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email *</label>
                    <input
                      type="email"
                      value={newDeal.email}
                      onChange={(e) => handleDealFieldChange('email', e.target.value)}
                      onBlur={() => handleDealFieldBlur('email')}
                      className={`w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm ${
                        dealErrors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., john@techcorp.com"
                    />
                    {dealErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{dealErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={newDeal.linkedin_url}
                    onChange={(e) => setNewDeal({ ...newDeal, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Position/Role
                    </label>
                    <input
                      type="text"
                      value={newDeal.job_title}
                      onChange={(e) => setNewDeal({ ...newDeal, job_title: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                      placeholder="e.g., Senior Engineer"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Deal Value
                    </label>
                    <input
                      type="text"
                      value={newDeal.deal_value}
                      onChange={(e) => setNewDeal({ ...newDeal, deal_value: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                      placeholder="e.g., €15,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Notes</label>
                  <textarea
                    value={newDeal.notes}
                    onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm resize-none"
                    rows={3}
                    placeholder="Add any relevant notes..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => setShowAddDeal(false)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDeal}
                  disabled={!newDeal.name || !newDeal.title || !newDeal.company || !newDeal.email}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Deal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

function validateDealField(field: 'name' | 'title' | 'company' | 'email', value: string): string {
  switch (field) {
    case 'name':
      return value.trim() === '' ? 'Name is required' : '';
    case 'title':
      return value.trim() === '' ? 'Title is required' : '';
    case 'company':
      return value.trim() === '' ? 'Company is required' : '';
    case 'email':
      return value.trim() === '' ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : '';
    default:
      return '';
  }
}