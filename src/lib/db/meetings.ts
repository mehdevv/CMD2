import { getSupabase } from '@/lib/supabase';
import type { MeetingBrief, MeetingNote, Stage } from '@/lib/types';
import { isDemoUser, loadDemoSession } from '@/lib/demo-auth';
import { demoLogActivity } from '@/lib/demo-crm-store';

type BriefRow = {
  id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  deal_stage: string | null;
  deal_value: number | null;
  meeting_time: string | null;
  history_context: string | null;
  open_deals: string | null;
  risk_flags: string[] | null;
  talking_points: string[] | null;
  created_at: string;
  lead?: { name: string } | null;
};

type NoteRow = {
  id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  summary: string | null;
  objections: string[] | null;
  opportunities_found: string[] | null;
  next_steps: string[] | null;
  voice_file_url: string | null;
  created_at: string;
  lead?: { name: string } | null;
};

function rowToBrief(r: BriefRow): MeetingBrief {
  return {
    id: r.id,
    leadId: r.lead_id ?? '',
    leadName: r.lead?.name ?? 'Contact',
    dealStage: (r.deal_stage ?? 'new') as Stage,
    dealValue: Number(r.deal_value ?? 0),
    meetingTime: r.meeting_time ?? r.created_at,
    historyContext: r.history_context ?? '',
    openDeals: r.open_deals ?? '',
    riskFlags: r.risk_flags ?? [],
    talkingPoints: r.talking_points ?? [],
    opportunityId: r.opportunity_id ?? undefined,
  };
}

function rowToNote(r: NoteRow): MeetingNote {
  return {
    id: r.id,
    leadId: r.lead_id ?? '',
    leadName: r.lead?.name ?? 'Contact',
    summary: r.summary ?? '',
    objections: r.objections ?? [],
    opportunities: r.opportunities_found ?? [],
    nextSteps: r.next_steps ?? [],
    createdAt: r.created_at,
    opportunityId: r.opportunity_id ?? undefined,
  };
}

export async function getLatestBriefForLead(leadId: string): Promise<MeetingBrief | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('meeting_briefs')
    .select('*, lead:leads!meeting_briefs_lead_id_fkey(name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToBrief(data as BriefRow) : null;
}

export async function saveMeetingBrief(
  orgId: string,
  input: Omit<MeetingBrief, 'id'> & { id?: string }
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('meeting_briefs')
    .insert({
      org_id: orgId,
      lead_id: input.leadId || null,
      opportunity_id: input.opportunityId ?? null,
      deal_stage: input.dealStage,
      deal_value: input.dealValue,
      meeting_time: input.meetingTime,
      history_context: input.historyContext,
      open_deals: input.openDeals,
      risk_flags: input.riskFlags ?? [],
      talking_points: input.talkingPoints ?? [],
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function getLatestNoteForLead(leadId: string): Promise<MeetingNote | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('meeting_notes')
    .select('*, lead:leads!meeting_notes_lead_id_fkey(name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToNote(data as NoteRow) : null;
}

export function buildNoteSummaryFromText(raw: string, contactName: string): MeetingNote {
  const trimmed = raw.trim();
  const lines = trimmed.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const objections = lines.filter(l => /prix|budget|délai|timeline|concurrence|objection/i.test(l)).slice(0, 3);
  const opportunities = lines.filter(l => /opportunit|upsell|expansion|pilot|deal/i.test(l)).slice(0, 3);
  const nextSteps =
    lines.filter(l => /suiv|next|envoy|call|rdv|schedule|follow/i.test(l)).slice(0, 4) ||
    ['Send recap email within 24h', 'Update CRM stage', 'Schedule check-in'];

  return {
    id: 'draft',
    leadId: '',
    leadName: contactName,
    summary:
      trimmed.length > 40
        ? trimmed.slice(0, 280) + (trimmed.length > 280 ? '…' : '')
        : `Discussion with ${contactName}: ${trimmed || 'key needs and next steps captured from the meeting.'}`,
    objections: objections.length ? objections : ['Pricing sensitivity', 'Implementation timeline'],
    opportunities: opportunities.length
      ? opportunities
      : ['Advance deal toward proposal', 'Confirm decision timeline'],
    nextSteps: nextSteps.length ? nextSteps : ['Send recap email within 24h', 'Update CRM stage'],
    createdAt: new Date().toISOString(),
  };
}

export async function saveMeetingNote(
  orgId: string,
  input: {
    leadId: string;
    opportunityId?: string;
    summary: string;
    objections: string[];
    opportunities: string[];
    nextSteps: string[];
  }
): Promise<string> {
  if (isDemoUser(loadDemoSession())) {
    demoLogActivity(input.leadId, 'Post-meeting note saved — follow-up scheduled in 24h', 'other');
    return `note-${Date.now()}`;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('meeting_notes')
    .insert({
      org_id: orgId,
      lead_id: input.leadId,
      opportunity_id: input.opportunityId ?? null,
      summary: input.summary,
      objections: input.objections,
      opportunities_found: input.opportunities,
      next_steps: input.nextSteps,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}
