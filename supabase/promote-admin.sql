-- ==============================================================
-- Promote a user to ADMIN by email.
--
-- How to use:
--   1. Replace the email in the `v_target_email` variable below.
--   2. Run the whole script in Supabase → SQL Editor → New query.
--   3. Check the NOTICE at the bottom of the output.
--
-- Safe to re-run: updates `profiles.role` in place, no duplicate rows.
-- The target user must have signed up at least once (we need their
-- auth.users row to exist). If they haven't signed up yet, the script
-- raises a clear error instead of creating orphan rows.
-- ==============================================================

do $$
declare
  v_target_email text := 'REPLACE_WITH_USER_EMAIL@example.com';
  v_user_id      uuid;
  v_org_id       uuid;
begin
  -- 1. Find the auth user.
  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_target_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No auth.users row found for %. Ask them to sign up first.', v_target_email;
  end if;

  -- 2. Make sure a profile row exists (the handle_new_user() trigger usually
  --    creates it on signup, but we guard against legacy rows).
  insert into public.profiles (id, name, email, role)
  values (
    v_user_id,
    split_part(v_target_email, '@', 1),
    v_target_email,
    'admin'
  )
  on conflict (id) do update
    set role = 'admin';

  -- 3. If this user has no org yet, give them one so they can log in.
  select org_id into v_org_id
    from public.profiles
    where id = v_user_id;

  if v_org_id is null then
    insert into public.organizations (name)
      values (split_part(v_target_email, '@', 1) || '''s workspace')
      returning id into v_org_id;

    update public.profiles
      set org_id = v_org_id
      where id = v_user_id;

    -- Seed the per-org defaults the bootstrap RPC normally creates.
    insert into public.refund_policy (org_id)        values (v_org_id) on conflict do nothing;
    insert into public.intervention_settings (org_id) values (v_org_id) on conflict do nothing;
    insert into public.billing (org_id)              values (v_org_id) on conflict do nothing;

    insert into public.automation_agent_configs (org_id, agent_id, agent_name, tone) values
      (v_org_id, 'followup', 'Lead Follow-Up', 'friendly'),
      (v_org_id, 'chat',     'Client Chat',    'professional'),
      (v_org_id, 'tracking', 'Order Tracking', 'direct'),
      (v_org_id, 'refund',   'Refund',         'empathetic')
    on conflict (org_id, agent_id) do nothing;

    insert into public.automation_triggers (org_id, event, agent_id, description) values
      (v_org_id, 'lead.created',           'followup', 'Start follow-up sequence — step 1 sent'),
      (v_org_id, 'lead.replied',           'followup', 'Stop sequence + mark Contacted'),
      (v_org_id, 'message.inbound',        'chat',     'FAQ match / generate reply'),
      (v_org_id, 'order.status_changed',   'tracking', 'Send mapped status message'),
      (v_org_id, 'customer.refund_intent', 'refund',   'Open refund flow'),
      (v_org_id, 'thread.takeover',         null,      'Pause all automation on that thread')
    on conflict (org_id, event) do nothing;
  end if;

  raise notice 'Promoted % (auth id: %, org id: %) to admin.',
    v_target_email, v_user_id, v_org_id;
end$$;
