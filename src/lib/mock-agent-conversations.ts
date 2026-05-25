import type { Conversation, Lead, Message } from '@/lib/types';
import { AGENT_BRAND, type AgentId } from '@/lib/agent-brand';

export type AgentScenarioId = AgentId;

/** Primary automation agent showcased per seeded lead (demo storytelling). */
export const LEAD_AGENT_SCENARIO: Partial<Record<string, AgentScenarioId>> = {
  'lead-1': 'followup', // Mohamed Benali — new prospect
  'lead-6': 'chat', // Nadia Hamdi — FAQ inbound
  'lead-7': 'refund', // Sofiane Meziane — refund + escalation
  'lead-9': 'tracking', // Mourad Terki — shipment updates
  'lead-10': 'chat', // Samira — product questions
  'lead-12': 'followup', // Zineb — outbound sequence
  'lead-4': 'chat', // Fatima — enterprise FAQ then human
  'lead-13': 'tracking', // Kamel — delivered confirmation
  'lead-15': 'tracking', // Bilal — VIP order path
  'lead-16': 'refund', // Karima — partial refund request
  'lead-19': 'followup', // Tarek — re-engagement sequence
  'lead-3': 'chat', // Yacine — pre-sale questions
  'lead-18': 'followup', // Dalila — sequence + escalation signal
};

export function scenarioForLead(leadId: string, index: number): AgentScenarioId {
  const fixed = LEAD_AGENT_SCENARIO[leadId];
  if (fixed) return fixed;
  const order: AgentScenarioId[] = ['followup', 'chat', 'tracking', 'refund'];
  return order[index % 4]!;
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

function messagesFollowUp(contactName: string, seed: number): Message[] {
  const fn = firstName(contactName);
  return [
    {
      id: `m-${seed}-1`,
      sender: 'contact',
      senderName: contactName,
      content: 'Bonjour, je viens de voir votre pub WhatsApp. Vous vendez en gros ?',
      timestamp: '09:14',
    },
    {
      id: `m-${seed}-2`,
      sender: 'ai',
      senderName: AGENT_BRAND.followup.label,
      content: `Bonjour ${fn} ! Merci de nous avoir contacté. Je suis l'assistant de suivi Scale — je peux vous envoyer le catalogue et les tarifs dégressifs dès maintenant.`,
      timestamp: '09:14',
      status: 'delivered',
    },
    {
      id: `m-${seed}-3`,
      sender: 'ai',
      senderName: AGENT_BRAND.followup.label,
      content: `${fn}, avez-vous pu regarder le PDF ? Je peux bloquer un créneau démo avec un conseiller si vous préférez.`,
      timestamp: '11:30',
      status: 'read',
    },
    {
      id: `m-${seed}-4`,
      sender: 'contact',
      senderName: contactName,
      content: 'Oui envoyez les prix pour 200 unités svp.',
      timestamp: '11:42',
    },
  ];
}

function messagesClientChat(contactName: string, seed: number): Message[] {
  const fn = firstName(contactName);
  return [
    {
      id: `m-${seed}-1`,
      sender: 'contact',
      senderName: contactName,
      content: 'Quels sont vos horaires de support ? Livrez-vous à Oran ?',
      timestamp: '14:02',
    },
    {
      id: `m-${seed}-2`,
      sender: 'ai',
      senderName: AGENT_BRAND.chat.label,
      content: `Bonjour ${fn} ! Nous répondons 7j/7 de 9h à 21h (heure Alger). Livraison Oran : 2–3 jours ouvrés, gratuite au-dessus de 8 000 DZD.`,
      timestamp: '14:02',
      status: 'read',
    },
    {
      id: `m-${seed}-3`,
      sender: 'contact',
      senderName: contactName,
      content: 'Et le retour si la taille ne convient pas ?',
      timestamp: '14:18',
    },
    {
      id: `m-${seed}-4`,
      sender: 'ai',
      senderName: AGENT_BRAND.chat.label,
      content:
        'Retours acceptés sous 14 jours, article non porté. Je peux lancer une étiquette retour — souhaitez-vous parler à un conseiller pour un échange ?',
      timestamp: '14:18',
      status: 'delivered',
    },
  ];
}

function messagesOrderTracking(contactName: string, seed: number): Message[] {
  const fn = firstName(contactName);
  return [
    {
      id: `m-${seed}-1`,
      sender: 'contact',
      senderName: contactName,
      content: 'Commande #CMD-8842 — toujours pas reçue, c’est normal ?',
      timestamp: '16:05',
    },
    {
      id: `m-${seed}-2`,
      sender: 'ai',
      senderName: AGENT_BRAND.tracking.label,
      content: `Bonjour ${fn}, votre colis est en transit à Alger Centre (hub DHL). Livraison estimée : demain avant 18h. Suivi : TRK-8842-ALG.`,
      timestamp: '16:06',
      status: 'delivered',
    },
    {
      id: `m-${seed}-3`,
      sender: 'ai',
      senderName: AGENT_BRAND.tracking.label,
      content:
        'Mise à jour : le livreur est en route. Répondez « OK » quand vous l’avez reçu — nous vous demanderons votre avis en 1 clic.',
      timestamp: '17:40',
      status: 'read',
    },
    {
      id: `m-${seed}-4`,
      sender: 'contact',
      senderName: contactName,
      content: 'Parfait merci, je vous confirme demain.',
      timestamp: '17:45',
    },
  ];
}

function messagesRefund(contactName: string, seed: number): Message[] {
  const fn = firstName(contactName);
  return [
    {
      id: `m-${seed}-1`,
      sender: 'contact',
      senderName: contactName,
      content: 'Je veux me faire rembourser, le produit est arrivé abîmé.',
      timestamp: '10:22',
    },
    {
      id: `m-${seed}-2`,
      sender: 'ai',
      senderName: AGENT_BRAND.refund.label,
      content: `Bonjour ${fn}, je suis l’assistant remboursement. Pouvez-vous confirmer le n° de commande et joindre une photo du colis ? Délai de traitement : 5–7 jours ouvrés.`,
      timestamp: '10:23',
      status: 'delivered',
    },
    {
      id: `m-${seed}-3`,
      sender: 'contact',
      senderName: contactName,
      content: 'CMD-5510, voici la photo. Je demande 2 400 DZD.',
      timestamp: '10:35',
    },
    {
      id: `m-${seed}-4`,
      sender: 'ai',
      senderName: AGENT_BRAND.refund.label,
      content:
        'Merci. Montant dans la politique auto (≤ 2 500 DZD) — remboursement approuvé. Vous recevrez un SMS de confirmation sous 24h. Un conseiller peut vous appeler si besoin.',
      timestamp: '10:36',
      status: 'read',
    },
  ];
}

/** Fatima-style: chat then human rep (still shows Client Chat first). */
function messagesChatWithHandoff(contactName: string, seed: number, repName: string): Message[] {
  const base = messagesClientChat(contactName, seed);
  return [
    ...base,
    {
      id: `m-${seed}-5`,
      sender: 'agent',
      senderName: repName,
      content:
        'Bonjour, je reprends pour le devis 500 unités. Je vous envoie la proposition PDF cet après-midi.',
      timestamp: '15:10',
      status: 'read',
    },
    {
      id: `m-${seed}-6`,
      sender: 'contact',
      senderName: contactName,
      content: 'Parfait, j’attends le PDF.',
      timestamp: '15:22',
    },
  ];
}

export function buildMessagesForScenario(
  scenario: AgentScenarioId,
  contactName: string,
  seed: number
): Message[] {
  switch (scenario) {
    case 'followup':
      return messagesFollowUp(contactName, seed);
    case 'chat':
      return seed === 3 ? messagesChatWithHandoff(contactName, seed, 'Mehdi Kaci') : messagesClientChat(contactName, seed);
    case 'tracking':
      return messagesOrderTracking(contactName, seed);
    case 'refund':
      return messagesRefund(contactName, seed);
    default:
      return messagesClientChat(contactName, seed);
  }
}

export function lastMessagePreview(messages: Message[]): string {
  const last = messages[messages.length - 1];
  return last?.content.slice(0, 120) ?? '';
}

export function primaryAgentLabel(messages: Message[]): string {
  const ai = [...messages].reverse().find(m => m.sender === 'ai');
  return ai?.senderName ?? AGENT_BRAND.chat.label;
}

export function activityKindForAgent(agent: AgentScenarioId): string {
  switch (agent) {
    case 'followup':
      return 'sequence';
    case 'chat':
      return 'chat';
    case 'tracking':
      return 'tracking';
    case 'refund':
      return 'refund';
    default:
      return 'other';
  }
}

export function seedActivitySummariesForConversation(
  leadId: string,
  scenario: AgentScenarioId,
  messages: Message[]
): { id: string; leadId: string; summary: string; at: string; kind: string }[] {
  const items: { id: string; leadId: string; summary: string; at: string; kind: string }[] = [];
  const kind = activityKindForAgent(scenario);
  const aiMsgs = messages.filter(m => m.sender === 'ai');

  aiMsgs.forEach((m, i) => {
    items.push({
      id: `act-seed-${leadId}-${scenario}-${i}`,
      leadId,
      summary: `${m.senderName}: ${m.content.slice(0, 80)}${m.content.length > 80 ? '…' : ''}`,
      at: new Date(Date.now() - (aiMsgs.length - i) * 3_600_000).toISOString(),
      kind,
    });
  });

  if (scenario === 'followup') {
    items.push({
      id: `act-seed-${leadId}-sched`,
      leadId,
      summary: 'Step 3 scheduled — case study follow-up in 2h (Lead Follow-Up)',
      at: new Date().toISOString(),
      kind: 'sequence',
    });
  }
  if (scenario === 'refund') {
    items.push({
      id: `act-seed-${leadId}-refund-ok`,
      leadId,
      summary: 'Refund auto-approved within policy — 2 400 DZD',
      at: new Date(Date.now() - 1_800_000).toISOString(),
      kind: 'refund',
    });
  }
  if (scenario === 'tracking') {
    items.push({
      id: `act-seed-${leadId}-track`,
      leadId,
      summary: 'Carrier webhook: status → Out for delivery',
      at: new Date(Date.now() - 900_000).toISOString(),
      kind: 'tracking',
    });
  }

  return items;
}

export function buildMockConversations(leads: Lead[]): Conversation[] {
  return leads.slice(0, 15).map((lead, i) => {
    const scenario = scenarioForLead(lead.id, i);
    const messages = buildMessagesForScenario(scenario, lead.name, i);
    const aiStatus =
      scenario === 'refund' && lead.id === 'lead-7'
        ? 'escalated'
        : lead.aiStatus;

    return {
      id: `conv-${lead.id}`,
      leadId: lead.id,
      leadName: lead.name,
      channel: lead.channel,
      aiStatus,
      automationPaused: lead.id === 'lead-4',
      assignedTo: lead.assignedTo,
      messages,
      lastMessage: lastMessagePreview(messages),
      lastTime: lead.lastContact,
    };
  });
}
