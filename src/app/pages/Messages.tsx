import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useOrganizationContext as useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import {
  MessageSquare,
  Hash,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Search,
  Plus,
  Users,
  Lock,
  MessageCircle,
  Pin,
  AtSign,
  Bold,
  Italic,
  Code,
  List,
  Trash2,
  Edit2,
  Reply,
  ChevronRight,
  ChevronDown,
  X,
  Bell,
  BellOff,
  LogOut,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { ParticleBackground } from '../components/ParticleBackground';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'channel' | 'dm';
  isPrivate: boolean;
  unreadCount?: number;
  participants?: { id: string; name: string }[];
}

interface Message {
  id: string;
  channelId: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  reactions: { emoji: string; users: string[]; count: number }[];
  threadCount?: number;
  parentMessageId?: string | null;
  mentions: string[];
  attachments: any[];
  isPinned?: boolean;
}

const EMOJI_PICKER = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '🔥', '✅'];

export function Messages() {
  const location = useLocation();
  const { currentOrg, members } = useOrganization();
  const { user, getToken } = useAuth();
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [selectedThreadMessage, setSelectedThreadMessage] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [showChannelList, setShowChannelList] = useState(true);
  const [showDMList, setShowDMList] = useState(true);
  const [showComposerEmojiPicker, setShowComposerEmojiPicker] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [channelMuted, setChannelMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const previousMessagesRef = useRef<string>('');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const composerEmojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  // Close all panels when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      setShowMembersPanel(false);
      setShowPinnedMessages(false);
      setShowMoreOptions(false);
      setShowThreadPanel(false);
      setShowNewChannelModal(false);
      setShowEmojiPicker(null);
      setShowComposerEmojiPicker(false);
      setShowMentionDropdown(false);
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null);
      }
      if (composerEmojiPickerRef.current && !composerEmojiPickerRef.current.contains(event.target as Node)) {
        setShowComposerEmojiPicker(false);
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load channels
  useEffect(() => {
    const loadChannels = async () => {
      if (!currentOrg?.id) return;
      
      setLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/channels/${currentOrg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'x-clerk-token': token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setChannels(data.channels || []);
          
          // Auto-select #general channel
          const generalChannel = data.channels?.find((ch: Channel) => ch.name === 'general');
          if (generalChannel) {
            setSelectedChannel(generalChannel);
            // Load messages immediately for general channel to avoid sequential loading
            loadMessagesForChannel(generalChannel.id);
          }
        }
      } catch (err) {
        console.error('Error loading channels:', err);
        toast.error('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, [currentOrg?.id]);

  // Helper function to load messages for a specific channel
  const loadMessagesForChannel = async (channelId: string) => {
    if (!currentOrg?.id) return;
    
    try {
      setLoadingMessages(true);
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        const newMessagesString = JSON.stringify(newMessages);
        
        // Only update if messages actually changed
        if (newMessagesString !== previousMessagesRef.current) {
          previousMessagesRef.current = newMessagesString;
          setMessages(newMessages);
          
          // Auto-scroll to bottom
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load messages for selected channel
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentOrg?.id || !selectedChannel?.id) return;
      
      try {
        const token = await getToken();
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${selectedChannel.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'x-clerk-token': token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const newMessages = data.messages || [];
          const newMessagesString = JSON.stringify(newMessages);
          
          // Only update if messages actually changed
          if (newMessagesString !== previousMessagesRef.current) {
            previousMessagesRef.current = newMessagesString;
            setMessages(newMessages);
            
            // Auto-scroll to bottom on initial load or new messages
            if (messagesEndRef.current) {
              const container = messagesEndRef.current.parentElement;
              const isNearBottom = container && 
                (container.scrollHeight - container.scrollTop - container.clientHeight < 100);
              
              if (isNearBottom || newMessages.length === 1) {
                scrollToBottom();
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    // Only load if this is a channel change (not initial load)
    if (selectedChannel && messages.length === 0) {
      setLoadingMessages(true);
      loadMessages();
    }
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => {
      clearInterval(interval);
      previousMessagesRef.current = ''; // Reset on channel change
    };
  }, [currentOrg?.id, selectedChannel?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !user || !currentOrg) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${selectedChannel.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            mentions: extractMentions(content),
            parentMessageId: selectedThreadMessage?.id || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        scrollToBottom();
      } else {
        toast.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!currentOrg || !selectedChannel) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${selectedChannel.id}/${messageId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.map(m => m.id === messageId ? data.message : m));
        setEditingMessageId(null);
        setEditingContent('');
        toast.success('Message updated');
      }
    } catch (err) {
      console.error('Error editing message:', err);
      toast.error('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentOrg || !selectedChannel) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${selectedChannel.id}/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== messageId));
        toast.success('Message deleted');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentOrg || !selectedChannel || !user) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${selectedChannel.id}/${messageId}/reactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emoji, userId: user.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.map(m => m.id === messageId ? data.message : m));
        setShowEmojiPicker(null);
      }
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const openThread = async (message: Message) => {
    setSelectedThreadMessage(message);
    setShowThreadPanel(true);

    if (!currentOrg) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/messages/${currentOrg.id}/${message.channelId}/${message.id}/thread`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setThreadMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error loading thread:', err);
    }
  };

  const createChannel = async (name: string, description: string, isPrivate: boolean) => {
    if (!currentOrg || !user) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d5eb2a5/channels/${currentOrg.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-clerk-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description, isPrivate, createdBy: user.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChannels([...channels, data.channel]);
        setShowNewChannelModal(false);
        toast.success(`Channel #${name} created!`);
      }
    } catch (err) {
      console.error('Error creating channel:', err);
      toast.error('Failed to create channel');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Text formatting functions
  const insertFormatting = (format: 'bold' | 'italic' | 'code') => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = messageInput.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '****';
        cursorOffset = selectedText ? selectedText.length + 4 : 2;
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '**';
        cursorOffset = selectedText ? selectedText.length + 2 : 1;
        break;
      case 'code':
        formattedText = selectedText ? `\`${selectedText}\`` : '``';
        cursorOffset = selectedText ? selectedText.length + 2 : 1;
        break;
    }
    
    const newText = messageInput.substring(0, start) + formattedText + messageInput.substring(end);
    setMessageInput(newText);
    
    // Set cursor position after formatting markers
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + cursorOffset : start + (cursorOffset);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    console.log(`Applied ${format} formatting`);
  };

  const insertMention = () => {
    setShowMentionDropdown(!showMentionDropdown);
    console.log('Mention dropdown toggled');
  };

  const insertMentionName = (name: string) => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const mention = `@${name} `;
    const newText = messageInput.substring(0, start) + mention + messageInput.substring(start);
    setMessageInput(newText);
    setShowMentionDropdown(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + mention.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = messageInput.substring(0, start) + emoji + messageInput.substring(start);
    setMessageInput(newText);
    setShowComposerEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    console.log('Inserted emoji:', emoji);
  };

  const handleFileUpload = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        console.log('Files selected:', Array.from(files).map(f => f.name));
        toast.success(`${files.length} file(s) selected (upload feature coming soon)`);
      }
    };
    
    input.click();
  };

  const togglePinMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const newPinnedState = !message.isPinned;
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, isPinned: newPinnedState } : m
    ));
    
    toast.success(newPinnedState ? 'Message pinned!' : 'Message unpinned');
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  const channelChannels = channels.filter(ch => ch.type === 'channel');
  const dmChannels = channels.filter(ch => ch.type === 'dm');

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Channels & DMs */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col max-h-screen">
        {/* Organization Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold mb-1">{currentOrg?.name}</h2>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>

        {/* Search */}
        <div className="p-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Channels Section */}
          <div className="px-2">
            <div className="w-full flex items-center justify-between px-2 py-1 hover:bg-muted/50 rounded transition-colors">
              <button
                onClick={() => setShowChannelList(!showChannelList)}
                className="flex items-center gap-1 flex-1"
              >
                {showChannelList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-sm font-medium">Channels</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewChannelModal(true);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showChannelList && (
              <div className="mt-1">
                {channelChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm ${
                      selectedChannel?.id === channel.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {channel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                    <span className="flex-1 text-left truncate">{channel.name}</span>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-medium">
                        {channel.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="px-2 mt-4">
            <div className="w-full flex items-center justify-between px-2 py-1 hover:bg-muted/50 rounded transition-colors">
              <button
                onClick={() => setShowDMList(!showDMList)}
                className="flex items-center gap-1 flex-1"
              >
                {showDMList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-sm font-medium">Direct Messages</span>
              </button>
              <button
                className="p-0.5 hover:bg-muted rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showDMList && (
              <div className="mt-1">
                {dmChannels.map((dm) => (
                  <button
                    key={dm.id}
                    onClick={() => setSelectedChannel(dm)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm ${
                      selectedChannel?.id === dm.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="flex-1 text-left truncate">
                      {dm.participants?.map(p => p.name).join(', ')}
                    </span>
                    {dm.unreadCount && dm.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-medium">
                        {dm.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen">
        {/* Channel Header */}
        {selectedChannel && (
          <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-background flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {selectedChannel.type === 'channel' ? (
                selectedChannel.isPrivate ? <Lock className="w-5 h-5 flex-shrink-0" /> : <Hash className="w-5 h-5 flex-shrink-0" />
              ) : (
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{selectedChannel.name}</h3>
                {selectedChannel.description && (
                  <p className="text-xs text-muted-foreground truncate">{selectedChannel.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMembersPanel(!showMembersPanel);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="View members"
                aria-label="View members"
              >
                <Users className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPinnedMessages(!showPinnedMessages);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Pinned messages"
                aria-label="Pinned messages"
              >
                <Pin className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreOptions(!showMoreOptions);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {/* More Options Dropdown */}
                {showMoreOptions && (
                  <div
                    ref={moreOptionsRef}
                    className="absolute right-0 top-10 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col max-h-40 overflow-y-auto min-w-[200px]"
                  >
                    <button
                      onClick={() => {
                        setChannelMuted(!channelMuted);
                        setShowMoreOptions(false);
                        toast.success(channelMuted ? 'Channel unmuted' : 'Channel muted');
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm hover:bg-muted/50 text-left"
                      type="button"
                    >
                      {channelMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      <span className="font-medium">{channelMuted ? 'Unmute channel' : 'Mute channel'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreOptions(false);
                        toast.info('Leave channel feature coming soon');
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm hover:bg-muted/50 text-left"
                      type="button"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Leave channel</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreOptions(false);
                        toast.info('Channel settings coming soon');
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm hover:bg-muted/50 text-left"
                      type="button"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Channel settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreOptions(false);
                        toast.info('Notification settings coming soon');
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm hover:bg-muted/50 text-left"
                      type="button"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="font-medium">Notification settings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 relative">
          {/* Particle background only in chat area */}
          <ParticleBackground />
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to send a message in #{selectedChannel?.name}
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.userId === user?.id;
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

              return (
                <div
                  key={message.id}
                  className={`group flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}
                >
                  {showAvatar ? (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-foreground">
                        {message.userName.charAt(0)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-muted-foreground italic">(edited)</span>
                        )}
                      </div>
                    )}

                    {editingMessageId === message.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              editMessage(message.id, editingContent);
                            }
                          }}
                        />
                        <button
                          onClick={() => editMessage(message.id, editingContent)}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditingContent('');
                          }}
                          className="px-3 py-2 bg-muted rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm break-words">{message.content}</p>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                                  reaction.users.includes(user?.id || '')
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-muted border-border hover:border-primary/50'
                                } transition-colors`}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Thread indicator */}
                        {(message.threadCount ?? 0) > 0 && (
                          <button
                            onClick={() => openThread(message)}
                            className="flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
                          >
                            <Reply className="w-3 h-3" />
                            {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className="flex items-start gap-1 transition-opacity flex-shrink-0 group-hover:opacity-100" style={{ opacity: 0.01 }}>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Emoji button clicked for message:', message.id);
                          setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id);
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                        type="button"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Smile className="w-4 h-4 pointer-events-none" />
                      </button>
                      {showEmojiPicker === message.id && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute right-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {EMOJI_PICKER.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Adding reaction:', emoji, 'to message:', message.id);
                                addReaction(message.id, emoji);
                              }}
                              className="text-lg hover:scale-125 transition-transform cursor-pointer"
                              type="button"
                              style={{ pointerEvents: 'auto' }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Thread button clicked for message:', message.id);
                        openThread(message);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                      type="button"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Reply className="w-4 h-4 pointer-events-none" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePinMessage(message.id);
                      }}
                      className={`p-1 hover:bg-muted rounded transition-colors cursor-pointer ${message.isPinned ? 'text-primary' : ''}`}
                      type="button"
                      style={{ pointerEvents: 'auto' }}
                      title={message.isPinned ? 'Unpin message' : 'Pin message'}
                    >
                      <Pin className="w-4 h-4 pointer-events-none" />
                    </button>
                    {isOwnMessage && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Edit button clicked for message:', message.id);
                            setEditingMessageId(message.id);
                            setEditingContent(message.content);
                          }}
                          className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Edit2 className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Delete button clicked for message:', message.id);
                            if (confirm('Delete this message?')) {
                              deleteMessage(message.id);
                            }
                          }}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors text-destructive cursor-pointer"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {selectedChannel && (
          <div className="p-4 border-t border-border bg-background flex-shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button 
                    className="p-1.5 hover:bg-muted rounded transition-colors" 
                    onClick={() => insertFormatting('bold')}
                    type="button"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-muted rounded transition-colors" 
                    onClick={() => insertFormatting('italic')}
                    type="button"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-muted rounded transition-colors" 
                    onClick={() => insertFormatting('code')}
                    type="button"
                    title="Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button 
                      className="p-1.5 hover:bg-muted rounded transition-colors" 
                      onClick={insertMention}
                      type="button"
                      title="Mention team member"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>
                    {/* Mention Dropdown */}
                    {showMentionDropdown && (
                      <div
                        ref={mentionDropdownRef}
                        className="absolute right-0 bottom-10 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col max-h-40 overflow-y-auto min-w-[200px]"
                      >
                        {members.map(member => (
                          <button
                            key={member.id}
                            onClick={() => insertMentionName(member.name)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm hover:bg-muted/50 text-left"
                            type="button"
                          >
                            <AtSign className="w-4 h-4" />
                            <span className="font-medium">{member.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button 
                      className="p-1.5 hover:bg-muted rounded transition-colors" 
                      onClick={() => setShowComposerEmojiPicker(!showComposerEmojiPicker)}
                      type="button"
                      title="Insert emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {/* Composer Emoji Picker */}
                    {showComposerEmojiPicker && (
                      <div
                        ref={composerEmojiPickerRef}
                        className="absolute right-0 bottom-10 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex gap-1"
                      >
                        {EMOJI_PICKER.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Inserting emoji:', emoji);
                              insertEmoji(emoji);
                            }}
                            className="text-lg hover:scale-125 transition-transform cursor-pointer"
                            type="button"
                            style={{ pointerEvents: 'auto' }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    className="p-1.5 hover:bg-muted rounded transition-colors" 
                    onClick={handleFileUpload}
                    type="button"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        )}
      </div>

      {/* Thread Panel */}
      {showThreadPanel && selectedThreadMessage && (
        <div className="w-96 border-l border-border bg-background flex flex-col max-h-screen">
          <div className="h-14 border-b border-border px-4 flex items-center justify-between flex-shrink-0">
            <h3 className="font-semibold">Thread</h3>
            <button
              onClick={() => {
                setShowThreadPanel(false);
                setSelectedThreadMessage(null);
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Original Message */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary-foreground">
                  {selectedThreadMessage.userName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold truncate">{selectedThreadMessage.userName}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimestamp(selectedThreadMessage.timestamp)}
                  </span>
                </div>
                <p className="text-sm break-words">{selectedThreadMessage.content}</p>
              </div>
            </div>
          </div>

          {/* Thread Replies */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
            {threadMessages.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary-foreground">
                    {reply.userName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{reply.userName}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimestamp(reply.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm break-words">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thread Reply Input */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex items-end gap-2">
              <input
                type="text"
                placeholder="Reply to thread..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    // Send thread reply
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create Channel</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createChannel(
                  formData.get('name') as string,
                  formData.get('description') as string,
                  formData.get('isPrivate') === 'on'
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Channel Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="e.g., marketing-team"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none"
                    rows={2}
                    placeholder="What's this channel about?"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    id="isPrivate"
                    className="rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm">
                    Make private (only visible to invited members)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="flex-1 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Panel */}
      {showMembersPanel && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end justify-end z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowMembersPanel(false); }}>
          <div className="w-80 h-full bg-background border-l border-border flex flex-col">
            <div className="h-14 border-b border-border px-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold">Members ({members.length})</h3>
              <button
                onClick={() => setShowMembersPanel(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-foreground">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Online" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pinned Messages Panel */}
      {showPinnedMessages && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end justify-end z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowPinnedMessages(false); }}>
          <div className="w-80 h-full bg-background border-l border-border flex flex-col">
            <div className="h-14 border-b border-border px-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold">Pinned Messages ({pinnedMessages.length})</h3>
              <button
                onClick={() => setShowPinnedMessages(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pinnedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Pin className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pinned messages</h3>
                  <p className="text-sm text-muted-foreground">
                    Pin important messages to find them easily later
                  </p>
                </div>
              ) : (
                pinnedMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary-foreground">
                          {message.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold truncate">{message.userName}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <button
                        onClick={() => togglePinMessage(message.id)}
                        className="p-1 hover:bg-muted rounded transition-colors text-primary"
                        title="Unpin message"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}