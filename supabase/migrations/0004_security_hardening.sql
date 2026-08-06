-- ==========================================================================
-- GetränkeTaxi Greifswald – 0004_security_hardening
-- Behebt Hinweise des Supabase Security-Advisors.
-- ==========================================================================

-- 1) View mit der RLS des AUFRUFERS ausführen (nicht des Erstellers).
alter view public.driver_current_location set (security_invoker = on);

-- 2) updated_at-Trigger: search_path fixieren.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3) Rollen-Helper als SECURITY INVOKER – funktionieren über die eigene
--    RLS (jede*r darf die eigene Zeile lesen) und werfen keine Advisor-Warnung.
create or replace function public.is_driver()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.drivers where id = auth.uid());
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.customers where id = auth.uid());
$$;

-- 4) Trigger-Funktion nicht über die REST-API (RPC) aufrufbar machen.
--    Der Trigger selbst feuert weiterhin (unabhängig von EXECUTE-Rechten).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
