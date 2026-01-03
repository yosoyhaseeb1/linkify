import { useState, useEffect } from 'react';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MoreVertical, Mail, Shield, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/Skeleton';

export function Team() {
  const { members, inviteMember, removeMember, updateMemberRole, currentOrg, loadingMembers } = useOrganization();
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setLoading(true);
    try {
      await inviteMember(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (memberId === user?.id) {
      toast.error('You cannot remove yourself from the team');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      try {
        await removeMember(memberId);
        toast.success(`${memberName} removed from team`);
      } catch (error) {
        toast.error('Failed to remove member');
      }
    }
    setOpenMenuId(null);
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member', memberName: string) => {
    if (memberId === user?.id) {
      toast.error('You cannot change your own role');
      return;
    }

    try {
      await updateMemberRole(memberId, newRole);
      toast.success(`${memberName}'s role updated to ${newRole === 'admin' ? 'Admin' : 'Member'}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1>Team</h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass-card p-4 sm:p-6 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Team Members</p>
          <p className="text-3xl font-semibold">{members.length}</p>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Seats Used</p>
          <p className="text-3xl font-semibold">
            {currentOrg?.usedSeats} / {currentOrg?.seats}
          </p>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Available Seats</p>
          <p className="text-3xl font-semibold">
            {(currentOrg?.seats || 0) - (currentOrg?.usedSeats || 0)}
          </p>
        </div>
      </div>

      {/* Members List - Desktop Table */}
      <div className="hidden lg:block glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Member</th>
                <th className="px-6 py-4 text-left text-sm">Role</th>
                <th className="px-6 py-4 text-left text-sm">Joined</th>
                <th className="px-6 py-4 text-left text-sm"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingMembers ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-48 h-3" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4 rounded" />
                          <Skeleton className="w-16 h-4" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-24 h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full bg-primary/10"
                        />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {member.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={member.role === 'admin' ? 'text-primary' : ''}>
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 glass-card border border-border rounded-lg shadow-lg z-20">
                              {member.role === 'member' && (
                                <button
                                  onClick={() => handleRoleChange(member.id, 'admin', member.name)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 first:rounded-t-lg"
                                >
                                  <Shield className="w-4 h-4" />
                                  Make Admin
                                </button>
                              )}
                              {member.role === 'admin' && member.id !== '1' && (
                                <button
                                  onClick={() => handleRoleChange(member.id, 'member', member.name)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 first:rounded-t-lg"
                                >
                                  <User className="w-4 h-4" />
                                  Make Member
                                </button>
                              )}
                              {member.id !== '1' && (
                                <button
                                  onClick={() => handleRemove(member.id, member.name)}
                                  className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 last:rounded-b-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Members List - Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {loadingMembers ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                    <div className="flex items-center gap-4 mt-3">
                      <Skeleton className="w-20 h-3" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                </div>
              </div>
            ))}
          </>
        ) : (
          members.map((member) => (
            <div key={member.id} className="glass-card p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-1">{member.name}</div>
                  <div className="text-sm text-muted-foreground mb-3 truncate">{member.email}</div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      {member.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={member.role === 'admin' ? 'text-primary' : ''}>
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{formatDate(member.joinedAt)}</span>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === member.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 glass-card border border-border rounded-lg shadow-lg z-20">
                        {member.role === 'member' && (
                          <button
                            onClick={() => handleRoleChange(member.id, 'admin', member.name)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 first:rounded-t-lg"
                          >
                            <Shield className="w-4 h-4" />
                            Make Admin
                          </button>
                        )}
                        {member.role === 'admin' && member.id !== '1' && (
                          <button
                            onClick={() => handleRoleChange(member.id, 'member', member.name)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 first:rounded-t-lg"
                          >
                            <User className="w-4 h-4" />
                            Make Member
                          </button>
                        )}
                        {member.id !== '1' && (
                          <button
                            onClick={() => handleRemove(member.id, member.name)}
                            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 last:rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Info */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3>Admin</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Full access to all features</li>
            <li>• Manage team members</li>
            <li>• Configure integrations</li>
            <li>• Manage billing</li>
          </ul>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <h3>Member</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Create and view runs</li>
            <li>• Access dashboard</li>
            <li>• View prospects</li>
            <li>• No admin capabilities</li>
          </ul>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 sm:p-8 rounded-2xl max-w-md w-full">
            <h2 className="mb-6">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteRole('member');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}