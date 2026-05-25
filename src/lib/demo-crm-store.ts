import type { AnalyticsReport, Conversation, Lead, Message, Opportunity, User } from '@/lib/types';
import { MOCK_CONVERSATIONS, MOCK_LEADS } from '@/lib/mock-data';
import { MOCK_OPPORTUNITIES_SEED } from '@/lib/mock-opportunities-seed';
import { MOCK_REPORTS_SEED } from '@/lib/mock-reports-seed';
import { derivePaymentStatus } from '@/lib/pipeline';
import type { AddLeadPayload } from '@/contexts/CrmDataContext';
import {
  buildMockConversations,
  scenarioForLead,
  seedActivitySummariesForConversation,
} from '@/lib/mock-agent-conversations';

const STORAGE_KEY = 'scale_demo_crm_v3';
export const DEMO_TEAM: User[] = [
  { id: 'demo-admin', name: 'Platform Admin', email: 'admin@scale.test', role: 'admin', status: 'active', lastActive: 'Now' },
  { id: 'demo-owner', name: 'Demo Owner', email: 'owner@scale.test', role: 'owner', status: 'active', lastActive: 'Now' },
  {
    id: 'demo-agent-karim',
    name: 'Karim Agent',
    email: 'karim@demo.scale',
    role: 'agent',
    status: 'active',
    lastActive: 'Now',
    localHandle: 'karim',
  },
];

type DemoStore = {
  leads: Lead[];
  opportunities: Opportunity[];
  conversations: Conversation[];
  reports: AnalyticsReport[];
  activity: { id: string; leadId: string; summary: string; at: string; kind: string }[];
};

function seedStore(): DemoStore {
  const leads = MOCK_LEADS.map(l => ({
    ...l,
    assignedToUserId:
      l.assignedTo === 'Mehdi Kaci' || l.assignedTo === 'Nassim Rahmani'
        ? 'demo-agent-karim'
        : 'demo-owner',
  }));

  const opportunities = MOCK_OPPORTUNITIES_SEED.map(opp => {
    const lead = leads.find(l => l.id === opp.leadId);
    const ownerId = lead?.assignedToUserId ?? 'demo-owner';
    const owner = DEMO_TEAM.find(t => t.id === ownerId);
    return {
      ...opp,
      ownerId,
      ownerName: owner?.name ?? opp.ownerName,
      stageHistory: opp.stageHistory.map(h => ({ ...h, by: ownerId })),
    };
  });

  const conversations = MOCK_CONVERSATIONS.map(c => ({
    ...c,
    automationPaused: c.automationPaused ?? false,
  }));

  const activity = seedDemoActivity(leads, conversations);

  return {
    leads,
    opportunities,
    conversations,
    reports: [...MOCK_REPORTS_SEED],
    activity,
  };
}

function seedDemoActivity(
  leads: Lead[],
  conversations: Conversation[]
): DemoStore['activity'] {
  const items: DemoStore['activity'] = [];

  for (const lead of leads) {
    const conv = conversations.find(c => c.leadId === lead.id);
    if (!conv) continue;
    const idx = leads.findIndex(l => l.id === lead.id);
    const scenario = scenarioForLead(lead.id, idx >= 0 ? idx : 0);
    items.push(...seedActivitySummariesForConversation(lead.id, scenario, conv.messages ?? []));

    if (lead.convertedOpportunityId) {
      items.push({
        id: `act-seed-convert-${lead.id}`,
        leadId: lead.id,
        summary: `Converted to opportunity ${lead.convertedOpportunityId}`,
        at: new Date(Date.now() - 86_400_000).toISOString(),
        kind: 'pipeline',
      });
    }

    if (lead.enrichedAt) {
      items.push({
        id: `act-seed-enrich-${lead.id}`,
        leadId: lead.id,
        summary: 'Assistant enrichment — company and pain points updated',
        at: lead.enrichedAt,
        kind: 'enrichment',
      });
    }
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function migrateStore(store: DemoStore): DemoStore {
  const leadById = new Map(store.leads.map(l => [l.id, l]));
  const opportunities = store.opportunities.map(opp => {
    const legacyOwner =
      opp.ownerId === 'agent-1' ||
      opp.ownerId === 'agent-2' ||
      opp.ownerId === 'agent-3' ||
      opp.ownerId === 'user-2';
    if (!legacyOwner) return opp;
    const lead = leadById.get(opp.leadId);
    const ownerId = lead?.assignedToUserId ?? 'demo-owner';
    const owner = DEMO_TEAM.find(t => t.id === ownerId);
    return {
      ...opp,
      ownerId,
      ownerName: owner?.name ?? opp.ownerName,
      stageHistory: opp.stageHistory.map(h => ({ ...h, by: ownerId })),
    };
  });

  const scripted = new Map(buildMockConversations(store.leads).map(c => [c.leadId, c]));
  const conversations = store.conversations.map(c => {
    const fresh = scripted.get(c.leadId);
    if (!fresh) return c;
    return {
      ...fresh,
      automationPaused: c.automationPaused ?? fresh.automationPaused,
    };
  });
  for (const [leadId, fresh] of scripted) {
    if (!conversations.some(c => c.leadId === leadId)) conversations.push(fresh);
  }

  const activity = seedDemoActivity(store.leads, conversations);

  return { ...store, opportunities, conversations, activity };
}

function readStore(): DemoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedStore();
      writeStore(seeded);
      return seeded;
    }
    const parsed = migrateStore(JSON.parse(raw) as DemoStore);
    writeStore(parsed);
    return parsed;
  } catch {
    const seeded = seedStore();
    writeStore(seeded);
    return seeded;
  }
}

function writeStore(store: DemoStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function demoListLeads(): Lead[] {
  return readStore().leads;
}

export function demoListOpportunities(): Opportunity[] {
  return readStore().opportunities;
}

export function demoListConversations(): Conversation[] {
  return readStore().conversations;
}

export function demoListReports(): AnalyticsReport[] {
  return readStore().reports;
}

export function demoListTeam(): User[] {
  return DEMO_TEAM;
}

export function demoListActivityForLead(leadId: string) {
  return readStore()
    .activity.filter(a => a.leadId === leadId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function demoListAllActivity(limit = 100) {
  return readStore()
    .activity.slice(0, limit)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function demoLogActivity(leadId: string, summary: string, kind = 'sequence') {
  const store = readStore();
  store.activity.unshift({
    id: `act-${Date.now()}`,
    leadId,
    summary,
    at: new Date().toISOString(),
    kind,
  });
  writeStore(store);
}

export function demoUpdateLead(id: string, patch: Partial<Lead>) {
  const store = readStore();
  const prev = store.leads.find(l => l.id === id);
  store.leads = store.leads.map(l => (l.id === id ? { ...l, ...patch } : l));
  if (prev && patch.stage && patch.stage !== prev.stage) {
    store.activity.unshift({
      id: `act-${Date.now()}-stage`,
      leadId: id,
      summary: `Stage changed: ${prev.stage} → ${patch.stage}`,
      at: new Date().toISOString(),
      kind: 'other',
    });
  }
  writeStore(store);
}

export function demoAddLead(input: AddLeadPayload, assignedToUserId: string): string {
  const store = readStore();
  const id = `lead-${Date.now()}`;
  const now = new Date().toISOString();
  const lead: Lead = {
    id,
    name: input.name,
    phone: input.phone,
    channel: input.channel,
    stage: 'new',
    aiStatus: 'active',
    assignedToUserId,
    assignedTo: DEMO_TEAM.find(t => t.id === assignedToUserId)?.name ?? 'Agent',
    lastContact: 'Just now',
    source: input.source,
    createdAt: now,
    qualificationScore: 'cold',
  };
  const greeting = `Bonjour ${input.name.split(' ')[0]}, merci de nous avoir contacté. Je suis l'assistant Scale — comment puis-je vous aider aujourd'hui ?`;
  const convId = `conv-${id}`;
  const conv: Conversation = {
    id: convId,
    leadId: id,
    leadName: input.name,
    channel: input.channel,
    aiStatus: 'active',
    automationPaused: false,
    assignedTo: lead.assignedTo,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        senderName: 'Lead Follow-Up',
        content: greeting,
        timestamp: now,
        status: 'delivered',
      },
    ],
    lastMessage: greeting.slice(0, 120),
    lastTime: 'Just now',
  };
  store.leads.unshift(lead);
  store.conversations.unshift(conv);
  store.activity.unshift({
    id: `act-${Date.now()}-0`,
    leadId: id,
    summary: `Lead created on ${input.channel}`,
    at: now,
    kind: 'other',
  });
  store.activity.unshift({
    id: `act-${Date.now()}-1`,
    leadId: id,
    summary: `Step 1 sent on ${input.channel} — welcome message delivered`,
    at: now,
    kind: 'sequence',
  });
  store.activity.unshift({
    id: `act-${Date.now()}-2`,
    leadId: id,
    summary: 'Step 2 scheduled — product follow-up in 2h (Lead Follow-Up)',
    at: now,
    kind: 'sequence',
  });
  writeStore(store);
  return id;
}

export function demoAddOpportunity(o: Opportunity): string {
  const store = readStore();
  const id = o.id.startsWith('opp-') ? o.id : `opp-${Date.now()}`;
  store.opportunities.unshift({ ...o, id });
  writeStore(store);
  return id;
}

export function demoSyncOpportunity(opp: Opportunity) {
  const store = readStore();
  const prev = store.opportunities.find(o => o.id === opp.id);
  const next = { ...opp, paymentStatus: derivePaymentStatus(opp.payments ?? []) };
  store.opportunities = store.opportunities.map(o => (o.id === opp.id ? next : o));
  if (prev && opp.leadId) {
    if (prev.stage !== next.stage) {
      store.activity.unshift({
        id: `act-${Date.now()}-pipe`,
        leadId: opp.leadId,
        summary: `Pipeline: ${prev.stage.replace(/_/g, ' ')} → ${next.stage.replace(/_/g, ' ')}`,
        at: new Date().toISOString(),
        kind: 'opportunity',
      });
    }
    if (prev.outcome !== 'won' && next.outcome === 'won') {
      store.activity.unshift({
        id: `act-${Date.now()}-won`,
        leadId: opp.leadId,
        summary: `Deal marked Won — ${next.name}`,
        at: new Date().toISOString(),
        kind: 'opportunity',
      });
      const lead = store.leads.find(l => l.id === opp.leadId);
      if (lead) {
        store.leads = store.leads.map(l =>
          l.id === opp.leadId ? { ...l, stage: 'closed', aiStatus: 'completed' } : l
        );
      }
    }
  }
  writeStore(store);
}

export function demoAddReport(r: AnalyticsReport): string {
  const store = readStore();
  const id = r.id || `report-${Date.now()}`;
  store.reports.unshift({ ...r, id });
  writeStore(store);
  return id;
}

export function demoUpdateReport(id: string, patch: Partial<AnalyticsReport>) {
  const store = readStore();
  store.reports = store.reports.map(r => (r.id === id ? { ...r, ...patch } : r));
  writeStore(store);
}

export function demoSendMessage(conversationId: string, msg: Omit<Message, 'id'>) {
  const store = readStore();
  store.conversations = store.conversations.map(c => {
    if (c.id !== conversationId) return c;
    const message: Message = { ...msg, id: `msg-${Date.now()}` };
    return {
      ...c,
      messages: [...(c.messages ?? []), message],
      lastMessage: msg.content.slice(0, 120),
      lastTime: 'Just now',
    };
  });
  writeStore(store);
}

export function demoSetConversationTakeover(
  conversationId: string,
  opts: { automationPaused: boolean; assignedToUserId: string | null }
) {
  const store = readStore();
  const conv = store.conversations.find(c => c.id === conversationId);
  store.conversations = store.conversations.map(c =>
    c.id === conversationId
      ? {
          ...c,
          automationPaused: opts.automationPaused,
          aiStatus: opts.automationPaused ? 'paused' : 'active',
          assignedTo: opts.assignedToUserId
            ? (DEMO_TEAM.find(t => t.id === opts.assignedToUserId)?.name ?? c.assignedTo)
            : c.assignedTo,
        }
      : c
  );
  if (conv?.leadId) {
    const agentName = opts.assignedToUserId
      ? (DEMO_TEAM.find(t => t.id === opts.assignedToUserId)?.name ?? 'Agent')
      : null;
    store.activity.unshift({
      id: `act-${Date.now()}-takeover`,
      leadId: conv.leadId,
      summary: opts.automationPaused
        ? `Human takeover — ${agentName ?? 'Agent'} paused automation on this thread`
        : 'Released to automation — Lead Follow-Up sequence resumed',
      at: new Date().toISOString(),
      kind: opts.automationPaused ? 'escalation' : 'sequence',
    });
    store.leads = store.leads.map(l =>
      l.id === conv.leadId
        ? { ...l, aiStatus: opts.automationPaused ? 'paused' : 'active' }
        : l
    );
  }
  writeStore(store);
}
