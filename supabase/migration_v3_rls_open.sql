-- =============================================================================
-- PATRINIUM v3 — Ouvrir les politiques RLS pour l'acces anonyme (dev/demo)
-- A REMPLACER par une authentification complete en production
-- =============================================================================

-- Supprimer les anciennes politiques SELECT restrictives
-- et les remplacer par des politiques ouvertes

-- ─── Provinces & Ministeres (referentiels, pas de RLS) ───────────────
-- Ces tables n'ont pas de RLS, donc pas besoin de modification

-- ─── Biens Immobiliers ───────────────────────────────────────────────
drop policy if exists "biens_immo_select" on biens_immobiliers;
create policy "biens_immo_select" on biens_immobiliers for select using (true);

drop policy if exists "biens_immo_insert" on biens_immobiliers;
create policy "biens_immo_insert" on biens_immobiliers for insert with check (true);

drop policy if exists "biens_immo_update" on biens_immobiliers;
create policy "biens_immo_update" on biens_immobiliers for update using (true);

drop policy if exists "biens_immo_delete" on biens_immobiliers;
create policy "biens_immo_delete" on biens_immobiliers for delete using (true);

-- ─── Biens Mobiliers ────────────────────────────────────────────────
drop policy if exists "biens_mob_select" on biens_mobiliers;
create policy "biens_mob_select" on biens_mobiliers for select using (true);

drop policy if exists "biens_mob_insert" on biens_mobiliers;
create policy "biens_mob_insert" on biens_mobiliers for insert with check (true);

drop policy if exists "biens_mob_update" on biens_mobiliers;
create policy "biens_mob_update" on biens_mobiliers for update using (true);

drop policy if exists "biens_mob_delete" on biens_mobiliers;
create policy "biens_mob_delete" on biens_mobiliers for delete using (true);

-- ─── Affectations ───────────────────────────────────────────────────
drop policy if exists "affectations_select" on affectations;
create policy "affectations_select" on affectations for select using (true);

drop policy if exists "affectations_insert" on affectations;
create policy "affectations_insert" on affectations for insert with check (true);

drop policy if exists "affectations_update" on affectations;
create policy "affectations_update" on affectations for update using (true);

-- ─── Demandes Intervention ──────────────────────────────────────────
drop policy if exists "interventions_select" on demandes_intervention;
create policy "interventions_select" on demandes_intervention for select using (true);

drop policy if exists "interventions_insert" on demandes_intervention;
create policy "interventions_insert" on demandes_intervention for insert with check (true);

drop policy if exists "interventions_update" on demandes_intervention;
create policy "interventions_update" on demandes_intervention for update using (true);

-- ─── Marches Rehabilitation ─────────────────────────────────────────
drop policy if exists "marches_select" on marches_rehabilitation;
create policy "marches_select" on marches_rehabilitation for select using (true);

drop policy if exists "marches_insert" on marches_rehabilitation;
create policy "marches_insert" on marches_rehabilitation for insert with check (true);

drop policy if exists "marches_update" on marches_rehabilitation;
create policy "marches_update" on marches_rehabilitation for update using (true);

-- ─── Maintenance Preventive ─────────────────────────────────────────
drop policy if exists "maint_prev_select" on maintenance_preventive;
create policy "maint_prev_select" on maintenance_preventive for select using (true);

drop policy if exists "maint_prev_manage" on maintenance_preventive;
create policy "maint_prev_manage" on maintenance_preventive for all using (true);

-- ─── Baux ───────────────────────────────────────────────────────────
drop policy if exists "baux_select" on baux;
create policy "baux_select" on baux for select using (true);

drop policy if exists "baux_manage" on baux;
create policy "baux_manage" on baux for all using (true);

-- ─── Paiements ──────────────────────────────────────────────────────
drop policy if exists "paiements_select" on paiements;
create policy "paiements_select" on paiements for select using (true);

drop policy if exists "paiements_insert" on paiements;
create policy "paiements_insert" on paiements for insert with check (true);

-- ─── Cessions ───────────────────────────────────────────────────────
drop policy if exists "cessions_select" on cessions;
create policy "cessions_select" on cessions for select using (true);

drop policy if exists "cessions_manage" on cessions;
create policy "cessions_manage" on cessions for all using (true);

-- ─── Mouvements Stock ───────────────────────────────────────────────
drop policy if exists "mouvements_select" on mouvements_stock;
create policy "mouvements_select" on mouvements_stock for select using (true);

drop policy if exists "mouvements_insert" on mouvements_stock;
create policy "mouvements_insert" on mouvements_stock for insert with check (true);

-- ─── Charges ────────────────────────────────────────────────────────
drop policy if exists "charges_select" on charges;
create policy "charges_select" on charges for select using (true);

drop policy if exists "charges_manage" on charges;
create policy "charges_manage" on charges for all using (true);

-- ─── Profiles ───────────────────────────────────────────────────────
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (true);

drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles for update using (true);

-- ─── Conversations IA ───────────────────────────────────────────────
drop policy if exists "conv_ia_select" on conversations_ia;
create policy "conv_ia_select" on conversations_ia for select using (true);

drop policy if exists "conv_ia_insert" on conversations_ia;
create policy "conv_ia_insert" on conversations_ia for insert with check (true);

drop policy if exists "conv_ia_delete" on conversations_ia;
create policy "conv_ia_delete" on conversations_ia for delete using (true);

-- ─── Messages IA ────────────────────────────────────────────────────
drop policy if exists "msg_ia_select" on messages_ia;
create policy "msg_ia_select" on messages_ia for select using (true);

drop policy if exists "msg_ia_insert" on messages_ia;
create policy "msg_ia_insert" on messages_ia for insert with check (true);

-- ─── Documents ──────────────────────────────────────────────────────
drop policy if exists "documents_select" on documents;
create policy "documents_select" on documents for select using (true);

drop policy if exists "documents_insert" on documents;
create policy "documents_insert" on documents for insert with check (true);

-- ─── Notifications ──────────────────────────────────────────────────
drop policy if exists "notif_select" on notifications;
create policy "notif_select" on notifications for select using (true);

drop policy if exists "notif_update" on notifications;
create policy "notif_update" on notifications for update using (true);

-- ─── Audit Log ──────────────────────────────────────────────────────
drop policy if exists "audit_select" on audit_log;
create policy "audit_select" on audit_log for select using (true);

drop policy if exists "audit_insert" on audit_log;
create policy "audit_insert" on audit_log for insert with check (true);
