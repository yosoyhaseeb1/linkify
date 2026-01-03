import { useState, useEffect, useRef } from 'react';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useTheme } from '../contexts/ThemeContext';
import { Save, Trash2, AlertTriangle, Mail, Bell, Sparkles, Lock, FlaskConical, ToggleLeft, ToggleRight, Sun, Moon, Plus, MoreVertical, Shield, User, Upload, Camera, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
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
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * Settings Page Component
 * Manages organization settings, team members, and user preferences
 */
export function Settings() {
  const { currentOrg, members, inviteMember, removeMember, updateMemberRole, isCurrentUserAdmin, currentUserMember } = useOrganization();
  const { user, getToken } = useAuth();
  const { isFeatureEnabled, enableFeature, disableFeature } = useFeatureFlags();
  const { theme, setTheme } = useTheme();
  const { restartOnboarding } = useOnboarding();
  const [orgName, setOrgName] = useState('');
  const [defaultMaxProspects, setDefaultMaxProspects] = useState('50');
  const [autoStart, setAutoStart] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBetaFeatures, setShowBetaFeatures] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<{ id: string; name: string; currentRole: 'admin' | 'member' } | null>(null);
  
  // Profile settings
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Avatar options using DiceBear - using 'big-smile' style for friendly, happy avatars
  const avatarSeeds = ['Felix', 'Aneka', 'Buddy', 'Callie', 'Chester', 'Cleo', 'Dusty', 'George', 'Gizmo', 'Harley', 'Jasper', 'Loki', 'Lucky', 'Max', 'Milo', 'Misty', 'Oliver', 'Patches', 'Princess', 'Sasha', 'Smokey', 'Snickers', 'Tiger', 'Trouble'];
  
  // Initialize org name when currentOrg changes
  useEffect(() => {
    if (currentOrg?.name) {
      setOrgName(currentOrg.name);
    }
  }, [currentOrg?.name]);
  
  // Initialize notification email when user changes
  useEffect(() => {
    if (user?.email) {
      setNotificationEmail(user.email);
    }
  }, [user?.email]);
  
  // Initialize profile from current member or user
  useEffect(() => {
    if (currentUserMember) {
      setProfileName(currentUserMember.name || user?.name || '');
      setProfileEmail(currentUserMember.email || user?.email || '');
      setProfileAvatar(currentUserMember.avatar || user?.avatar || `https://api.dicebear.com/7.x/big-smile/svg?seed=${user?.id}`);
    } else if (user) {
      setProfileName(user?.name || '');
      setProfileEmail(user?.email || '');
      setProfileAvatar(user?.avatar || `https://api.dicebear.com/7.x/big-smile/svg?seed=${user?.id}`);
    }
  }, [currentUserMember, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setLoading(true);
    
    try {
      // Handle file upload to server
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        setLoading(false);
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user?.id || '');
      formData.append('orgId', currentOrg?.id || '');
      
      // Upload to server which will handle Supabase Storage
      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/upload-avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
          body: formData,
        }
      );
      
      if (uploadResponse.ok) {
        const { avatarUrl } = await uploadResponse.json();
        setProfileAvatar(avatarUrl);
        toast.success('Profile picture uploaded!');
      } else {
        // Fallback to local preview if upload fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileAvatar(reader.result as string);
          toast.success('Profile picture updated (saved locally until you click Save)');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      // Fallback to local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
        toast.success('Profile picture updated (saved locally until you click Save)');
      };
      reader.readAsDataURL(file);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarSelect = (seed: string) => {
    const newAvatar = `https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}`;
    setProfileAvatar(newAvatar);
    setShowAvatarPicker(false);
    toast.success('Avatar updated!');
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    
    // Update member data in organization
    try {
      console.log('Current user member:', currentUserMember);
      console.log('Current org:', currentOrg);
      console.log('Profile name:', profileName);
      console.log('Profile avatar:', profileAvatar);
      
      if (!currentUserMember) {
        toast.error('Current user not found in team members');
        setLoading(false);
        return;
      }
      
      if (!currentOrg) {
        toast.error('No organization selected');
        setLoading(false);
        return;
      }
      
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/org-members/${currentOrg.id}/profile`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profileName,
            avatar: profileAvatar
          })
        }
      );
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        toast.success('Profile updated successfully');
        // Refresh page to show updated avatar
        setTimeout(() => window.location.reload(), 500);
      } else {
        const errorText = await response.text();
        console.error('Failed to update profile:', errorText);
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInviteEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    // Check if email already exists
    const emailExists = members.some(member => member.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return 'This email is already a team member';
    }
    return '';
  };

  const handleInviteEmailChange = (email: string) => {
    setInviteEmail(email);
    // Clear error when user starts typing
    setInviteEmailError('');
  };

  const handleInviteEmailBlur = () => {
    const error = validateInviteEmail(inviteEmail);
    setInviteEmailError(error);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setLoading(false);
    }, 1000);
  };

  const handleDelete = () => {
    toast.error('Organization deletion is not available in demo mode');
  };

  const advancedFeatures = [
    {
      name: 'AI Candidate Matching',
      enabled: isFeatureEnabled('aiCandidateMatching'),
      plan: 'Pro',
      description: 'Get AI-powered match scores for each prospect'
    },
    {
      name: 'Multi-Job Intelligence',
      enabled: isFeatureEnabled('multiJobIntelligence'),
      plan: 'Pro',
      description: 'Analyze multiple similar job posts at once'
    },
    {
      name: 'Campaign Analytics',
      enabled: isFeatureEnabled('campaignPerformanceDashboard'),
      plan: 'Pro',
      description: 'Deep insights into campaign performance'
    },
    {
      name: 'Multi-Channel Sequencing',
      enabled: isFeatureEnabled('multiChannelSequencing'),
      plan: 'Pro',
      description: 'LinkedIn + Email outreach sequences'
    }
  ];

  // Beta features that are backend-ready but UI not yet exposed
  const betaFeatures = [
    {
      key: 'aiCandidateMatching' as const,
      name: 'AI Candidate Matching',
      status: 'Backend Ready',
      description: 'Score prospects based on job requirements and likelihood to respond',
      planRequired: 'Pro'
    },
    {
      key: 'multiJobIntelligence' as const,
      name: 'Multi-Job Intelligence',
      status: 'Backend Ready',
      description: 'Upload multiple similar job posts and get unified candidate profiles',
      planRequired: 'Pro'
    },
    {
      key: 'competitiveIntelligence' as const,
      name: 'Competitive Intelligence',
      status: 'Backend Ready',
      description: 'See which prospects are oversaturated and find hidden gems',
      planRequired: 'Pro'
    },
    {
      key: 'prospectEngagementTracking' as const,
      name: 'Prospect Engagement Tracking',
      status: 'Coming Q1 2026',
      description: 'Track profile views, post engagement, and optimal follow-up timing',
      planRequired: 'Pro'
    },
    {
      key: 'campaignPerformanceDashboard' as const,
      name: 'Campaign Performance Dashboard',
      status: 'Coming Q1 2026',
      description: 'Deep analytics with A/B testing and ROI calculator',
      planRequired: 'Pro'
    },
    {
      key: 'atsIntegration' as const,
      name: 'ATS Integration',
      status: 'Coming Q2 2026',
      description: 'Sync with Greenhouse, Lever, and Bullhorn',
      planRequired: 'Enterprise'
    }
  ];

  const handleToggleBetaFeature = (featureKey: typeof betaFeatures[number]['key']) => {
    const isEnabled = isFeatureEnabled(featureKey);
    if (isEnabled) {
      disableFeature(featureKey);
      toast.success('Beta feature disabled');
    } else {
      enableFeature(featureKey);
      toast.success('Beta feature enabled - changes will apply on next run');
    }
  };

  const canAccessFeature = (planRequired: string) => {
    const planHierarchy = { 'Pilot': 0, 'Pro': 1, 'Enterprise': 2 };
    return planHierarchy[currentOrg?.plan || 'Pilot'] >= planHierarchy[planRequired as keyof typeof planHierarchy];
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const error = validateInviteEmail(inviteEmail);
    if (error) {
      setInviteEmailError(error);
      return;
    }

    if (!inviteEmail) return;

    setLoading(true);
    try {
      await inviteMember(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      setInviteEmailError('');
      setShowInviteModal(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    try {
      await removeMember(memberId);
      toast.success(`${memberName} removed from team`);
    } catch (error) {
      toast.error('Failed to remove member');
    }
    setOpenMenuId(null);
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member', memberName: string) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success(`${memberName}'s role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
    setOpenMenuId(null);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and organization settings
        </p>
      </div>

      {/* Profile Settings */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-primary" />
          <h2>Profile</h2>
        </div>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div>
            <label className="block mb-3">Profile Picture</label>
            <div className="flex items-start gap-6">
              {/* Current Avatar */}
              <div className="relative">
                <img
                  src={profileAvatar || user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={profileName}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-border"
                />
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary-hover transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Upload and Choose Options */}
              <div className="flex-1 space-y-3">
                {/* Upload Button */}
                <label className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg cursor-pointer transition-colors w-full">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>

                {/* Choose Avatar Button */}
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors w-full"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Choose Avatar</span>
                </button>

                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowAvatarPicker(false)}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="glass-card p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold">Choose an Avatar</h3>
                      <button
                        onClick={() => setShowAvatarPicker(false)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {avatarSeeds.map((seed) => (
                        <button
                          key={seed}
                          onClick={() => handleAvatarSelect(seed)}
                          className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}`}
                            alt={seed}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="block mb-2">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </div>

          {/* Save Profile Button */}
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Organization Settings */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <h2 className="mb-6">Organization</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="org-name" className="block mb-2">
              Organization Name
            </label>
            <input
              id="org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="plan" className="block mb-2">
              Current Plan
            </label>
            <div className="flex items-center gap-4">
              <input
                id="plan"
                type="text"
                value={currentOrg?.plan}
                disabled
                className="flex-1 px-4 py-3 bg-muted border border-input rounded-lg text-muted-foreground"
              />
              {currentOrg?.plan !== 'Enterprise' && (
                <Link
                  to="/billing"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] whitespace-nowrap"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              To change your plan, visit the Billing section or contact support
            </p>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          {theme === 'dark' ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
          <h2>Appearance</h2>
        </div>
        <div>
          <label className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium mb-1">Theme Mode</div>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Currently using dark mode' : 'Currently using light mode'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sun className="w-4 h-4" />
                <span className={theme === 'light' ? 'text-foreground font-medium' : ''}>Light</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-switch-background rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={theme === 'dark' ? 'text-foreground font-medium' : ''}>Dark</span>
                <Moon className="w-4 h-4" />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Help & Onboarding */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2>Help & Onboarding</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium mb-2">Product Tour</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  New to Lynqio? Take a quick guided tour to learn about the key features and how to get the most out of the platform.
                </p>
                <button
                  onClick={() => {
                    restartOnboarding();
                    toast.success('Starting product tour...');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Restart Onboarding Tour
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Learn more about Lynqio features and integrations
                </p>
              </div>
              <Link
                to="/help"
                className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg transition-colors text-sm"
              >
                View Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Status */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2>Advanced Features</h2>
        </div>
        <div className="space-y-3">
          {advancedFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                feature.enabled ? 'bg-success/5 border border-success/20' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm">{feature.name}</h4>
                  {feature.enabled ? (
                    <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {feature.plan}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        {currentOrg?.plan === 'Pilot' && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Upgrade to <strong className="text-foreground">Pro</strong> to unlock these advanced features and boost your recruiting efficiency.{' '}
              <Link to="/billing" className="text-primary hover:underline">
                Compare plans →
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Beta Features - Toggleable */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-warning" />
            <h2>Beta Features</h2>
          </div>
          <button
            onClick={() => setShowBetaFeatures(!showBetaFeatures)}
            className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-2"
          >
            {showBetaFeatures ? 'Hide' : 'Show'} Beta Features
            {showBetaFeatures ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
        </div>

        {showBetaFeatures && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Toggle experimental features that are backend-ready but still in testing. These features work with your Make.com workflows.
            </p>
            <div className="space-y-3">
              {betaFeatures.map((feature, index) => {
                const hasAccess = canAccessFeature(feature.planRequired);
                const isEnabled = isFeatureEnabled(feature.key);
                const isBackendReady = feature.status === 'Backend Ready';
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isEnabled && hasAccess
                        ? 'bg-warning/5 border-warning/20'
                        : hasAccess
                        ? 'bg-muted/30 border-border'
                        : 'bg-muted/10 border-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium">{feature.name}</h4>
                          {isBackendReady ? (
                            <span className="px-2 py-0.5 bg-success/10 text-success rounded text-xs">
                              {feature.status}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                              {feature.status}
                            </span>
                          )}
                          {!hasAccess && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {feature.planRequired}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      
                      {hasAccess && isBackendReady && (
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleBetaFeature(feature.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-switch-background rounded-full peer peer-checked:bg-warning transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Beta Feature Notice
              </h4>
              <p className="text-sm text-muted-foreground">
                Beta features are functional in the backend (Make.com workflows) but UI components may not be fully implemented yet. 
                Enable these to test functionality - results will appear in run outputs and can be accessed via API.
              </p>
            </div>

            {currentOrg?.plan === 'Pilot' && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Upgrade to <strong className="text-foreground">Pro</strong> to access backend-ready beta features.{' '}
                  <Link to="/billing" className="text-primary hover:underline">
                    View plans →
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h2>Notifications</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <div className="font-medium mb-1">Email notifications for completed runs</div>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a run completes and HeyReach campaign is prepared
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-switch-background rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          {emailNotifications && (
            <div className="pl-4 border-l-2 border-primary/30">
              <label htmlFor="notification-email" className="block mb-2">
                Notification Email Address
              </label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <input
                  id="notification-email"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="flex-1 px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You'll receive notifications when runs complete successfully or fail
              </p>

              {/* Sample Notification Preview */}
              <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Sample Notification
                </h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Subject:</strong> ✅ Run Completed: Senior Software Engineer at TechCorp</p>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-foreground mb-2">Your automation run has completed successfully!</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Job: Senior Software Engineer at TechCorp</li>
                      <li>Prospects found: 15 decision makers</li>
                      <li>HeyReach campaign: Created and paused for review</li>
                    </ul>
                    <p className="mt-2">
                      <a href="#" className="text-primary hover:underline">View run details →</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automation Settings */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <h2 className="mb-6">Automation Preferences</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="max-prospects" className="block mb-2">
              Default Max Prospects
            </label>
            <select
              id="max-prospects"
              value={defaultMaxProspects}
              onChange={(e) => setDefaultMaxProspects(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="25">25 prospects</option>
              <option value="50">50 prospects</option>
              <option value="100">100 prospects</option>
              <option value="200">200 prospects</option>
            </select>
            <p className="text-sm text-muted-foreground mt-2">
              Default limit for new automation runs
            </p>
          </div>

          <div>
            <label className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <div className="font-medium mb-1">Auto-start campaigns</div>
                <p className="text-sm text-muted-foreground">
                  Automatically activate campaigns in HeyReach after run completes
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-switch-background rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <p className="text-sm text-warning mt-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Campaigns will start automatically without review. Not recommended for first-time users.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <div className="glass-card p-8 rounded-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2>Team Management</h2>
          </div>
          {isCurrentUserAdmin() && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {isCurrentUserAdmin() 
            ? `Manage team members and their roles within ${currentOrg?.name}`
            : `View team members in ${currentOrg?.name}`
          }
        </p>

        {!isCurrentUserAdmin() && (
          <div className="mb-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-warning" />
              Only admins can invite members or change roles. Contact an admin for team management.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{member.name}</h4>
                    {member.email === user?.email && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  {member.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{member.role === 'admin' ? 'Admin' : 'Member'}</span>
                </div>

                {isCurrentUserAdmin() && member.email !== user?.email && (
                  <>
                    <button
                      onClick={() => {
                        setMemberToChangeRole({ id: member.id, name: member.name, currentRole: member.role });
                        setShowChangeRoleDialog(true);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title={`Change ${member.name}'s role`}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMemberToRemove({ id: member.id, name: member.name });
                        setShowRemoveMemberDialog(true);
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      title={`Remove ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 rounded-xl max-w-md w-full">
              <h2 className="mb-6">Invite Team Member</h2>
              <form onSubmit={handleInvite}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="invite-email" className="block mb-2">
                      Email Address
                    </label>
                    <input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => handleInviteEmailChange(e.target.value)}
                      onBlur={handleInviteEmailBlur}
                      placeholder="colleague@company.com"
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    {inviteEmailError && (
                      <p className="text-sm text-red-500 mt-1">{inviteEmailError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="invite-role" className="block mb-2">
                      Role
                    </label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                      className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Admins can manage team members and organization settings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={() => {
            setOrgName(currentOrg?.name || '');
            setDefaultMaxProspects('50');
            setAutoStart(false);
            setEmailNotifications(true);
            setNotificationEmail(user?.email || '');
            toast.info('Changes discarded');
          }}
          className="px-8 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          Discard
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-8 rounded-xl border-l-4 border-destructive">
        <h2 className="mb-6">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
            <div>
              <h3 className="mb-1">Delete Organization</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all associated data.
                This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteOrgDialog(true)}
              className="flex items-center gap-2 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Organization Dialog */}
      <AlertDialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your organization and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                setShowDeleteOrgDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove {memberToRemove?.name} from the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove) {
                  handleRemove(memberToRemove.id, memberToRemove.name);
                }
                setShowRemoveMemberDialog(false);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Member Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Change {memberToChangeRole?.name}'s role from <strong>{memberToChangeRole?.currentRole === 'admin' ? 'Admin' : 'Member'}</strong> to <strong>{memberToChangeRole?.currentRole === 'admin' ? 'Member' : 'Admin'}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToChangeRole) {
                  const newRole = memberToChangeRole.currentRole === 'admin' ? 'member' : 'admin';
                  handleRoleChange(memberToChangeRole.id, newRole, memberToChangeRole.name);
                }
                setShowChangeRoleDialog(false);
              }}
            >
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}