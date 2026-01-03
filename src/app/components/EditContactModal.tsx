import { X, User, Mail, Briefcase, MapPin, Hash, Tag, Plus, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Contact, ProspectStage } from '../types/contact';
import { trapFocus, generateId } from '../utils/accessibility';

type ProspectStage = 
  | 'conversation_started'
  | 'qualification'
  | 'proposal_sent'
  | 'signed_mandate'
  | 'lost'
  | 'cold';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  contact: Contact;
  availableTags: string[];
}

// Mock available tags
const availableTags = [
  'High Priority',
  'Decision Maker',
  'Technical',
  'Follow Up',
  'Hot Lead',
  'Budget Holder',
  'Executive',
  'Responsive',
  'Interested',
  'Proposal Requested'
];

export function EditContactModal({ contact, isOpen, onClose, onSave }: EditContactModalProps) {
  const [formData, setFormData] = useState(contact);
  const [selectedTags, setSelectedTags] = useState<string[]>(contact.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = generateId('edit-contact-modal-title');
  const descId = generateId('edit-contact-modal-desc');

  useEffect(() => {
    setFormData(contact);
    setSelectedTags(contact.tags || []);
  }, [contact]);

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedContact: Contact = {
      ...contact,
      ...formData,
      tags: selectedTags,
    };

    onSave(updatedContact);
    onClose();
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  if (!isOpen) return null;

  const getStageLabel = (s: ProspectStage) => {
    const labels = {
      conversation_started: 'Conversation Started',
      qualification: 'Qualification',
      proposal_sent: 'Proposal Sent',
      signed_mandate: 'Signed Mandate',
      lost: 'Lost',
      cold: 'Cold'
    };
    return labels[s];
  };

  const getStageBadge = (s: ProspectStage) => {
    const badges = {
      conversation_started: { color: 'bg-blue-500/10 text-blue-500', label: 'Conversation Started' },
      qualification: { color: 'bg-purple-500/10 text-purple-500', label: 'Qualification' },
      proposal_sent: { color: 'bg-orange-500/10 text-orange-500', label: 'Proposal Sent' },
      signed_mandate: { color: 'bg-green-500/10 text-green-500', label: 'Signed Mandate' },
      lost: { color: 'bg-red-500/10 text-red-500', label: 'Lost' },
      cold: { color: 'bg-gray-500/10 text-gray-500', label: 'Cold' }
    };
    return badges[s];
  };

  const unselectedTags = availableTags.filter(tag => !selectedTags.includes(tag));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-xl max-w-3xl w-full sm:w-[95%] md:w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 id={titleId}>Edit Contact</h2>
            <p id={descId} className="sr-only">
              Dialog to edit contact information and details
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
          {/* Name and Email Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  !formData.name ? 'border-destructive' : 'border-border'
                }`}
              />
              {!formData.name && (
                <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  Name is required
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  !validateEmail(formData.email) ? 'border-destructive' : 'border-border'
                }`}
              />
              {!validateEmail(formData.email) && (
                <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  Please enter a valid email address
                </div>
              )}
            </div>
          </div>

          {/* Title and Company Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Phone and Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Stage Selector */}
          <div>
            <label className="block text-sm mb-2">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as ProspectStage })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="conversation_started">Conversation Started</option>
              <option value="qualification">Qualification</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="signed_mandate">Signed Mandate</option>
              <option value="lost">Lost</option>
              <option value="cold">Cold</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 rounded text-xs ${getStageBadge(formData.stage).color}`}>
                {getStageBadge(formData.stage).label}
              </span>
            </div>
          </div>

          {/* Tags Multi-Select */}
          <div>
            <label className="block text-sm mb-2">Tags</label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    handleAddTag(tagInput.trim());
                  }
                }}
                placeholder="Add or search tags..."
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />

              {/* Tag Dropdown */}
              {showTagDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {tagInput.trim() && !availableTags.includes(tagInput.trim()) && (
                    <button
                      onClick={() => handleAddTag(tagInput.trim())}
                      className="w-full px-4 py-2 hover:bg-accent transition-colors text-left flex items-center gap-2 border-b border-border"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create "{tagInput.trim()}"</span>
                    </button>
                  )}
                  {unselectedTags
                    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-4 py-2 hover:bg-accent transition-colors text-left"
                      >
                        {tag}
                      </button>
                    ))}
                  {unselectedTags.filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase())).length === 0 && !tagInput.trim() && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      All tags selected
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this contact..."
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
            />
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}