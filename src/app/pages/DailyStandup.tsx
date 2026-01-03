import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Coffee, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface MemberActivity {
  id: string;
  name: string;
  newConnections: number;
  repliesPending: number;
  conversationsActive: number;
  runsCompleted: number;
}

export function DailyStandup() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberActivity, setMemberActivity] = useState<MemberActivity[]>([]);
  const [teamGoals, setTeamGoals] = useState({
    weeklyConnectionsGoal: 50,
    weeklyConnectionsActual: 0
  });

  useEffect(() => {
    loadStandupData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStandupData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentOrg]);

  const loadStandupData = async () => {
    if (!currentOrg) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/analytics/daily-standup/${currentOrg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load standup data');

      const data = await response.json();
      setMemberActivity(data.memberActivity || []);
      setTeamGoals(data.teamGoals || {
        weeklyConnectionsGoal: 50,
        weeklyConnectionsActual: 0
      });
    } catch (error) {
      console.error('Error loading standup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goalProgress = teamGoals.weeklyConnectionsGoal > 0 
    ? Math.min((teamGoals.weeklyConnectionsActual / teamGoals.weeklyConnectionsGoal) * 100, 100)
    : 0;
  const totalNewConnections = memberActivity.reduce((sum, m) => sum + (m.newConnections || 0), 0);
  const totalRepliesPending = memberActivity.reduce((sum, m) => sum + (m.repliesPending || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading daily standup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <Coffee className="w-8 h-8 text-primary" />
          <h1>Daily Standup</h1>
        </div>
        <p className="text-muted-foreground">
          Team activity from the last 24 hours
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <Clock className="w-4 h-4 inline mr-1" />
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">New Connections</span>
          </div>
          <p className="text-3xl font-bold">{totalNewConnections}</p>
          <p className="text-sm text-muted-foreground mt-1">Last 24 hours</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">Replies Pending</span>
          </div>
          <p className="text-3xl font-bold">{totalRepliesPending}</p>
          <p className="text-sm text-muted-foreground mt-1">Needs response</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Active Members</span>
          </div>
          <p className="text-3xl font-bold">
            {memberActivity.filter(m => m.newConnections > 0 || m.conversationsActive > 0).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            of {memberActivity.length} total
          </p>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="glass-card p-6 rounded-xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Team Goal
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {teamGoals.weeklyConnectionsActual} / {teamGoals.weeklyConnectionsGoal} connections
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{Math.round(goalProgress)}%</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500 rounded-full"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        {goalProgress >= 100 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            🎉 Congratulations! Weekly goal achieved!
          </div>
        )}
      </div>

      {/* Team Member Activity */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Team Member Updates</h2>
          <p className="text-sm text-muted-foreground mt-1">Individual activity breakdown</p>
        </div>

        <div className="divide-y divide-border">
          {memberActivity.map((member) => {
            const hasActivity = member.newConnections > 0 || member.conversationsActive > 0 || member.repliesPending > 0;
            
            return (
              <div 
                key={member.id} 
                className={`p-6 ${hasActivity ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    {!hasActivity && (
                      <p className="text-sm text-muted-foreground mt-1">No activity today</p>
                    )}
                  </div>
                  {hasActivity && (
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      Active
                    </div>
                  )}
                </div>

                {hasActivity && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">New Connections</span>
                      </div>
                      <p className="text-2xl font-bold">{member.newConnections || 0}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Active Convos</span>
                      </div>
                      <p className="text-2xl font-bold">{member.conversationsActive || 0}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Pending Replies</span>
                      </div>
                      <p className="text-2xl font-bold">{member.repliesPending || 0}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Runs Completed</span>
                      </div>
                      <p className="text-2xl font-bold">{member.runsCompleted || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {memberActivity.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
}