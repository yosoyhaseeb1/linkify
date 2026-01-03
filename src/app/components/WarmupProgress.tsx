import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext } from '../contexts/OrganizationContext';
import { Flame, Shield, Clock, TrendingUp, Info } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface WarmupStatus {
  warmupComplete: boolean;
  daysSinceStart: number;
  totalDays: number;
  progress: number;
  today?: {
    runsUsed: number;
    runsLimit: number;
    runsRemaining: number;
    invitesUsed: number;
    invitesLimit: number;
    invitesRemaining: number;
  };
  daysUntilFullAccess?: number;
}

export function WarmupProgress() {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganizationContext();
  const [status, setStatus] = useState<WarmupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (currentOrg?.id) {
      loadWarmupStatus();
    }
  }, [currentOrg?.id]);

  const loadWarmupStatus = async () => {
    try {
      const token = await getToken();
      
      if (!token || !currentOrg?.id) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/warmup/${currentOrg?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Error loading warmup status:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error loading warmup status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
        <div className="h-2 bg-white/10 rounded w-full" />
      </div>
    );
  }

  if (!status || status.warmupComplete) {
    return null; // Don't show if warmup is complete
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
      {/* Warmup Icon & Status */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-500/20 rounded">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Warmup</span>
          <span className="text-white/60 text-xs">Day {status.daysSinceStart}/{status.totalDays}</span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="relative h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* Today's Stats - Compact */}
      {status.today && (
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Runs:</span>
            <span className="text-white font-medium">{status.today.runsUsed}/{status.today.runsLimit}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Invites:</span>
            <span className="text-white font-medium">{status.today.invitesUsed}/{status.today.invitesLimit}</span>
          </div>
        </div>
      )}

      {/* Info Button */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="p-1 hover:bg-white/10 rounded transition-colors ml-auto"
        title="Why warmup?"
      >
        <Info className="w-3.5 h-3.5 text-white/40" />
      </button>

      {/* Info Tooltip - Positioned Absolutely */}
      {showInfo && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 border border-orange-500/20 rounded-lg p-3 shadow-xl z-50">
          <div className="flex items-start gap-2 text-white/80 text-xs">
            <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white mb-1">Why warmup?</p>
              <p>
                LinkedIn monitors new accounts for suspicious activity. 
                Gradually increasing your outreach volume over 2 weeks keeps your account safe and improves response rates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarmupProgress;