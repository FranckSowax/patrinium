import { supabase } from './supabase';

// Helper to bypass strict Supabase typing when Database types don't match exactly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ─── Biens Immobiliers ──────────────────────────────────────────────────

export async function createBienImmobilier(data: {
  nom: string;
  type: string;
  adresse: string;
  province_id: string;
  superficie: number;
  valeur: number;
  etat: string;
  date_acquisition: string;
  affectataire_id?: string;
  titre_foncier?: string;
  latitude?: number;
  longitude?: number;
}) {
  return db.from('biens_immobiliers').insert(data).select().single();
}

export async function updateBienImmobilier(id: string, data: Record<string, unknown>) {
  return db.from('biens_immobiliers').update(data).eq('id', id).select().single();
}

// ─── Biens Mobiliers ────────────────────────────────────────────────────

export async function createBienMobilier(data: {
  nom: string;
  categorie: string;
  valeur: number;
  date_acquisition: string;
  etat: string;
  affectataire: string;
  ministere_id: string;
  localisation: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
}) {
  return db.from('biens_mobiliers').insert(data).select().single();
}

export async function updateBienMobilier(id: string, data: Record<string, unknown>) {
  return db.from('biens_mobiliers').update(data).eq('id', id).select().single();
}

// ─── Affectations ───────────────────────────────────────────────────────

export async function createAffectation(data: {
  type: string;
  bien_immobilier_id?: string;
  bien_mobilier_id?: string;
  demandeur_id: string;
  ministere_id: string;
  motif?: string;
}) {
  return db.from('affectations').insert(data).select().single();
}

export async function updateAffectationStatut(id: string, statut: 'approuve' | 'rejete', commentaire?: string) {
  return db.from('affectations').update({
    statut,
    commentaire,
    date_validation: new Date().toISOString().split('T')[0],
  }).eq('id', id).select().single();
}

// ─── Interventions ──────────────────────────────────────────────────────

export async function createIntervention(data: {
  bien_immobilier_id?: string;
  bien_mobilier_id?: string;
  type: string;
  priorite: string;
  description: string;
  demandeur_nom: string;
  demandeur_contact?: string;
}) {
  return db.from('demandes_intervention').insert({
    ...data,
    source: 'web',
  }).select().single();
}

export async function updateInterventionStatut(id: string, statut: string, extras?: Record<string, unknown>) {
  const update: Record<string, unknown> = { statut, ...extras };
  if (statut === 'en_cours') update.date_intervention = new Date().toISOString().split('T')[0];
  if (statut === 'termine') update.date_fin = new Date().toISOString().split('T')[0];
  return db.from('demandes_intervention').update(update).eq('id', id).select().single();
}

// ─── Baux ───────────────────────────────────────────────────────────────

export async function createBail(data: {
  bien_immobilier_id: string;
  locataire_nom: string;
  locataire_contact?: string;
  locataire_email?: string;
  montant_loyer: number;
  frequence: string;
  date_debut: string;
  date_fin: string;
  caution?: number;
}) {
  return db.from('baux').insert(data).select().single();
}

// ─── Paiements ──────────────────────────────────────────────────────────

export async function createPaiement(data: {
  bail_id: string;
  montant: number;
  mode: string;
  reference_transaction: string;
  telephone_payeur?: string;
}) {
  return db.from('paiements').insert({
    ...data,
    date_paiement: new Date().toISOString().split('T')[0],
    statut: 'succes',
  }).select().single();
}

// ─── Charges ────────────────────────────────────────────────────────────

export async function createCharge(data: {
  type: string;
  beneficiaire: string;
  ministere_id: string;
  montant: number;
  date_facture: string;
  bien_immobilier_id?: string;
  fournisseur?: string;
}) {
  return db.from('charges').insert(data).select().single();
}

export async function updateChargeStatut(id: string, statut: 'paye' | 'en_attente') {
  const update: Record<string, unknown> = { statut };
  if (statut === 'paye') update.date_paiement = new Date().toISOString().split('T')[0];
  return db.from('charges').update(update).eq('id', id).select().single();
}

// ─── Marchés ────────────────────────────────────────────────────────────

// ─── Vehicules ──────────────────────────────────────────────────────────

export async function createVehicule(data: {
  immatriculation: string;
  marque: string;
  modele: string;
  type: string;
  annee: number;
  energie?: string;
  date_acquisition: string;
  valeur_acquisition: number;
  etat: string;
  ministere_id?: string;
  province_id?: string;
  affectataire_nom?: string;
  affectataire_poste?: string;
}) {
  return db.from('vehicules').insert(data).select().single();
}

export async function updateVehicule(id: string, data: Record<string, unknown>) {
  return db.from('vehicules').update(data).eq('id', id).select().single();
}

// ─── Concessions Domaniales ─────────────────────────────────────────────

export async function createConcession(data: {
  nom: string;
  type: string;
  localisation: string;
  province_id?: string;
  superficie_ha: number;
  statut?: string;
  beneficiaire_nom?: string;
  usage_prevu?: string;
  valeur_estimee?: number;
  redevance_annuelle?: number;
}) {
  return db.from('concessions_domaniales').insert(data).select().single();
}

export async function updateConcession(id: string, data: Record<string, unknown>) {
  return db.from('concessions_domaniales').update(data).eq('id', id).select().single();
}

// ─── Cessions ───────────────────────────────────────────────────────────

export async function createCession(data: {
  bien_immobilier_id?: string;
  bien_mobilier_id?: string;
  acheteur_nom: string;
  montant: number;
  date_cession: string;
  motif?: string;
}) {
  return db.from('cessions').insert(data).select().single();
}

export async function updateCessionStatut(id: string, statut: 'finalisee' | 'annulee') {
  return db.from('cessions').update({ statut }).eq('id', id).select().single();
}

// ─── Marchés ────────────────────────────────────────────────────────────

export async function updateMarcheAvancement(id: string, taux: number) {
  const update: Record<string, unknown> = { taux_avancement: taux };
  if (taux >= 100) {
    update.statut = 'termine';
    update.date_fin_reelle = new Date().toISOString().split('T')[0];
  }
  return db.from('marches_rehabilitation').update(update).eq('id', id).select().single();
}
