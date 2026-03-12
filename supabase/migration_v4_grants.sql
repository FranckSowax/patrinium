-- =============================================================================
-- PATRINIUM v4 — Accorder les permissions au role anon et authenticated
-- Necessaire pour que les requetes Supabase fonctionnent sans authentification
-- =============================================================================

-- ─── Permissions sur le schema ──────────────────────────────────────────
grant usage on schema public to anon, authenticated;

-- ─── Permissions sur TOUTES les tables ──────────────────────────────────
grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- ─── Permissions sur les sequences ──────────────────────────────────────
grant usage, select on all sequences in schema public to anon, authenticated;

-- ─── Permissions sur les fonctions RPC ──────────────────────────────────
grant execute on function get_dashboard_stats() to anon, authenticated;
grant execute on function get_biens_par_province() to anon, authenticated;
grant execute on function recherche_globale(text, integer) to anon, authenticated;
grant execute on function calculer_impaye(uuid) to anon, authenticated;

-- Fonction v2 (si elle existe)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'get_patrimoine_global_stats') then
    execute 'grant execute on function get_patrimoine_global_stats() to anon, authenticated';
  end if;
end $$;

-- ─── Permissions par defaut pour futures tables ─────────────────────────
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

alter default privileges in schema public
  grant execute on functions to anon, authenticated;
