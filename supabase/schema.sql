-- =============================================================================
-- PATRINIUM — Gabon Patrimoine Digital 2026
-- Schema SQL complet pour Supabase (PostgreSQL + RLS)
-- Direction Générale du Patrimoine de l'État (DGPE)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";        -- SIG / cartographie
create extension if not exists "pg_trgm";        -- recherche floue

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TYPES ENUM
-- ─────────────────────────────────────────────────────────────────────────────

-- Rôles utilisateur
create type user_role as enum (
  'admin',
  'agent_central',
  'province',
  'ministere'
);

-- Biens immobiliers
create type type_bien_immobilier as enum (
  'bureau',
  'logement',
  'entrepot',
  'terrain',
  'autre'
);

create type etat_bien_immobilier as enum (
  'excellent',
  'bon',
  'moyen',
  'mauvais'
);

-- Biens mobiliers
create type categorie_bien_mobilier as enum (
  'ordinateur',
  'vehicule',
  'mobilier',
  'equipement'
);

create type etat_bien_mobilier as enum (
  'neuf',
  'bon',
  'use',
  'hors_service'
);

-- Affectations
create type type_affectation as enum (
  'immobilier',
  'mobilier'
);

create type statut_affectation as enum (
  'en_attente',
  'approuve',
  'rejete'
);

-- Maintenance
create type type_intervention as enum (
  'corrective',
  'preventive'
);

create type priorite_intervention as enum (
  'basse',
  'moyenne',
  'haute',
  'urgente'
);

create type statut_intervention as enum (
  'nouveau',
  'en_cours',
  'termine',
  'annule'
);

-- Baux & loyers
create type frequence_bail as enum (
  'mensuel',
  'trimestriel',
  'annuel'
);

create type statut_bail as enum (
  'actif',
  'resilie',
  'expire'
);

create type mode_paiement as enum (
  'airtel_money',
  'moov_money',
  'virement',
  'especes'
);

create type statut_paiement as enum (
  'succes',
  'echec',
  'en_attente'
);

-- Charges
create type type_charge as enum (
  'eau',
  'electricite',
  'telecom',
  'medical',
  'funerailles'
);

create type statut_charge as enum (
  'en_attente',
  'paye'
);

-- Marchés de réhabilitation
create type statut_marche as enum (
  'en_cours',
  'termine',
  'retarde'
);

-- Maintenance préventive
create type frequence_maintenance as enum (
  'mensuelle',
  'trimestrielle',
  'semestrielle',
  'annuelle'
);

create type statut_planification as enum (
  'a_venir',
  'en_retard',
  'effectue'
);

-- Messages IA
create type role_message as enum (
  'user',
  'assistant'
);

-- Documents
create type type_document as enum (
  'titre_foncier',
  'pv_affectation',
  'contrat_bail',
  'facture',
  'rapport',
  'decret',
  'autre'
);

-- Notifications
create type canal_notification as enum (
  'whatsapp',
  'email',
  'in_app'
);

create type statut_notification as enum (
  'envoyee',
  'lue',
  'echec'
);

-- Journal d'audit
create type action_audit as enum (
  'create',
  'update',
  'delete',
  'login',
  'export',
  'validation'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- ===================== RÉFÉRENTIELS =====================

-- 2.1 Provinces du Gabon
create table provinces (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null unique,
  code        varchar(5) not null unique,
  chef_lieu   text,
  created_at  timestamptz not null default now()
);

-- 2.2 Ministères
create table ministeres (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null unique,
  sigle       varchar(20),
  created_at  timestamptz not null default now()
);

-- ===================== UTILISATEURS =====================

-- 2.3 Profils utilisateurs (étend auth.users de Supabase)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nom           text not null,
  prenom        text not null,
  email         text not null unique,
  telephone     text,
  role          user_role not null default 'agent_central',
  province_id   uuid references provinces(id),
  ministere_id  uuid references ministeres(id),
  poste         text,
  avatar_url    text,
  actif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ===================== MODULE 1 : CADASTRE NUMÉRIQUE (SIG) =====================

-- 2.4 Biens immobiliers
create table biens_immobiliers (
  id                uuid primary key default uuid_generate_v4(),
  reference         text not null unique,
  nom               text not null,
  type              type_bien_immobilier not null,
  adresse           text not null,
  province_id       uuid not null references provinces(id),
  superficie        numeric(12,2) not null check (superficie > 0),
  valeur            numeric(18,2) not null default 0 check (valeur >= 0),
  etat              etat_bien_immobilier not null default 'bon',
  affectataire_id   uuid references ministeres(id),
  date_acquisition  date not null,
  titre_foncier     text,
  -- PostGIS : point géographique (longitude, latitude)
  geom              geometry(Point, 4326),
  latitude          numeric(10,6),
  longitude         numeric(10,6),
  photos            text[] default '{}',
  qr_code           text unique,
  description       text,
  nombre_etages     integer,
  annee_construction integer,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index spatial pour les requêtes cartographiques
create index idx_biens_immobiliers_geom on biens_immobiliers using gist(geom);
create index idx_biens_immobiliers_province on biens_immobiliers(province_id);
create index idx_biens_immobiliers_type on biens_immobiliers(type);
create index idx_biens_immobiliers_etat on biens_immobiliers(etat);
create index idx_biens_immobiliers_reference on biens_immobiliers(reference);
-- Recherche floue sur le nom
create index idx_biens_immobiliers_nom_trgm on biens_immobiliers using gin(nom gin_trgm_ops);

-- ===================== MODULE 2 : GESTION DES AFFECTATIONS =====================

-- 2.5 Biens mobiliers (Comptabilité-matières)
create table biens_mobiliers (
  id                uuid primary key default uuid_generate_v4(),
  reference         text not null unique,
  nom               text not null,
  categorie         categorie_bien_mobilier not null,
  marque            text,
  modele            text,
  numero_serie      text,
  valeur            numeric(18,2) not null default 0 check (valeur >= 0),
  date_acquisition  date not null,
  etat              etat_bien_mobilier not null default 'bon',
  affectataire      text not null,
  ministere_id      uuid not null references ministeres(id),
  province_id       uuid references provinces(id),
  localisation      text not null,
  qr_code           text unique,
  photo_url         text,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_biens_mobiliers_categorie on biens_mobiliers(categorie);
create index idx_biens_mobiliers_ministere on biens_mobiliers(ministere_id);
create index idx_biens_mobiliers_etat on biens_mobiliers(etat);
create index idx_biens_mobiliers_reference on biens_mobiliers(reference);
create index idx_biens_mobiliers_nom_trgm on biens_mobiliers using gin(nom gin_trgm_ops);

-- 2.6 Affectations (workflow demande → validation → PV)
create table affectations (
  id                uuid primary key default uuid_generate_v4(),
  reference         text not null unique,
  type              type_affectation not null,
  bien_immobilier_id uuid references biens_immobiliers(id),
  bien_mobilier_id  uuid references biens_mobiliers(id),
  demandeur_id      uuid not null references profiles(id),
  ministere_id      uuid not null references ministeres(id),
  date_demande      date not null default current_date,
  date_validation   date,
  statut            statut_affectation not null default 'en_attente',
  valide_par        uuid references profiles(id),
  motif             text,
  commentaire       text,
  pv_affectation_url text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Au moins un bien doit être référencé
  constraint chk_affectation_bien check (
    (bien_immobilier_id is not null and type = 'immobilier') or
    (bien_mobilier_id is not null and type = 'mobilier')
  )
);

create index idx_affectations_statut on affectations(statut);
create index idx_affectations_demandeur on affectations(demandeur_id);
create index idx_affectations_ministere on affectations(ministere_id);
create index idx_affectations_date on affectations(date_demande desc);

-- ===================== MODULE 3 : GMAO MAINTENANCE =====================

-- 2.7 Demandes d'intervention
create table demandes_intervention (
  id                  uuid primary key default uuid_generate_v4(),
  reference           text not null unique,
  bien_immobilier_id  uuid references biens_immobiliers(id),
  bien_mobilier_id    uuid references biens_mobiliers(id),
  type                type_intervention not null,
  priorite            priorite_intervention not null default 'moyenne',
  description         text not null,
  demandeur_id        uuid references profiles(id),
  demandeur_nom       text not null,
  demandeur_contact   text,
  date_demande        date not null default current_date,
  date_intervention   date,
  date_fin            date,
  statut              statut_intervention not null default 'nouveau',
  technicien          text,
  prestataire         text,
  cout                numeric(14,2) check (cout >= 0),
  rapport             text,
  whatsapp_notif      boolean not null default false,
  source              text default 'web', -- 'web' | 'whatsapp' | 'mobile'
  photos_avant        text[] default '{}',
  photos_apres        text[] default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_interventions_statut on demandes_intervention(statut);
create index idx_interventions_priorite on demandes_intervention(priorite);
create index idx_interventions_bien_immo on demandes_intervention(bien_immobilier_id);
create index idx_interventions_date on demandes_intervention(date_demande desc);

-- 2.8 Marchés de réhabilitation
create table marches_rehabilitation (
  id                uuid primary key default uuid_generate_v4(),
  reference         text not null unique,
  nom               text not null,
  prestataire       text not null,
  bien_immobilier_id uuid references biens_immobiliers(id),
  montant           numeric(18,2) not null check (montant > 0),
  date_debut        date not null,
  date_fin_prevu    date not null,
  date_fin_reelle   date,
  taux_avancement   integer not null default 0 check (taux_avancement between 0 and 100),
  statut            statut_marche not null default 'en_cours',
  description       text,
  responsable_id    uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint chk_dates_marche check (date_fin_prevu >= date_debut)
);

create index idx_marches_statut on marches_rehabilitation(statut);
create index idx_marches_bien on marches_rehabilitation(bien_immobilier_id);

-- 2.9 Planification maintenance préventive
create table maintenance_preventive (
  id                  uuid primary key default uuid_generate_v4(),
  bien_immobilier_id  uuid references biens_immobiliers(id),
  bien_mobilier_id    uuid references biens_mobiliers(id),
  equipement          text not null,
  description         text,
  frequence           frequence_maintenance not null,
  prochaine_date      date not null,
  derniere_date       date,
  statut              statut_planification not null default 'a_venir',
  responsable_id      uuid references profiles(id),
  cout_estime         numeric(14,2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_maint_prev_date on maintenance_preventive(prochaine_date);
create index idx_maint_prev_statut on maintenance_preventive(statut);

-- ===================== MODULE 4 : VALORISATION & LOYERS =====================

-- 2.10 Baux (contrats de location)
create table baux (
  id                uuid primary key default uuid_generate_v4(),
  reference         text not null unique,
  bien_immobilier_id uuid not null references biens_immobiliers(id),
  locataire_nom     text not null,
  locataire_contact text,
  locataire_email   text,
  montant_loyer     numeric(14,2) not null check (montant_loyer > 0),
  frequence         frequence_bail not null default 'mensuel',
  date_debut        date not null,
  date_fin          date not null,
  statut            statut_bail not null default 'actif',
  dernier_paiement  date,
  montant_impaye    numeric(14,2) not null default 0 check (montant_impaye >= 0),
  caution           numeric(14,2) default 0,
  conditions        text,
  contrat_url       text,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint chk_dates_bail check (date_fin > date_debut)
);

create index idx_baux_statut on baux(statut);
create index idx_baux_bien on baux(bien_immobilier_id);
create index idx_baux_locataire_trgm on baux using gin(locataire_nom gin_trgm_ops);

-- 2.11 Paiements de loyers
create table paiements (
  id                    uuid primary key default uuid_generate_v4(),
  bail_id               uuid not null references baux(id) on delete cascade,
  montant               numeric(14,2) not null check (montant > 0),
  date_paiement         date not null default current_date,
  mode                  mode_paiement not null,
  reference_transaction text not null,
  statut                statut_paiement not null default 'en_attente',
  telephone_payeur      text,  -- numéro Mobile Money
  recu_url              text,
  note                  text,
  created_at            timestamptz not null default now()
);

create index idx_paiements_bail on paiements(bail_id);
create index idx_paiements_date on paiements(date_paiement desc);
create index idx_paiements_statut on paiements(statut);
create index idx_paiements_mode on paiements(mode);

-- 2.12 Cessions de biens
create table cessions (
  id                  uuid primary key default uuid_generate_v4(),
  reference           text not null unique,
  bien_immobilier_id  uuid references biens_immobiliers(id),
  bien_mobilier_id    uuid references biens_mobiliers(id),
  acheteur_nom        text not null,
  acheteur_contact    text,
  montant             numeric(18,2) not null check (montant > 0),
  date_cession        date not null,
  motif               text,
  statut              text not null default 'en_cours' check (statut in ('en_cours', 'finalisee', 'annulee')),
  pv_cession_url      text,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ===================== MODULE 5 : COMPTABILITÉ-MATIÈRES =====================
-- (Table biens_mobiliers déjà créée en 2.5)

-- 2.13 Mouvements de stock (traçabilité des transferts entre ministères)
create table mouvements_stock (
  id                  uuid primary key default uuid_generate_v4(),
  bien_mobilier_id    uuid not null references biens_mobiliers(id),
  type_mouvement      text not null check (type_mouvement in ('entree', 'sortie', 'transfert', 'reforme')),
  ministere_source_id uuid references ministeres(id),
  ministere_dest_id   uuid references ministeres(id),
  motif               text,
  date_mouvement      date not null default current_date,
  effectue_par        uuid references profiles(id),
  pv_url              text,
  created_at          timestamptz not null default now()
);

create index idx_mouvements_bien on mouvements_stock(bien_mobilier_id);
create index idx_mouvements_date on mouvements_stock(date_mouvement desc);

-- ===================== MODULE 6 : CHARGES ADMIN & SOCIALES =====================

-- 2.14 Charges administratives et sociales
create table charges (
  id              uuid primary key default uuid_generate_v4(),
  reference       text unique,
  type            type_charge not null,
  beneficiaire    text not null,
  ministere_id    uuid not null references ministeres(id),
  bien_immobilier_id uuid references biens_immobiliers(id),
  montant         numeric(14,2) not null check (montant > 0),
  date_facture    date not null,
  date_echeance   date,
  date_paiement   date,
  statut          statut_charge not null default 'en_attente',
  fournisseur     text,
  numero_facture  text,
  justificatif_url text,
  note            text,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_charges_type on charges(type);
create index idx_charges_statut on charges(statut);
create index idx_charges_ministere on charges(ministere_id);
create index idx_charges_date on charges(date_facture desc);

-- ===================== MODULE 7 : ASSISTANT IA & BI =====================

-- 2.15 Conversations IA
create table conversations_ia (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  titre       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.16 Messages IA
create table messages_ia (
  id                uuid primary key default uuid_generate_v4(),
  conversation_id   uuid not null references conversations_ia(id) on delete cascade,
  role              role_message not null,
  content           text not null,
  sources           text[] default '{}',
  tokens_utilises   integer,
  created_at        timestamptz not null default now()
);

create index idx_messages_ia_conv on messages_ia(conversation_id);
create index idx_messages_ia_date on messages_ia(created_at);

-- ===================== TRANSVERSAL =====================

-- 2.17 Documents (coffre-fort numérique)
create table documents (
  id                  uuid primary key default uuid_generate_v4(),
  type                type_document not null,
  nom                 text not null,
  description         text,
  fichier_url         text not null,
  taille_octets       bigint,
  mime_type           text,
  -- Liens polymorphiques (un seul renseigné à la fois)
  bien_immobilier_id  uuid references biens_immobiliers(id),
  bien_mobilier_id    uuid references biens_mobiliers(id),
  affectation_id      uuid references affectations(id),
  bail_id             uuid references baux(id),
  marche_id           uuid references marches_rehabilitation(id),
  uploaded_by         uuid references profiles(id),
  created_at          timestamptz not null default now()
);

create index idx_documents_type on documents(type);
create index idx_documents_bien_immo on documents(bien_immobilier_id);

-- 2.18 Notifications
create table notifications (
  id            uuid primary key default uuid_generate_v4(),
  destinataire_id uuid not null references profiles(id) on delete cascade,
  canal         canal_notification not null default 'in_app',
  titre         text not null,
  message       text not null,
  lien          text,
  statut        statut_notification not null default 'envoyee',
  lue_at        timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_dest on notifications(destinataire_id);
create index idx_notifications_statut on notifications(statut);
create index idx_notifications_date on notifications(created_at desc);

-- 2.19 Journal d'audit (traçabilité complète de chaque action)
create table audit_log (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id),
  action        action_audit not null,
  table_name    text not null,
  record_id     uuid,
  ancien_valeur jsonb,
  nouveau_valeur jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index idx_audit_user on audit_log(user_id);
create index idx_audit_table on audit_log(table_name);
create index idx_audit_date on audit_log(created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FONCTIONS UTILITAIRES
-- ─────────────────────────────────────────────────────────────────────────────

-- 3.1 Mise à jour automatique du champ updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3.2 Génération automatique des références
create or replace function generate_reference(prefix text, seq_name text)
returns text as $$
declare
  next_val bigint;
  year_str text;
begin
  year_str := to_char(now(), 'YYYY');
  execute format('select nextval(%L)', seq_name) into next_val;
  return prefix || '-' || year_str || '-' || lpad(next_val::text, 4, '0');
end;
$$ language plpgsql;

-- 3.3 Synchroniser le point géographique PostGIS depuis lat/lng
create or replace function sync_geom_from_coords()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326);
  end if;
  return new;
end;
$$ language plpgsql;

-- 3.4 Calculer les impayés d'un bail
create or replace function calculer_impaye(p_bail_id uuid)
returns numeric as $$
declare
  v_bail record;
  v_total_du numeric;
  v_total_paye numeric;
  v_nb_mois integer;
begin
  select * into v_bail from baux where id = p_bail_id;
  if not found then return 0; end if;

  -- Nombre de mois écoulés depuis le début du bail
  v_nb_mois := greatest(
    extract(year from age(least(current_date, v_bail.date_fin), v_bail.date_debut)) * 12 +
    extract(month from age(least(current_date, v_bail.date_fin), v_bail.date_debut)),
    0
  )::integer;

  -- Ajuster selon la fréquence
  case v_bail.frequence
    when 'mensuel' then v_total_du := v_nb_mois * v_bail.montant_loyer;
    when 'trimestriel' then v_total_du := (v_nb_mois / 3) * v_bail.montant_loyer;
    when 'annuel' then v_total_du := (v_nb_mois / 12) * v_bail.montant_loyer;
    else v_total_du := 0;
  end case;

  select coalesce(sum(montant), 0) into v_total_paye
  from paiements
  where bail_id = p_bail_id and statut = 'succes';

  return greatest(v_total_du - v_total_paye, 0);
end;
$$ language plpgsql;

-- 3.5 Statistiques du dashboard
create or replace function get_dashboard_stats()
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_biens_immobiliers', (select count(*) from biens_immobiliers),
    'total_biens_mobiliers', (select count(*) from biens_mobiliers),
    'valeur_patrimoine_immobilier', (select coalesce(sum(valeur), 0) from biens_immobiliers),
    'valeur_patrimoine_mobilier', (select coalesce(sum(valeur), 0) from biens_mobiliers),
    'baux_actifs', (select count(*) from baux where statut = 'actif'),
    'revenus_loyers_annuels', (
      select coalesce(sum(montant), 0) from paiements
      where statut = 'succes'
        and date_paiement >= date_trunc('year', current_date)
    ),
    'total_impayes', (select coalesce(sum(montant_impaye), 0) from baux where statut = 'actif'),
    'interventions_en_cours', (select count(*) from demandes_intervention where statut in ('nouveau', 'en_cours')),
    'interventions_terminees_mois', (
      select count(*) from demandes_intervention
      where statut = 'termine'
        and date_fin >= date_trunc('month', current_date)
    ),
    'affectations_en_attente', (select count(*) from affectations where statut = 'en_attente'),
    'taux_occupation', (
      select round(
        (count(*) filter (where affectataire_id is not null))::numeric /
        nullif(count(*), 0) * 100, 1
      ) from biens_immobiliers where type != 'terrain'
    ),
    'provinces_couvertes', (
      select count(distinct province_id) from biens_immobiliers
    )
  ) into result;
  return result;
end;
$$ language plpgsql;

-- 3.6 Biens par province (pour la carte)
create or replace function get_biens_par_province()
returns table(province_id uuid, province_nom text, province_code text, nb_biens bigint, valeur_totale numeric) as $$
begin
  return query
  select
    p.id,
    p.nom,
    p.code,
    count(bi.id),
    coalesce(sum(bi.valeur), 0)
  from provinces p
  left join biens_immobiliers bi on bi.province_id = p.id
  group by p.id, p.nom, p.code
  order by count(bi.id) desc;
end;
$$ language plpgsql;

-- 3.7 Recherche globale (biens immobiliers + mobiliers)
create or replace function recherche_globale(terme text, limite integer default 20)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'immobiliers', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select id, reference, nom, type::text, province_id, etat::text, valeur
        from biens_immobiliers
        where nom ilike '%' || terme || '%'
           or reference ilike '%' || terme || '%'
           or adresse ilike '%' || terme || '%'
           or titre_foncier ilike '%' || terme || '%'
        limit limite
      ) t
    ),
    'mobiliers', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select id, reference, nom, categorie::text, etat::text, valeur, affectataire
        from biens_mobiliers
        where nom ilike '%' || terme || '%'
           or reference ilike '%' || terme || '%'
           or numero_serie ilike '%' || terme || '%'
        limit limite
      ) t
    )
  ) into result;
  return result;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SÉQUENCES (pour les références auto-incrémentées)
-- ─────────────────────────────────────────────────────────────────────────────

create sequence seq_bien_immobilier start 1;
create sequence seq_bien_mobilier start 1;
create sequence seq_affectation start 1;
create sequence seq_intervention start 1;
create sequence seq_bail start 1;
create sequence seq_paiement start 1;
create sequence seq_charge start 1;
create sequence seq_marche start 1;
create sequence seq_cession start 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- 5.1 updated_at automatique
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger trg_biens_immo_updated_at before update on biens_immobiliers
  for each row execute function update_updated_at();

create trigger trg_biens_mob_updated_at before update on biens_mobiliers
  for each row execute function update_updated_at();

create trigger trg_affectations_updated_at before update on affectations
  for each row execute function update_updated_at();

create trigger trg_interventions_updated_at before update on demandes_intervention
  for each row execute function update_updated_at();

create trigger trg_marches_updated_at before update on marches_rehabilitation
  for each row execute function update_updated_at();

create trigger trg_maint_prev_updated_at before update on maintenance_preventive
  for each row execute function update_updated_at();

create trigger trg_baux_updated_at before update on baux
  for each row execute function update_updated_at();

create trigger trg_charges_updated_at before update on charges
  for each row execute function update_updated_at();

create trigger trg_conversations_updated_at before update on conversations_ia
  for each row execute function update_updated_at();

create trigger trg_cessions_updated_at before update on cessions
  for each row execute function update_updated_at();

-- 5.2 Synchronisation PostGIS
create trigger trg_biens_immo_geom before insert or update on biens_immobiliers
  for each row execute function sync_geom_from_coords();

-- 5.3 Génération automatique de référence sur INSERT
create or replace function auto_reference_bien_immobilier()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('IM', 'seq_bien_immobilier');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_bien_immo_ref before insert on biens_immobiliers
  for each row execute function auto_reference_bien_immobilier();

create or replace function auto_reference_bien_mobilier()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('MO', 'seq_bien_mobilier');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_bien_mob_ref before insert on biens_mobiliers
  for each row execute function auto_reference_bien_mobilier();

create or replace function auto_reference_affectation()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('AFF', 'seq_affectation');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_affectation_ref before insert on affectations
  for each row execute function auto_reference_affectation();

create or replace function auto_reference_intervention()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('INT', 'seq_intervention');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_intervention_ref before insert on demandes_intervention
  for each row execute function auto_reference_intervention();

create or replace function auto_reference_bail()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('BAIL', 'seq_bail');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_bail_ref before insert on baux
  for each row execute function auto_reference_bail();

create or replace function auto_reference_marche()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('MAR', 'seq_marche');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_marche_ref before insert on marches_rehabilitation
  for each row execute function auto_reference_marche();

create or replace function auto_reference_cession()
returns trigger as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := generate_reference('CES', 'seq_cession');
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_cession_ref before insert on cessions
  for each row execute function auto_reference_cession();

-- 5.4 Mise à jour des impayés après chaque paiement
create or replace function update_bail_apres_paiement()
returns trigger as $$
begin
  if new.statut = 'succes' then
    update baux set
      dernier_paiement = new.date_paiement,
      montant_impaye = calculer_impaye(new.bail_id)
    where id = new.bail_id;
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_paiement_update_bail after insert or update on paiements
  for each row execute function update_bail_apres_paiement();

-- 5.5 Alerte automatique : marché en retard
create or replace function check_marche_retard()
returns trigger as $$
begin
  if new.statut = 'en_cours' and new.date_fin_prevu < current_date then
    new.statut := 'retarde';
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_marche_retard before update on marches_rehabilitation
  for each row execute function check_marche_retard();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VUES
-- ─────────────────────────────────────────────────────────────────────────────

-- 6.1 Vue consolidée des biens immobiliers avec province
create or replace view v_biens_immobiliers as
select
  bi.*,
  p.nom as province_nom,
  p.code as province_code,
  m.nom as ministere_nom
from biens_immobiliers bi
join provinces p on p.id = bi.province_id
left join ministeres m on m.id = bi.affectataire_id;

-- 6.2 Vue des baux avec détails
create or replace view v_baux_details as
select
  b.*,
  bi.nom as bien_nom,
  bi.adresse as bien_adresse,
  bi.province_id,
  p.nom as province_nom
from baux b
join biens_immobiliers bi on bi.id = b.bien_immobilier_id
join provinces p on p.id = bi.province_id;

-- 6.3 Vue des interventions avec détails du bien
create or replace view v_interventions_details as
select
  di.*,
  coalesce(bi.nom, bm.nom) as bien_nom,
  coalesce(bi.adresse, bm.localisation) as bien_localisation,
  p.nom as province_nom
from demandes_intervention di
left join biens_immobiliers bi on bi.id = di.bien_immobilier_id
left join biens_mobiliers bm on bm.id = di.bien_mobilier_id
left join provinces p on p.id = bi.province_id;

-- 6.4 Vue des revenus mensuels
create or replace view v_revenus_mensuels as
select
  date_trunc('month', date_paiement)::date as mois,
  sum(montant) filter (where statut = 'succes') as total_recu,
  count(*) filter (where statut = 'succes') as nb_paiements,
  sum(montant) filter (where statut = 'echec') as total_echec
from paiements
group by date_trunc('month', date_paiement)
order by mois desc;

-- 6.5 Vue des charges par type et mois
create or replace view v_charges_mensuelles as
select
  date_trunc('month', date_facture)::date as mois,
  type,
  sum(montant) as total,
  count(*) as nb_factures,
  sum(montant) filter (where statut = 'paye') as total_paye,
  sum(montant) filter (where statut = 'en_attente') as total_en_attente
from charges
group by date_trunc('month', date_facture), type
order by mois desc, type;

-- 6.6 Vue comptabilité-matières par ministère
create or replace view v_comptabilite_matieres as
select
  m.id as ministere_id,
  m.nom as ministere_nom,
  bm.categorie,
  count(*) as nb_biens,
  sum(bm.valeur) as valeur_totale,
  count(*) filter (where bm.etat = 'hors_service') as nb_hors_service,
  count(*) filter (where bm.etat = 'use') as nb_uses
from biens_mobiliers bm
join ministeres m on m.id = bm.ministere_id
group by m.id, m.nom, bm.categorie
order by m.nom, bm.categorie;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

-- Activer RLS sur toutes les tables
alter table profiles enable row level security;
alter table biens_immobiliers enable row level security;
alter table biens_mobiliers enable row level security;
alter table affectations enable row level security;
alter table demandes_intervention enable row level security;
alter table marches_rehabilitation enable row level security;
alter table maintenance_preventive enable row level security;
alter table baux enable row level security;
alter table paiements enable row level security;
alter table cessions enable row level security;
alter table mouvements_stock enable row level security;
alter table charges enable row level security;
alter table conversations_ia enable row level security;
alter table messages_ia enable row level security;
alter table documents enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;

-- Fonction helper : récupérer le rôle de l'utilisateur courant
create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Fonction helper : récupérer la province de l'utilisateur courant
create or replace function get_user_province_id()
returns uuid as $$
  select province_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Fonction helper : récupérer le ministère de l'utilisateur courant
create or replace function get_user_ministere_id()
returns uuid as $$
  select ministere_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ── PROFILES ──
-- Chacun voit son propre profil ; admin voit tout
create policy "profiles_select" on profiles for select using (
  id = auth.uid() or get_user_role() = 'admin'
);
create policy "profiles_update" on profiles for update using (
  id = auth.uid() or get_user_role() = 'admin'
);

-- ── BIENS IMMOBILIERS ──
-- Admin et agent_central : tout voir
-- Province : biens de sa province uniquement
-- Ministère : biens affectés à son ministère
create policy "biens_immo_select" on biens_immobiliers for select using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'province' and province_id = get_user_province_id())
  or (get_user_role() = 'ministere' and affectataire_id = get_user_ministere_id())
);
create policy "biens_immo_insert" on biens_immobiliers for insert with check (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'province' and province_id = get_user_province_id())
);
create policy "biens_immo_update" on biens_immobiliers for update using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'province' and province_id = get_user_province_id())
);
create policy "biens_immo_delete" on biens_immobiliers for delete using (
  get_user_role() = 'admin'
);

-- ── BIENS MOBILIERS ──
create policy "biens_mob_select" on biens_mobiliers for select using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'province' and province_id = get_user_province_id())
  or (get_user_role() = 'ministere' and ministere_id = get_user_ministere_id())
);
create policy "biens_mob_insert" on biens_mobiliers for insert with check (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'ministere' and ministere_id = get_user_ministere_id())
);
create policy "biens_mob_update" on biens_mobiliers for update using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'ministere' and ministere_id = get_user_ministere_id())
);
create policy "biens_mob_delete" on biens_mobiliers for delete using (
  get_user_role() = 'admin'
);

-- ── AFFECTATIONS ──
create policy "affectations_select" on affectations for select using (
  get_user_role() in ('admin', 'agent_central')
  or demandeur_id = auth.uid()
  or ministere_id = get_user_ministere_id()
);
create policy "affectations_insert" on affectations for insert with check (
  get_user_role() in ('admin', 'agent_central', 'ministere')
);
create policy "affectations_update" on affectations for update using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── INTERVENTIONS ──
create policy "interventions_select" on demandes_intervention for select using (
  get_user_role() in ('admin', 'agent_central')
  or demandeur_id = auth.uid()
);
create policy "interventions_insert" on demandes_intervention for insert with check (
  true -- Tout utilisateur authentifié peut signaler
);
create policy "interventions_update" on demandes_intervention for update using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── MARCHÉS ──
create policy "marches_select" on marches_rehabilitation for select using (
  get_user_role() in ('admin', 'agent_central')
);
create policy "marches_insert" on marches_rehabilitation for insert with check (
  get_user_role() in ('admin', 'agent_central')
);
create policy "marches_update" on marches_rehabilitation for update using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── MAINTENANCE PRÉVENTIVE ──
create policy "maint_prev_select" on maintenance_preventive for select using (
  get_user_role() in ('admin', 'agent_central')
);
create policy "maint_prev_manage" on maintenance_preventive for all using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── BAUX ──
create policy "baux_select" on baux for select using (
  get_user_role() in ('admin', 'agent_central')
);
create policy "baux_manage" on baux for all using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── PAIEMENTS ──
create policy "paiements_select" on paiements for select using (
  get_user_role() in ('admin', 'agent_central')
);
create policy "paiements_insert" on paiements for insert with check (
  get_user_role() in ('admin', 'agent_central')
);

-- ── CESSIONS ──
create policy "cessions_select" on cessions for select using (
  get_user_role() in ('admin', 'agent_central')
);
create policy "cessions_manage" on cessions for all using (
  get_user_role() = 'admin'
);

-- ── MOUVEMENTS STOCK ──
create policy "mouvements_select" on mouvements_stock for select using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'ministere' and (
    ministere_source_id = get_user_ministere_id()
    or ministere_dest_id = get_user_ministere_id()
  ))
);
create policy "mouvements_insert" on mouvements_stock for insert with check (
  get_user_role() in ('admin', 'agent_central')
);

-- ── CHARGES ──
create policy "charges_select" on charges for select using (
  get_user_role() in ('admin', 'agent_central')
  or (get_user_role() = 'ministere' and ministere_id = get_user_ministere_id())
);
create policy "charges_manage" on charges for all using (
  get_user_role() in ('admin', 'agent_central')
);

-- ── CONVERSATIONS IA ──
create policy "conv_ia_select" on conversations_ia for select using (
  user_id = auth.uid() or get_user_role() = 'admin'
);
create policy "conv_ia_insert" on conversations_ia for insert with check (
  user_id = auth.uid()
);
create policy "conv_ia_delete" on conversations_ia for delete using (
  user_id = auth.uid()
);

-- ── MESSAGES IA ──
create policy "msg_ia_select" on messages_ia for select using (
  exists (
    select 1 from conversations_ia c
    where c.id = messages_ia.conversation_id
      and (c.user_id = auth.uid() or get_user_role() = 'admin')
  )
);
create policy "msg_ia_insert" on messages_ia for insert with check (
  exists (
    select 1 from conversations_ia c
    where c.id = conversation_id and c.user_id = auth.uid()
  )
);

-- ── DOCUMENTS ──
create policy "documents_select" on documents for select using (
  get_user_role() in ('admin', 'agent_central')
  or uploaded_by = auth.uid()
);
create policy "documents_insert" on documents for insert with check (
  true -- Tout authentifié peut uploader
);

-- ── NOTIFICATIONS ──
create policy "notif_select" on notifications for select using (
  destinataire_id = auth.uid()
);
create policy "notif_update" on notifications for update using (
  destinataire_id = auth.uid()
);

-- ── AUDIT LOG ──
create policy "audit_select" on audit_log for select using (
  get_user_role() = 'admin'
);
-- L'insertion dans audit_log se fait via des triggers SECURITY DEFINER
create policy "audit_insert" on audit_log for insert with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. STORAGE BUCKETS (Supabase Storage)
-- ─────────────────────────────────────────────────────────────────────────────

-- Les buckets sont créés via le dashboard ou l'API Supabase :
-- insert into storage.buckets (id, name, public) values
--   ('photos-biens', 'photos-biens', false),
--   ('documents', 'documents', false),
--   ('titres-fonciers', 'titres-fonciers', false),
--   ('avatars', 'avatars', true),
--   ('rapports', 'rapports', false);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SEED DATA — Données initiales
-- ─────────────────────────────────────────────────────────────────────────────

-- 9.1 Provinces du Gabon (9 provinces)
insert into provinces (nom, code, chef_lieu) values
  ('Estuaire', 'EST', 'Libreville'),
  ('Haut-Ogooué', 'HOG', 'Franceville'),
  ('Moyen-Ogooué', 'MOG', 'Lambaréné'),
  ('Ngounié', 'NGO', 'Mouila'),
  ('Nyanga', 'NYA', 'Tchibanga'),
  ('Ogooué-Ivindo', 'OIV', 'Makokou'),
  ('Ogooué-Lolo', 'OLO', 'Koulamoutou'),
  ('Ogooué-Maritime', 'OMA', 'Port-Gentil'),
  ('Woleu-Ntem', 'WNT', 'Oyem');

-- 9.2 Ministères principaux
insert into ministeres (nom, sigle) values
  ('Ministère des Comptes Publics', 'MCP'),
  ('Ministère de l''Éducation Nationale', 'MEN'),
  ('Ministère de la Santé', 'MS'),
  ('Ministère de l''Intérieur', 'MI'),
  ('Ministère des Travaux Publics', 'MTP'),
  ('Ministère de la Défense Nationale', 'MDN'),
  ('Ministère de l''Économie et des Finances', 'MEF'),
  ('Ministère de la Justice', 'MJ'),
  ('Ministère des Affaires Étrangères', 'MAE'),
  ('Ministère de l''Agriculture', 'MA'),
  ('Ministère des Eaux et Forêts', 'MEF2'),
  ('Ministère des Mines', 'MM'),
  ('Ministère du Pétrole', 'MP'),
  ('Ministère de la Communication', 'MC'),
  ('Ministère de la Culture', 'MCU'),
  ('Ministère des Sports', 'MSP'),
  ('Ministère du Travail', 'MT'),
  ('Ministère de l''Habitat', 'MH'),
  ('Ministère des Transports', 'MTR'),
  ('Ministère de l''Énergie', 'ME'),
  ('Ministère du Commerce', 'MCO'),
  ('Ministère de la Fonction Publique', 'MFP'),
  ('Ministère du Tourisme', 'MTO'),
  ('Présidence de la République', 'PR');

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. REALTIME — Activer les publications temps réel
-- ─────────────────────────────────────────────────────────────────────────────

-- Active le Realtime pour les tables critiques
-- (à exécuter dans le dashboard Supabase ou via SQL)
-- alter publication supabase_realtime add table demandes_intervention;
-- alter publication supabase_realtime add table affectations;
-- alter publication supabase_realtime add table paiements;
-- alter publication supabase_realtime add table notifications;
-- alter publication supabase_realtime add table baux;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIN DU SCHEMA PATRINIUM
-- ─────────────────────────────────────────────────────────────────────────────
