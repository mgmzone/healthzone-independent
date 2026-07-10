-- Prevent privilege escalation via profiles.is_admin.
--
-- The `authenticated` role holds a TABLE-level UPDATE grant on public.profiles,
-- and the only UPDATE RLS policy is `USING (auth.uid() = id)` with no column
-- scoping. That let any logged-in user run
--   update profiles set is_admin = true where id = auth.uid()
-- and satisfy the policy (still their own row), escalating to full admin — which
-- unlocks admin-delete-user, admin-set-user-ban, and every admin analytics RPC.
--
-- A column-level REVOKE does NOT help while a table-level UPDATE grant exists
-- (Postgres table privileges cover all columns), so we guard the column with a
-- BEFORE UPDATE trigger instead. SECURITY INVOKER (the default) is required so
-- current_user reflects the caller's effective role (authenticated / service_role)
-- rather than the function owner.

create or replace function public.prevent_privileged_profile_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- service_role (edge functions), postgres and supabase_admin (migrations /
  -- dashboard) may legitimately set is_admin. Regular users may not.
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    if new.is_admin is distinct from old.is_admin then
      raise exception 'not authorized to modify is_admin'
        using errcode = '42501'; -- insufficient_privilege
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_privileged_profile_changes on public.profiles;
create trigger trg_prevent_privileged_profile_changes
  before update on public.profiles
  for each row
  execute function public.prevent_privileged_profile_changes();
