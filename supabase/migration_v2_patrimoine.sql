-- =============================================================================
-- PATRINIUM v2 — Tables additionnelles pour la gestion complete du patrimoine
-- Vehicules de l'Etat, Concessions Domaniales, Terrains Domaniaux
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. NOUVEAUX TYPES ENUM
-- ─────────────────────────────────────────────────────────────────────────────

create type type_vehicule as enum (
  'berline', 'suv', '4x4', 'pickup', 'minibus', 'camion', 'moto', 'autre'
);

create type statut_vehicule as enum (
  'en_service', 'en_panne', 'en_reparation', 'reforme', 'vole'
);

create type type_concession as enum (
  'terrain_nu', 'terrain_bati', 'concession_forestiere', 'concession_miniere',
  'concession_agricole', 'emprise_routiere', 'domaine_maritime', 'autre'
);

create type statut_concession as enum (
  'attribue', 'libre', 'en_litige', 'en_cours_attribution', 'resilie'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLE VEHICULES
-- ─────────────────────────────────────────────────────────────────────────────

create table vehicules (
  id                  uuid primary key default uuid_generate_v4(),
  reference           varchar(20) not null unique default ('VEH-' || lpad(nextval('seq_vehicule')::text, 5, '0')),
  immatriculation     varchar(20) not null unique,
  marque              text not null,
  modele              text not null,
  type                type_vehicule not null default 'berline',
  annee               integer not null,
  couleur             text,
  numero_chassis      varchar(50),
  energie             text default 'essence', -- essence, diesel, electrique, hybride
  puissance_fiscale   integer,
  kilometrage         integer default 0,
  date_acquisition    date not null,
  valeur_acquisition  numeric(15,2) not null default 0,
  valeur_actuelle     numeric(15,2) default 0,
  etat                etat_bien_mobilier not null default 'bon',
  statut              statut_vehicule not null default 'en_service',

  -- Affectation
  ministere_id        uuid references ministeres(id),
  province_id         uuid references provinces(id),
  affectataire_nom    text,
  affectataire_poste  text,

  -- Documents
  carte_grise_url     text,
  assurance_url       text,
  date_assurance_fin  date,
  date_visite_technique date,
  visite_technique_url text,

  -- Suivi
  photo_url           text,
  qr_code             text,
  notes               text,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Sequence pour references vehicules
create sequence if not exists seq_vehicule start 1;

-- Re-create reference default with sequence
alter table vehicules alter column reference set default ('VEH-' || lpad(nextval('seq_vehicule')::text, 5, '0'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLE CONCESSIONS DOMANIALES
-- ─────────────────────────────────────────────────────────────────────────────

create table concessions_domaniales (
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

  -- Statut juridique
  statut              statut_concession not null default 'libre',
  numero_titre        text,
  date_attribution    date,
  date_expiration     date,
  beneficiaire_nom    text,
  beneficiaire_contact text,
  usage_prevu         text,

  -- Valeur
  valeur_estimee      numeric(15,2) default 0,
  redevance_annuelle  numeric(15,2) default 0,

  -- Documents
  titre_url           text,
  plan_cadastral_url  text,
  photos              text[] default '{}',
  notes               text,

  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create sequence if not exists seq_concession start 1;

alter table concessions_domaniales alter column reference set default ('CON-' || lpad(nextval('seq_concession')::text, 5, '0'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INDEX
-- ─────────────────────────────────────────────────────────────────────────────

create index idx_vehicules_ministere on vehicules(ministere_id);
create index idx_vehicules_province on vehicules(province_id);
create index idx_vehicules_statut on vehicules(statut);
create index idx_vehicules_type on vehicules(type);

create index idx_concessions_province on concessions_domaniales(province_id);
create index idx_concessions_statut on concessions_domaniales(statut);
create index idx_concessions_type on concessions_domaniales(type);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS (Row Level Security)
-- ─────────────────────────────────────────────────────────────────────────────

alter table vehicules enable row level security;
alter table concessions_domaniales enable row level security;

create policy "vehicules_select" on vehicules for select using (true);
create policy "vehicules_insert" on vehicules for insert with check (true);
create policy "vehicules_update" on vehicules for update using (true);

create policy "concessions_select" on concessions_domaniales for select using (true);
create policy "concessions_insert" on concessions_domaniales for insert with check (true);
create policy "concessions_update" on concessions_domaniales for update using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TRIGGERS updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create trigger set_updated_at_vehicules
  before update on vehicules
  for each row execute function moddatetime(updated_at);

create trigger set_updated_at_concessions
  before update on concessions_domaniales
  for each row execute function moddatetime(updated_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. DONNEES DE DEMONSTRATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Vehicules de l'Etat (exemples)
insert into vehicules (immatriculation, marque, modele, type, annee, energie, kilometrage, date_acquisition, valeur_acquisition, valeur_actuelle, etat, statut, affectataire_nom, affectataire_poste, notes) values
('DG-0001-A', 'Toyota', 'Land Cruiser 300', '4x4', 2024, 'diesel', 12500, '2024-01-15', 45000000, 40000000, 'bon', 'en_service', 'Directeur General DGPE', 'Directeur General', 'Vehicule de fonction DG'),
('DG-0002-A', 'Toyota', 'Hilux', 'pickup', 2023, 'diesel', 35000, '2023-06-01', 28000000, 22000000, 'bon', 'en_service', 'Direction des Inspections', 'Chef de service', 'Missions terrain'),
('DG-0003-A', 'Toyota', 'Corolla', 'berline', 2022, 'essence', 48000, '2022-03-10', 18000000, 12000000, 'moyen', 'en_service', 'Secretariat General', 'SG', null),
('DG-0004-A', 'Mitsubishi', 'Pajero', '4x4', 2021, 'diesel', 72000, '2021-01-20', 35000000, 18000000, 'moyen', 'en_reparation', null, null, 'En atelier - boite de vitesse'),
('DG-0005-A', 'Toyota', 'Hiace', 'minibus', 2023, 'diesel', 25000, '2023-09-01', 32000000, 28000000, 'bon', 'en_service', 'Pool Transport', 'Chef Transport', 'Navette personnel'),
('DG-0006-A', 'Renault', 'Duster', 'suv', 2020, 'essence', 95000, '2020-04-15', 15000000, 6000000, 'use', 'en_panne', null, null, 'Moteur HS - a reformer'),
('DG-0007-A', 'Ford', 'Ranger', 'pickup', 2024, 'diesel', 8000, '2024-06-01', 30000000, 28000000, 'neuf', 'en_service', 'Direction Provinciale Estuaire', 'DP', null),
('DG-0008-A', 'Yamaha', 'XT660', 'moto', 2023, 'essence', 15000, '2023-03-01', 5000000, 3500000, 'bon', 'en_service', 'Coursier', 'Agent', null);

-- Concessions domaniales (exemples)
insert into concessions_domaniales (nom, type, localisation, superficie_ha, statut, numero_titre, date_attribution, beneficiaire_nom, usage_prevu, valeur_estimee, redevance_annuelle, notes) values
('Terrain Ministere Interieur - PK12', 'terrain_bati', 'PK12, Route Nationale 1, Libreville', 5.5, 'attribue', 'TF-2020-0451', '2020-03-15', 'Ministere de l''Interieur', 'Construction bureaux administratifs', 850000000, 0, 'Terrain avec batiments existants'),
('Parcelle Zone Industrielle Owendo', 'terrain_nu', 'Zone Industrielle, Owendo', 12.0, 'libre', null, null, null, 'A determiner', 1200000000, 0, 'Terrain disponible pour projet'),
('Concession Forestiere Moyen-Ogooue', 'concession_forestiere', 'Departement Ogooue et Lacs, Lambarene', 5000.0, 'attribue', 'CF-2019-0089', '2019-06-01', 'Societe Forestiere du Gabon', 'Exploitation forestiere durable', 2500000000, 150000000, 'Concession 25 ans renouvelable'),
('Terrain Domanial Franceville Nord', 'terrain_nu', 'Zone Nord, Franceville', 25.0, 'en_cours_attribution', null, null, 'Universite des Sciences', 'Campus universitaire', 500000000, 0, 'Projet extension campus'),
('Emprise Route Transgabonaise Km 45-60', 'emprise_routiere', 'PK45-PK60, Route Transgabonaise', 150.0, 'attribue', 'ER-2018-0012', '2018-01-01', 'Direction des Routes', 'Infrastructure routiere', 0, 0, 'Emprise reservee'),
('Domaine Maritime Port-Gentil', 'domaine_maritime', 'Front de mer, Port-Gentil', 8.0, 'en_litige', 'DM-2015-0033', '2015-09-01', 'En contentieux', 'Port de peche', 3000000000, 200000000, 'Litige en cours - tribunal administratif'),
('Concession Miniere Mounana', 'concession_miniere', 'Mounana, Haut-Ogooue', 800.0, 'resilie', 'CM-2010-0007', '2010-01-01', 'Ex-Comuf', 'Extraction uranium (arretee)', 0, 0, 'Site rehabilite'),
('Terrain Hopital Regional Mouila', 'terrain_bati', 'Centre-ville, Mouila', 3.2, 'attribue', 'TF-2017-0234', '2017-08-15', 'Ministere de la Sante', 'Hopital regional', 450000000, 0, null);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. FONCTION STATS ENRICHIES
-- ─────────────────────────────────────────────────────────────────────────────

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
