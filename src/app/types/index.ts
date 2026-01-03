export interface Run {
  id: string;
  jobTitle: string;
  company: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  prospectsFound: number;
  campaignStatus: 'paused' | 'live' | 'draft';
  campaignId?: string;
  error?: string;
}

export interface Prospect {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  relevanceScore: number;
}

export interface MessageDraft {
  type: 'connection' | 'follow-up-1' | 'follow-up-2';
  subject?: string;
  message: string;
}

export interface Integration {
  id: string;
  name: 'HeyReach' | 'Apollo';
  connected: boolean;
  workspace?: string;
  connectedAt?: string;
}
