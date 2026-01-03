import { useState, useEffect } from 'react';
import { Search, Filter, Plus, List, Grid3x3, CheckCircle2, Circle, Clock, AlertCircle, Calendar, User, Tag, Trash2, ChevronDown, X, Loader2, Flag, ListTodo } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserData, saveUserTasks } from '../services/userDataService';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { TaskModal } from '../components/TaskModal';
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

type TaskType = 'follow_up' | 'meeting' | 'call' | 'email' | 'other';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'completed' | 'overdue';

interface Task {
  id: string;
  prospect_id: string;
  prospect_name: string;
  prospect_company: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  type: TaskType;
  priority: TaskPriority;
  created_at: string;
}

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_LEVELS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' }
];

// Profile pictures for prospects
const PROSPECT_AVATARS: Record<string, string> = {
  'Michael Roberts': 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NjU3MDI0NXww&ixlib=rb-4.1.0&q=80&w=1080',
  'James Park': 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzY2NjY4OTMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Dr. Lisa Wang': 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2NjU5MDk0OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Alex Thompson': 'https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwaGVhZHNob3R8ZW58MXx8fHwxNzY2NjIwMzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Sarah Chen': 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY2NjQ2MDY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Rachel Green': 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2NjU5MDk0OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Sophie Brown': 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY2NjQ2MDY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Marcus Kim': 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzY2NjY4OTMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'Emma Wilson': 'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc2NjU5MDk0OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'Tom Anderson': 'https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NjU5NzcyN3ww&ixlib=rb-4.1.0&q=80&w=1080'
};

export function Tasks() {
  const { user, getToken } = useAuth(); // Get current user from auth context
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created'>('due_date');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [fadingTasks, setFadingTasks] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    prospect_id: '',
    type: 'follow_up' as TaskType,
    priority: 'medium' as TaskPriority
  });
  
  const [taskErrors, setTaskErrors] = useState({
    title: '',
    due_date: '',
    prospect_id: ''
  });

  const [touchedFields, setTouchedFields] = useState({
    title: false,
    due_date: false,
    prospect_id: false
  });

  // Save tasks to backend with toast feedback
  const saveTasks = async (updatedTasks: Task[], action: string) => {
    const previousTasks = [...tasks];
    setTasks(updatedTasks); // Optimistic update
    
    if (user?.id) {
      try {
        const token = await getToken();
        if (token) {
          await saveUserTasks(user.id, token, updatedTasks);
          toast.success(action);
        }
      } catch (error) {
        setTasks(previousTasks); // Rollback on error
        toast.error('Failed to save changes');
        console.error('Error saving tasks:', error);
      }
    }
  };

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        console.error('Failed to get authentication token');
        setLoading(false);
        return;
      }
      
      const userData = await fetchUserData(user.id, token);
      setTasks(userData.tasks || []);
      setContacts(userData.contacts || []);
      console.log(`✅ Loaded ${userData.tasks?.length || 0} tasks for user ${user.id}`);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, getToken]);

  const validateTaskField = (field: string, value: string) => {
    if (!value.trim()) {
      const fieldName = field === 'prospect_id' ? 'Contact/Prospect' : field.charAt(0).toUpperCase() + field.slice(1);
      return `${fieldName} is required`;
    }
    return '';
  };

  const handleTaskFieldChange = (field: string, value: string) => {
    setNewTask({ ...newTask, [field]: value });
    // Clear error when user starts typing
    if (field in taskErrors) {
      setTaskErrors({ ...taskErrors, [field]: '' });
    }
  };

  const handleTaskFieldBlur = (field: string) => {
    // Mark field as touched
    if (field in touchedFields) {
      setTouchedFields(prev => ({ ...prev, [field]: true }));
    }
    
    const value = newTask[field as keyof typeof newTask];
    if (field in taskErrors) {
      const error = validateTaskField(field, String(value));
      setTaskErrors({ ...taskErrors, [field]: error });
    }
  };

  const handleAddTask = () => {
    // Validate all required fields
    const errors = {
      title: validateTaskField('title', newTask.title),
      due_date: validateTaskField('due_date', newTask.due_date),
      prospect_id: validateTaskField('prospect_id', newTask.prospect_id)
    };

    if (Object.values(errors).some(error => error !== '')) {
      setTaskErrors(errors);
      return;
    }

    const prospect = contacts.find(p => p.id === newTask.prospect_id);
    if (!prospect) return;

    const task: Task = {
      id: String(Date.now()),
      prospect_id: newTask.prospect_id,
      prospect_name: prospect.name,
      prospect_company: prospect.company,
      title: newTask.title,
      description: newTask.description,
      due_date: newTask.due_date,
      completed: false,
      type: newTask.type,
      priority: newTask.priority,
      created_at: new Date().toISOString()
    };

    saveTasks([task, ...tasks], 'Task added successfully!');
    setShowAddTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      due_date: '',
      prospect_id: '',
      type: 'follow_up',
      priority: 'medium'
    });
    setTaskErrors({
      title: '',
      due_date: '',
      prospect_id: ''
    });
    setTouchedFields({
      title: false,
      due_date: false,
      prospect_id: false
    });
  };

  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.completed) return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) return 'overdue';
    return 'pending';
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.prospect_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.prospect_company.toLowerCase().includes(searchQuery.toLowerCase());

    const taskStatus = getTaskStatus(task);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && taskStatus === 'pending') ||
      (statusFilter === 'completed' && taskStatus === 'completed');

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;

    // Keep tasks visible during fade animation even if they don't match filter
    const isFading = fadingTasks.includes(task.id);

    return (matchesSearch && matchesStatus && matchesPriority && matchesType) || isFading;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'due_date') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, sortBy]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => getTaskStatus(t) === 'pending').length,
    overdue: tasks.filter((t) => getTaskStatus(t) === 'overdue').length,
    completed: tasks.filter((t) => getTaskStatus(t) === 'completed').length,
    dueToday: tasks.filter((t) => {
      const today = new Date().toDateString();
      return new Date(t.due_date).toDateString() === today && !t.completed;
    }).length
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // If uncompleting a task, just toggle immediately
    if (task?.completed) {
      const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed: false } : t));
      saveTasks(updatedTasks, 'Task reopened');
      return;
    }
    
    // Mark as completed
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t));
    saveTasks(updatedTasks, 'Task completed! 🎉');
    
    // Add to fading list
    setFadingTasks(prev => [...prev, taskId]);
    
    // After 0.5 seconds, remove from fading list
    setTimeout(() => {
      setFadingTasks(prev => prev.filter(id => id !== taskId));
    }, 500);
  };

  const handleBulkComplete = () => {
    const updatedTasks = tasks.map((t) => (selectedTasks.includes(t.id) ? { ...t, completed: true } : t));
    saveTasks(updatedTasks, `${selectedTasks.length} tasks completed! 🎉`);
    setSelectedTasks([]);
  };

  const handleBulkDelete = () => {
    const count = selectedTasks.length;
    setFadingTasks(selectedTasks);
    setTimeout(() => {
      const updatedTasks = tasks.filter((t) => !selectedTasks.includes(t.id));
      saveTasks(updatedTasks, `${count} task${count > 1 ? 's' : ''} deleted`);
      setSelectedTasks([]);
      setFadingTasks([]);
    }, 500);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays < 7) return `in ${diffDays}d`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    return PRIORITY_LEVELS.find((p) => p.value === priority)?.color || 'text-gray-500';
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    return PRIORITY_LEVELS.find((p) => p.value === priority)?.label || priority;
  };

  const getTypeLabel = (type: TaskType) => {
    return TASK_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Tasks</h1>
        <p className="text-muted-foreground">
          Manage and track all your follow-ups and action items
        </p>
      </div>

      {/* Mobile: Status Filter Dropdown */}
      <div className="lg:hidden mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none"
        >
          <option value="all">All Tasks ({stats.total})</option>
          <option value="active">⭕ Active ({stats.pending})</option>
          <option value="overdue">🔴 Overdue ({stats.overdue})</option>
          <option value="completed">✅ Completed ({stats.completed})</option>
        </select>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground mb-1">Due Today</div>
            <div className="text-xl text-orange-500">{stats.dueToday}</div>
          </div>
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground mb-1">Overdue</div>
            <div className="text-xl text-red-500">{stats.overdue}</div>
          </div>
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-xl text-green-500">{stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Desktop: Status Filter Grid */}
      <div className="hidden lg:grid grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('active')}
          className={`glass-card rounded-lg p-4 transition-all ${
            statusFilter === 'active' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="text-2xl">{stats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`glass-card rounded-lg p-4 transition-all ${
            statusFilter === 'overdue' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Overdue</span>
          </div>
          <div className="text-2xl text-red-500">{stats.overdue}</div>
        </button>

        <button
          className="glass-card rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Due Today</span>
          </div>
          <div className="text-2xl text-orange-500">{stats.dueToday}</div>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`glass-card rounded-lg p-4 transition-all ${
            statusFilter === 'completed' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="text-2xl text-green-500">{stats.completed}</div>
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`glass-card rounded-lg p-4 transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <div className="text-2xl">{stats.total}</div>
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-lg p-4 mb-6">
        {/* Top Row: Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-background' : 'hover:bg-background/50'
              }`}
            >
              <ListTodo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-background' : 'hover:bg-background/50'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>

          {/* Add Task */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm ml-auto"
            onClick={() => setShowAddTaskModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Bottom Row: Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="flex gap-3 pt-4 border-t border-border">
            {/* Priority Filter */}
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-2 block">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Priorities</option>
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-2 block">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Types</option>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPriorityFilter('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
            <span className="text-sm text-muted-foreground">
              {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkComplete}
              className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
            >
              Mark Complete
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTasks([])}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Tasks List/Grid */}
      {viewMode === 'list' ? (
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(sortedTasks.map((t) => t.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3 text-left w-8"></th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Task</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <Skeleton className="w-4 h-4 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-5 h-5 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-full h-4 mb-1" />
                          <Skeleton className="w-3/4 h-3" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div>
                              <Skeleton className="w-24 h-3 mb-1" />
                              <Skeleton className="w-20 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-16 h-6 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-16 h-4" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="w-12 h-4" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <>
                {paginatedTasks.map((task) => {
                  const taskStatus = getTaskStatus(task);
                  const isFading = fadingTasks.includes(task.id);
                  
                  // Don't render tasks that finished fading
                  if (task.completed && !isFading && statusFilter !== 'completed' && statusFilter !== 'all') {
                    return null;
                  }
                  
                  return (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isFading ? 0 : 1 }}
                      transition={{ duration: 0.5 }}
                      className={`hover:bg-muted/30 transition-colors ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter((id) => id !== task.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleTask(task.id)}>
                          {task.completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </motion.div>
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          <p className="text-sm font-medium mb-1">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={PROSPECT_AVATARS[task.prospect_name]} 
                            alt={task.prospect_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm">{task.prospect_name}</p>
                            <p className="text-xs text-muted-foreground">{task.prospect_company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs">
                          {getTypeLabel(task.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-4 h-4" />
                          <span className="text-sm">{getPriorityLabel(task.priority)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            taskStatus === 'overdue' ? 'text-red-500 font-medium' : ''
                          }`}
                        >
                          {formatDueDate(task.due_date)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
                </>
                )}
              </tbody>
            </table>
            {!loading && sortedTasks.length === 0 && (
              <div className="py-4">
                <EmptyState
                  icon={ListTodo}
                  headline="All caught up!"
                  description={searchQuery || priorityFilter !== 'all' || typeFilter !== 'all' || statusFilter === 'completed' ? 'Try adjusting your filters to see more tasks.' : 'No tasks to show.'}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {paginatedTasks.map((task) => {
            const taskStatus = getTaskStatus(task);
            const isFading = fadingTasks.includes(task.id);
            
            // Don't render tasks that finished fading
            if (task.completed && !isFading && statusFilter !== 'completed' && statusFilter !== 'all') {
              return null;
            }
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: isFading ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className={`glass-card rounded-lg p-4 ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <button onClick={() => handleToggleTask(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-3 h-3" />
                    <span className="text-xs">{getPriorityLabel(task.priority)}</span>
                  </span>
                </div>
                <h3
                  className={`text-sm mb-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <img 
                    src={PROSPECT_AVATARS[task.prospect_name]} 
                    alt={task.prospect_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{task.prospect_name}</p>
                    <p className="text-muted-foreground">{task.prospect_company}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 bg-muted rounded">{getTypeLabel(task.type)}</span>
                  <span className={taskStatus === 'overdue' ? 'text-red-500 font-medium' : ''}>
                    {formatDueDate(task.due_date)}
                  </span>
                </div>
              </motion.div>
            );
          })}
          {!loading && sortedTasks.length === 0 && (
            <div className="col-span-3">
              <EmptyState
                icon={ListTodo}
                headline="All caught up!"
                description={searchQuery || priorityFilter !== 'all' || typeFilter !== 'all' || statusFilter === 'completed' ? 'Try adjusting your filters to see more tasks.' : 'No tasks to show.'}
              />
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <TaskModal
        isOpen={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setNewTask({
            title: '',
            description: '',
            due_date: '',
            prospect_id: '',
            type: 'follow_up',
            priority: 'medium'
          });
          setTaskErrors({
            title: '',
            due_date: '',
            prospect_id: ''
          });
          setTouchedFields({
            title: false,
            due_date: false,
            prospect_id: false
          });
        }}
        onSave={(taskData) => {
          const prospect = contacts.find(p => p.id === taskData.contact_id);
          if (!prospect) return;

          const task: Task = {
            id: String(Date.now()),
            prospect_id: taskData.contact_id!,
            prospect_name: taskData.contact_name!,
            prospect_company: prospect.company,
            title: taskData.title,
            description: taskData.description,
            due_date: taskData.due_date,
            completed: false,
            type: taskData.type!,
            priority: taskData.priority!,
            created_at: new Date().toISOString()
          };

          saveTasks([task, ...tasks], 'Task created');
        }}
        contacts={contacts}
      />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedTasks.length > 1 ? `${selectedTasks.length} tasks` : 'this task'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected task{selectedTasks.length > 1 ? 's' : ''}.
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