import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useOrganizationList, useSession } from '@clerk/clerk-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { logger } from '../utils/logger';

interface Organization {
  id: string;
  name: string;
  plan: 'Pilot' | 'Pro' | 'Enterprise';
  seats: number;
  usedSeats: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

interface Usage {
  runsUsed: number;
  runsLimit: number;
  prospectsUsed: number;
  prospectsLimit: number;
  resetDate: string;
}

/**
 * Organization context value type
 * @property organizations - List of organizations the user belongs to
 * @property currentOrg - Currently active organization
 * @property switchOrganization - Function to switch to a different org
 * @property members - Members of the current organization
 * @property usage - Current usage statistics and limits for the organization
 * @property inviteMember - Function to invite a new member to the organization
 * @property removeMember - Function to remove a member from the organization
 * @property updateMemberRole - Function to update a member's role (Admin or Member)
 * @property loadingMembers - Whether members are currently being loaded
 * @property loadingOrg - Whether organization data is currently being loaded
 * @property isCurrentUserAdmin - Function to check if current user is admin
 * @property currentUserMember - The current user's member object in the organization
 */
interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  switchOrganization: (orgId: string) => void;
  members: Member[];
  usage: Usage;
  inviteMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  loadingMembers: boolean;
  loadingOrg: boolean;
  isCurrentUserAdmin: () => boolean;
  currentUserMember: Member | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

/**
 * Internal Organization Provider Implementation
 * This is the actual provider that uses Clerk hooks
 * Should only be rendered when user is authenticated
 */
function OrganizationProviderImpl({ children }: { children: ReactNode }) {
  const { user, getToken } = useAuth();
  const { session } = useSession();
  
  // SAFETY: This component should only be rendered when user exists
  // The outer OrganizationProvider handles the guard
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const [usage, setUsage] = useState<Usage>({
    runsUsed: 0,
    runsLimit: 100,
    prospectsUsed: 0,
    prospectsLimit: 1000,
    resetDate: '2025-01-01'
  });

  // Sync Clerk organizations to local state
  useEffect(() => {
    // Guard: Don't process if user not authenticated
    if (!user) {
      setLoadingOrg(false);
      return;
    }
    
    // Wait for Clerk to load
    if (!isLoaded) {
      return;
    }

    if (userMemberships?.data) {
      const orgs = userMemberships.data.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        plan: 'Pilot' as const, // Default to trial/Pilot plan - will be fetched from backend
        seats: 3, // Default minimum seats
        usedSeats: membership.organization.membersCount || 0
      }));
      setOrganizations(orgs);
      logger.success(`Loaded ${orgs.length} Clerk organizations`);
      
      // Handle no organizations case - set loadingOrg to false
      if (orgs.length === 0) {
        setLoadingOrg(false);
        setCurrentOrg(null);
        logger.info('No organizations found - user needs to create or join an organization');
      }
    } else if (isLoaded) {
      // Clerk is loaded but no memberships data - user has no organizations
      setOrganizations([]);
      setLoadingOrg(false);
      setCurrentOrg(null);
      logger.info('No organizations found - user needs to create or join an organization');
    }
  }, [userMemberships?.data, isLoaded, user]);

  // Set current org from Clerk active organization
  // CRITICAL: Must call setActive() to ensure JWT contains org_id claim
  useEffect(() => {
    if (organizations.length > 0 && setActive && session) {
      const storedOrgId = localStorage.getItem('currentOrgId');
      const matchingOrg = storedOrgId ? organizations.find(o => o.id === storedOrgId) : null;
      const orgToActivate = matchingOrg || organizations[0];
      const shouldStoreOrgId = !matchingOrg;
      
      // Check if the org is already active
      const activeOrgId = session.lastActiveOrganizationId;
      if (activeOrgId === orgToActivate.id) {
        // Organization is already active, verify token has org_id
        getToken().then(token => {
          if (token) {
            // Decode token to check for org_id claim
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                if (payload.org_id === orgToActivate.id) {
                  logger.success(`Organization already active with valid token: ${orgToActivate.name}`);
                  setCurrentOrg(orgToActivate);
                  setLoadingOrg(false);
                  return;
                }
              }
            } catch (e) {
              logger.warn('Could not decode token:', e);
            }
          }
          
          // Token doesn't have org_id, need to activate
          logger.info(`Token missing org_id, re-activating: ${orgToActivate.name}`);
          activateOrganization(orgToActivate, shouldStoreOrgId);
        });
      } else {
        // Different org needs to be activated
        activateOrganization(orgToActivate, shouldStoreOrgId);
      }
    }
    
    async function activateOrganization(org: Organization, storeOrgId: boolean) {
      logger.info(`Activating organization in Clerk: ${org.name} (${org.id})`);
      
      try {
        await setActive({ organization: org.id });
        logger.info('setActive() completed');
        
        // Wait for session to update and verify token has org_id
        let retries = 0;
        const maxRetries = 20; // Further increased
        
        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 400)); // Increased to 400ms
          
          // CRITICAL: Skip cache to get fresh token with org_id claim
          const token = await getToken({ skipCache: true });
          if (token) {
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                
                // Log full payload for debugging
                logger.debug(`🔍 Token check (attempt ${retries + 1}/${maxRetries}):`, {
                  has_org_id: !!payload.org_id,
                  org_id_value: payload.org_id,
                  expected: org.id,
                  match: payload.org_id === org.id,
                  org_role: payload.org_role,
                  org_permissions: payload.org_permissions,
                  all_claims: Object.keys(payload)
                });
                
                if (payload.org_id === org.id) {
                  // Token has the correct org_id!
                  setCurrentOrg(org);
                  if (storeOrgId) {
                    localStorage.setItem('currentOrgId', org.id);
                  }
                  logger.success(`Activated Clerk org with verified token: ${org.name} (took ${(retries + 1) * 400}ms)`);
                  setLoadingOrg(false);
                  return;
                }
              }
            } catch (e) {
              logger.warn('Error decoding token:', e);
            }
          } else {
            logger.warn(`No token returned on attempt ${retries + 1}`);
          }
          
          retries++;
        }
        
        // Timeout - check one more time what we have
        const finalToken = await getToken({ skipCache: true });
        if (finalToken) {
          try {
            const parts = finalToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              logger.error(`⚠️ Token verification timed out. Final token state:`, {
                has_org_id: !!payload.org_id,
                org_id: payload.org_id,
                expected: org.id,
                all_claims: Object.keys(payload)
              });
            }
          } catch (e) {
            logger.error('Could not decode final token');
          }
        }
        
        logger.warn(`⚠️ Token verification timed out after ${maxRetries} attempts (${maxRetries * 400}ms), proceeding anyway`);
        setCurrentOrg(org);
        if (storeOrgId) {
          localStorage.setItem('currentOrgId', org.id);
        }
        setLoadingOrg(false);
        
      } catch (err) {
        logger.error('❌ Failed to activate organization in Clerk:', err);
        // Still set the org locally even if Clerk activation fails
        setCurrentOrg(org);
        setLoadingOrg(false);
      }
    }
  }, [organizations, setActive, getToken, session]);

  // Update usedSeats when members change
  useEffect(() => {
    if (currentOrg) {
      setOrganizations(prevOrgs => 
        prevOrgs.map(org => 
          org.id === currentOrg.id 
            ? { ...org, usedSeats: members.length }
            : org
        )
      );
      // Update currentOrg with new usedSeats count
      setCurrentOrg(prev => {
        if (!prev || prev.id !== currentOrg.id) return prev;
        return { ...prev, usedSeats: members.length };
      });
    }
  }, [members.length, currentOrg?.id]); // Fixed: Added currentOrg?.id to dependencies

  // Load members when organization changes
  useEffect(() => {
    const loadMembers = async () => {
      if (!currentOrg?.id || !user) {
        setLoadingMembers(false);
        return;
      }

      setLoadingMembers(true);
      try {
        // Fetch members from backend database instead of Clerk
        // This is our single source of truth after the initial sync
        const token = await getToken();
        if (!token) {
          logger.error('Failed to get Clerk token for loading members');
          setLoadingMembers(false);
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/org-members/${currentOrg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'x-clerk-token': token,
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const dbMembers: Member[] = data.members.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            avatar: m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`,
            joinedAt: m.joined_at
          }));

          setMembers(dbMembers);
          logger.success(`Loaded ${dbMembers.length} members from database for org ${currentOrg.id}`);
        } else {
          logger.error('Failed to load members from database:', await response.text());
          setMembers([]);
        }
      } catch (err) {
        logger.error('Error loading members:', err);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [currentOrg?.id, user, getToken]); // Fixed: Added user and getToken to dependencies

  // Fetch usage data from backend
  useEffect(() => {
    const fetchUsage = async () => {
      if (!currentOrg?.id) return;
      
      try {
        const token = await getToken();
        if (!token) return;
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/usage/${currentOrg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'x-clerk-token': token,
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUsage({
            runsUsed: data.usage.runs.used,
            runsLimit: data.usage.runs.limit,
            prospectsUsed: data.usage.prospects.used,
            prospectsLimit: data.usage.prospects.limit,
            resetDate: data.periodEnd || '2025-01-01'
          });
          logger.success('Loaded usage data');
        }
      } catch (err) {
        logger.error('Error fetching usage:', err);
      }
    };
    
    fetchUsage();
  }, [currentOrg?.id, getToken]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org && setActive) {
      // Set the active organization in Clerk
      setActive({ organization: orgId });
      setCurrentOrg(org);
      localStorage.setItem('currentOrgId', orgId);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!currentOrg?.id) return;

    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: new Date().toISOString()
    };

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/org-members/${currentOrg.id}/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ member: newMember })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMembers([...members, data.member]);
        logger.success(`Added member ${data.member.email} to org ${currentOrg.id}`);
      } else {
        logger.error('Failed to add member:', await response.text());
        throw new Error('Failed to add member');
      }
    } catch (err) {
      logger.error('Error inviting member:', err);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!currentOrg?.id) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/org-members/${currentOrg.id}/${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          }
        }
      );

      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberId));
        logger.success(`Removed member ${memberId} from org ${currentOrg.id}`);
      } else {
        logger.error('Failed to remove member:', await response.text());
        throw new Error('Failed to remove member');
      }
    } catch (err) {
      logger.error('Error removing member:', err);
      throw err;
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    if (!currentOrg?.id) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/org-members/${currentOrg.id}/${memberId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role })
        }
      );

      if (response.ok) {
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, role } : m
        ));
        logger.success(`Updated role for member ${memberId} in org ${currentOrg.id} to ${role}`);
      } else {
        logger.error('Failed to update member role:', await response.text());
        throw new Error('Failed to update member role');
      }
    } catch (err) {
      logger.error('Error updating member role:', err);
      throw err;
    }
  };

  const isCurrentUserAdmin = () => {
    if (!user) return false;
    
    // Check our database member role as the source of truth
    const currentMember = members.find(m => m.email === user.email);
    return currentMember?.role === 'admin';
  };

  const currentUserMember = members.find(m => m.email === user?.email) || null;

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        switchOrganization,
        members,
        usage,
        inviteMember,
        removeMember,
        updateMemberRole,
        loadingMembers,
        loadingOrg,
        isCurrentUserAdmin,
        currentUserMember
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Organization Provider Component
 * Manages multi-tenant organization state and Clerk integration
 * Handles org switching, member management, and backend sync
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components to render
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Guard: Don't use Clerk org hooks if user is not authenticated
  if (!user) {
    return (
      <OrganizationContext.Provider
        value={{
          organizations: [],
          currentOrg: null,
          switchOrganization: () => {},
          members: [],
          usage: {
            runsUsed: 0,
            runsLimit: 100,
            prospectsUsed: 0,
            prospectsLimit: 1000,
            resetDate: '2025-01-01'
          },
          inviteMember: () => Promise.resolve(),
          removeMember: () => Promise.resolve(),
          updateMemberRole: () => Promise.resolve(),
          loadingMembers: false,
          loadingOrg: false,
          isCurrentUserAdmin: () => false,
          currentUserMember: null
        }}
      >
        {children}
      </OrganizationContext.Provider>
    );
  }
  
  return <OrganizationProviderImpl children={children} />;
}

/**
 * Hook to access organization context
 * Must be used within an OrganizationProvider
 * @returns OrganizationContextType with org data, members, and management functions
 * @throws Error if used outside of OrganizationProvider
 */
export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}