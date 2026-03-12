-- =============================================================================
-- PATRINIUM v5 — Guichet Unique Digital & Interactions Institutionnelles
-- Tables : demandes_guichet, messages_dossier, rdv_inspections
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TYPES ENUM
-- ─────────────────────────────────────────────────────────────────────────────

create type type_demande_guichet as enum (
  'affectation_bien',
  'attribution_concession',
  'cession_reforme',
  'intervention_maintenance',
  'renouvellement_bail',
  'reclamation',
  'renseignement',
  'autre'
);

create type statut_demande_guichet as enum (
  'brouillon',
  'deposee',
  'en_instruction',
  'avis_technique',
  'commission',
  'validee',
  'rejetee',
  'classee'
);

create type priorite_demande as enum (
  'basse', 'normale', 'haute', 'urgente'
);

create type type_rdv as enum (
  'visite_bien',
  'etat_des_lieux',
  'inspection',
  'remise_cles',
  'reunion',
  'expertise',
  'autre'
);

create type statut_rdv as enum (
  'planifie', 'confirme', 'en_cours', 'termine', 'annule', 'reporte'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SEQUENCES
-- ─────────────────────────────────────────────────────────────────────────────

create sequence if not exists seq_demande_guichet start 1;
create sequence if not exists seq_rdv start 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLE DEMANDES GUICHET UNIQUE
-- ─────────────────────────────────────────────────────────────────────────────

create table demandes_guichet (
  id                  uuid primary key default uuid_generate_v4(),
  reference           varchar(20) not null unique default ('DEM-' || lpad(nextval('seq_demande_guichet')::text, 5, '0')),
  type                type_demande_guichet not null,
  objet               text not null,
  description         text,
  priorite            priorite_demande not null default 'normale',
  statut              statut_demande_guichet not null default 'deposee',

  -- Demandeur (institution/particulier)
  demandeur_type      text not null default 'institution', -- institution | particulier
  demandeur_nom       text not null,
  demandeur_organisme text,
  demandeur_poste     text,
  demandeur_email     text,
  demandeur_telephone text,
  ministere_id        uuid references ministeres(id),
  province_id         uuid references provinces(id),

  -- Bien concerne (optionnel)
  bien_immobilier_id  uuid references biens_immobiliers(id),
  bien_mobilier_id    uuid references biens_mobiliers(id),

  -- Workflow
  date_depot          timestamptz not null default now(),
  date_limite_sla     timestamptz, -- date limite de traitement
  date_instruction    timestamptz,
  date_decision       timestamptz,
  agent_instructeur   text,
  decision_motif      text,

  -- Documents
  pieces_jointes      text[] default '{}',
  pv_url              text,

  -- SLA
  sla_jours           integer not null default 15, -- delai de traitement en jours

  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-calculer date_limite_sla
create or replace function set_sla_deadline()
returns trigger as $$
begin
  if new.date_limite_sla is null then
    new.date_limite_sla := new.date_depot + (new.sla_jours || ' days')::interval;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_sla_deadline
  before insert on demandes_guichet
  for each row execute function set_sla_deadline();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLE MESSAGES DOSSIER (fil de discussion par demande)
-- ─────────────────────────────────────────────────────────────────────────────

create table messages_dossier (
  id                  uuid primary key default uuid_generate_v4(),
  demande_id          uuid not null references demandes_guichet(id) on delete cascade,
  auteur_nom          text not null,
  auteur_role         text not null default 'demandeur', -- demandeur | agent | superviseur
  contenu             text not null,
  pieces_jointes      text[] default '{}',
  lu                  boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLE RENDEZ-VOUS & INSPECTIONS
-- ─────────────────────────────────────────────────────────────────────────────

create table rdv_inspections (
  id                  uuid primary key default uuid_generate_v4(),
  reference           varchar(20) not null unique default ('RDV-' || lpad(nextval('seq_rdv')::text, 5, '0')),
  type                type_rdv not null,
  objet               text not null,

  -- Lien avec demande (optionnel)
  demande_id          uuid references demandes_guichet(id),
  bien_immobilier_id  uuid references biens_immobiliers(id),

  -- Planification
  date_rdv            timestamptz not null,
  duree_minutes       integer not null default 60,
  lieu                text not null,

  -- Participants
  agent_nom           text not null,
  agent_telephone     text,
  visiteur_nom        text,
  visiteur_telephone  text,
  visiteur_organisme  text,

  -- Resultat
  statut              statut_rdv not null default 'planifie',
  compte_rendu        text,
  photos              text[] default '{}',
  signature_url       text,

  notes               text,
  created_by          uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. INDEX
-- ─────────────────────────────────────────────────────────────────────────────

create index idx_demandes_type on demandes_guichet(type);
create index idx_demandes_statut on demandes_guichet(statut);
create index idx_demandes_priorite on demandes_guichet(priorite);
create index idx_demandes_ministere on demandes_guichet(ministere_id);
create index idx_demandes_province on demandes_guichet(province_id);
create index idx_demandes_date_depot on demandes_guichet(date_depot desc);
create index idx_demandes_sla on demandes_guichet(date_limite_sla);
create index idx_messages_demande on messages_dossier(demande_id);
create index idx_rdv_date on rdv_inspections(date_rdv);
create index idx_rdv_statut on rdv_inspections(statut);
create index idx_rdv_demande on rdv_inspections(demande_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RLS (ouvert pour dev/demo)
-- ─────────────────────────────────────────────────────────────────────────────

alter table demandes_guichet enable row level security;
alter table messages_dossier enable row level security;
alter table rdv_inspections enable row level security;

create policy "demandes_select" on demandes_guichet for select using (true);
create policy "demandes_insert" on demandes_guichet for insert with check (true);
create policy "demandes_update" on demandes_guichet for update using (true);
create policy "demandes_delete" on demandes_guichet for delete using (true);

create policy "messages_select" on messages_dossier for select using (true);
create policy "messages_insert" on messages_dossier for insert with check (true);

create policy "rdv_select" on rdv_inspections for select using (true);
create policy "rdv_insert" on rdv_inspections for insert with check (true);
create policy "rdv_update" on rdv_inspections for update using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRIGGERS updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create trigger set_updated_at_demandes
  before update on demandes_guichet
  for each row execute function update_updated_at();

create trigger set_updated_at_rdv
  before update on rdv_inspections
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. FONCTION STATS GUICHET
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function get_guichet_stats()
returns json language plpgsql as $$
declare
  result json;
begin
  select json_build_object(
    'total_demandes', (select count(*) from demandes_guichet),
    'deposees', (select count(*) from demandes_guichet where statut = 'deposee'),
    'en_instruction', (select count(*) from demandes_guichet where statut = 'en_instruction'),
    'avis_technique', (select count(*) from demandes_guichet where statut = 'avis_technique'),
    'validees', (select count(*) from demandes_guichet where statut = 'validee'),
    'rejetees', (select count(*) from demandes_guichet where statut = 'rejetee'),
    'en_retard_sla', (select count(*) from demandes_guichet where date_limite_sla < now() and statut not in ('validee', 'rejetee', 'classee')),
    'delai_moyen_jours', (select coalesce(
      round(extract(epoch from avg(coalesce(date_decision, now()) - date_depot)) / 86400),
      0
    ) from demandes_guichet where statut not in ('brouillon')),
    'total_rdv', (select count(*) from rdv_inspections),
    'rdv_planifies', (select count(*) from rdv_inspections where statut = 'planifie'),
    'rdv_confirmes', (select count(*) from rdv_inspections where statut = 'confirme'),
    'rdv_termines', (select count(*) from rdv_inspections where statut = 'termine'),
    'messages_non_lus', (select count(*) from messages_dossier where lu = false)
  ) into result;
  return result;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DONNEES DE DEMONSTRATION
-- ─────────────────────────────────────────────────────────────────────────────

insert into demandes_guichet (type, objet, description, priorite, statut, demandeur_type, demandeur_nom, demandeur_organisme, demandeur_poste, demandeur_email, demandeur_telephone, date_depot, sla_jours, agent_instructeur) values
('affectation_bien', 'Demande affectation bureaux pour la Direction des Douanes', 'La Direction Generale des Douanes souhaite obtenir un immeuble de bureaux de 500m2 minimum dans le quartier administratif de Libreville pour reloger ses services centraux.', 'haute', 'en_instruction', 'institution', 'Jean-Paul Mba Ndong', 'Direction Generale des Douanes', 'Directeur General', 'jp.mba@douanes.ga', '+241 77 12 34 56', now() - interval '8 days', 15, 'Agent Koumba Marie'),
('attribution_concession', 'Attribution terrain pour construction ecole a Oyem', 'Demande attribution terrain domanial de 2ha pour la construction d''un complexe scolaire dans la commune d''Oyem.', 'normale', 'deposee', 'institution', 'Marie Ondo Ella', 'Ministere de l''Education Nationale', 'Secretaire General', 'm.ondo@education.ga', '+241 66 98 76 54', now() - interval '3 days', 30, null),
('intervention_maintenance', 'Fuite toiture batiment Tresor Public', 'Infiltrations d''eau importantes au 3eme etage du batiment du Tresor Public a Libreville. Urgence en saison des pluies.', 'urgente', 'avis_technique', 'institution', 'Pierre Nzue Obame', 'Tresor Public', 'Chef Service Logistique', 'p.nzue@tresor.ga', '+241 74 55 66 77', now() - interval '12 days', 7, 'Agent Biyoghe Paul'),
('renouvellement_bail', 'Renouvellement bail residence Ambassadeur', 'Le bail de la residence de l''Ambassadeur du Cameroun arrive a echeance le 30/06/2026. Demande de renouvellement pour 3 ans.', 'normale', 'validee', 'institution', 'Ahmadou Bello', 'Ambassade du Cameroun', 'Intendant', 'a.bello@ambacam.ga', '+241 77 88 99 00', now() - interval '25 days', 20, 'Agent Moussavou Claire'),
('reclamation', 'Contestation evaluation fonciere parcelle Akanda', 'Le proprietaire conteste la valeur estimee de sa parcelle a Akanda utilisee pour le calcul de la plus-value lors de la cession.', 'normale', 'en_instruction', 'particulier', 'Robert Essono Mba', null, null, 'r.essono@gmail.com', '+241 66 11 22 33', now() - interval '15 days', 20, 'Agent Ndong Simon'),
('cession_reforme', 'Reforme lot vehicules hors service - Pool Transport', 'Demande de mise en cession de 5 vehicules reformes du pool transport ministeriel. PV de reforme technique joint.', 'basse', 'commission', 'institution', 'Alain Ntoutoume', 'Ministere des Transports', 'Directeur Logistique', 'a.ntoutoume@transports.ga', '+241 77 33 44 55', now() - interval '20 days', 30, 'Agent Mintsa Anges'),
('renseignement', 'Information sur procedure attribution concession forestiere', 'Societe ivoirienne souhaitant investir dans l''exploitation forestiere au Gabon. Demande d''information sur les procedures et conditions.', 'basse', 'classee', 'particulier', 'Kouame Yao', 'Groupe Bois CI', 'PDG', 'k.yao@boisci.ci', '+225 07 88 99 00', now() - interval '35 days', 10, 'Agent Koumba Marie'),
('affectation_bien', 'Affectation hangar stockage pour la Croix-Rouge', 'La Croix-Rouge gabonaise demande l''affectation temporaire d''un hangar de stockage pour les operations d''aide humanitaire.', 'haute', 'deposee', 'institution', 'Sylvie Mengue', 'Croix-Rouge Gabonaise', 'Coordinatrice Logistique', 's.mengue@croixrouge.ga', '+241 62 77 88 99', now() - interval '1 day', 10, null);

-- Messages de discussion
insert into messages_dossier (demande_id, auteur_nom, auteur_role, contenu, lu) values
((select id from demandes_guichet where objet like '%bureaux pour la Direction des Douanes%'), 'Jean-Paul Mba Ndong', 'demandeur', 'Bonjour, je souhaite connaitre l''avancement de notre demande d''affectation. Nos services sont actuellement dans des locaux vetustes et la situation devient critique.', true),
((select id from demandes_guichet where objet like '%bureaux pour la Direction des Douanes%'), 'Agent Koumba Marie', 'agent', 'Bonjour M. Mba Ndong, votre dossier est en cours d''instruction. Nous avons identifie 2 immeubles potentiels et une visite terrain est prevue cette semaine. Je vous tiendrai informe.', true),
((select id from demandes_guichet where objet like '%bureaux pour la Direction des Douanes%'), 'Jean-Paul Mba Ndong', 'demandeur', 'Merci pour le retour. Serait-il possible de participer a la visite terrain ?', false),
((select id from demandes_guichet where objet like '%Fuite toiture%'), 'Pierre Nzue Obame', 'demandeur', 'URGENT : Les infiltrations se sont aggravees ce week-end. Des documents importants ont ete endommages. Merci d''accelerer l''intervention.', false),
((select id from demandes_guichet where objet like '%Fuite toiture%'), 'Agent Biyoghe Paul', 'agent', 'Un expert en batiment a ete missionne. Il sera sur place demain matin a 8h. Merci de prevoir un accompagnateur.', true),
((select id from demandes_guichet where objet like '%evaluation fonciere%'), 'Robert Essono Mba', 'demandeur', 'Je joins le rapport d''expertise independant qui estime la parcelle a 180M FCFA, soit 30% de plus que votre evaluation.', false);

-- Rendez-vous
insert into rdv_inspections (type, objet, date_rdv, duree_minutes, lieu, agent_nom, agent_telephone, visiteur_nom, visiteur_telephone, visiteur_organisme, statut, notes) values
('visite_bien', 'Visite immeuble candidat pour la Direction des Douanes', now() + interval '2 days', 90, 'Immeuble SOGAFER, Boulevard Triomphal, Libreville', 'Agent Koumba Marie', '+241 77 45 67 89', 'Jean-Paul Mba Ndong', '+241 77 12 34 56', 'Direction Generale des Douanes', 'planifie', 'Visite du batiment de 3 etages, verifier conformite avec le cahier des charges'),
('inspection', 'Inspection urgente toiture Tresor Public', now() + interval '1 day', 120, 'Batiment Tresor Public, 3eme etage, Libreville', 'Agent Biyoghe Paul', '+241 74 11 22 33', 'Expert BTP Gabon', '+241 66 44 55 66', 'Cabinet BTP Expertise', 'confirme', 'Apporter materiel de mesure humidite. Photos obligatoires.'),
('etat_des_lieux', 'Etat des lieux sortant - Residence Ambassadeur Cameroun', now() + interval '15 days', 180, 'Residence diplomatique, Quartier Glass, Libreville', 'Agent Moussavou Claire', '+241 77 99 88 77', 'Ahmadou Bello', '+241 77 88 99 00', 'Ambassade du Cameroun', 'planifie', 'Etat des lieux contradictoire avant renouvellement bail'),
('expertise', 'Expertise vehicules a reformer - Pool Transport', now() + interval '5 days', 240, 'Garage Central, Zone Industrielle Oloumi', 'Agent Mintsa Anges', '+241 66 33 22 11', 'Alain Ntoutoume', '+241 77 33 44 55', 'Ministere des Transports', 'planifie', 'Expertise technique des 5 vehicules. Mecanicien agree present.'),
('reunion', 'Commission d''attribution - Concession forestiere', now() + interval '10 days', 180, 'Salle de conference DGPE, Libreville', 'Directeur DGPE', '+241 77 00 11 22', null, null, null, 'planifie', 'Ordre du jour : examen des 3 dossiers de concession en attente');

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. GRANTS
-- ─────────────────────────────────────────────────────────────────────────────

grant select, insert, update, delete on demandes_guichet to anon, authenticated;
grant select, insert on messages_dossier to anon, authenticated;
grant select, insert, update on rdv_inspections to anon, authenticated;
grant usage, select on sequence seq_demande_guichet to anon, authenticated;
grant usage, select on sequence seq_rdv to anon, authenticated;
grant execute on function get_guichet_stats() to anon, authenticated;
grant execute on function set_sla_deadline() to anon, authenticated;
