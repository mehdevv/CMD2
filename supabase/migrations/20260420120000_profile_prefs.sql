-- Profile preferences, notification prefs, org branding, avatars bucket + RPCs.

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb,
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;

alter table public.organizations
  add column if not exists branding jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- RPCs: safe merges for profile fields (self only).
-- ---------------------------------------------------------------------------

create or replace function public.update_my_profile(new_name text default null, new_prefs jsonb default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;

  update public.profiles
     set name = case
           when new_name is null then name
           when trim(new_name) = '' then name
           else trim(new_name)
         end,
         preferences = case
           when new_prefs is null then preferences
           else coalesce(preferences, '{}'::jsonb) || new_prefs
         end
   where id = auth.uid();
end;
$$;

create or replace function public.set_my_notification_prefs(delta jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare out jsonb;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;

  update public.profiles
     set notification_prefs = coalesce(notification_prefs, '{}'::jsonb) || coalesce(delta, '{}'::jsonb)
   where id = auth.uid()
  returning notification_prefs into out;

  return coalesce(out, '{}'::jsonb);
end;
$$;

grant execute on function public.update_my_profile(text, jsonb) to authenticated;
grant execute on function public.set_my_notification_prefs(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public avatars bucket, org-scoped paths: <org_id>/profiles/<...>
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars objects read" on storage.objects;
create policy "avatars objects read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars objects write" on storage.objects;
create policy "avatars objects write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "avatars objects update" on storage.objects;
create policy "avatars objects update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  ) with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

drop policy if exists "avatars objects delete" on storage.objects;
create policy "avatars objects delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );
