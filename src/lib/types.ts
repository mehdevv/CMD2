export type Role = 'admin' | 'owner' | 'agent';
export type Channel = 'whatsapp' | 'instagram' | 'facebook';
export type Stage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
export type AIStatus = 'active' | 'paused' | 'completed' | 'escalated';
export type TemplateStatus = 'approved' | 'pending' | 'rejected';
export type UserStatus = 'active' | 'inactive' | 'invited';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastActive: string;
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  channel: Channel;
  stage: Stage;
  aiStatus: AIStatus;
  assignedTo: string;
  lastContact: string;
  dealValue?: number;
  source?: string;
  notes?: string;
  closeDate?: string;
  tags?: string[];
}

export interface Message {
  id: string;
  sender: 'ai' | 'agent' | 'contact';
  senderName: string;
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  channel: Channel;
  aiStatus: AIStatus;
  assignedTo: string;
  messages: Message[];
  lastMessage: string;
  lastTime: string;
}

export interface Template {
  id: string;
  name: string;
  channel: Channel;
  body: string;
  status: TemplateStatus;
  usedIn: number;
}

export interface MeetingBrief {
  id: string;
  leadId: string;
  leadName: string;
  dealStage: Stage;
  dealValue: number;
  meetingTime: string;
  historyContext: string;
  openDeals: string;
  riskFlags: string[];
  talkingPoints: string[];
}

export interface MeetingNote {
  id: string;
  leadId: string;
  leadName: string;
  summary: string;
  objections: string[];
  opportunities: string[];
  nextSteps: string[];
  createdAt: string;
}

export interface IntelligenceItem {
  id: string;
  type: 'objection' | 'opportunity' | 'risk';
  headline: string;
  detail: string;
  frequency?: number;
}

export interface Rule {
  id: string;
  condition: string;
  value: string;
  action: string;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface FollowUpStep {
  id: string;
  delay: string;
  message: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

export interface AgentMetrics {
  name: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
}
