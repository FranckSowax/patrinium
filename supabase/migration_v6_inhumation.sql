-- =============================================================================
-- PATRINIUM v6 — Ajout du service Prise en Charge des Frais d'Inhumation
-- Grille officielle DGPE
-- =============================================================================

-- Ajouter la valeur a l'enum type_demande_guichet
alter type type_demande_guichet add value if not exists 'prise_en_charge_inhumation';

-- Table de reference pour la grille officielle des montants
create table if not exists grille_inhumation (
  id              uuid primary key default uuid_generate_v4(),
  categorie       text not null unique,
  code            text not null unique,
  montant_fcfa    integer not null,
  description     text,
  ordre           integer not null default 0,
  created_at      timestamptz not null default now()
);

-- RLS
alter table grille_inhumation enable row level security;
drop policy if exists "grille_inhumation_select" on grille_inhumation;
create policy "grille_inhumation_select" on grille_inhumation for select using (true);

-- GRANTS
grant select on grille_inhumation to anon, authenticated;

-- Inserer la grille officielle
insert into grille_inhumation (categorie, code, montant_fcfa, description, ordre) values
  ('Categorie A',                     'cat_a',        1000000, 'Agent de categorie A de la fonction publique', 1),
  ('Categorie B',                     'cat_b',         800000, 'Agent de categorie B de la fonction publique', 2),
  ('Categorie C',                     'cat_c',         700000, 'Agent de categorie C de la fonction publique', 3),
  ('Main d''oeuvre non permanente',   'monp',          575000, 'Main d''oeuvre non permanente de l''Etat', 4),
  ('Conjoint(e)',                     'conjoint',      650000, 'Conjoint(e) d''un agent de l''Etat', 5),
  ('Enfants a charge',               'enfant',        500000, 'Enfant a charge d''un agent de l''Etat', 6),
  ('Retraites',                       'retraite',      575000, 'Agent retraite de la fonction publique', 7),
  ('Eleves et etudiants',            'eleve',         500000, 'Eleve ou etudiant', 8),
  ('Indigents',                       'indigent',      400000, 'Personne indigente', 9)
on conflict (code) do update set
  montant_fcfa = excluded.montant_fcfa,
  categorie = excluded.categorie,
  description = excluded.description,
  ordre = excluded.ordre;
