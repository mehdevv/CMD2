-- ==============================================================
-- Scale Software — Supabase schema (MVP)
-- Paste this entire file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
--
-- Covers:
--   * Multi-tenant orgs + role-based profiles (admin / owner / agent)
--   * Leads (with enrichment) → Opportunities (with proposals, payments,
--     qualification, need analysis, stage history)
--   * Conversations + messages (channel-agnostic; channels plug in later)
--   * Meetings (briefs + post-meeting notes)
--   * Templates, business rules, refund policy, invoices, billing
--   * Automation agent configuration for all 4 agents
--     (followup, chat, tracking, refund) with sub-tables for
--     follow-up steps, FAQ, status-message mapping, carrier integration,
--     refund policy rules, triggers matrix, intervention settings
--   * Activity log, notifications, intelligence items, analytics reports
--   * Row-Level Security (RLS) scoped to org_id
--   * Auto-create profile on auth signup
--   * updated_at triggers
--   * Storage buckets for voice notes / proposals / contracts
-- ==============================================================


-- ==============================================================
-- 1. Extensions + helper functions
-- ==============================================================

create extension if not exists "pgcrypto";

-- Auto-updates updated_at columns.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The org / role helper functions are defined AFTER the profiles
-- table below. SQL-language functions are parsed at creation time,
-- so they cannot reference a table that does not yet exist.


-- ==============================================================
-- 2. Organizations + profiles (auth users)
-- ==============================================================

create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text,
  plan          text not null default 'freelancer' check (plan in ('freelancer','ecommerce','edu_centers','custom')),
  timezone      text not null default 'Africa/Algiers',
  currency      text not null default 'DZD',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint organizations_slug_format_chk
    check (slug is null or slug ~ '^[a-z0-9-]{3,40}$')
);

-- `profiles.id` matches `auth.users.id` so RLS can use auth.uid() directly.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid references public.organizations(id) on delete set null,
  role          text not null default 'owner' check (role in ('admin','owner','agent')),
  name          text not null,
  email         text not null,
  local_handle  text,
  status        text not null default 'active' check (status in ('active','invited','inactive')),
  avatar_url    text,
  last_active   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_local_handle_format_chk
    check (local_handle is null or local_handle ~ '^[a-z0-9._-]{3,40}$')
);

create index if not exists profiles_org_idx on public.profiles(org_id);
create unique index if not exists organizations_slug_uidx
  on public.organizations (lower(slug))
  where slug is not null;
create unique index if not exists profiles_org_handle_uidx
  on public.profiles (org_id, lower(local_handle))
  where local_handle is not null;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
-- `bootstrap_my_org` attaches the first org and sets `role = 'owner'`.
-- Promote to platform `admin` only via `supabase/promote-admin.sql` (Scale staff).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper functions used by every RLS policy below. Defined here,
-- after public.profiles exists, because SQL-language functions are
-- parsed against the live schema at creation time.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ==============================================================
-- 3. Channels (placeholder for later WhatsApp/IG/FB integration)
-- ==============================================================

create table if not exists public.channels (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  kind           text not null check (kind in ('whatsapp','instagram','facebook','telegram','tiktok')),
  handle         text,
  status         text not null default 'disconnected' check (status in ('connected','disconnected','error')),
  api_token      text,
  webhook_url    text,
  connected_at   timestamptz,
  today_volume   integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, kind)
);

create index if not exists channels_org_idx on public.channels(org_id);
drop trigger if exists channels_updated_at on public.channels;
create trigger channels_updated_at before update on public.channels
  for each row execute function public.set_updated_at();


-- ==============================================================
-- 4. Billing + invoices
-- ==============================================================

create table if not exists public.billing (
  org_id         uuid primary key references public.organizations(id) on delete cascade,
  plan           text not null default 'freelancer' check (plan in ('freelancer','ecommerce','edu_centers','custom')),
  seats_used     integer not null default 0,
  seats_cap      integer not null default 5,
  messages_used  integer not null default 0,
  messages_cap   integer not null default 10000,
  billing_email  text,
  card_last4     text,
  card_exp       text,
  renewal_date   date,
  updated_at     timestamptz not null default now()
);

drop trigger if exists billing_updated_at on public.billing;
create trigger billing_updated_at before update on public.billing
  for each row execute function public.set_updated_at();

create table if not exists public.invoices (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  invoice_date date not null default current_date,
  description  text not null,
  amount       numeric(12,2) not null,
  status       text not null default 'pending' check (status in ('paid','pending','void')),
  pdf_url      text,
  created_at   timestamptz not null default now()
);

create index if not exists invoices_org_idx on public.invoices(org_id);


-- ==============================================================
-- 5. Leads (with enrichment fields)
-- ==============================================================

create table if not exists public.leads (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid not null references public.organizations(id) on delete cascade,
  assigned_to              uuid references public.profiles(id) on delete set null,

  name                     text not null,
  phone                    text,
  email                    text,
  channel                  text not null default 'whatsapp' check (channel in ('whatsapp','instagram','facebook','other')),
  stage                    text not null default 'new' check (stage in ('new','contacted','qualified','proposal','closed')),
  ai_status                text not null default 'paused' check (ai_status in ('active','paused','completed','escalated')),
  automation_paused        boolean not null default false,

  source                   text,
  notes                    text,
  last_contact             timestamptz,
  deal_value               numeric(12,2),
  close_date               date,

  -- Enrichment
  whatsapp                 text,
  instagram_handle         text,
  facebook_handle          text,
  website                  text,
  linkedin                 text,
  company                  text,
  company_role             text,
  company_size             text check (company_size is null or company_size in ('solo','2-10','11-50','51-200','200+')),
  industry                 text,
  country                  text,
  city                     text,
  budget_range             text,
  timeline                 text,
  qualification_score      text check (qualification_score is null or qualification_score in ('cold','warm','hot')),
  enriched_at              timestamptz,

  converted_opportunity_id uuid,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists leads_org_idx     on public.leads(org_id);
create index if not exists leads_stage_idx   on public.leads(org_id, stage);
create index if not exists leads_owner_idx   on public.leads(assigned_to);
drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

create table if not exists public.lead_tags (
  lead_id uuid not null references public.leads(id) on delete cascade,
  tag     text not null,
  primary key (lead_id, tag)
);

create table if not exists public.lead_pain_points (
  id        uuid primary key default gen_random_uuid(),
  lead_id   uuid not null references public.leads(id) on delete cascade,
  point     text not null,
  created_at timestamptz not null default now()
);


-- ==============================================================
-- 6. Conversations + messages
-- ==============================================================

create table if not exists public.conversations (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  lead_id            uuid not null references public.leads(id) on delete cascade,
  channel            text not null check (channel in ('whatsapp','instagram','facebook','other')),
  ai_status          text not null default 'paused' check (ai_status in ('active','paused','completed','escalated')),
  automation_paused  boolean not null default false,
  assigned_to        uuid references public.profiles(id) on delete set null,
  last_message       text,
  last_time          timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists conversations_org_idx   on public.conversations(org_id);
create index if not exists conversations_lead_idx  on public.conversations(lead_id);
drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  org_id          uuid not null references public.organizations(id) on delete cascade,
  sender          text not null check (sender in ('ai','agent','contact')),
  sender_name     text not null,
  content         text not null,
  status          text check (status is null or status in ('sent','delivered','read')),
  created_at      timestamptz not null default now()
);

create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);


-- ==============================================================
-- 7. Opportunities (+ children)
-- ==============================================================

create table if not exists public.opportunities (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references public.organizations(id) on delete cascade,
  lead_id                uuid references public.leads(id) on delete set null,
  owner_id               uuid references public.profiles(id) on delete set null,

  name                   text not null,
  company                text,
  contact_name           text not null,
  channel                text not null check (channel in ('whatsapp','instagram','facebook','other')),

  stage                  text not null default 'qualification' check (stage in ('qualification','need_analysis','proposal','negotiation','closing','won','lost')),
  outcome                text not null default 'open' check (outcome in ('won','lost','open')),
  value                  numeric(12,2) not null default 0,
  currency               text not null default 'DZD',
  expected_close_date    date,
  probability            integer,

  payment_status         text not null default 'pending' check (payment_status in ('pending','partially_paid','paid','refunded')),
  loss_reason            text check (loss_reason is null or loss_reason in ('price','competitor','no_budget','no_decision','timing','not_a_fit','other')),
  loss_detail            text,
  won_detail             text,

  next_step_at           timestamptz,
  next_step_text         text,

  contract_url           text,
  onboarding_owner_id    uuid references public.profiles(id),
  onboarding_date        date,
  onboarding_notes       text,

  stage_entered_at       timestamptz not null default now(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists opportunities_org_idx   on public.opportunities(org_id);
create index if not exists opportunities_stage_idx on public.opportunities(org_id, stage);
create index if not exists opportunities_owner_idx on public.opportunities(owner_id);
drop trigger if exists opportunities_updated_at on public.opportunities;
create trigger opportunities_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();

-- Close the loop from leads → opportunities (one-to-one converted link).
alter table public.leads
  drop constraint if exists leads_converted_opportunity_fk;
alter table public.leads
  add constraint leads_converted_opportunity_fk
  foreign key (converted_opportunity_id)
  references public.opportunities(id) on delete set null;

create table if not exists public.opportunity_tags (
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  tag            text not null,
  primary key (opportunity_id, tag)
);

create table if not exists public.opportunity_qualification (
  opportunity_id         uuid primary key references public.opportunities(id) on delete cascade,
  budget                 text,
  authority              text,
  need                   text,
  timeline               text,
  updated_at             timestamptz not null default now()
);

drop trigger if exists opp_qual_updated_at on public.opportunity_qualification;
create trigger opp_qual_updated_at before update on public.opportunity_qualification
  for each row execute function public.set_updated_at();

create table if not exists public.opportunity_competing_solutions (
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  solution       text not null,
  primary key (opportunity_id, solution)
);

create table if not exists public.opportunity_risk_flags (
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  flag           text not null,
  primary key (opportunity_id, flag)
);

create table if not exists public.opportunity_need_analysis (
  opportunity_id    uuid primary key references public.opportunities(id) on delete cascade,
  summary           text,
  proposed_solution text,
  updated_at        timestamptz not null default now()
);

drop trigger if exists opp_need_updated_at on public.opportunity_need_analysis;
create trigger opp_need_updated_at before update on public.opportunity_need_analysis
  for each row execute function public.set_updated_at();

create table if not exists public.opportunity_goals (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  label          text not null
);

create table if not exists public.opportunity_metrics_to_move (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  label          text not null
);

create table if not exists public.opportunity_decision_criteria (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  label          text not null
);

create table if not exists public.opportunity_stakeholders (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  name           text not null,
  role           text not null
);

create table if not exists public.proposals (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  version        integer not null default 1,
  title          text not null,
  value          numeric(12,2) not null,
  currency       text not null default 'DZD',
  valid_until    date,
  file_url       text,
  link_url       text,
  notes          text,
  status         text not null default 'draft' check (status in ('draft','sent','accepted','rejected','superseded')),
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists proposals_opp_idx on public.proposals(opportunity_id);

create table if not exists public.proposal_line_items (
  id           uuid primary key default gen_random_uuid(),
  proposal_id  uuid not null references public.proposals(id) on delete cascade,
  name         text not null,
  qty          numeric(10,2) not null default 1,
  unit_price   numeric(12,2) not null default 0,
  discount_pct numeric(5,2) not null default 0
);

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  amount         numeric(12,2) not null,
  method         text not null check (method in ('cash','bank_transfer','cheque','card','other')),
  reference      text,
  received_at    timestamptz,
  due_date       date,
  status         text not null default 'pending' check (status in ('pending','partially_paid','paid','refunded')),
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists payments_opp_idx on public.payments(opportunity_id);

create table if not exists public.opportunity_stage_transitions (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  from_stage     text not null,
  to_stage       text not null,
  at             timestamptz not null default now(),
  by             uuid references public.profiles(id) on delete set null,
  note           text
);

create index if not exists opp_transitions_opp_idx on public.opportunity_stage_transitions(opportunity_id, at desc);

create table if not exists public.opportunity_objections (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  at             timestamptz not null default now(),
  note           text not null,
  value_delta    numeric(12,2)
);


-- ==============================================================
-- 8. Meetings (briefs + notes)
-- ==============================================================

create table if not exists public.meeting_briefs (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  lead_id          uuid references public.leads(id) on delete set null,
  opportunity_id   uuid references public.opportunities(id) on delete set null,
  deal_stage       text,
  deal_value       numeric(12,2),
  meeting_time     timestamptz,
  history_context  text,
  open_deals       text,
  risk_flags       text[] not null default '{}',
  talking_points   text[] not null default '{}',
  created_at       timestamptz not null default now()
);

create index if not exists meeting_briefs_org_idx on public.meeting_briefs(org_id);

create table if not exists public.meeting_notes (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  lead_id          uuid references public.leads(id) on delete set null,
  opportunity_id   uuid references public.opportunities(id) on delete set null,
  summary          text,
  objections       text[] not null default '{}',
  opportunities_found text[] not null default '{}',
  next_steps       text[] not null default '{}',
  voice_file_url   text,
  created_at       timestamptz not null default now()
);

create index if not exists meeting_notes_org_idx on public.meeting_notes(org_id);


-- ==============================================================
-- 9. Templates, business rules, refund policy
-- ==============================================================

create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  channel    text not null check (channel in ('whatsapp','instagram','facebook','other')),
  body       text not null,
  status     text not null default 'pending' check (status in ('approved','pending','rejected')),
  used_in    integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_org_idx on public.templates(org_id);
drop trigger if exists templates_updated_at on public.templates;
create trigger templates_updated_at before update on public.templates
  for each row execute function public.set_updated_at();

create table if not exists public.rules (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  condition  text not null,
  value      text not null,
  action     text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.refund_policy (
  org_id                 uuid primary key references public.organizations(id) on delete cascade,
  window_days            integer not null default 14,
  auto_approve_max       numeric(12,2) not null default 0,
  proof_required         boolean not null default true,
  partial_refund_allowed boolean not null default true,
  updated_at             timestamptz not null default now()
);

drop trigger if exists refund_policy_updated_at on public.refund_policy;
create trigger refund_policy_updated_at before update on public.refund_policy
  for each row execute function public.set_updated_at();


-- ==============================================================
-- 10. Automation agents (configuration)
-- One row per (org, agent_id). Agent ids: followup | chat | tracking | refund.
-- ==============================================================

create table if not exists public.automation_agent_configs (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  agent_id           text not null check (agent_id in ('followup','chat','tracking','refund')),
  enabled            boolean not null default false,

  -- LLM (admin only)
  provider           text check (provider is null or provider in ('openai','anthropic','google','custom')),
  api_key            text,
  model              text,
  temperature        numeric(3,2),
  max_tokens         integer,
  max_response_sec   integer,
  holding_message    text,

  -- Personality / prompts (owner-editable)
  agent_name         text,
  tone               text check (tone is null or tone in ('professional','friendly','direct','empathetic','minimal','custom')),
  emoji_level        text check (emoji_level is null or emoji_level in ('none','low','medium','high')),
  mirror_energy      boolean not null default false,
  language           text default 'en',
  system_prompt      text,
  opening_message    text,
  business_context   text,

  -- Refund-agent defaults (mirrors public.refund_policy but per-agent override)
  policy_window_days integer,
  policy_auto_max    numeric(12,2),
  policy_proof       boolean,
  policy_partial     boolean,

  -- Tracking-agent defaults
  satisfaction_check boolean not null default false,
  unsatisfied_kw     text[] default '{}',

  -- Metrics hints / extra settings that are specific to one agent
  extra              jsonb not null default '{}'::jsonb,

  last_edited_by     uuid references public.profiles(id),
  last_edited_at     timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (org_id, agent_id)
);

create index if not exists agent_configs_org_idx on public.automation_agent_configs(org_id);
drop trigger if exists agent_configs_updated_at on public.automation_agent_configs;
create trigger agent_configs_updated_at before update on public.automation_agent_configs
  for each row execute function public.set_updated_at();

create table if not exists public.agent_forbidden_topics (
  agent_config_id uuid not null references public.automation_agent_configs(id) on delete cascade,
  topic           text not null,
  primary key (agent_config_id, topic)
);

-- Follow-up agent: ordered message sequence.
create table if not exists public.followup_steps (
  id                uuid primary key default gen_random_uuid(),
  agent_config_id   uuid not null references public.automation_agent_configs(id) on delete cascade,
  position          integer not null,
  delay_value       integer not null default 1,
  delay_unit        text not null default 'hours' check (delay_unit in ('minutes','hours','days')),
  message_mode      text not null default 'template' check (message_mode in ('template','generated','hybrid')),
  template_id       uuid references public.templates(id) on delete set null,
  instruction       text,
  channels          text[] not null default '{}',
  send_window_start text,
  send_window_end   text,
  stop_conditions   jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists followup_steps_agent_idx on public.followup_steps(agent_config_id, position);
drop trigger if exists followup_steps_updated_at on public.followup_steps;
create trigger followup_steps_updated_at before update on public.followup_steps
  for each row execute function public.set_updated_at();

-- Chat agent: knowledge base Q/A.
create table if not exists public.faq_entries (
  id              uuid primary key default gen_random_uuid(),
  agent_config_id uuid not null references public.automation_agent_configs(id) on delete cascade,
  category        text,
  question        text not null,
  answer          text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists faq_entries_agent_idx on public.faq_entries(agent_config_id);
drop trigger if exists faq_entries_updated_at on public.faq_entries;
create trigger faq_entries_updated_at before update on public.faq_entries
  for each row execute function public.set_updated_at();

-- Tracking agent: carrier integration + status-message map.
create table if not exists public.carrier_integrations (
  agent_config_id uuid primary key references public.automation_agent_configs(id) on delete cascade,
  base_url        text,
  api_key         text,
  auth_type       text,
  mode            text check (mode is null or mode in ('polling','webhook')),
  order_id_field  text,
  updated_at      timestamptz not null default now()
);

drop trigger if exists carrier_updated_at on public.carrier_integrations;
create trigger carrier_updated_at before update on public.carrier_integrations
  for each row execute function public.set_updated_at();

create table if not exists public.status_messages (
  id              uuid primary key default gen_random_uuid(),
  agent_config_id uuid not null references public.automation_agent_configs(id) on delete cascade,
  internal_code   text not null check (internal_code in ('confirmed','shipped','out_for_delivery','delivered','failed','returned','on_hold','other')),
  customer_message text not null,
  enabled         boolean not null default true,
  escalation_flag boolean not null default false,
  unique (agent_config_id, internal_code)
);

-- Refund agent: policy rules (IF/THEN).
create table if not exists public.policy_rules (
  id              uuid primary key default gen_random_uuid(),
  agent_config_id uuid not null references public.automation_agent_configs(id) on delete cascade,
  condition       text not null,
  comparator      text not null,
  value           text not null,
  action          text not null check (action in ('auto_approve','escalate','reject')),
  position        integer not null default 0
);

create table if not exists public.refund_decisions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  agent_config_id uuid references public.automation_agent_configs(id) on delete set null,
  lead_id         uuid references public.leads(id) on delete set null,
  opportunity_id  uuid references public.opportunities(id) on delete set null,
  decision        text not null check (decision in ('auto_approve','escalate','reject')),
  amount          numeric(12,2),
  reason          text,
  decided_at      timestamptz not null default now()
);

create index if not exists refund_decisions_org_idx on public.refund_decisions(org_id, decided_at desc);


-- ==============================================================
-- 11. Triggers matrix, human intervention, activity log
-- ==============================================================

create table if not exists public.automation_triggers (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  event         text not null,
  agent_id      text check (agent_id is null or agent_id in ('followup','chat','tracking','refund')),
  enabled       boolean not null default true,
  description   text,
  extra         jsonb not null default '{}'::jsonb,
  unique (org_id, event)
);

create table if not exists public.intervention_settings (
  org_id                   uuid primary key references public.organizations(id) on delete cascade,
  reasons                  text[] not null default '{}',
  confidence_threshold     numeric(3,2) not null default 0.70,
  instant_keywords         text[] not null default '{}',
  notify_channels          text[] not null default '{}',
  recipients               uuid[] not null default '{}',
  urgent_template          text,
  pause_after_escalation   boolean not null default true,
  allow_auto_resume        boolean not null default false,
  cooldown_hours           integer not null default 2,
  updated_at               timestamptz not null default now()
);

drop trigger if exists intervention_updated_at on public.intervention_settings;
create trigger intervention_updated_at before update on public.intervention_settings
  for each row execute function public.set_updated_at();

create table if not exists public.automation_activity_log (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  kind       text not null check (kind in ('sequence','escalation','refund','tracking','chat','enrichment','opportunity','report','other')),
  agent_id   text,
  lead_id    uuid references public.leads(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  summary    text not null,
  payload    jsonb not null default '{}'::jsonb,
  at         timestamptz not null default now()
);

create index if not exists activity_log_org_idx on public.automation_activity_log(org_id, at desc);


-- ==============================================================
-- 12. Intelligence items + analytics reports
-- ==============================================================

create table if not exists public.intelligence_items (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  kind       text not null check (kind in ('objection','opportunity','risk')),
  headline   text not null,
  detail     text,
  frequency  integer,
  lead_id    uuid references public.leads(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists intelligence_org_idx on public.intelligence_items(org_id, kind);

create table if not exists public.analytics_reports (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid references public.profiles(id) on delete set null,
  question        text not null,
  summary         text,
  filters         jsonb not null default '{}'::jsonb,
  sections        jsonb not null default '[]'::jsonb,
  recommendations text[] not null default '{}',
  status          text not null default 'ready' check (status in ('draft','ready','error')),
  source          text not null default 'mock' check (source in ('mock','llm')),
  share_slug      text unique,
  created_at      timestamptz not null default now()
);

create index if not exists analytics_reports_org_idx on public.analytics_reports(org_id, created_at desc);


-- ==============================================================
-- 13. Notifications
-- ==============================================================

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  kind         text not null,
  title        text not null,
  body         text,
  read         boolean not null default false,
  url          text,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications(recipient_id, read, created_at desc);


-- ==============================================================
-- 14. Row Level Security
-- Every tenant table: an authenticated user can act on rows whose
-- org_id matches their profile's org_id. The client-side filters
-- (agents only see their own leads/opps in list views) are applied
-- in SQL SELECT clauses, not here — RLS guarantees multi-tenancy,
-- not role policy.
-- ==============================================================

alter table public.organizations     enable row level security;
alter table public.profiles          enable row level security;
alter table public.channels          enable row level security;
alter table public.billing           enable row level security;
alter table public.invoices          enable row level security;
alter table public.leads             enable row level security;
alter table public.lead_tags         enable row level security;
alter table public.lead_pain_points  enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.opportunities     enable row level security;
alter table public.opportunity_tags  enable row level security;
alter table public.opportunity_qualification     enable row level security;
alter table public.opportunity_competing_solutions enable row level security;
alter table public.opportunity_risk_flags        enable row level security;
alter table public.opportunity_need_analysis     enable row level security;
alter table public.opportunity_goals             enable row level security;
alter table public.opportunity_metrics_to_move   enable row level security;
alter table public.opportunity_decision_criteria enable row level security;
alter table public.opportunity_stakeholders      enable row level security;
alter table public.proposals                     enable row level security;
alter table public.proposal_line_items           enable row level security;
alter table public.payments                      enable row level security;
alter table public.opportunity_stage_transitions enable row level security;
alter table public.opportunity_objections        enable row level security;
alter table public.meeting_briefs                enable row level security;
alter table public.meeting_notes                 enable row level security;
alter table public.templates                     enable row level security;
alter table public.rules                         enable row level security;
alter table public.refund_policy                 enable row level security;
alter table public.automation_agent_configs     enable row level security;
alter table public.agent_forbidden_topics        enable row level security;
alter table public.followup_steps                enable row level security;
alter table public.faq_entries                   enable row level security;
alter table public.carrier_integrations          enable row level security;
alter table public.status_messages               enable row level security;
alter table public.policy_rules                  enable row level security;
alter table public.refund_decisions              enable row level security;
alter table public.automation_triggers           enable row level security;
alter table public.intervention_settings         enable row level security;
alter table public.automation_activity_log       enable row level security;
alter table public.intelligence_items            enable row level security;
alter table public.analytics_reports             enable row level security;
alter table public.notifications                 enable row level security;

-- ----- organizations -----
drop policy if exists "org readable by members" on public.organizations;
create policy "org readable by members" on public.organizations
  for select using (id = public.current_org_id());

drop policy if exists "org updatable by admin" on public.organizations;
create policy "org updatable by admin" on public.organizations
  for update using (id = public.current_org_id() and public.current_role() in ('admin','owner'))
  with check  (id = public.current_org_id() and public.current_role() in ('admin','owner'));

-- ----- profiles -----
drop policy if exists "profiles readable in same org" on public.profiles;
create policy "profiles readable in same org" on public.profiles
  for select using (org_id = public.current_org_id() or id = auth.uid());

drop policy if exists "profiles updatable by self or admin" on public.profiles;
create policy "profiles updatable by self or admin" on public.profiles
  for update using (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  )
  with check (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  );

drop policy if exists "profiles insertable by admin" on public.profiles;
create policy "profiles insertable by admin" on public.profiles
  for insert with check (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'));


-- Generic helper: apply the standard org-scoped policies to a table
-- (use-once expansion below — PostgreSQL does not have policy macros).
-- For each tenant table we grant full CRUD to org members.

-- ----- channels -----
drop policy if exists channels_rw on public.channels;
create policy channels_rw on public.channels for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- billing -----
drop policy if exists billing_rw on public.billing;
create policy billing_rw on public.billing for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- invoices -----
drop policy if exists invoices_rw on public.invoices;
create policy invoices_rw on public.invoices for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- leads + children -----
drop policy if exists leads_rw on public.leads;
create policy leads_rw on public.leads for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists lead_tags_rw on public.lead_tags;
create policy lead_tags_rw on public.lead_tags for all
  using (exists (select 1 from public.leads l where l.id = lead_tags.lead_id and l.org_id = public.current_org_id()))
  with check (exists (select 1 from public.leads l where l.id = lead_tags.lead_id and l.org_id = public.current_org_id()));

drop policy if exists lead_pain_rw on public.lead_pain_points;
create policy lead_pain_rw on public.lead_pain_points for all
  using (exists (select 1 from public.leads l where l.id = lead_pain_points.lead_id and l.org_id = public.current_org_id()))
  with check (exists (select 1 from public.leads l where l.id = lead_pain_points.lead_id and l.org_id = public.current_org_id()));

-- ----- conversations + messages -----
drop policy if exists conversations_rw on public.conversations;
create policy conversations_rw on public.conversations for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists messages_rw on public.messages;
create policy messages_rw on public.messages for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- opportunities + all child tables -----
drop policy if exists opportunities_rw on public.opportunities;
create policy opportunities_rw on public.opportunities for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- opportunity_* children use parent link
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'opportunity_tags',
      'opportunity_qualification',
      'opportunity_competing_solutions',
      'opportunity_risk_flags',
      'opportunity_need_analysis',
      'opportunity_goals',
      'opportunity_metrics_to_move',
      'opportunity_decision_criteria',
      'opportunity_stakeholders',
      'proposals',
      'payments',
      'opportunity_stage_transitions',
      'opportunity_objections'
    ])
  loop
    execute format('drop policy if exists %I_rw on public.%I', t, t);
    execute format($f$
      create policy %I_rw on public.%I for all
        using (exists (select 1 from public.opportunities o
                       where o.id = %I.opportunity_id
                         and o.org_id = public.current_org_id()))
        with check (exists (select 1 from public.opportunities o
                            where o.id = %I.opportunity_id
                              and o.org_id = public.current_org_id()))
    $f$, t, t, t, t);
  end loop;
end$$;

drop policy if exists proposal_items_rw on public.proposal_line_items;
create policy proposal_items_rw on public.proposal_line_items for all
  using (exists (
    select 1 from public.proposals p
    join public.opportunities o on o.id = p.opportunity_id
    where p.id = proposal_line_items.proposal_id
      and o.org_id = public.current_org_id()))
  with check (exists (
    select 1 from public.proposals p
    join public.opportunities o on o.id = p.opportunity_id
    where p.id = proposal_line_items.proposal_id
      and o.org_id = public.current_org_id()));

-- ----- meetings -----
drop policy if exists meeting_briefs_rw on public.meeting_briefs;
create policy meeting_briefs_rw on public.meeting_briefs for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists meeting_notes_rw on public.meeting_notes;
create policy meeting_notes_rw on public.meeting_notes for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- templates / rules / refund_policy -----
drop policy if exists templates_rw on public.templates;
create policy templates_rw on public.templates for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists rules_rw on public.rules;
create policy rules_rw on public.rules for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists refund_policy_rw on public.refund_policy;
create policy refund_policy_rw on public.refund_policy for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- agent configs + children -----
drop policy if exists agent_configs_rw on public.automation_agent_configs;
create policy agent_configs_rw on public.automation_agent_configs for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'agent_forbidden_topics',
      'followup_steps',
      'faq_entries',
      'carrier_integrations',
      'status_messages',
      'policy_rules'
    ])
  loop
    execute format('drop policy if exists %I_rw on public.%I', t, t);
    execute format($f$
      create policy %I_rw on public.%I for all
        using (exists (select 1 from public.automation_agent_configs a
                       where a.id = %I.agent_config_id
                         and a.org_id = public.current_org_id()))
        with check (exists (select 1 from public.automation_agent_configs a
                            where a.id = %I.agent_config_id
                              and a.org_id = public.current_org_id()))
    $f$, t, t, t, t);
  end loop;
end$$;

drop policy if exists refund_decisions_rw on public.refund_decisions;
create policy refund_decisions_rw on public.refund_decisions for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- triggers / intervention / activity -----
drop policy if exists auto_triggers_rw on public.automation_triggers;
create policy auto_triggers_rw on public.automation_triggers for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists intervention_rw on public.intervention_settings;
create policy intervention_rw on public.intervention_settings for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists activity_log_rw on public.automation_activity_log;
create policy activity_log_rw on public.automation_activity_log for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- intelligence / reports -----
drop policy if exists intelligence_rw on public.intelligence_items;
create policy intelligence_rw on public.intelligence_items for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

drop policy if exists reports_rw on public.analytics_reports;
create policy reports_rw on public.analytics_reports for all
  using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id());

-- ----- notifications -----
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select using (
    recipient_id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  );

drop policy if exists notifications_write on public.notifications;
create policy notifications_write on public.notifications
  for insert with check (org_id = public.current_org_id());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (
    recipient_id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  )
  with check (
    recipient_id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  );


-- ==============================================================
-- 15. Storage buckets (run after the schema; these use storage.* RPC)
-- ==============================================================

insert into storage.buckets (id, name, public)
values
  ('proposals', 'proposals', false),
  ('contracts', 'contracts', false),
  ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;

-- Storage RLS (one policy family shared by all 3 private buckets).
-- The object's first folder segment is the org_id — clients must upload
-- to `<bucket>/<org_id>/<anything>` for this to pass.
drop policy if exists "scale objects read" on storage.objects;
create policy "scale objects read" on storage.objects
  for select using (
    bucket_id in ('proposals','contracts','voice-notes')
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "scale objects write" on storage.objects;
create policy "scale objects write" on storage.objects
  for insert with check (
    bucket_id in ('proposals','contracts','voice-notes')
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "scale objects update" on storage.objects;
create policy "scale objects update" on storage.objects
  for update using (
    bucket_id in ('proposals','contracts','voice-notes')
    and (storage.foldername(name))[1] = public.current_org_id()::text
  ) with check (
    bucket_id in ('proposals','contracts','voice-notes')
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "scale objects delete" on storage.objects;
create policy "scale objects delete" on storage.objects
  for delete using (
    bucket_id in ('proposals','contracts','voice-notes')
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );


-- ==============================================================
-- 16. Seed helpers (optional — no mock rows; only defaults on first login)
-- Run this block AFTER your first user signs up. It:
--   1. Creates the "My Business" org if none exists for the user.
--   2. Attaches the user + promotes to admin.
--   3. Creates default refund_policy, intervention_settings, 4 empty
--      agent_configs, and the default triggers matrix.
-- Paste this at the bottom and rerun safely.
-- ==============================================================

create or replace function public.claim_org_slug(new_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role    text := public.current_role();
  v_org_id  uuid := public.current_org_id();
  v_clean   text := lower(trim(new_slug));
begin
  if v_org_id is null then
    raise exception 'No organization';
  end if;
  if v_role is null or v_role not in ('admin', 'owner') then
    raise exception 'Only admins and owners can set the business address';
  end if;
  if v_clean !~ '^[a-z0-9-]{3,40}$' then
    raise exception 'Slug must be 3-40 characters: lowercase letters, digits, and hyphens only';
  end if;

  update public.organizations
     set slug = v_clean
   where id = v_org_id;
exception
  when unique_violation then
    raise exception 'That business address is already taken';
end;
$$;

drop function if exists public.bootstrap_my_org(text);
drop function if exists public.bootstrap_my_org(text, text);

create function public.bootstrap_my_org(org_name text default 'My Business', org_slug text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
  v_slug    text;
begin
  if v_user_id is null then
    raise exception 'Must be signed in';
  end if;

  select org_id into v_org_id from public.profiles where id = v_user_id;
  if v_org_id is not null then
    return v_org_id;
  end if;

  insert into public.organizations (name) values (org_name) returning id into v_org_id;

  -- Business sign-up: first user is **owner** (tenant). Reserve `admin` for Scale
  -- platform operators (see `supabase/promote-admin.sql`).
  update public.profiles
    set org_id = v_org_id, role = 'owner'
    where id = v_user_id;

  if org_slug is not null and trim(org_slug) <> '' then
    v_slug := lower(trim(org_slug));
    if v_slug !~ '^[a-z0-9-]{3,40}$' then
      raise exception 'Invalid business address format';
    end if;
    begin
      update public.organizations
         set slug = v_slug
       where id = v_org_id;
    exception
      when unique_violation then
        raise exception 'That business address is already taken';
    end;
  end if;

  insert into public.refund_policy (org_id) values (v_org_id) on conflict do nothing;
  insert into public.intervention_settings (org_id) values (v_org_id) on conflict do nothing;
  insert into public.billing (org_id) values (v_org_id) on conflict do nothing;

  insert into public.automation_agent_configs (org_id, agent_id, agent_name, tone)
  values
    (v_org_id, 'followup', 'Lead Follow-Up',  'friendly'),
    (v_org_id, 'chat',     'Client Chat',     'professional'),
    (v_org_id, 'tracking', 'Order Tracking',  'direct'),
    (v_org_id, 'refund',   'Refund',          'empathetic')
  on conflict (org_id, agent_id) do nothing;

  insert into public.automation_triggers (org_id, event, agent_id, description) values
    (v_org_id, 'lead.created',            'followup', 'Start follow-up sequence — step 1 sent'),
    (v_org_id, 'lead.replied',            'followup', 'Stop sequence + mark Contacted'),
    (v_org_id, 'message.inbound',         'chat',     'FAQ match / generate reply'),
    (v_org_id, 'order.status_changed',    'tracking', 'Send mapped status message'),
    (v_org_id, 'customer.refund_intent',  'refund',   'Open refund flow'),
    (v_org_id, 'thread.takeover',          null,      'Pause all automation on that thread')
  on conflict (org_id, event) do nothing;

  return v_org_id;
end;
$$;

grant execute on function public.claim_org_slug(text) to authenticated;
grant execute on function public.bootstrap_my_org(text, text) to authenticated;

-- Done. Tables, RLS, triggers, storage and bootstrap RPC are ready.
