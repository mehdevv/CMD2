-- Business agents: org slug + profile local_handle + bootstrap + claim slug
-- Run in Supabase SQL Editor or: supabase db push

-- 1. Org slug (internal sign-in namespace: handle@slug.scale)
alter table public.organizations
  add column if not exists slug text;

create unique index if not exists organizations_slug_uidx
  on public.organizations (lower(slug))
  where slug is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'organizations_slug_format_chk'
  ) then
    alter table public.organizations
      add constraint organizations_slug_format_chk
      check (slug is null or slug ~ '^[a-z0-9-]{3,40}$');
  end if;
end $$;

-- 2. Agent handle (unique per org)
alter table public.profiles
  add column if not exists local_handle text;

create unique index if not exists profiles_org_handle_uidx
  on public.profiles (org_id, lower(local_handle))
  where local_handle is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_local_handle_format_chk'
  ) then
    alter table public.profiles
      add constraint profiles_local_handle_format_chk
      check (local_handle is null or local_handle ~ '^[a-z0-9._-]{3,40}$');
  end if;
end $$;

-- 3. Set slug on current org (admin or owner)
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

grant execute on function public.claim_org_slug(text) to authenticated;

-- 4. Bootstrap with optional slug (single function; second param defaults to null)
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

grant execute on function public.bootstrap_my_org(text, text) to authenticated;
