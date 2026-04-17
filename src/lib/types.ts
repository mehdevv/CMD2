export type Role = 'admin' | 'owner' | 'agent';
export type Channel = 'whatsapp' | 'instagram' | 'facebook';
export type Stage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
export type AIStatus = 'active' | 'paused' | 'completed' | 'escalated';
export type TemplateStatus = 'approved' | 'pending' | 'rejected';
export type UserStatus = 'active' | 'inactive' | 'invited';

export type LeadQualificationScore = 'cold' | 'warm' | 'hot';
export type CompanySize = 'solo' | '2-10' | '11-50' | '51-200' | '200+';

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
  email?: string;
  whatsapp?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  website?: string;
  linkedin?: string;
  company?: string;
  companyRole?: string;
  companySize?: CompanySize;
  industry?: string;
  location?: { country?: string; city?: string };
  budgetRange?: string;
  timeline?: string;
  painPoints?: string[];
  qualificationScore?: LeadQualificationScore;
  createdAt?: string;
  enrichedAt?: string;
  convertedOpportunityId?: string;
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
  opportunityId?: string;
  opportunityName?: string;
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
  opportunityId?: string;
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

/** Post-qualification pipeline (separate from Lead.stage). */
export type OpportunityStage =
  | 'qualification'
  | 'need_analysis'
  | 'proposal'
  | 'negotiation'
  | 'closing'
  | 'won'
  | 'lost';

export type OpportunityOutcome = 'won' | 'lost' | 'open';

export type LossReason =
  | 'price'
  | 'competitor'
  | 'no_budget'
  | 'no_decision'
  | 'timing'
  | 'not_a_fit'
  | 'other';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface StageTransition {
  from: OpportunityStage;
  to: OpportunityStage;
  at: string;
  by: string;
  note?: string;
}

export interface ProposalLineItem {
  name: string;
  qty: number;
  unitPrice: number;
  discountPct?: number;
}

export interface Proposal {
  id: string;
  version: number;
  title: string;
  value: number;
  currency: 'DZD';
  validUntil?: string;
  fileUrl?: string;
  linkUrl?: string;
  lineItems?: ProposalLineItem[];
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'superseded';
  sentAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'other';
  reference?: string;
  receivedAt?: string;
  status: PaymentStatus;
  note?: string;
  dueDate?: string;
}

export interface QualificationAnswers {
  budget?: string;
  authority?: string;
  need?: string;
  timeline?: string;
  competingSolutions?: string[];
  riskFlags?: string[];
}

export interface NeedAnalysis {
  summary: string;
  goals: string[];
  metricsToMove: string[];
  decisionCriteria: string[];
  stakeholders: Array<{ name: string; role: string }>;
  proposedSolution?: string;
}

export interface Opportunity {
  id: string;
  leadId: string;
  name: string;
  company?: string;
  contactName: string;
  channel: Channel;
  ownerId: string;
  ownerName?: string;
  stage: OpportunityStage;
  outcome: OpportunityOutcome;
  value: number;
  currency: 'DZD';
  expectedCloseDate?: string;
  probability?: number;
  qualification?: QualificationAnswers;
  needAnalysis?: NeedAnalysis;
  proposals: Proposal[];
  payments: Payment[];
  paymentStatus: PaymentStatus;
  lossReason?: LossReason;
  lossDetail?: string;
  wonDetail?: string;
  createdAt: string;
  updatedAt: string;
  stageEnteredAt: string;
  stageHistory: StageTransition[];
  nextStepAt?: string;
  nextStepText?: string;
  tags?: string[];
  objectionLog?: Array<{ at: string; note: string; valueDelta?: number }>;
  contractUrl?: string;
  onboardingOwnerId?: string;
  onboardingDate?: string;
  onboardingNotes?: string;
}

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  channel?: Channel | 'all';
  ownerId?: string | 'all';
  source?: string | 'all';
}

export type ReportSectionKind =
  | 'kpi-row'
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'funnel-chart'
  | 'table'
  | 'text'
  | 'bullet-list';

export interface ReportSection {
  id: string;
  kind: ReportSectionKind;
  title: string;
  description?: string;
  payload: unknown;
}

export interface AnalyticsReport {
  id: string;
  question: string;
  createdAt: string;
  createdBy: string;
  filters: AnalyticsFilters;
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  status: 'draft' | 'ready' | 'error';
  source: 'mock' | 'llm';
  shareUrl?: string;
}

export interface FunnelStep {
  key: string;
  label: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface BreakdownRow {
  key: string;
  label: string;
  count: number;
  value?: number;
}
