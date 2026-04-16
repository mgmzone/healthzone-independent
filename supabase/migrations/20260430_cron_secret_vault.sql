-- Migration: Store CRON_SECRET in Supabase Vault and expose a
-- security-definer helper that reads it. Replaces the prior approach of
-- hardcoding the bearer token inline in pg_cron commands and the
-- handle_new_user trigger.
--
-- Out-of-band setup (NOT in this file, one-time per environment):
--   select vault.create_secret('<SECRET>', 'cron_secret', 'Shared secret for cron-triggered edge functions');
-- and a matching `supabase secrets set CRON_SECRET=<SECRET>` so the edge
-- function env agrees with Vault.
--
-- The helper below is revoked from anon/authenticated so only the postgres
-- role (i.e. triggers and pg_cron running as superuser) can read the value.

create or replace function public.get_cron_secret()
returns text
language plpgsql
security definer
set search_path = 'public', 'vault'
as $$
declare secret text;
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'cron_secret' limit 1;
  return secret;
end;
$$;

revoke execute on function public.get_cron_secret() from public;
revoke execute on function public.get_cron_secret() from anon;
revoke execute on function public.get_cron_secret() from authenticated;

comment on function public.get_cron_secret() is 'Returns the CRON_SECRET stored in Supabase Vault. Used by pg_net calls in triggers and pg_cron jobs so no bearer token is embedded in committed migrations.';
