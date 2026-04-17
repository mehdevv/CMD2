import {
  Lead,
  Conversation,
  Message,
  Template,
  MeetingBrief,
  MeetingNote,
  IntelligenceItem,
  User,
  Invoice,
  FollowUpStep,
  FAQEntry,
  AgentMetrics,
  Rule,
} from './types';
import { MOCK_OPPORTUNITIES_SEED, MOCK_LOSS_REASONS } from './mock-opportunities-seed';

export { MOCK_LOSS_REASONS, MOCK_OPPORTUNITIES_SEED };

export const MOCK_AGENTS: User[] = [
  { id: 'agent-1', name: 'Mehdi Kaci', email: 'agent@scale.dz', role: 'agent', status: 'active', lastActive: '2h ago' },
  { id: 'agent-2', name: 'Sara Boukhalfa', email: 'sara@scale.dz', role: 'agent', status: 'active', lastActive: '1h ago' },
  { id: 'agent-3', name: 'Nassim Rahmani', email: 'nassim@scale.dz', role: 'agent', status: 'active', lastActive: '30m ago' },
];

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Karim Admin', email: 'admin@scale.dz', role: 'admin', status: 'active', lastActive: '5m ago' },
  { id: 'user-2', name: 'Sara Owner', email: 'owner@scale.dz', role: 'owner', status: 'active', lastActive: '1h ago' },
  ...MOCK_AGENTS,
  { id: 'user-4', name: 'Amina Slimani', email: 'amina@scale.dz', role: 'agent', status: 'invited', lastActive: 'Never' },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'lead-1', name: 'Mohamed Benali', phone: '+213 555 123 456', channel: 'whatsapp', stage: 'new', aiStatus: 'active', assignedTo: 'Mehdi Kaci', lastContact: '2h ago', dealValue: 15000, source: 'WhatsApp Ad', notes: 'Interested in bulk order', tags: ['vip', 'bulk'], createdAt: '2026-04-14T09:00:00.000Z' },
  { id: 'lead-2', name: 'Amira Khelif', phone: '+213 555 234 567', channel: 'instagram', stage: 'qualified', aiStatus: 'completed', assignedTo: 'Sara Boukhalfa', lastContact: '5h ago', dealValue: 8500, source: 'Instagram Story', tags: ['repeat'], email: 'amira@khelif.dz', company: 'Khelif Boutique', createdAt: '2026-04-10T09:00:00.000Z', enrichedAt: '2026-04-11T09:00:00.000Z', qualificationScore: 'warm', convertedOpportunityId: 'opp-9' },
  {
    id: 'lead-3',
    name: 'Yacine Ouahab',
    phone: '+213 555 345 678',
    channel: 'facebook',
    stage: 'qualified',
    aiStatus: 'completed',
    assignedTo: 'Nassim Rahmani',
    lastContact: '1d ago',
    dealValue: 22000,
    source: 'Facebook Ad',
    tags: [],
    email: 'yacine@ouahab-retail.dz',
    company: 'Ouahab Retail',
    companyRole: 'Owner',
    companySize: '11-50',
    industry: 'Retail',
    location: { country: 'DZ', city: 'Algiers' },
    website: 'https://ouahab-retail.example',
    budgetRange: '40-80k DZD/mo',
    timeline: 'Next month',
    painPoints: ['Slow WhatsApp replies', 'No team visibility'],
    qualificationScore: 'hot',
    createdAt: '2026-03-12T09:00:00.000Z',
    enrichedAt: '2026-04-01T09:00:00.000Z',
    convertedOpportunityId: 'opp-1',
  },
  { id: 'lead-4', name: 'Fatima Zahra Aït', phone: '+213 555 456 789', channel: 'whatsapp', stage: 'proposal', aiStatus: 'completed', assignedTo: 'Mehdi Kaci', lastContact: '3d ago', dealValue: 45000, source: 'Referral', tags: ['enterprise'], email: 'fatima@ait-commerce.dz', company: 'Aït Commerce', enrichedAt: '2026-03-15T09:00:00.000Z', convertedOpportunityId: 'opp-4', createdAt: '2026-02-10T09:00:00.000Z' },
  { id: 'lead-5', name: 'Rachid Bensalem', phone: '+213 555 567 890', channel: 'instagram', stage: 'closed', aiStatus: 'completed', assignedTo: 'Sara Boukhalfa', lastContact: '5d ago', dealValue: 12000, source: 'Instagram Post', tags: ['closed-won'], convertedOpportunityId: 'opp-11', createdAt: '2026-01-20T09:00:00.000Z' },
  { id: 'lead-6', name: 'Nadia Hamdi', phone: '+213 555 678 901', channel: 'whatsapp', stage: 'new', aiStatus: 'active', assignedTo: 'Nassim Rahmani', lastContact: '1h ago', dealValue: 6000, source: 'WhatsApp', tags: [] },
  { id: 'lead-7', name: 'Sofiane Meziane', phone: '+213 555 789 012', channel: 'facebook', stage: 'contacted', aiStatus: 'escalated', assignedTo: 'Mehdi Kaci', lastContact: '3h ago', dealValue: 9500, source: 'Facebook Messenger', tags: ['urgent'] },
  {
    id: 'lead-8',
    name: 'Lynda Bouziane',
    phone: '+213 555 890 123',
    channel: 'instagram',
    stage: 'qualified',
    aiStatus: 'completed',
    assignedTo: 'Sara Boukhalfa',
    lastContact: '2d ago',
    dealValue: 18000,
    source: 'Instagram DM',
    tags: [],
    email: 'lynda@bouziane.dz',
    company: 'Bouziane Studio',
    companyRole: 'Creative director',
    companySize: '2-10',
    industry: 'Creative',
    qualificationScore: 'warm',
    createdAt: '2026-03-18T09:00:00.000Z',
    enrichedAt: '2026-04-02T09:00:00.000Z',
    convertedOpportunityId: 'opp-2',
  },
  { id: 'lead-9', name: 'Mourad Terki', phone: '+213 555 901 234', channel: 'whatsapp', stage: 'proposal', aiStatus: 'completed', assignedTo: 'Nassim Rahmani', lastContact: '1d ago', dealValue: 32000, source: 'WhatsApp', tags: ['enterprise'], convertedOpportunityId: 'opp-5', enrichedAt: '2026-04-01T09:00:00.000Z', createdAt: '2026-02-22T09:00:00.000Z' },
  { id: 'lead-10', name: 'Samira Guettouche', phone: '+213 555 012 345', channel: 'facebook', stage: 'new', aiStatus: 'active', assignedTo: 'Mehdi Kaci', lastContact: '30m ago', dealValue: 7500, source: 'Facebook Ad', tags: [] },
  { id: 'lead-11', name: 'Hocine Amarouche', phone: '+213 555 111 222', channel: 'whatsapp', stage: 'contacted', aiStatus: 'active', assignedTo: 'Sara Boukhalfa', lastContact: '6h ago', dealValue: 11000, source: 'WhatsApp Ad', tags: [] },
  { id: 'lead-12', name: 'Zineb Cherif', phone: '+213 555 222 333', channel: 'instagram', stage: 'new', aiStatus: 'active', assignedTo: 'Nassim Rahmani', lastContact: '45m ago', dealValue: 4500, source: 'Instagram Story', tags: [] },
  { id: 'lead-13', name: 'Kamel Boudoukha', phone: '+213 555 333 444', channel: 'facebook', stage: 'closed', aiStatus: 'completed', assignedTo: 'Mehdi Kaci', lastContact: '7d ago', dealValue: 28000, source: 'Facebook Messenger', tags: ['closed-won'] },
  {
    id: 'lead-14',
    name: 'Asma Merzouk',
    phone: '+213 555 444 555',
    channel: 'whatsapp',
    stage: 'qualified',
    aiStatus: 'completed',
    assignedTo: 'Sara Boukhalfa',
    lastContact: '4h ago',
    dealValue: 16500,
    source: 'WhatsApp',
    tags: [],
    email: 'asma@merzouk-logistics.dz',
    company: 'Merzouk Logistics',
    companySize: '51-200',
    industry: 'Logistics',
    qualificationScore: 'hot',
    createdAt: '2026-03-20T09:00:00.000Z',
    enrichedAt: '2026-04-03T09:00:00.000Z',
    convertedOpportunityId: 'opp-3',
  },
  { id: 'lead-15', name: 'Bilal Hadjadj', phone: '+213 555 555 666', channel: 'instagram', stage: 'proposal', aiStatus: 'completed', assignedTo: 'Nassim Rahmani', lastContact: '2h ago', dealValue: 38000, source: 'Instagram DM', tags: ['vip'], convertedOpportunityId: 'opp-6', enrichedAt: '2026-03-20T09:00:00.000Z', createdAt: '2026-01-05T09:00:00.000Z' },
  { id: 'lead-16', name: 'Karima Boufeldja', phone: '+213 555 666 777', channel: 'facebook', stage: 'contacted', aiStatus: 'paused', assignedTo: 'Mehdi Kaci', lastContact: '1d ago', dealValue: 9000, source: 'Facebook Ad', tags: [] },
  { id: 'lead-17', name: 'Abderrahmane Oukil', phone: '+213 555 777 888', channel: 'whatsapp', stage: 'new', aiStatus: 'active', assignedTo: 'Sara Boukhalfa', lastContact: '15m ago', dealValue: 5000, source: 'WhatsApp Ad', tags: [], createdAt: '2026-04-16T09:00:00.000Z' },
  { id: 'lead-18', name: 'Dalila Benmeziani', phone: '+213 555 888 999', channel: 'instagram', stage: 'qualified', aiStatus: 'completed', assignedTo: 'Nassim Rahmani', lastContact: '8h ago', dealValue: 21000, source: 'Instagram Post', tags: ['urgent'], convertedOpportunityId: 'opp-10', enrichedAt: '2026-04-04T09:00:00.000Z', createdAt: '2026-03-08T09:00:00.000Z' },
  { id: 'lead-19', name: 'Tarek Lazreg', phone: '+213 555 999 000', channel: 'facebook', stage: 'proposal', aiStatus: 'completed', assignedTo: 'Mehdi Kaci', lastContact: '3h ago', dealValue: 41000, source: 'Facebook Messenger', tags: ['enterprise'], convertedOpportunityId: 'opp-7', enrichedAt: '2026-03-10T09:00:00.000Z', createdAt: '2026-02-01T09:00:00.000Z' },
  { id: 'lead-20', name: 'Imene Guerfi', phone: '+213 555 100 200', channel: 'whatsapp', stage: 'closed', aiStatus: 'completed', assignedTo: 'Sara Boukhalfa', lastContact: '14d ago', dealValue: 33000, source: 'WhatsApp', tags: ['closed-won'], convertedOpportunityId: 'opp-12', createdAt: '2026-03-05T09:00:00.000Z' },
];

export const MOCK_CONVERSATIONS: Conversation[] = MOCK_LEADS.slice(0, 15).map((lead, i) => ({
  id: `conv-${lead.id}`,
  leadId: lead.id,
  leadName: lead.name,
  channel: lead.channel,
  aiStatus: lead.aiStatus,
  assignedTo: lead.assignedTo,
  lastMessage: i % 3 === 0 ? "Merci pour votre message, je reviens vers vous très vite." : i % 3 === 1 ? "Je suis intéressé par votre offre, pouvez-vous m'envoyer plus de détails ?" : "Bonjour, quand est-ce que je peux recevoir ma commande ?",
  lastTime: lead.lastContact,
  messages: generateMessages(lead.name, i),
}));

function generateMessages(contactName: string, seed: number): Message[] {
  const msgs: Message[] = [
    { id: `m-${seed}-1`, sender: 'contact', senderName: contactName, content: "Bonjour, je voudrais en savoir plus sur vos produits.", timestamp: "10:02 AM" },
    { id: `m-${seed}-2`, sender: 'ai', senderName: 'Client Chat', content: `Bonjour ${contactName.split(' ')[0]} ! Merci pour votre intérêt. Je suis là pour répondre à toutes vos questions. Qu'est-ce qui vous intéresse en particulier ?`, timestamp: "10:02 AM", status: 'read' },
    { id: `m-${seed}-3`, sender: 'contact', senderName: contactName, content: "Je cherche une solution pour gérer mes commandes et mes clients.", timestamp: "10:15 AM" },
    { id: `m-${seed}-4`, sender: 'ai', senderName: 'Client Chat', content: "Excellent choix ! Notre plateforme Scale automatise le suivi des leads et la communication avec vos clients sur WhatsApp, Instagram et Facebook. Souhaitez-vous une démonstration ?", timestamp: "10:15 AM", status: 'delivered' },
    { id: `m-${seed}-5`, sender: 'agent', senderName: 'Mehdi Kaci', content: "Je reprends la conversation. Bonjour, je peux vous arranger un appel demo pour demain matin, ça vous convient ?", timestamp: "11:30 AM", status: 'read' },
    { id: `m-${seed}-6`, sender: 'contact', senderName: contactName, content: "Oui parfait, 10h ça me convient.", timestamp: "11:45 AM" },
  ];
  return msgs;
}

export const MOCK_TEMPLATES: Template[] = [
  { id: 'tpl-1', name: 'Lead Welcome WA', channel: 'whatsapp', body: 'Bonjour {{name}} ! Merci de nous avoir contacté. Notre équipe va vous répondre dans les plus brefs délais. À tout de suite ! 🛍️', status: 'approved', usedIn: 3 },
  { id: 'tpl-2', name: 'Follow Up 24h', channel: 'whatsapp', body: 'Bonjour {{name}}, juste un petit rappel concernant votre demande. Avez-vous eu l\'opportunité de réfléchir à notre offre ? Je reste disponible pour vous aider.', status: 'approved', usedIn: 2 },
  { id: 'tpl-3', name: 'Order Shipped', channel: 'whatsapp', body: 'Bonne nouvelle {{name}} ! Votre commande {{product}} a été expédiée aujourd\'hui. Vous pouvez la suivre via le lien ci-joint. Livraison estimée : 2-3 jours.', status: 'approved', usedIn: 1 },
  { id: 'tpl-4', name: 'Refund Confirmation', channel: 'facebook', body: 'Bonjour {{name}}, votre demande de remboursement a bien été traitée. Vous recevrez votre remboursement sous 5 jours ouvrables. Merci de votre confiance.', status: 'pending', usedIn: 0 },
  { id: 'tpl-5', name: 'Last Follow Up', channel: 'whatsapp', body: 'Bonjour {{name}}, c\'est mon dernier message. Si vous êtes prêt(e), répondez simplement ici et je m\'occupe de tout. 😊', status: 'rejected', usedIn: 0 },
  { id: 'tpl-6', name: 'Promo Flash IG', channel: 'instagram', body: '{{name}} ! Offre exclusive pour vous aujourd\'hui seulement : -20% sur tous nos produits. Profitez-en maintenant avant que l\'offre expire !', status: 'approved', usedIn: 4 },
];

export const MOCK_MEETING_BRIEFS: MeetingBrief[] = [
  {
    id: 'brief-1',
    leadId: 'lead-4',
    leadName: 'Fatima Zahra Aït',
    dealStage: 'proposal',
    dealValue: 45000,
    meetingTime: 'Today at 2:00 PM',
    historyContext: 'Fatima first reached out 3 weeks ago via WhatsApp after seeing a Facebook ad. She is the purchasing manager for a mid-size e-commerce company in Algiers. She has been engaged across 3 touchpoints. Automation handled the first 4 messages before Mehdi took over. Strong intent signals — asked about volume pricing and API integration.',
    openDeals: 'Proposal for 500-unit package at 45,000 DZD sent 3 days ago. No response yet. Previous proposal for 200-unit package was declined on price in Week 1.',
    riskFlags: ['No response to proposal in 72+ hours', 'Mentioned competitor "AlgerCRM" in last conversation', 'Payment delay on previous order with another vendor'],
    talkingPoints: [
      'Address the competitor comparison directly — emphasize WhatsApp automation depth',
      'Offer a 30-day pilot at reduced pricing to lower commitment barrier',
      'Revisit the 200-unit option with a better payment structure',
      'Ask about their current manual process pain points to anchor value',
    ],
  },
];

export const MOCK_MEETING_NOTES: MeetingNote[] = [
  {
    id: 'note-1',
    leadId: 'lead-4',
    leadName: 'Fatima Zahra Aït',
    summary: 'Meeting went well. Fatima is interested in a pilot program. Main concern is the onboarding time for her team. She wants to start with a smaller package.',
    objections: ['Onboarding complexity', 'Team buy-in for new tool', 'Price point too high for initial commitment'],
    opportunities: ['She has 3 other brands under same company — potential upsell', 'Looking to replace current Excel-based tracking by Q3'],
    nextSteps: ['Send revised proposal for 200-unit starter pack', 'Schedule onboarding call with ops team', 'Send case study from similar e-commerce client'],
    createdAt: 'Today at 3:15 PM',
  },
];

export const MOCK_INTELLIGENCE: IntelligenceItem[] = [
  { id: 'int-1', type: 'objection', headline: '"Le prix est trop élevé"', detail: 'Most common objection this week. Appeared in 8 conversations. Response rate drops 40% after this objection is raised.', frequency: 8 },
  { id: 'int-2', type: 'objection', headline: '"Je dois en parler avec mon équipe"', detail: 'Second most common stall. Signals committee buy-in issue. Usually precedes 72h+ silence.', frequency: 6 },
  { id: 'int-3', type: 'objection', headline: '"Vous avez d\'autres clients comme nous ?"', detail: 'Social proof request. Appears in 4 conversations this week.', frequency: 4 },
  { id: 'int-4', type: 'objection', headline: '"Votre concurrent est moins cher"', detail: 'Competitor mention detected in 3 conversations. AlgerCRM mentioned most frequently.', frequency: 3 },
  { id: 'int-5', type: 'objection', headline: '"Le délai de livraison est trop long"', detail: 'Logistics objection in 2 conversations. Only appears in Facebook leads.', frequency: 2 },
  { id: 'int-6', type: 'opportunity', headline: 'Yacine Ouahab showing strong buying signals', detail: 'Responded to every AI message within 15 minutes. Asked about payment terms twice. Stage: Qualified.', frequency: 0 },
  { id: 'int-7', type: 'opportunity', headline: 'Bilal Hadjadj ready for upsell', detail: 'Current proposal is 200-unit pack. Purchase history suggests capacity for 500-unit. Last message positive.', frequency: 0 },
  { id: 'int-8', type: 'opportunity', headline: 'Facebook ad leads converting 23% better this week', detail: 'Batch of 5 Facebook leads from this week all reached Qualified stage within 48 hours.', frequency: 0 },
  { id: 'int-9', type: 'risk', headline: 'Sofiane Meziane — 14 days without reply', detail: 'Last contact was 14 days ago. Proposal sent, no response. High value deal at 9,500 DZD. Recommend manual outreach.', frequency: 0 },
  { id: 'int-10', type: 'risk', headline: 'Karima Boufeldja — AI sequence stopped early', detail: 'Sequence paused after negative sentiment detected in Step 2 reply. Escalation not yet acknowledged by agent.', frequency: 0 },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv-1', date: 'April 1, 2026', description: 'E-commerce Plan — Monthly', amount: 30, status: 'paid' },
  { id: 'inv-2', date: 'March 1, 2026', description: 'E-commerce Plan — Monthly', amount: 30, status: 'paid' },
  { id: 'inv-3', date: 'February 1, 2026', description: 'Freelancer Plan — Monthly', amount: 20, status: 'paid' },
];

export const DEFAULT_FOLLOWUP_STEPS: FollowUpStep[] = [
  { id: 'step-1', delay: 'Immediately', message: 'Bonjour {{name}}, merci de nous avoir contacté ! Je vérifie la disponibilité pour vous tout de suite. 🛍️' },
  { id: 'step-2', delay: '+2 hours', message: 'Bonjour {{name}}, juste un petit suivi — êtes-vous toujours intéressé(e) ? Je peux répondre à toutes vos questions.' },
  { id: 'step-3', delay: '+1 day', message: '{{name}}, je ne voudrais pas que vous passiez à côté. Cet article part vite. Voulez-vous que je vous en réserve un ?' },
  { id: 'step-4', delay: '+3 days', message: 'Dernier message de ma part, {{name}}. Quand vous serez prêt(e), répondez simplement ici et je m\'occupe de tout.' },
];

export const DEFAULT_FAQ: FAQEntry[] = [
  { id: 'faq-1', question: 'Quels sont vos délais de livraison ?', answer: 'Nos délais de livraison sont de 2 à 5 jours ouvrables selon votre région.' },
  { id: 'faq-2', question: 'Quelle est votre politique de remboursement ?', answer: 'Nous acceptons les retours dans les 30 jours suivant l\'achat. Le remboursement est effectué sous 5 jours ouvrables.' },
  { id: 'faq-3', question: 'Quels sont vos horaires d\'ouverture ?', answer: 'Notre équipe est disponible du dimanche au jeudi, de 9h à 18h. Notre IA répond 24h/24, 7j/7.' },
  { id: 'faq-4', question: 'Comment puis-je passer une commande ?', answer: 'Vous pouvez passer votre commande directement via WhatsApp ou notre site web. Un de nos agents vous guidera.' },
];

export const DEFAULT_RULES: Rule[] = [
  { id: 'rule-1', condition: 'order_value_above', value: '5000', action: 'escalate_to_human' },
  { id: 'rule-2', condition: 'days_since_purchase_above', value: '30', action: 'reject_refund' },
  { id: 'rule-3', condition: 'order_value_below', value: '1000', action: 'auto_approve' },
];

export const MOCK_AI_AGENT_METRICS: AgentMetrics[] = [
  { name: 'Lead Follow-Up', metric1Label: 'Sequences sent', metric1Value: '1,247', metric2Label: 'Reply rate', metric2Value: '68%', metric3Label: 'Avg time to reply', metric3Value: '4.2h' },
  { name: 'Client Chat', metric1Label: 'Questions answered', metric1Value: '3,891', metric2Label: 'Escalation rate', metric2Value: '12%', metric3Label: 'Avg resolution time', metric3Value: '3.1m' },
  { name: 'Refund Agent', metric1Label: 'Refunds processed', metric1Value: '84', metric2Label: 'Auto-approved', metric2Value: '76%', metric3Label: 'Avg resolution time', metric3Value: '8.4m' },
  { name: 'Order Tracking', metric1Label: 'Updates sent', metric1Value: '2,103', metric2Label: 'Inbound inquiries', metric2Value: '-31%', metric3Label: 'Delivery confirmation', metric3Value: '94%' },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Nassim Rahmani', leads: 42, responseRate: '96%', closed: 8, conversion: '19%' },
  { rank: 2, name: 'Sara Boukhalfa', leads: 38, responseRate: '94%', closed: 7, conversion: '18%' },
  { rank: 3, name: 'Mehdi Kaci', leads: 35, responseRate: '91%', closed: 5, conversion: '14%' },
];

export const MOCK_ACTIVITY_FEED = [
  { id: 'act-1', agent: 'Lead Follow-Up', action: 'Step 2 sent to Mohamed Benali', time: '2m ago', channel: 'whatsapp' as const },
  { id: 'act-2', agent: 'Client Chat', action: 'FAQ answered for Nadia Hamdi: delivery time', time: '5m ago', channel: 'instagram' as const },
  { id: 'act-3', agent: 'Refund Agent', action: 'Auto-approved refund for Sofiane Meziane (2,400 DZD)', time: '12m ago', channel: 'facebook' as const },
  { id: 'act-4', agent: 'Order Tracking', action: 'Shipping update sent to Lynda Bouziane', time: '18m ago', channel: 'whatsapp' as const },
  { id: 'act-5', agent: 'Lead Follow-Up', action: 'Escalation triggered for Dalila Benmeziani', time: '25m ago', channel: 'instagram' as const },
  { id: 'act-6', agent: 'Client Chat', action: 'Human takeover requested: Mourad Terki', time: '31m ago', channel: 'whatsapp' as const },
  { id: 'act-7', agent: 'Lead Follow-Up', action: 'Step 1 sent to Imene Guerfi (new lead)', time: '45m ago', channel: 'facebook' as const },
  { id: 'act-8', agent: 'Order Tracking', action: 'Delivered confirmation sent to Kamel Boudoukha', time: '1h ago', channel: 'whatsapp' as const },
];

export const MOCK_PENDING_TEMPLATES = [
  { id: 'pt-1', name: 'Refund Confirmation', channel: 'facebook' as const, status: 'pending' as const },
];
