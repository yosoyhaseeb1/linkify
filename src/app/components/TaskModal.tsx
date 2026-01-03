import { X, Calendar as CalendarIcon, Search, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { trapFocus, generateId } from '../utils/accessibility';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'follow_up' | 'meeting' | 'call' | 'email' | 'other';
  contact_id?: string;
  contact_name?: string;
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  contacts: Contact[];
}

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'follow_up' | 'meeting' | 'call' | 'email' | 'other';
  contact_id: string;
  contact_name: string;
}

// Mock contacts for demo
const contacts: Contact[] = [
  { id: '1', name: 'Sarah Chen', company: 'TechCorp', title: 'VP Engineering' },
  { id: '2', name: 'Michael Roberts', company: 'InnovateLabs', title: 'Head of Product' },
  { id: '3', name: 'Dr. Lisa Wang', company: 'AI Solutions Inc', title: 'Chief Data Officer' }
];

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [taskData, setTaskData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    contact_id: '',
    contact_name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = generateId('task-modal-title');
  const descId = generateId('task-modal-desc');

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        contact_id: task.contact_id || '',
        contact_name: task.contact_name || ''
      });
    } else {
      // Reset form
      setTaskData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        contact_id: '',
        contact_name: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!taskData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const taskDataToSend: Partial<Task> = {
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date,
      priority: taskData.priority,
      contact_id: taskData.contact_id,
      contact_name: taskData.contact_name
    };

    setIsSaving(true);
    onSave(taskDataToSend);
    onClose();
    setIsSaving(false);
  };

  if (!isOpen) return null;

  const formatDate = (date?: string) => {
    if (!date) return 'Select date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getPriorityColor = (p: string) => {
    const colors = {
      low: 'bg-blue-500/10 text-blue-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      high: 'bg-orange-500/10 text-orange-500',
      urgent: 'bg-red-500/10 text-red-500'
    };
    return colors[p as keyof typeof colors] || colors.medium;
  };

  const getTypeLabel = (t: string) => {
    const labels = {
      follow_up: 'Follow Up',
      meeting: 'Meeting',
      call: 'Call',
      email: 'Email',
      other: 'Other'
    };
    return labels[t as keyof typeof labels] || 'Follow Up';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="glass-card rounded-xl max-w-2xl w-full sm:w-[95%] md:w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 id={titleId}>{task ? 'Edit Task' : 'Create New Task'}</h2>
            <p id={descId} className="sr-only">
              {task ? 'Dialog to edit task details' : 'Dialog to create a new task'}
            </p>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => {
                setTaskData({ ...taskData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g., Follow up with Michael Roberts"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.title ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Add any additional details about this task..."
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm mb-2">Due Date</label>
            <Popover open={isContactDropdownOpen} onOpenChange={setIsContactDropdownOpen}>
              <PopoverTrigger asChild>
                <button className="w-full px-4 py-2 bg-background border border-border rounded-lg flex items-center gap-2 hover:bg-accent transition-colors text-left">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className={taskData.due_date ? '' : 'text-muted-foreground'}>
                    {formatDate(taskData.due_date)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={taskData.due_date ? new Date(taskData.due_date) : undefined}
                  onSelect={(date) => {
                    setTaskData({ ...taskData, due_date: date ? date.toISOString() : '' });
                    setIsContactDropdownOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm mb-2">Priority</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm mb-2">Type</label>
              <select
                value={taskData.type}
                onChange={(e) => setTaskData({ ...taskData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="follow_up">Follow Up</option>
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Selector */}
          <div>
            <label className="block text-sm mb-2">Linked Contact (Optional)</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={taskData.contact_name || contactSearchQuery}
                  onChange={(e) => {
                    setContactSearchQuery(e.target.value);
                    setTaskData({ ...taskData, contact_id: '', contact_name: '' });
                    setIsContactDropdownOpen(true);
                  }}
                  onFocus={() => setIsContactDropdownOpen(true)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* Contact Dropdown */}
              {isContactDropdownOpen && !taskData.contact_name && (
                <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          setTaskData({ ...taskData, contact_id: contact.id, contact_name: contact.name });
                          setContactSearchQuery('');
                          setIsContactDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-accent transition-colors text-left border-b border-border last:border-0"
                      >
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.title} at {contact.company}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No contacts found
                    </div>
                  )}
                </div>
              )}

              {/* Selected Contact Display */}
              {taskData.contact_name && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{taskData.contact_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {contacts.find(c => c.id === taskData.contact_id)?.title} at {contacts.find(c => c.id === taskData.contact_id)?.company}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTaskData({ ...taskData, contact_id: '', contact_name: '' });
                      setContactSearchQuery('');
                    }}
                    className="p-1 hover:bg-accent rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm mb-3">Preview</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(taskData.priority)}`}>
                  {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)}
                </span>
                <span className="px-2 py-0.5 bg-muted rounded text-xs">
                  {getTypeLabel(taskData.type)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Due:</span>{' '}
                {formatDate(taskData.due_date)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 hover:bg-accent rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}