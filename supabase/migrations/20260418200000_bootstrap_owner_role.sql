-- Business sign-ups were incorrectly assigned `profiles.role = 'admin'` because
-- `bootstrap_my_org` matched the DB name "org admin" but the app routes `admin`
-- to the Scale **platform** shell. Org creators should be `owner`.

-- 1. Replace bootstrap function (same body as schema.sql; role = owner)
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

-- 2. RLS: owners need the same org-level profile + notification access as tenant admins
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

drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select using (
    recipient_id = auth.uid()
    or (org_id = public.current_org_id() and public.current_role() in ('admin', 'owner'))
  );

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
