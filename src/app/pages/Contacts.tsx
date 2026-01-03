import { useState, useEffect } from 'react';
import { Search, Filter, Plus, LayoutGrid, LayoutList, UserPlus, Mail, Phone, Linkedin, MapPin, Calendar, Tag, Trash2, Download, Upload, MoreVertical, X, AlertCircle, Loader2, MessageSquare, CheckCircle2, Clock, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizationContext } from '../contexts/OrganizationContext';
import { fetchUserData, saveUserContacts } from '../services/userDataService';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../components/ui/pagination';
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

type ProspectStage = 'conversation_started' | 'qualification' | 'proposal_sent' | 'signed_mandate' | 'lost';

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedin_url: string;
  email: string;
  phone?: string;
  stage: ProspectStage;
  tags: string[];
  run_id: string;
  organization_id: string;
  notes: string;
  last_activity_at: string;
  created_at: string;
  source: string;
  location?: string;
}

const STAGES = [
  { id: 'conversation_started', label: 'Conversation Started', color: 'bg-blue-500/20 text-blue-500' },
  { id: 'qualification', label: 'Qualification', color: 'bg-purple-500/20 text-purple-500' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-green-500/20 text-green-500' },
  { id: 'signed_mandate', label: 'Signed Mandate', color: 'bg-orange-500/20 text-orange-500' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500/20 text-gray-500' }
];

const ALL_TAGS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'AI/ML',
  'Cloud',
  'HR',
  'Hot Lead',
  'Decision Maker',
  'Enterprise',
  'Startup',
  'Success',
  'Cold'
];

export function Contacts() {
  const { user, getToken } = useAuth(); // Get current user from auth context
  const { currentOrg } = useOrganizationContext();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ProspectStage | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'created' | 'activity'>('activity');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Add Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [lastSavedContacts, setLastSavedContacts] = useState<Contact[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isFormValid, setIsFormValid] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    title: '',
    company: '',
    phone: '',
    linkedin_url: '',
    location: '',
    notes: '',
    tags: [] as string[],
    stage: 'conversation_started' as ProspectStage
  });
  const [contactErrors, setContactErrors] = useState({
    name: '',
    email: '',
    title: '',
    company: ''
  });

  // Load user-specific contacts from backend
  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
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
      setContacts(userData.contacts || []);
      console.log(`✅ Loaded ${userData.contacts?.length || 0} contacts for user ${user.id}`);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Save contacts to backend whenever they change
  const saveContacts = async (updatedContacts: Contact[], options?: { silent?: boolean }): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Store previous state for rollback
    const previousContacts = contacts;
    
    // Optimistic update - show changes immediately
    setContacts(updatedContacts);
    setPendingSave(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token');
      }
      
      const success = await saveUserContacts(user.id, token, updatedContacts);
      
      if (success) {
        setLastSavedContacts(updatedContacts);
        setPendingSave(false);
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Save failed, rolling back:', error);
      // Rollback to previous state
      setContacts(previousContacts);
      setPendingSave(false);
      
      if (!options?.silent) {
        toast.error('Failed to save. Changes reverted.');
      }
      return false;
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, getToken]);

  // Real-time form validation
  useEffect(() => {
    const errors = {
      name: '',
      email: '',
      title: '',
      company: ''
    };

    if (touchedFields.has('name') && !newContact.name.trim()) {
      errors.name = 'Name is required';
    }

    if (touchedFields.has('email')) {
      if (!newContact.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
        errors.email = 'Please enter a valid email';
      }
    }

    if (touchedFields.has('title') && !newContact.title.trim()) {
      errors.title = 'Title is required';
    }

    if (touchedFields.has('company') && !newContact.company.trim()) {
      errors.company = 'Company is required';
    }

    setContactErrors(errors);
    
    // Check if form is valid (all required fields filled and no errors)
    const hasAllRequired = 
      newContact.name.trim() && 
      newContact.email.trim() && 
      newContact.title.trim() && 
      newContact.company.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email);
    
    setIsFormValid(hasAllRequired);
  }, [newContact, touchedFields]);

  const handleRetry = () => {
    setIsRetrying(true);
    loadData();
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'all' || contact.stage === stageFilter;

    const matchesTags =
      tagFilter.length === 0 || tagFilter.some((tag) => contact.tags.includes(tag));

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const contactDate = new Date(contact.created_at);
      const now = new Date();
      const diffTime = now.getTime() - contactDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (dateFilter === 'today') return diffDays < 1;
      if (dateFilter === 'week') return diffDays < 7;
      if (dateFilter === 'month') return diffDays < 30;
      return true;
    })();

    return matchesSearch && matchesStage && matchesTags && matchesDate;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'company') return a.company.localeCompare(b.company);
    if (sortBy === 'created')
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'activity')
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = sortedContacts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stageFilter, tagFilter, dateFilter, sortBy]);

  const stats = {
    total: contacts.length,
    conversation_started: contacts.filter((c) => c.stage === 'conversation_started').length,
    qualification: contacts.filter((c) => c.stage === 'qualification').length,
    proposal_sent: contacts.filter((c) => c.stage === 'proposal_sent').length,
    signed_mandate: contacts.filter((c) => c.stage === 'signed_mandate').length
  };

  const handleToggleTag = (tag: string) => {
    setTagFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleContactTag = (tag: string) => {
    setNewContact((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handleSaveContact = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSavingContact(true);

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication failed. Please try logging in again.');
        setIsSavingContact(false);
        return;
      }

      const contactToAdd: Contact = {
        id: crypto.randomUUID(),
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        title: newContact.title.trim(),
        company: newContact.company.trim(),
        phone: newContact.phone.trim(),
        linkedin_url: newContact.linkedin_url.trim(),
        location: newContact.location.trim(),
        notes: newContact.notes.trim(),
        tags: newContact.tags,
        stage: newContact.stage,
        run_id: 'manual-add',
        organization_id: currentOrg?.id || '',
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        source: 'Manual Entry'
      };

      const updatedContacts = [contactToAdd, ...contacts];
      const success = await saveContacts(updatedContacts);

      if (success !== false) {
        // Reset form
        setNewContact({
          name: '',
          email: '',
          title: '',
          company: '',
          phone: '',
          linkedin_url: '',
          location: '',
          notes: '',
          tags: [],
          stage: 'conversation_started'
        });

        setContactErrors({
          name: '',
          email: '',
          title: '',
          company: ''
        });

        setShowAddContactModal(false);
        toast.success(`${contactToAdd.name} added to contacts!`);
        console.log('✅ Contact added successfully:', contactToAdd);
      } else {
        // Revert optimistic update
        setContacts(contacts);
        toast.error('Failed to save contact. Please try again.');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to save contact. Please check your connection.');
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleBulkExport = () => {
    console.log('Exporting contacts:', selectedContacts);
    // In real app, trigger CSV/Excel export
  };

  const handleBulkDelete = async () => {
    const count = selectedContacts.length;
    const updatedContacts = contacts.filter((c) => !selectedContacts.includes(c.id));
    const success = await saveContacts(updatedContacts);
    
    if (success !== false) {
      setSelectedContacts([]);
      toast.success(`${count} contact${count > 1 ? 's' : ''} deleted`);
    } else {
      toast.error('Failed to delete contacts');
    }
  };

  const handleQuickStageChange = async (contactId: string, newStage: ProspectStage) => {
    const updatedContacts = contacts.map(c => 
      c.id === contactId 
        ? { ...c, stage: newStage, last_activity_at: new Date().toISOString() }
        : c
    );
    
    const success = await saveContacts(updatedContacts, { silent: true });
    
    if (success) {
      toast.success('Stage updated');
    }
  };

  const getStageBadge = (stage: ProspectStage) => {
    const stageInfo = STAGES.find((s) => s.id === stage);
    return stageInfo || { label: stage, color: 'bg-gray-500/20 text-gray-500' };
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your prospect database with advanced filtering and segmentation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <button
          onClick={() => setStageFilter('all')}
          className={`glass-card rounded-lg p-4 transition-all ${
            stageFilter === 'all' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="text-2xl mb-1">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Contacts</div>
        </button>

        {STAGES.slice(0, 5).map((stage) => (
          <button
            key={stage.id}
            onClick={() => setStageFilter(stage.id as ProspectStage)}
            className={`glass-card rounded-lg p-4 transition-all ${
              stageFilter === stage.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="text-2xl mb-1">
              {stats[stage.id as keyof typeof stats] || 0}
            </div>
            <div className="text-sm text-muted-foreground">{stage.label}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          {/* Search */}
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(tagFilter.length > 0 || dateFilter !== 'all') && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">
                {tagFilter.length + (dateFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 sm:px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:border-primary focus:outline-none min-w-0"
          >
            <option value="activity">Activity</option>
            <option value="created">Created</option>
            <option value="name">Name</option>
            <option value="company">Company</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-background' : 'hover:bg-background/50'
              }`}
              aria-label="Table view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-background' : 'hover:bg-background/50'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            aria-label="Export contacts"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Contact */}
          <button
            onClick={() => setShowAddContactModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>

          {/* Saving Indicator */}
          {pendingSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-border space-y-4">
            {/* Tags Filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      tagFilter.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Added:</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      dateFilter === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setTagFilter([]);
                  setDateFilter('all');
                  setStageFilter('all');
                  setSearchQuery('');
                }}
                className="ml-auto px-4 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
            <span className="text-sm text-muted-foreground">
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkExport}
              className="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
            >
              Export Selected
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedContacts([])}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Contacts List/Grid */}
      {viewMode === 'table' ? (
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      checked={
                        selectedContacts.length === sortedContacts.length &&
                        sortedContacts.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(sortedContacts.map((c) => c.id));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Company</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Stage</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Tags</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">
                    Last Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <Skeleton className="w-4 h-4 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div>
                              <Skeleton className="w-32 h-4 mb-1" />
                              <Skeleton className="w-24 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-28 h-4" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-24 h-6 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Skeleton className="w-16 h-5 rounded" />
                            <Skeleton className="w-20 h-5 rounded" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-16 h-4" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-12 h-4" />
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <Skeleton className="w-4 h-4 rounded-full" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-2">
                      <ErrorBanner
                        message="Failed to load contacts. Please try again."
                        onRetry={handleRetry}
                        isRetrying={isRetrying}
                      />
                    </td>
                  </tr>
                ) : (
                  <>
                {paginatedContacts.map((contact) => {
                  const stageBadge = getStageBadge(contact.stage);
                  return (
                    <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            } else {
                              setSelectedContacts(
                                selectedContacts.filter((id) => id !== contact.id)
                              );
                            }
                          }}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {contact.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contact.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${stageBadge.color}`}
                        >
                          {stageBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {formatLastActivity(contact.last_activity_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="text-sm text-primary hover:text-primary-hover transition-colors"
                          >
                            View
                          </button>
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-accent rounded transition-colors"
                          >
                            <Linkedin className="w-4 h-4 text-muted-foreground" />
                          </a>
                          <a
                            href={`mailto:${contact.email}`}
                            className="p-1 hover:bg-accent rounded transition-colors"
                          >
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </>
                )}
              </tbody>
            </table>
            {!loading && sortedContacts.length === 0 && (
              <div className="py-4">
                <EmptyState
                  icon={UserPlus}
                  headline="No contacts in your database yet"
                  description={searchQuery || stageFilter !== 'all' || tagFilter.length > 0 || dateFilter !== 'all' ? 'Try adjusting your filters to see more results.' : 'Contacts are automatically added from your automation runs.'}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {paginatedContacts.map((contact) => {
            const stageBadge = getStageBadge(contact.stage);
            return (
              <div key={contact.id} className="glass-card rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium">{contact.name.charAt(0)}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts([...selectedContacts, contact.id]);
                      } else {
                        setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                      }
                    }}
                    className="rounded border-border"
                  />
                </div>
                <h3 className="text-sm font-medium mb-1 truncate">{contact.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 truncate">{contact.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{contact.company}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs mb-3 ${stageBadge.color}`}
                >
                  {stageBadge.label}
                </span>
                <div className="flex flex-wrap gap-1 mb-3">
                  {contact.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary-hover transition-colors"
                  >
                    View Details
                  </button>
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            );
          })}
          {!loading && sortedContacts.length === 0 && (
            <div className="col-span-4">
              <EmptyState
                icon={UserPlus}
                headline="No contacts in your database yet"
                description={searchQuery || stageFilter !== 'all' || tagFilter.length > 0 || dateFilter !== 'all' ? 'Try adjusting your filters to see more results.' : 'Contacts are automatically added from your automation runs.'}
              />
            </div>
          )}
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="glass-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-medium">
                      {selectedContact.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="mb-1">{selectedContact.name}</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedContact.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedContact.company}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{selectedContact.email}</span>
                  </a>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedContact.phone}</span>
                    </div>
                  )}
                  <a
                    href={selectedContact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn Profile</span>
                    <MoreVertical className="w-3 h-3" />
                  </a>
                  {selectedContact.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedContact.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-muted rounded-lg text-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm mb-3">Notes</h3>
                <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                  {selectedContact.notes || 'No notes yet'}
                </div>
              </div>

              <div>
                <h3 className="text-sm mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span>{selectedContact.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added:</span>
                    <span>{formatDate(selectedContact.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span>{formatDate(selectedContact.last_activity_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stage:</span>
                    <span className={`${getStageBadge(selectedContact.stage).color} px-2 py-0.5 rounded`}>
                      {getStageBadge(selectedContact.stage).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedContacts.length > 1 ? `${selectedContacts.length} contacts` : '1 contact'}? This will remove them from all pipelines and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkDelete();
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Contact Modal */}
      <AlertDialog 
        open={showAddContactModal} 
        onOpenChange={(open) => {
          setShowAddContactModal(open);
          if (!open) {
            setTouchedFields(new Set());
            setContactErrors({ name: '', email: '', title: '', company: '' });
          }
        }}
      >
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details of the new contact you want to add to your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Form Grid - 3 columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  onBlur={() => handleFieldBlur('name')}
                  className={`w-full px-3 py-2 bg-muted border rounded-lg focus:outline-none text-sm transition-colors ${
                    contactErrors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : newContact.name.trim() && touchedFields.has('name')
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-border focus:border-primary'
                  }`}
                  placeholder="John Doe"
                />
                {contactErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.name}
                  </p>
                )}
                {!contactErrors.name && newContact.name.trim() && touchedFields.has('name') && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Looks good!
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newContact.title}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  onBlur={() => handleFieldBlur('title')}
                  className={`w-full px-3 py-2 bg-muted border rounded-lg focus:outline-none text-sm transition-colors ${
                    contactErrors.title 
                      ? 'border-red-500 focus:border-red-500' 
                      : newContact.title.trim() && touchedFields.has('title')
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-border focus:border-primary'
                  }`}
                  placeholder="VP of Engineering"
                />
                {contactErrors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.title}
                  </p>
                )}
                {!contactErrors.title && newContact.title.trim() && touchedFields.has('title') && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Looks good!
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full px-3 py-2 bg-muted border rounded-lg focus:outline-none text-sm transition-colors ${
                    contactErrors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : newContact.email.trim() && !contactErrors.email && touchedFields.has('email')
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-border focus:border-primary'
                  }`}
                  placeholder="john@company.com"
                />
                {contactErrors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.email}
                  </p>
                )}
                {!contactErrors.email && newContact.email.trim() && touchedFields.has('email') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email) && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Looks good!
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  onBlur={() => handleFieldBlur('company')}
                  className={`w-full px-3 py-2 bg-muted border rounded-lg focus:outline-none text-sm transition-colors ${
                    contactErrors.company 
                      ? 'border-red-500 focus:border-red-500' 
                      : newContact.company.trim() && touchedFields.has('company')
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-border focus:border-primary'
                  }`}
                  placeholder="Acme Inc."
                />
                {contactErrors.company && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {contactErrors.company}
                  </p>
                )}
                {!contactErrors.company && newContact.company.trim() && touchedFields.has('company') && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Looks good!
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">LinkedIn URL</label>
                <input
                  type="text"
                  value={newContact.linkedin_url}
                  onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                <input
                  type="text"
                  value={newContact.location}
                  onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                  placeholder="San Francisco, CA"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Stage</label>
                <select
                  value={newContact.stage}
                  onChange={(e) => setNewContact({ ...newContact, stage: e.target.value as ProspectStage })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Tags - Full Width */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleContactTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    newContact.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSaveContact} 
              disabled={isSavingContact || !isFormValid}
              className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSavingContact ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage(currentPage)}
                className="bg-primary text-primary-foreground"
              >
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}