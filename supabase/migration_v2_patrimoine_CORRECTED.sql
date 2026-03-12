-- =============================================================================
-- PATRINIUM v2 — Vehicules + Concessions Domaniales
-- Les enums type_vehicule, statut_vehicule, type_concession, statut_concession
-- existent deja — on ne les recree PAS.
-- =============================================================================

create extension if not exists moddatetime schema extensions;

-- ─── SEQUENCES ──────────────────────────────────────────────────────────

create sequence if not exists seq_vehicule start 1;
create sequence if not exists seq_concession start 1;

-- ─── TABLE VEHICULES ────────────────────────────────────────────────────

create table if not exists vehicules (
  id                  uuid primary key default uuid_generate_v4(),
  reference           varchar(20) not null unique default ('VEH-' || lpad(nextval('seq_vehicule')::text, 5, '0')),
  immatriculation     varchar(20) not null unique,
  marque              text not null,
  modele              text not null,
  type                type_vehicule not null default 'berline',
  annee               integer not null,
  couleur             text,
  numero_chassis      varchar(50),
  energie             text default 'essence',
  puissance_fiscale   integer,
  kilometrage         integer default 0,
  date_acquisition    date not null,
  valeur_acquisition  numeric(15,2) not null default 0,
  valeur_actuelle     numeric(15,2) default 0,
  etat                etat_bien_mobilier not null default 'bon',
  statut              statut_vehicule not null default 'en_service',
  ministere_id        uuid references ministeres(id),
  province_id         uuid references provinces(id),
  affectataire_nom    text,
  affectataire_poste  text,
  carte_grise_url     text,
  assurance_url       text,
  date_assurance_fin  date,
  date_visite_technique date,
  visite_technique_url text,
  photo_url           text,
  qr_code             text,
  notes               text,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── TABLE CONCESSIONS DOMANIALES ───────────────────────────────────────

create table if not exists concessions_domaniales (
  id                  uuid primary key default uuid_generate_v4(),
  reference           varchar(20) not null unique default ('CON-' || lpad(nextval('seq_concession')::text, 5, '0')),
  nom                 text not null,
  type                type_concession not null default 'terrain_nu',
  localisation        text not null,
  province_id         uuid references provinces(id),
  superficie_ha       numeric(12,2) not null default 0,
  coordonnees_gps     text,
  latitude            double precision,
  longitude           double precision,
  statut              statut_concession not null default 'libre',
  numero_titre        text,
  date_attribution    date,
  date_expiration     date,
  beneficiaire_nom    text,
  beneficiaire_contact text,
  usage_prevu         text,
  valeur_estimee      numeric(15,2) default 0,
  redevance_annuelle  numeric(15,2) default 0,
  titre_url           text,
  plan_cadastral_url  text,
  photos              text[] default '{}',
  notes               text,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── INDEX ──────────────────────────────────────────────────────────────

create index if not exists idx_vehicules_ministere on vehicules(ministere_id);
create index if not exists idx_vehicules_province on vehicules(province_id);
create index if not exists idx_vehicules_statut on vehicules(statut);
create index if not exists idx_vehicules_type on vehicules(type);

create index if not exists idx_concessions_province on concessions_domaniales(province_id);
create index if not exists idx_concessions_statut on concessions_domaniales(statut);
create index if not exists idx_concessions_type on concessions_domaniales(type);

-- ─── RLS ────────────────────────────────────────────────────────────────

alter table vehicules enable row level security;
alter table concessions_domaniales enable row level security;

drop policy if exists "vehicules_select" on vehicules;
create policy "vehicules_select" on vehicules for select using (true);
drop policy if exists "vehicules_insert" on vehicules;
create policy "vehicules_insert" on vehicules for insert with check (true);
drop policy if exists "vehicules_update" on vehicules;
create policy "vehicules_update" on vehicules for update using (true);

drop policy if exists "concessions_select" on concessions_domaniales;
create policy "concessions_select" on concessions_domaniales for select using (true);
drop policy if exists "concessions_insert" on concessions_domaniales;
create policy "concessions_insert" on concessions_domaniales for insert with check (true);
drop policy if exists "concessions_update" on concessions_domaniales;
create policy "concessions_update" on concessions_domaniales for update using (true);

-- ─── GRANTS ─────────────────────────────────────────────────────────────

grant select, insert, update on vehicules to anon, authenticated;
grant select, insert, update on concessions_domaniales to anon, authenticated;
grant usage, select on sequence seq_vehicule to anon, authenticated;
grant usage, select on sequence seq_concession to anon, authenticated;

-- ─── TRIGGERS ───────────────────────────────────────────────────────────

drop trigger if exists set_updated_at_vehicules on vehicules;
create trigger set_updated_at_vehicules
  before update on vehicules
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists set_updated_at_concessions on concessions_domaniales;
create trigger set_updated_at_concessions
  before update on concessions_domaniales
  for each row execute function extensions.moddatetime(updated_at);

-- ─── DONNEES DEMO ───────────────────────────────────────────────────────

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0001-A', 'Toyota', 'Land Cruiser 300', '4x4'::type_vehicule, 2024, 'diesel', 12500, '2024-01-15'::date, 45000000::numeric, 40000000::numeric, 'bon'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Directeur General DGPE', 'Directeur General', 'Vehicule de fonction DG'
where not exists (select 1 from vehicules where immatriculation = 'DG-0001-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0002-A', 'Toyota', 'Hilux', 'pickup'::type_vehicule, 2023, 'diesel', 35000, '2023-06-01'::date, 28000000::numeric, 22000000::numeric, 'bon'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Direction des Inspections', 'Chef de service', 'Missions terrain'
where not exists (select 1 from vehicules where immatriculation = 'DG-0002-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0003-A', 'Toyota', 'Corolla', 'berline'::type_vehicule, 2022, 'essence', 48000, '2022-03-10'::date, 18000000::numeric, 12000000::numeric, 'bon'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Secretariat General', 'SG', null
where not exists (select 1 from vehicules where immatriculation = 'DG-0003-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0004-A', 'Mitsubishi', 'Pajero', '4x4'::type_vehicule, 2021, 'diesel', 72000, '2021-01-20'::date, 35000000::numeric, 18000000::numeric, 'use'::etat_bien_mobilier, 'en_reparation'::statut_vehicule, null, null, 'En atelier - boite de vitesse'
where not exists (select 1 from vehicules where immatriculation = 'DG-0004-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0005-A', 'Toyota', 'Hiace', 'minibus'::type_vehicule, 2023, 'diesel', 25000, '2023-09-01'::date, 32000000::numeric, 28000000::numeric, 'bon'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Pool Transport', 'Chef Transport', 'Navette personnel'
where not exists (select 1 from vehicules where immatriculation = 'DG-0005-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0006-A', 'Renault', 'Duster', 'suv'::type_vehicule, 2020, 'essence', 95000, '2020-04-15'::date, 15000000::numeric, 6000000::numeric, 'use'::etat_bien_mobilier, 'en_panne'::statut_vehicule, null, null, 'Moteur HS - a reformer'
where not exists (select 1 from vehicules where immatriculation = 'DG-0006-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0007-A', 'Ford', 'Ranger', 'pickup'::type_vehicule, 2024, 'diesel', 8000, '2024-06-01'::date, 30000000::numeric, 28000000::numeric, 'neuf'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Direction Provinciale Estuaire', 'DP', null
where not exists (select 1 from vehicules where immatriculation = 'DG-0007-A');

insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes)
select 'DG-0008-A', 'Yamaha', 'XT660', 'moto'::type_vehicule, 2023, 'essence', 15000, '2023-03-01'::date, 5000000::numeric, 3500000::numeric, 'bon'::etat_bien_mobilier, 'en_service'::statut_vehicule, 'Coursier', 'Agent', null
where not exists (select 1 from vehicules where immatriculation = 'DG-0008-A');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Terrain Ministere Interieur - PK12', 'terrain_bati'::type_concession, 'PK12, Route Nationale 1, Libreville', 5.5, 'attribue'::statut_concession, 'TF-2020-0451', '2020-03-15'::date, 'Ministere de l''Interieur', 'Construction bureaux administratifs', 850000000, 0, 'Terrain avec batiments existants'
where not exists (select 1 from concessions_domaniales where nom = 'Terrain Ministere Interieur - PK12');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Parcelle Zone Industrielle Owendo', 'terrain_nu'::type_concession, 'Zone Industrielle, Owendo', 12.0, 'libre'::statut_concession, null, null, null, 'A determiner', 1200000000, 0, 'Terrain disponible pour projet'
where not exists (select 1 from concessions_domaniales where nom = 'Parcelle Zone Industrielle Owendo');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Concession Forestiere Moyen-Ogooue', 'concession_forestiere'::type_concession, 'Departement Ogooue et Lacs, Lambarene', 5000.0, 'attribue'::statut_concession, 'CF-2019-0089', '2019-06-01'::date, 'Societe Forestiere du Gabon', 'Exploitation forestiere durable', 2500000000, 150000000, 'Concession 25 ans renouvelable'
where not exists (select 1 from concessions_domaniales where nom = 'Concession Forestiere Moyen-Ogooue');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Terrain Domanial Franceville Nord', 'terrain_nu'::type_concession, 'Zone Nord, Franceville', 25.0, 'en_cours_attribution'::statut_concession, null, null, 'Universite des Sciences', 'Campus universitaire', 500000000, 0, 'Projet extension campus'
where not exists (select 1 from concessions_domaniales where nom = 'Terrain Domanial Franceville Nord');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Emprise Route Transgabonaise Km 45-60', 'emprise_routiere'::type_concession, 'PK45-PK60, Route Transgabonaise', 150.0, 'attribue'::statut_concession, 'ER-2018-0012', '2018-01-01'::date, 'Direction des Routes', 'Infrastructure routiere', 0, 0, 'Emprise reservee'
where not exists (select 1 from concessions_domaniales where nom = 'Emprise Route Transgabonaise Km 45-60');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Domaine Maritime Port-Gentil', 'domaine_maritime'::type_concession, 'Front de mer, Port-Gentil', 8.0, 'en_litige'::statut_concession, 'DM-2015-0033', '2015-09-01'::date, 'En contentieux', 'Port de peche', 3000000000, 200000000, 'Litige en cours - tribunal administratif'
where not exists (select 1 from concessions_domaniales where nom = 'Domaine Maritime Port-Gentil');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Concession Miniere Mounana', 'concession_miniere'::type_concession, 'Mounana, Haut-Ogooue', 800.0, 'resilie'::statut_concession, 'CM-2010-0007', '2010-01-01'::date, 'Ex-Comuf', 'Extraction uranium (arretee)', 0, 0, 'Site rehabilite'
where not exists (select 1 from concessions_domaniales where nom = 'Concession Miniere Mounana');

insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes)
select 'Terrain Hopital Regional Mouila', 'terrain_bati'::type_concession, 'Centre-ville, Mouila', 3.2, 'attribue'::statut_concession, 'TF-2017-0234', '2017-08-15'::date, 'Ministere de la Sante', 'Hopital regional', 450000000, 0, null
where not exists (select 1 from concessions_domaniales where nom = 'Terrain Hopital Regional Mouila');

-- ─── FONCTION STATS ─────────────────────────────────────────────────────

create or replace function get_patrimoine_global_stats()
returns json language plpgsql as $$
declare
  result json;
begin
  select json_build_object(
    'total_vehicules', (select count(*) from vehicules),
    'vehicules_en_service', (select count(*) from vehicules where statut = 'en_service'),
    'vehicules_en_panne', (select count(*) from vehicules where statut in ('en_panne', 'en_reparation')),
    'valeur_parc_auto', (select coalesce(sum(valeur_actuelle), 0) from vehicules where statut != 'reforme'),
    'total_concessions', (select count(*) from concessions_domaniales),
    'concessions_attribuees', (select count(*) from concessions_domaniales where statut = 'attribue'),
    'concessions_libres', (select count(*) from concessions_domaniales where statut = 'libre'),
    'concessions_en_litige', (select count(*) from concessions_domaniales where statut = 'en_litige'),
    'superficie_totale_ha', (select coalesce(sum(superficie_ha), 0) from concessions_domaniales),
    'valeur_concessions', (select coalesce(sum(valeur_estimee), 0) from concessions_domaniales),
    'redevances_annuelles', (select coalesce(sum(redevance_annuelle), 0) from concessions_domaniales where statut = 'attribue'),
    'total_cessions', (select count(*) from cessions),
    'cessions_en_cours', (select count(*) from cessions where statut = 'en_cours'),
    'valeur_cessions', (select coalesce(sum(montant), 0) from cessions where statut = 'finalisee')
  ) into result;
  return result;
end;
$$;
