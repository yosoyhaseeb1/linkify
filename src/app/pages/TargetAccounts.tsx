import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Plus, 
  ArrowLeft,
  Building2,
  Users,
  TrendingUp,
  ExternalLink,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface TargetAccount {
  id: string;
  company: string;
  domain: string | null;
  priority: 'high' | 'medium' | 'low';
  notes: string | null;
  addedAt: string;
}

interface AccountActivity {
  account: TargetAccount;
  prospects: any[];
  runs: any[];
  summary: {
    totalProspects: number;
    totalRuns: number;
    teamMembers: string[];
  };
}

export function TargetAccounts() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  const { getToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<TargetAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountActivity | null>(null);
  const [newAccount, setNewAccount] = useState({
    company: '',
    domain: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, [currentOrg]);

  const loadAccounts = async () => {
    if (!currentOrg) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/target-accounts/${currentOrg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load target accounts');

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading target accounts:', error);
      toast.error('Failed to load target accounts');
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async () => {
    if (!currentOrg) return;
    if (!newAccount.company) {
      toast.error('Please provide a company name');
      return;
    }

    try {
      const token = await getToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/target-accounts/${currentOrg.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAccount),
        }
      );

      if (!response.ok) throw new Error('Failed to add target account');

      toast.success('Target account added');
      setNewAccount({ company: '', domain: '', priority: 'medium', notes: '' });
      setShowAddModal(false);
      loadAccounts();
    } catch (error) {
      console.error('Error adding target account:', error);
      toast.error('Failed to add target account');
    }
  };

  const viewAccountActivity = async (accountId: string) => {
    if (!currentOrg) return;

    try {
      const token = await getToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/target-accounts/${currentOrg.id}/${accountId}/activity`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load account activity');

      const data = await response.json();
      setSelectedAccount(data);
    } catch (error) {
      console.error('Error loading account activity:', error);
      toast.error('Failed to load account activity');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading target accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Target Accounts
            </h1>
            <p className="text-muted-foreground mt-2">
              Track all team activity for your most important accounts
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Target Account
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            onClick={() => viewAccountActivity(account.id)}
            className="glass-card p-6 rounded-xl hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {account.company}
                  </h3>
                  {account.domain && (
                    <p className="text-sm text-muted-foreground">{account.domain}</p>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityColor(account.priority)}`}>
                {account.priority}
              </span>
            </div>

            {account.notes && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {account.notes}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-primary">
              <Activity className="w-4 h-4" />
              View Team Activity
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="glass-card p-12 rounded-xl text-center">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No target accounts yet</p>
          <p className="text-sm text-muted-foreground">
            Add your most important accounts to track all team activity in one place
          </p>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Target Account</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newAccount.company}
                  onChange={(e) => setNewAccount({ ...newAccount, company: e.target.value })}
                  placeholder="e.g., Airbnb"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  value={newAccount.domain}
                  onChange={(e) => setNewAccount({ ...newAccount, domain: e.target.value })}
                  placeholder="e.g., airbnb.com"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  value={newAccount.priority}
                  onChange={(e) => setNewAccount({ ...newAccount, priority: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                  placeholder="Why is this account important?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addAccount}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
              >
                Add Account
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAccount({ company: '', domain: '', priority: 'medium', notes: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Activity Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 rounded-xl max-w-4xl w-full my-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-primary" />
                  {selectedAccount.account.company}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All team activity for this account
                </p>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Runs</span>
                </div>
                <p className="text-2xl font-bold">{selectedAccount.summary.totalRuns}</p>
              </div>

              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Prospects</span>
                </div>
                <p className="text-2xl font-bold">{selectedAccount.summary.totalProspects}</p>
              </div>

              <div className="glass-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Team Members</span>
                </div>
                <p className="text-2xl font-bold">{selectedAccount.summary.teamMembers.length}</p>
              </div>
            </div>

            {/* Team Members Working This Account */}
            {selectedAccount.summary.teamMembers.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Team Members Involved</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAccount.summary.teamMembers.map((member, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prospects List */}
            {selectedAccount.prospects.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">
                  Prospects ({selectedAccount.prospects.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedAccount.prospects.map((prospect) => (
                    <div key={prospect.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{prospect.name}</p>
                          <p className="text-sm text-muted-foreground">{prospect.title}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {prospect.pipeline?.stage || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contacted by <span className="font-semibold">{prospect.contactedBy}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAccount.prospects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No prospects contacted yet for this account</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}