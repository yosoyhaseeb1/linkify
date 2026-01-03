import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  Clock,
  Contact,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Mail,
  Phone,
  Linkedin,
  X
} from 'lucide-react';
import { useState } from 'react';

type JobStatus = 'open' | 'on_hold' | 'closed_filled' | 'closed_lost';
type CandidateStatus = 'sourced' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';

interface Candidate {
  id: string;
  name: string;
  linkedinUrl: string;
  source: string;
  status: CandidateStatus;
  addedDate: string;
  notes?: string;
}

interface JobTask {
  id: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ContactPerson {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  role: 'hiring_manager' | 'hr' | 'stakeholder';
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    linkedinUrl: 'https://linkedin.com/in/alexthompson',
    source: 'LinkedIn Search',
    status: 'interviewing',
    addedDate: 'Jan 20, 2026',
    notes: 'Strong ML background, previously at Google'
  },
  {
    id: '2',
    name: 'Jamie Lee',
    linkedinUrl: 'https://linkedin.com/in/jamielee',
    source: 'Referral',
    status: 'contacted',
    addedDate: 'Jan 18, 2026'
  },
  {
    id: '3',
    name: 'Taylor Martinez',
    linkedinUrl: 'https://linkedin.com/in/taylormartinez',
    source: 'Direct Outreach',
    status: 'sourced',
    addedDate: 'Jan 22, 2026'
  }
];

const mockTasks: JobTask[] = [
  {
    id: '1',
    title: 'Follow up with hiring manager on candidate feedback',
    dueDate: 'Today',
    assignedTo: 'Sarah Johnson',
    completed: false,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Send shortlist to client',
    dueDate: 'Tomorrow',
    assignedTo: 'Sarah Johnson',
    completed: false,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Prep candidates for technical interview',
    dueDate: 'Jan 28',
    assignedTo: 'Sarah Johnson',
    completed: true,
    priority: 'medium'
  }
];

const mockContacts: ContactPerson[] = [
  {
    id: '1',
    name: 'Dr. Lisa Wang',
    title: 'Chief Data Officer',
    email: 'lisa.wang@aisolutions.com',
    phone: '+1 (555) 123-4567',
    linkedinUrl: 'https://linkedin.com/in/lisawang',
    role: 'hiring_manager'
  },
  {
    id: '2',
    name: 'Jennifer Park',
    title: 'HR Director',
    email: 'jennifer.park@aisolutions.com',
    linkedinUrl: 'https://linkedin.com/in/jenniferpark',
    role: 'hr'
  }
];

const candidateStatusConfig: Record<CandidateStatus, { label: string; color: string; bgColor: string }> = {
  sourced: { label: 'Sourced', color: 'text-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20' },
  contacted: { label: 'Contacted', color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  interviewing: { label: 'Interviewing', color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  offered: { label: 'Offered', color: 'text-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/20' },
  hired: { label: 'Hired', color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20' }
};

export function JobDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'tasks' | 'contacts'>('overview');
  const [jobStatus, setJobStatus] = useState<JobStatus>('open');
  
  // State for managing lists
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [tasks, setTasks] = useState<JobTask[]>(mockTasks);
  const [contacts, setContacts] = useState<ContactPerson[]>(mockContacts);
  
  // State for showing add forms
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  
  // State for new items
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    linkedinUrl: '',
    source: '',
    notes: ''
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    assignedTo: 'Sarah Johnson',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  
  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    role: 'stakeholder' as 'hiring_manager' | 'hr' | 'stakeholder'
  });

  // Mock job data
  const job = {
    id: id || '1',
    title: 'Senior ML Engineer',
    company: 'AI Solutions Inc',
    location: 'San Francisco, CA',
    feeType: '20% of first year salary',
    estimatedValue: '$35,000',
    signedDate: 'Jan 15, 2026',
    assignedRecruiter: 'Sarah Johnson',
    dealId: 'deal-1',
    jobPostUrl: 'https://linkedin.com/jobs/view/12345',
    dealNotes: 'Connected via LinkedIn outreach. Dr. Lisa Wang is the key decision maker. They\'re looking to build out their ML team quickly. Timeline is urgent - want someone to start by March.',
    decisionMakers: ['Dr. Lisa Wang (CDO)', 'Jennifer Park (HR Director)']
  };

  const statusOptions: { value: JobStatus; label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'closed_filled', label: 'Closed - Filled' },
    { value: 'closed_lost', label: 'Closed - Lost' }
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Briefcase },
    { id: 'candidates' as const, label: 'Candidates', icon: Users, count: candidates.length },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckCircle2, count: tasks.filter(t => !t.completed).length },
    { id: 'contacts' as const, label: 'Contacts', icon: Contact, count: contacts.length }
  ];

  // Handler functions
  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.linkedinUrl || !newCandidate.source) {
      return;
    }

    const candidate: Candidate = {
      id: String(Date.now()),
      name: newCandidate.name,
      linkedinUrl: newCandidate.linkedinUrl,
      source: newCandidate.source,
      status: 'sourced',
      addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: newCandidate.notes || undefined
    };

    setCandidates([candidate, ...candidates]);
    setShowAddCandidate(false);
    setNewCandidate({ name: '', linkedinUrl: '', source: '', notes: '' });
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      return;
    }

    const task: JobTask = {
      id: String(Date.now()),
      title: newTask.title,
      dueDate: newTask.dueDate,
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      completed: false
    };

    setTasks([task, ...tasks]);
    setShowAddTask(false);
    setNewTask({ title: '', dueDate: '', assignedTo: 'Sarah Johnson', priority: 'medium' });
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.title || !newContact.email) {
      return;
    }

    const contact: ContactPerson = {
      id: String(Date.now()),
      name: newContact.name,
      title: newContact.title,
      email: newContact.email,
      phone: newContact.phone || undefined,
      linkedinUrl: newContact.linkedinUrl || undefined,
      role: newContact.role
    };

    setContacts([...contacts, contact]);
    setShowAddContact(false);
    setNewContact({ name: '', title: '', email: '', phone: '', linkedinUrl: '', role: 'stakeholder' });
  };

  const handleToggleTask = (taskId: string) => {
    console.log('Toggle task:', taskId);
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        console.log('Task toggled from', t.completed, 'to', !t.completed);
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleUpdateCandidateStatus = (candidateId: string, status: CandidateStatus) => {
    setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status } : c));
  };

  return (
    <div className="p-4 md:p-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="mb-1">{job.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.assignedRecruiter}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">Started {job.signedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.estimatedValue}</span>
              </div>
            </div>
          </div>

          {/* Status Selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value as JobStatus)}
              className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {job.jobPostUrl && (
              <a
                href={job.jobPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4" />
                View Job Post
              </a>
            )}

            <Link
              to="/pipeline"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
            >
              <FileText className="w-4 h-4" />
              View in Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-background'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Summary */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-4">Job Summary</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Role Title</label>
                <p className="font-medium">{job.title}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Company</label>
                <p className="font-medium">{job.company}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <p className="font-medium">{job.location}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Fee Type</label>
                <p className="font-medium">{job.feeType}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Estimated Value</label>
                <p className="font-medium text-green-500">{job.estimatedValue}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Signed Date</label>
                <p className="font-medium">{job.signedDate}</p>
              </div>
            </div>
          </div>

          {/* Client Context */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-4">Client Context</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Decision Makers</label>
                <div className="space-y-2">
                  {job.decisionMakers.map((dm, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{dm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Deal Notes</label>
                <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                  {job.dealNotes}
                </div>
              </div>
              <Link
                to="/pipeline"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
              >
                <FileText className="w-4 h-4" />
                View in Pipeline
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="mb-1">Candidates</h2>
              <p className="text-sm text-muted-foreground">
                Lightweight tracking only - no ATS features
              </p>
            </div>
            <button 
              onClick={() => setShowAddCandidate(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((candidate) => {
              const config = candidateStatusConfig[candidate.status];
              return (
                <div key={candidate.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <span className={`px-3 py-1 rounded-lg text-xs border ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>Source: {candidate.source}</span>
                        <span>•</span>
                        <span>Added {candidate.addedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                        title="View LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <select
                        value={candidate.status}
                        onChange={(e) => {
                          // In production, this would update the candidate status
                          console.log('Update candidate status:', candidate.id, e.target.value);
                        }}
                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      >
                        <option value="sourced">Sourced</option>
                        <option value="contacted">Contacted</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  {candidate.notes && (
                    <p className="text-sm text-muted-foreground italic">{candidate.notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          {candidates.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg mb-2">No candidates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking candidates for this role
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2>Job Tasks</h2>
            <button 
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  console.log('🟢 TASK ROW CLICKED! Task ID:', task.id);
                  alert(`Task row clicked: ${task.id}`);
                  handleToggleTask(task.id);
                }}
                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 cursor-pointer hover:bg-muted/40 ${
                  task.completed ? 'bg-muted/20' : 'bg-muted/30'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 transition-all duration-300" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground transition-all duration-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-2 transition-all duration-300 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignedTo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className={task.dueDate === 'Today' ? 'text-orange-500 font-medium' : ''}>
                        {task.dueDate}
                      </span>
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="mb-1">Related Contacts</h2>
              <p className="text-sm text-muted-foreground">
                Key stakeholders for this role
              </p>
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Link Contact
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium mb-1">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{contact.title}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      contact.role === 'hiring_manager' ? 'bg-purple-500/10 text-purple-500' :
                      contact.role === 'hr' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {contact.role === 'hiring_manager' ? 'Hiring Manager' :
                       contact.role === 'hr' ? 'HR' : 'Stakeholder'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCandidate(false)}>
          <div className="glass-card rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Add New Candidate</h3>
              <button onClick={() => setShowAddCandidate(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Name *</label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">LinkedIn URL *</label>
                <input
                  type="url"
                  value={newCandidate.linkedinUrl}
                  onChange={(e) => setNewCandidate({ ...newCandidate, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Source *</label>
                <input
                  type="text"
                  value={newCandidate.source}
                  onChange={(e) => setNewCandidate({ ...newCandidate, source: e.target.value })}
                  placeholder="LinkedIn Search, Referral, etc."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Notes (optional)</label>
                <textarea
                  value={newCandidate.notes}
                  onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                  placeholder="Any relevant notes about this candidate..."
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddCandidate}
                  disabled={!newCandidate.name || !newCandidate.linkedinUrl || !newCandidate.source}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Candidate
                </button>
                <button
                  onClick={() => setShowAddCandidate(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTask(false)}>
          <div className="glass-card rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Add New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Follow up with client..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Due Date *</label>
                  <input
                    type="text"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    placeholder="Today, Tomorrow, Jan 28..."
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title || !newTask.dueDate}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddContact(false)}>
          <div className="glass-card rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Add New Contact</h3>
              <button onClick={() => setShowAddContact(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Title *</label>
                  <input
                    type="text"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                    placeholder="HR Director"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Email *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Role</label>
                  <select
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value as 'hiring_manager' | 'hr' | 'stakeholder' })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="stakeholder">Stakeholder</option>
                    <option value="hiring_manager">Hiring Manager</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">LinkedIn URL (optional)</label>
                <input
                  type="url"
                  value={newContact.linkedinUrl}
                  onChange={(e) => setNewContact({ ...newContact, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/johnsmith"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.title || !newContact.email}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}