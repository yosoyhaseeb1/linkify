import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Upload, 
  Trash2, 
  ArrowLeft,
  Download,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface BlacklistEntry {
  id: string;
  company: string | null;
  domain: string | null;
  reason: string | null;
  addedAt: string;
}

export function Blacklist() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganization();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    company: '',
    domain: '',
    reason: ''
  });

  useEffect(() => {
    loadBlacklist();
  }, [currentOrg]);

  const loadBlacklist = async () => {
    if (!currentOrg) return;

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token for loading blacklist');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/blacklist/${currentOrg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load blacklist');

      const data = await response.json();
      setBlacklist(data.blacklist || []);
    } catch (error) {
      console.error('Error loading blacklist:', error);
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!currentOrg) return;
    if (!newEntry.company && !newEntry.domain) {
      toast.error('Please provide either a company name or domain');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token for adding blacklist entry');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/blacklist/${currentOrg.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEntry),
        }
      );

      if (!response.ok) throw new Error('Failed to add to blacklist');

      toast.success('Company added to blacklist');
      setNewEntry({ company: '', domain: '', reason: '' });
      setShowAddModal(false);
      loadBlacklist();
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      toast.error('Failed to add to blacklist');
    }
  };

  const removeEntry = async (entryId: string) => {
    if (!currentOrg) return;

    if (!confirm('Remove this company from the blacklist?')) return;

    try {
      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token for removing blacklist entry');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/blacklist/${currentOrg.id}/${entryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to remove from blacklist');

      toast.success('Company removed from blacklist');
      loadBlacklist();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast.error('Failed to remove from blacklist');
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrg) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if present
      const startIndex = lines[0].toLowerCase().includes('company') ? 1 : 0;
      
      const entries = lines.slice(startIndex).map(line => {
        const [company, domain, reason] = line.split(',').map(s => s.trim());
        return { company, domain, reason };
      }).filter(entry => entry.company || entry.domain);

      if (entries.length === 0) {
        toast.error('No valid entries found in CSV');
        return;
      }

      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token for CSV upload');
        toast.error('Failed to import CSV');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/blacklist/${currentOrg.id}/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ entries }),
        }
      );

      if (!response.ok) throw new Error('Failed to import CSV');

      const data = await response.json();
      toast.success(`Imported ${data.count} companies to blacklist`);
      loadBlacklist();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Failed to import CSV');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = 'company,domain,reason\nGoogle,google.com,Current client\nMeta,meta.com,Competitor';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blacklist-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blacklist...</p>
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
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-destructive" />
              Company Blacklist
            </h1>
            <p className="text-muted-foreground mt-2">
              Companies that should never be contacted by your team
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV Template
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 rounded-xl mb-6 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">How Blacklist Works</p>
            <p className="text-muted-foreground">
              When a team member tries to run a job from a blacklisted company, the automation will be automatically blocked. 
              This prevents wasting credits and protects your relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Blacklist Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Blacklisted Companies ({blacklist.length})
            </h2>
          </div>
        </div>

        {blacklist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Company</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Domain</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Reason</th>
                  <th className="text-left p-4 font-semibold hidden sm:table-cell">Added</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{entry.company || '-'}</p>
                        {entry.domain && (
                          <p className="text-sm text-muted-foreground md:hidden">{entry.domain}</p>
                        )}
                        {entry.reason && (
                          <p className="text-sm text-muted-foreground md:hidden mt-1">{entry.reason}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {entry.domain || '-'}
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {entry.reason || '-'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remove from blacklist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No companies blacklisted yet</p>
            <p className="text-sm">Add companies you don't want your team to contact</p>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Company to Blacklist</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newEntry.company}
                  onChange={(e) => setNewEntry({ ...newEntry, company: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  value={newEntry.domain}
                  onChange={(e) => setNewEntry({ ...newEntry, domain: e.target.value })}
                  placeholder="e.g., google.com"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="e.g., Current client, Competitor, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addEntry}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
              >
                Add to Blacklist
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEntry({ company: '', domain: '', reason: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}