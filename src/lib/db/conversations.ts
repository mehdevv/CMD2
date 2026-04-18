import { getSupabase } from '@/lib/supabase';
import type { Channel, Conversation, Message } from '@/lib/types';
import { channelFromDb, formatLastContact } from '@/lib/db/map-common';

type MsgRow = {
  id: string;
  sender: string;
  sender_name: string;
  content: string;
  created_at: string;
  status: string | null;
};

type ConvRow = {
  id: string;
  lead_id: string;
  channel: string;
  ai_status: string;
  automation_paused: boolean;
  assigned_to: string | null;
  last_message: string | null;
  last_time: string | null;
  lead: { name: string } | null;
  assignee?: { name: string } | null;
  messages?: MsgRow[] | null;
};

function mapMessage(m: MsgRow): Message {
  return {
    id: m.id,
    sender: m.sender as Message['sender'],
    senderName: m.sender_name,
    content: m.content,
    timestamp: m.created_at,
    status: (m.status as Message['status']) ?? undefined,
  };
}

function rowToConversation(r: ConvRow): Conversation {
  const msgs = (r.messages ?? []).slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return {
    id: r.id,
    leadId: r.lead_id,
    leadName: r.lead?.name ?? 'Contact',
    channel: channelFromDb(r.channel) as Channel,
    aiStatus: r.ai_status as Conversation['aiStatus'],
    automationPaused: r.automation_paused,
    assignedTo: r.assignee?.name ?? (r.assigned_to ? r.assigned_to.slice(0, 8) + '…' : 'Unassigned'),
    messages: msgs.map(mapMessage),
    lastMessage: r.last_message ?? (msgs.length ? msgs[msgs.length - 1].content : ''),
    lastTime: r.last_time ? formatLastContact(r.last_time) : '—',
  };
}

export async function listConversations(): Promise<Conversation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      *,
      lead:leads!conversations_lead_id_fkey(name),
      assignee:profiles!conversations_assigned_to_fkey(name),
      messages(id, sender, sender_name, content, status, created_at)
    `
    )
    .order('last_time', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data as ConvRow[] | null)?.map(rowToConversation) ?? [];
}

export async function insertMessage(conversationId: string, orgId: string, msg: Omit<Message, 'id'>): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    org_id: orgId,
    sender: msg.sender,
    sender_name: msg.senderName,
    content: msg.content,
    status: msg.status ?? null,
  });
  if (error) throw error;
  const preview = msg.content.slice(0, 120);
  await supabase
    .from('conversations')
    .update({ last_message: preview, last_time: new Date().toISOString() })
    .eq('id', conversationId);
}

export async function setConversationTakeover(
  conversationId: string,
  opts: { automationPaused: boolean; assignedToUserId: string | null }
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('conversations')
    .update({
      automation_paused: opts.automationPaused,
      assigned_to: opts.assignedToUserId,
    })
    .eq('id', conversationId);
  if (error) throw error;
}
