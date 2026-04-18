import { getSupabase } from '@/lib/supabase';
import type { Channel, Lead } from '@/lib/types';
import { channelFromDb, channelToDb, formatLastContact } from '@/lib/db/map-common';

type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  channel: string;
  stage: string;
  ai_status: string;
  assigned_to: string | null;
  source: string | null;
  notes: string | null;
  last_contact: string | null;
  deal_value: number | null;
  close_date: string | null;
  whatsapp: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  website: string | null;
  linkedin: string | null;
  company: string | null;
  company_role: string | null;
  company_size: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  budget_range: string | null;
  timeline: string | null;
  qualification_score: string | null;
  enriched_at: string | null;
  converted_opportunity_id: string | null;
  created_at: string;
  lead_tags?: { tag: string }[] | null;
  lead_pain_points?: { point: string }[] | null;
  assignee?: { name: string } | null;
};

function rowToLead(r: LeadRow): Lead {
  const tags = r.lead_tags?.map(t => t.tag) ?? [];
  const painPoints = r.lead_pain_points?.map(p => p.point) ?? [];
  const loc =
    r.country || r.city ? { country: r.country ?? undefined, city: r.city ?? undefined } : undefined;
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    channel: channelFromDb(r.channel) as Channel,
    stage: r.stage as Lead['stage'],
    aiStatus: r.ai_status as Lead['aiStatus'],
    assignedToUserId: r.assigned_to ?? undefined,
    assignedTo: r.assignee?.name ?? (r.assigned_to ? r.assigned_to.slice(0, 8) + '…' : 'Unassigned'),
    lastContact: formatLastContact(r.last_contact),
    dealValue: r.deal_value ?? undefined,
    source: r.source ?? undefined,
    notes: r.notes ?? undefined,
    closeDate: r.close_date ?? undefined,
    tags: tags.length ? tags : undefined,
    email: r.email ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    instagramHandle: r.instagram_handle ?? undefined,
    facebookHandle: r.facebook_handle ?? undefined,
    website: r.website ?? undefined,
    linkedin: r.linkedin ?? undefined,
    company: r.company ?? undefined,
    companyRole: r.company_role ?? undefined,
    companySize: (r.company_size as Lead['companySize']) ?? undefined,
    industry: r.industry ?? undefined,
    location: loc,
    budgetRange: r.budget_range ?? undefined,
    timeline: r.timeline ?? undefined,
    painPoints: painPoints.length ? painPoints : undefined,
    qualificationScore: (r.qualification_score as Lead['qualificationScore']) ?? undefined,
    createdAt: r.created_at,
    enrichedAt: r.enriched_at ?? undefined,
    convertedOpportunityId: r.converted_opportunity_id ?? undefined,
  };
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      *,
      lead_tags(tag),
      lead_pain_points(point),
      assignee:profiles!leads_assigned_to_fkey(name)
    `
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as LeadRow[] | null)?.map(rowToLead) ?? [];
}

function leadPatchToColumns(patch: Partial<Lead>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.name !== undefined) out.name = patch.name;
  if (patch.phone !== undefined) out.phone = patch.phone;
  if (patch.email !== undefined) out.email = patch.email;
  if (patch.channel !== undefined) out.channel = channelToDb(patch.channel);
  if (patch.stage !== undefined) out.stage = patch.stage;
  if (patch.aiStatus !== undefined) out.ai_status = patch.aiStatus;
  if (patch.source !== undefined) out.source = patch.source;
  if (patch.notes !== undefined) out.notes = patch.notes;
  if (patch.dealValue !== undefined) out.deal_value = patch.dealValue;
  if (patch.closeDate !== undefined) out.close_date = patch.closeDate || null;
  if (patch.whatsapp !== undefined) out.whatsapp = patch.whatsapp;
  if (patch.instagramHandle !== undefined) out.instagram_handle = patch.instagramHandle;
  if (patch.facebookHandle !== undefined) out.facebook_handle = patch.facebookHandle;
  if (patch.website !== undefined) out.website = patch.website;
  if (patch.linkedin !== undefined) out.linkedin = patch.linkedin;
  if (patch.company !== undefined) out.company = patch.company;
  if (patch.companyRole !== undefined) out.company_role = patch.companyRole;
  if (patch.companySize !== undefined) out.company_size = patch.companySize;
  if (patch.industry !== undefined) out.industry = patch.industry;
  if (patch.budgetRange !== undefined) out.budget_range = patch.budgetRange;
  if (patch.timeline !== undefined) out.timeline = patch.timeline;
  if (patch.qualificationScore !== undefined) out.qualification_score = patch.qualificationScore;
  if (patch.enrichedAt !== undefined) out.enriched_at = patch.enrichedAt;
  if (patch.convertedOpportunityId !== undefined) out.converted_opportunity_id = patch.convertedOpportunityId;
  if (patch.assignedToUserId !== undefined) out.assigned_to = patch.assignedToUserId || null;
  if (patch.location !== undefined) {
    out.country = patch.location?.country ?? null;
    out.city = patch.location?.city ?? null;
  }
  if (patch.lastContact !== undefined && patch.lastContact !== '—' && patch.lastContact !== 'Just now') {
    const t = Date.parse(patch.lastContact);
    if (!Number.isNaN(t)) out.last_contact = new Date(t).toISOString();
  }
  return out;
}

async function replaceLeadTags(leadId: string, tags: string[] | undefined) {
  const supabase = getSupabase();
  await supabase.from('lead_tags').delete().eq('lead_id', leadId);
  if (tags?.length) {
    await supabase.from('lead_tags').insert(tags.map(tag => ({ lead_id: leadId, tag })));
  }
}

async function replaceLeadPainPoints(leadId: string, points: string[] | undefined) {
  const supabase = getSupabase();
  await supabase.from('lead_pain_points').delete().eq('lead_id', leadId);
  if (points?.length) {
    await supabase.from('lead_pain_points').insert(points.map(point => ({ lead_id: leadId, point })));
  }
}

export async function insertLead(
  orgId: string,
  input: {
    name: string;
    phone: string;
    channel: Channel;
    source?: string;
    assignedToUserId: string | null;
  }
): Promise<string> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('leads')
    .insert({
      org_id: orgId,
      name: input.name,
      phone: input.phone,
      channel: channelToDb(input.channel),
      stage: 'new',
      ai_status: 'active',
      assigned_to: input.assignedToUserId,
      source: input.source ?? null,
      qualification_score: 'cold',
      last_contact: now,
    })
    .select('id')
    .single();
  if (error) throw error;
  const leadId = data.id as string;

  const { error: cErr } = await supabase.from('conversations').insert({
    org_id: orgId,
    lead_id: leadId,
    channel: channelToDb(input.channel),
    ai_status: 'active',
    last_message: null,
    last_time: now,
  });
  if (cErr) throw cErr;
  return leadId;
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<void> {
  const supabase = getSupabase();
  const cols = leadPatchToColumns(patch);
  if (Object.keys(cols).length > 0) {
    const { error } = await supabase.from('leads').update(cols).eq('id', id);
    if (error) throw error;
  }
  if (patch.tags !== undefined) await replaceLeadTags(id, patch.tags);
  if (patch.painPoints !== undefined) await replaceLeadPainPoints(id, patch.painPoints);
}
