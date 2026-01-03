import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useOrganizationContext } from '../contexts/OrganizationContext';
import { 
  MessageSquare, 
  ArrowRight, 
  Phone, 
  Calendar, 
  FileText, 
  Mail,
  Clock,
  User
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  user_id?: string;
}

interface ActivityTimelineProps {
  prospectId: string;
  onActivityAdded?: () => void;
}

const activityIcons: Record<string, React.ReactNode> = {
  stage_change: <ArrowRight className="w-4 h-4" />,
  note_added: <FileText className="w-4 h-4" />,
  message_sent: <Mail className="w-4 h-4" />,
  reply_received: <MessageSquare className="w-4 h-4" />,
  call_logged: <Phone className="w-4 h-4" />,
  meeting_scheduled: <Calendar className="w-4 h-4" />,
  deal_updated: <span className="text-sm">💰</span>,
  field_updated: <FileText className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  stage_change: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  note_added: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  message_sent: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  reply_received: 'bg-green-500/20 text-green-400 border-green-500/30',
  call_logged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  meeting_scheduled: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  deal_updated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  field_updated: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function ActivityTimeline({ prospectId, onActivityAdded }: ActivityTimelineProps) {
  const { getToken } = useAuth();
  const { currentOrg } = useOrganizationContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (currentOrg?.id) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [prospectId, currentOrg?.id]);

  const loadActivities = async () => {
    if (!currentOrg?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/activities/${prospectId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token || '',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !currentOrg?.id) return;
    
    setAddingNote(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prospectId,
            activityType: 'note_added',
            title: 'Note added',
            description: newNote,
          })
        }
      );
      
      if (response.ok) {
        setNewNote('');
        loadActivities();
        onActivityAdded?.();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={addNote}
          disabled={addingNote || !newNote.trim()}
          className="px-4 py-2 bg-cyan-500 text-black rounded-lg text-sm font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {addingNote ? '...' : 'Add'}
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-white/40 text-sm pl-10">No activity yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-3 pl-1">
                {/* Icon */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border ${activityColors[activity.activity_type] || activityColors.note_added}`}>
                  {activityIcons[activity.activity_type] || <FileText className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{activity.title}</span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.created_at)}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-white/60 text-sm mt-1">{activity.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityTimeline;