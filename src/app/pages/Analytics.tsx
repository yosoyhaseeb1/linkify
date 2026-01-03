import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Flame,
  Crown,
  Zap,
  Star,
  Medal,
  BarChart3,
  Calendar,
  ChevronDown,
  Activity
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

type TimeRange = 'today' | 'week' | 'month' | 'all';

interface TeamMemberStats {
  totalRuns: number;
  runsToday: number;
  runsThisWeek: number;
  runsThisMonth: number;
  averagePerDay: number;
  averagePerWeek: number;
  pipelineContacts: number;
  contactsAddedThisWeek: number;
  contactsAddedThisMonth: number;
  taskCompletionRate: number;
  responseRate: number;
}

interface TeamMemberWithStats {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  stats: TeamMemberStats;
  streak: number;
  badges: string[];
}

export function Analytics() {
  const { members, currentOrg, loadingMembers } = useOrganization();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedMetric, setSelectedMetric] = useState<'runs' | 'pipeline' | 'tasks'>('runs');
  const [teamWithStats, setTeamWithStats] = useState<TeamMemberWithStats[]>([]);

  // Calculate statistics for each member
  useEffect(() => {
    // For now, initialize with zero stats - in production this would fetch real data
    const membersWithStats: TeamMemberWithStats[] = members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`,
      role: member.role,
      email: member.email,
      stats: {
        totalRuns: 0,
        runsToday: 0,
        runsThisWeek: 0,
        runsThisMonth: 0,
        averagePerDay: 0,
        averagePerWeek: 0,
        pipelineContacts: 0,
        contactsAddedThisWeek: 0,
        contactsAddedThisMonth: 0,
        taskCompletionRate: 0,
        responseRate: 0
      },
      streak: 0,
      badges: []
    }));

    setTeamWithStats(membersWithStats);
  }, [members]);

  // Sort team members based on selected metric and time range
  const getSortedTeam = () => {
    return [...teamWithStats].sort((a, b) => {
      if (selectedMetric === 'runs') {
        if (timeRange === 'today') return b.stats.runsToday - a.stats.runsToday;
        if (timeRange === 'week') return b.stats.runsThisWeek - a.stats.runsThisWeek;
        if (timeRange === 'month') return b.stats.runsThisMonth - a.stats.runsThisMonth;
        return b.stats.totalRuns - a.stats.totalRuns;
      } else if (selectedMetric === 'pipeline') {
        if (timeRange === 'week') return b.stats.contactsAddedThisWeek - a.stats.contactsAddedThisWeek;
        if (timeRange === 'month') return b.stats.contactsAddedThisMonth - a.stats.contactsAddedThisMonth;
        return b.stats.pipelineContacts - a.stats.pipelineContacts;
      } else {
        return b.stats.taskCompletionRate - a.stats.taskCompletionRate;
      }
    });
  };

  const sortedTeam = getSortedTeam();
  const currentUser = teamWithStats.find(member => member.email === user.email); // Find current user

  const getMetricValue = (member: TeamMemberWithStats) => {
    if (selectedMetric === 'runs') {
      if (timeRange === 'today') return member.stats.runsToday;
      if (timeRange === 'week') return member.stats.runsThisWeek;
      if (timeRange === 'month') return member.stats.runsThisMonth;
      return member.stats.totalRuns;
    } else if (selectedMetric === 'pipeline') {
      if (timeRange === 'week') return member.stats.contactsAddedThisWeek;
      if (timeRange === 'month') return member.stats.contactsAddedThisMonth;
      return member.stats.pipelineContacts;
    } else {
      return member.stats.taskCompletionRate;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const teamAverages = {
    runsPerDay: teamWithStats.reduce((sum, m) => sum + m.stats.averagePerDay, 0) / teamWithStats.length,
    runsPerWeek: teamWithStats.reduce((sum, m) => sum + m.stats.averagePerWeek, 0) / teamWithStats.length,
    pipelineContacts: teamWithStats.reduce((sum, m) => sum + m.stats.pipelineContacts, 0) / teamWithStats.length,
    taskCompletion: teamWithStats.reduce((sum, m) => sum + m.stats.taskCompletionRate, 0) / teamWithStats.length,
    responseRate: teamWithStats.reduce((sum, m) => sum + m.stats.responseRate, 0) / teamWithStats.length
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1>Team Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Performance leaderboard and competition dashboard
        </p>
      </div>

      {/* Your Performance Summary */}
      {currentUser && (
        <div className="glass-card rounded-lg p-6 mb-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
              />
              <div>
                <h2 className="text-xl font-semibold">Your Performance</h2>
                <p className="text-sm text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{currentUser.streak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Runs Today</span>
              </div>
              <div className="text-2xl font-bold">{currentUser.stats.runsToday}</div>
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +23% vs avg
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <div className="text-2xl font-bold">{currentUser.stats.runsThisWeek}</div>
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +15% vs avg
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Pipeline</span>
              </div>
              <div className="text-2xl font-bold">{currentUser.stats.pipelineContacts}</div>
              <div className="text-xs text-muted-foreground mt-1">
                +{currentUser.stats.contactsAddedThisWeek} this week
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Task Rate</span>
              </div>
              <div className="text-2xl font-bold">{currentUser.stats.taskCompletionRate}%</div>
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Above avg
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Response</span>
              </div>
              <div className="text-2xl font-bold">{currentUser.stats.responseRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                vs {teamAverages.responseRate.toFixed(0)}% avg
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
            {currentUser.badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Metric Selector */}
        <div className="flex gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setSelectedMetric('runs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'runs'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏃 Runs
          </button>
          <button
            onClick={() => setSelectedMetric('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'pipeline'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💼 Pipeline
          </button>
          <button
            onClick={() => setSelectedMetric('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'tasks'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ✅ Tasks
          </button>
        </div>

        {/* Time Range Selector */}
        {selectedMetric !== 'tasks' && (
          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'today'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'all'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Time
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="glass-card rounded-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-3 sm:px-6 py-3 sm:py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <h2 className="text-base sm:text-xl font-semibold">
                {selectedMetric === 'runs' && 'Runs Leaderboard'}
                {selectedMetric === 'pipeline' && 'Pipeline Competition'}
                {selectedMetric === 'tasks' && 'Task Completion Leaders'}
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {timeRange === 'today' && 'Today'}
              {timeRange === 'week' && 'This Week'}
              {timeRange === 'month' && 'This Month'}
              {timeRange === 'all' && 'All Time'}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {sortedTeam.map((member, index) => {
            const rank = index + 1;
            const metricValue = getMetricValue(member);
            const isCurrentUser = member.email === user.email;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-3 sm:px-6 py-3 sm:py-4 hover:bg-muted/30 transition-colors ${
                  isCurrentUser ? 'bg-primary/5 border-l-2 sm:border-l-4 border-l-primary' : ''
                }`}
              >
                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden gap-3">
                  {/* Top Row: Rank, Avatar, Name, Main Stat */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Rank */}
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        {getRankBadge(rank) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar & Name */}
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className={`w-10 h-10 rounded-full object-cover flex-shrink-0 ${
                          isCurrentUser ? 'ring-2 ring-primary' : ''
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold truncate text-sm">
                            {member.name}
                            {isCurrentUser && (
                              <span className="ml-1 text-xs text-primary">(You)</span>
                            )}
                          </h3>
                          {rank === 1 && (
                            <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>

                    {/* Main Stat */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold">{metricValue}{selectedMetric === 'tasks' && '%'}</div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {selectedMetric === 'runs' && timeRange === 'today' && 'today'}
                        {selectedMetric === 'runs' && timeRange === 'week' && 'week'}
                        {selectedMetric === 'runs' && timeRange === 'month' && 'month'}
                        {selectedMetric === 'runs' && timeRange === 'all' && 'total'}
                        {selectedMetric === 'pipeline' && timeRange === 'week' && 'week'}
                        {selectedMetric === 'pipeline' && timeRange === 'month' && 'month'}
                        {selectedMetric === 'pipeline' && (timeRange === 'all' || timeRange === 'today') && 'total'}
                        {selectedMetric === 'tasks' && 'rate'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Streak + Progress Bar (tasks only) */}
                  <div className="flex items-center gap-2 ml-10">
                    {member.streak >= 3 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 rounded-full">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-500">
                          {member.streak}d
                        </span>
                      </div>
                    )}
                    {selectedMetric === 'tasks' && (
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metricValue}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-primary-hover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(rank) || (
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={`w-12 h-12 rounded-full object-cover ${
                        isCurrentUser ? 'ring-2 ring-primary' : ''
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary">(You)</span>
                          )}
                        </h3>
                        {rank === 1 && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>

                    {/* Streak */}
                    {member.streak >= 3 && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 rounded-full">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-500">
                          {member.streak} days
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    {selectedMetric === 'runs' && (
                      <>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{metricValue}</div>
                          <div className="text-xs text-muted-foreground">
                            {timeRange === 'today' && 'runs today'}
                            {timeRange === 'week' && 'runs this week'}
                            {timeRange === 'month' && 'runs this month'}
                            {timeRange === 'all' && 'total runs'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-muted-foreground">
                            {member.stats.averagePerDay.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">avg/day</div>
                        </div>
                      </>
                    )}

                    {selectedMetric === 'pipeline' && (
                      <>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{metricValue}</div>
                          <div className="text-xs text-muted-foreground">
                            {timeRange === 'week' && 'added this week'}
                            {timeRange === 'month' && 'added this month'}
                            {(timeRange === 'all' || timeRange === 'today') && 'total contacts'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-muted-foreground">
                            {member.stats.responseRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">response</div>
                        </div>
                      </>
                    )}

                    {selectedMetric === 'tasks' && (
                      <>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{metricValue}%</div>
                          <div className="text-xs text-muted-foreground">completion rate</div>
                        </div>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metricValue}%` }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-primary to-primary-hover"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mini badges for top 3 */}
                {rank <= 3 && member.badges.length > 0 && (
                  <div className="flex gap-2 mt-3 ml-10 sm:ml-16 flex-wrap">
                    {member.badges.slice(0, 3).map((badge, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-muted rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Team Averages & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Team Averages */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Team Averages</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Runs/Day</span>
              <span className="font-semibold">{teamAverages.runsPerDay.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Runs/Week</span>
              <span className="font-semibold">{teamAverages.runsPerWeek.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pipeline Size</span>
              <span className="font-semibold">{teamAverages.pipelineContacts.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Task Completion</span>
              <span className="font-semibold">{teamAverages.taskCompletion.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="font-semibold">{teamAverages.responseRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Performance Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Top Performer</p>
                <p className="text-xs text-muted-foreground">
                  {sortedTeam[0].name} leads with {getMetricValue(sortedTeam[0])} this period
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Longest Streak</p>
                <p className="text-xs text-muted-foreground">
                  {[...teamWithStats].sort((a, b) => b.streak - a.streak)[0].name} - {[...teamWithStats].sort((a, b) => b.streak - a.streak)[0].streak} days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Rising Star</p>
                <p className="text-xs text-muted-foreground">
                  {sortedTeam[sortedTeam.length - 1].name} showing strong improvement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Recent Achievements</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold">Week Champion</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {sortedTeam[0].name} - Most productive this week
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">On Fire</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentUser?.name} - {currentUser?.streak} day streak
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">Speed Record</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Team hit 200+ runs this week
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}