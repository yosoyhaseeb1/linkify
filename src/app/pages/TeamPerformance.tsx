import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare, 
  CheckCircle,
  ArrowLeft,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface MemberStat {
  id: string;
  name: string;
  runsCreated: number;
  prospectsFound: number;
  connectionsMade: number;
  conversationsStarted: number;
  dealsInProgress: number;
  dealsClosed: number;
  responseRate: number;
}

export function TeamPerformance() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [teamStats, setTeamStats] = useState<MemberStat[]>([]);
  const [orgTotals, setOrgTotals] = useState({
    totalRuns: 0,
    totalProspects: 0,
    totalConnections: 0,
    totalDeals: 0
  });

  useEffect(() => {
    loadPerformanceData();
  }, [currentOrg, dateRange]);

  const loadPerformanceData = async () => {
    if (!currentOrg) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/analytics/team-performance/${currentOrg.id}?dateRange=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load performance data');

      const data = await response.json();
      setTeamStats(data.teamStats || []);
      setOrgTotals(data.orgTotals || {
        totalRuns: 0,
        totalProspects: 0,
        totalConnections: 0,
        totalDeals: 0
      });
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopPerformer = (metric: keyof MemberStat) => {
    if (teamStats.length === 0) return null;
    return teamStats.reduce((prev, current) => {
      return (current[metric] as number) > (prev[metric] as number) ? current : prev;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Team Performance
            </h1>
            <p className="text-muted-foreground mt-2">
              Compare team member metrics and identify top performers
            </p>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Organization Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Runs</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{orgTotals.totalRuns}</p>
        </div>

        <div className="glass-card p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Prospects</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{orgTotals.totalProspects}</p>
        </div>

        <div className="glass-card p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Connections</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{orgTotals.totalConnections}</p>
        </div>

        <div className="glass-card p-4 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">Deals Closed</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{orgTotals.totalDeals}</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 rounded-xl border-2 border-yellow-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500">Most Connections</span>
          </div>
          {getTopPerformer('connectionsMade') && (
            <>
              <p className="text-xl font-bold mb-1">{getTopPerformer('connectionsMade')?.name}</p>
              <p className="text-3xl font-bold text-yellow-500">
                {getTopPerformer('connectionsMade')?.connectionsMade}
              </p>
            </>
          )}
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-green-500">Best Response Rate</span>
          </div>
          {getTopPerformer('responseRate') && (
            <>
              <p className="text-xl font-bold mb-1">{getTopPerformer('responseRate')?.name}</p>
              <p className="text-3xl font-bold text-green-500">
                {getTopPerformer('responseRate')?.responseRate}%
              </p>
            </>
          )}
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-500">Most Deals Closed</span>
          </div>
          {getTopPerformer('dealsClosed') && (
            <>
              <p className="text-xl font-bold mb-1">{getTopPerformer('dealsClosed')?.name}</p>
              <p className="text-3xl font-bold text-blue-500">
                {getTopPerformer('dealsClosed')?.dealsClosed}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Team Member Stats Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Team Member Breakdown</h2>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {teamStats.map((member) => (
            <div key={member.id} className="p-4 border-b border-border">
              <p className="font-semibold mb-3">{member.name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Runs</span>
                  <p className="font-semibold">{member.runsCreated}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Prospects</span>
                  <p className="font-semibold">{member.prospectsFound}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Connections</span>
                  <p className="font-semibold">{member.connectionsMade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Response Rate</span>
                  <p className="font-semibold">{member.responseRate}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversations</span>
                  <p className="font-semibold">{member.conversationsStarted}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deals Closed</span>
                  <p className="font-semibold">{member.dealsClosed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Team Member</th>
                <th className="text-center p-4 font-semibold">Runs</th>
                <th className="text-center p-4 font-semibold">Prospects</th>
                <th className="text-center p-4 font-semibold">Connections</th>
                <th className="text-center p-4 font-semibold">Response Rate</th>
                <th className="text-center p-4 font-semibold">Conversations</th>
                <th className="text-center p-4 font-semibold">Deals</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-semibold">{member.name}</td>
                  <td className="p-4 text-center">{member.runsCreated}</td>
                  <td className="p-4 text-center">{member.prospectsFound}</td>
                  <td className="p-4 text-center">{member.connectionsMade}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      member.responseRate >= 30 ? 'bg-green-500/10 text-green-500' :
                      member.responseRate >= 15 ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {member.responseRate}%
                    </span>
                  </td>
                  <td className="p-4 text-center">{member.conversationsStarted}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      {member.dealsClosed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {teamStats.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team activity in the selected time period</p>
          </div>
        )}
      </div>
    </div>
  );
}