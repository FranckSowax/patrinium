// Types generés pour le schema Supabase PATRINIUM
// Correspond à supabase/schema.sql

export type UserRole = 'admin' | 'agent_central' | 'province' | 'ministere';
export type TypeBienImmobilier = 'bureau' | 'logement' | 'entrepot' | 'terrain' | 'autre';
export type EtatBienImmobilier = 'excellent' | 'bon' | 'moyen' | 'mauvais';
export type CategorieBienMobilier = 'ordinateur' | 'vehicule' | 'mobilier' | 'equipement';
export type EtatBienMobilier = 'neuf' | 'bon' | 'use' | 'hors_service';
export type TypeAffectation = 'immobilier' | 'mobilier';
export type StatutAffectation = 'en_attente' | 'approuve' | 'rejete';
export type TypeIntervention = 'corrective' | 'preventive';
export type PrioriteIntervention = 'basse' | 'moyenne' | 'haute' | 'urgente';
export type StatutIntervention = 'nouveau' | 'en_cours' | 'termine' | 'annule';
export type FrequenceBail = 'mensuel' | 'trimestriel' | 'annuel';
export type StatutBail = 'actif' | 'resilie' | 'expire';
export type ModePaiement = 'airtel_money' | 'moov_money' | 'virement' | 'especes';
export type StatutPaiement = 'succes' | 'echec' | 'en_attente';
export type TypeCharge = 'eau' | 'electricite' | 'telecom' | 'medical' | 'funerailles';
export type StatutCharge = 'en_attente' | 'paye';
export type StatutMarche = 'en_cours' | 'termine' | 'retarde';
export type FrequenceMaintenance = 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
export type StatutPlanification = 'a_venir' | 'en_retard' | 'effectue';
export type RoleMessage = 'user' | 'assistant';
export type TypeDocument = 'titre_foncier' | 'pv_affectation' | 'contrat_bail' | 'facture' | 'rapport' | 'decret' | 'autre';
export type CanalNotification = 'whatsapp' | 'email' | 'in_app';
export type StatutNotification = 'envoyee' | 'lue' | 'echec';
export type ActionAudit = 'create' | 'update' | 'delete' | 'login' | 'export' | 'validation';
export type TypeMouvement = 'entree' | 'sortie' | 'transfert' | 'reforme';
export type StatutCession = 'en_cours' | 'finalisee' | 'annulee';

// ─── Row types ──────────────────────────────────────────────────────────

export interface Province {
  id: string;
  nom: string;
  code: string;
  chef_lieu: string | null;
  created_at: string;
}

export interface Ministere {
  id: string;
  nom: string;
  sigle: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: UserRole;
  province_id: string | null;
  ministere_id: string | null;
  poste: string | null;
  avatar_url: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface BienImmobilier {
  id: string;
  reference: string;
  nom: string;
  type: TypeBienImmobilier;
  adresse: string;
  province_id: string;
  superficie: number;
  valeur: number;
  etat: EtatBienImmobilier;
  affectataire_id: string | null;
  date_acquisition: string;
  titre_foncier: string | null;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  qr_code: string | null;
  description: string | null;
  nombre_etages: number | null;
  annee_construction: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BienMobilier {
  id: string;
  reference: string;
  nom: string;
  categorie: CategorieBienMobilier;
  marque: string | null;
  modele: string | null;
  numero_serie: string | null;
  valeur: number;
  date_acquisition: string;
  etat: EtatBienMobilier;
  affectataire: string;
  ministere_id: string;
  province_id: string | null;
  localisation: string;
  qr_code: string | null;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Affectation {
  id: string;
  reference: string;
  type: TypeAffectation;
  bien_immobilier_id: string | null;
  bien_mobilier_id: string | null;
  demandeur_id: string;
  ministere_id: string;
  date_demande: string;
  date_validation: string | null;
  statut: StatutAffectation;
  valide_par: string | null;
  motif: string | null;
  commentaire: string | null;
  pv_affectation_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandeIntervention {
  id: string;
  reference: string;
  bien_immobilier_id: string | null;
  bien_mobilier_id: string | null;
  type: TypeIntervention;
  priorite: PrioriteIntervention;
  description: string;
  demandeur_id: string | null;
  demandeur_nom: string;
  demandeur_contact: string | null;
  date_demande: string;
  date_intervention: string | null;
  date_fin: string | null;
  statut: StatutIntervention;
  technicien: string | null;
  prestataire: string | null;
  cout: number | null;
  rapport: string | null;
  whatsapp_notif: boolean;
  source: string | null;
  photos_avant: string[];
  photos_apres: string[];
  created_at: string;
  updated_at: string;
}

export interface MarcheRehabilitation {
  id: string;
  reference: string;
  nom: string;
  prestataire: string;
  bien_immobilier_id: string | null;
  montant: number;
  date_debut: string;
  date_fin_prevu: string;
  date_fin_reelle: string | null;
  taux_avancement: number;
  statut: StatutMarche;
  description: string | null;
  responsable_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenancePreventive {
  id: string;
  bien_immobilier_id: string | null;
  bien_mobilier_id: string | null;
  equipement: string;
  description: string | null;
  frequence: FrequenceMaintenance;
  prochaine_date: string;
  derniere_date: string | null;
  statut: StatutPlanification;
  responsable_id: string | null;
  cout_estime: number | null;
  created_at: string;
  updated_at: string;
}

export interface Bail {
  id: string;
  reference: string;
  bien_immobilier_id: string;
  locataire_nom: string;
  locataire_contact: string | null;
  locataire_email: string | null;
  montant_loyer: number;
  frequence: FrequenceBail;
  date_debut: string;
  date_fin: string;
  statut: StatutBail;
  dernier_paiement: string | null;
  montant_impaye: number;
  caution: number | null;
  conditions: string | null;
  contrat_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paiement {
  id: string;
  bail_id: string;
  montant: number;
  date_paiement: string;
  mode: ModePaiement;
  reference_transaction: string;
  statut: StatutPaiement;
  telephone_payeur: string | null;
  recu_url: string | null;
  note: string | null;
  created_at: string;
}

export interface Cession {
  id: string;
  reference: string;
  bien_immobilier_id: string | null;
  bien_mobilier_id: string | null;
  acheteur_nom: string;
  acheteur_contact: string | null;
  montant: number;
  date_cession: string;
  motif: string | null;
  statut: StatutCession;
  pv_cession_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MouvementStock {
  id: string;
  bien_mobilier_id: string;
  type_mouvement: TypeMouvement;
  ministere_source_id: string | null;
  ministere_dest_id: string | null;
  motif: string | null;
  date_mouvement: string;
  effectue_par: string | null;
  pv_url: string | null;
  created_at: string;
}

export interface Charge {
  id: string;
  reference: string | null;
  type: TypeCharge;
  beneficiaire: string;
  ministere_id: string;
  bien_immobilier_id: string | null;
  montant: number;
  date_facture: string;
  date_echeance: string | null;
  date_paiement: string | null;
  statut: StatutCharge;
  fournisseur: string | null;
  numero_facture: string | null;
  justificatif_url: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationIA {
  id: string;
  user_id: string;
  titre: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageIA {
  id: string;
  conversation_id: string;
  role: RoleMessage;
  content: string;
  sources: string[];
  tokens_utilises: number | null;
  created_at: string;
}

export interface Document {
  id: string;
  type: TypeDocument;
  nom: string;
  description: string | null;
  fichier_url: string;
  taille_octets: number | null;
  mime_type: string | null;
  bien_immobilier_id: string | null;
  bien_mobilier_id: string | null;
  affectation_id: string | null;
  bail_id: string | null;
  marche_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  destinataire_id: string;
  canal: CanalNotification;
  titre: string;
  message: string;
  lien: string | null;
  statut: StatutNotification;
  lue_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: ActionAudit;
  table_name: string;
  record_id: string | null;
  ancien_valeur: Record<string, unknown> | null;
  nouveau_valeur: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ─── Database interface pour Supabase client ────────────────────────────

export interface Database {
  public: {
    Tables: {
      provinces: {
        Row: Province;
        Insert: Omit<Province, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Province, 'id'>>;
      };
      ministeres: {
        Row: Ministere;
        Insert: Omit<Ministere, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Ministere, 'id'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'actif'> & { created_at?: string; updated_at?: string; actif?: boolean };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      biens_immobiliers: {
        Row: BienImmobilier;
        Insert: Omit<BienImmobilier, 'id' | 'reference' | 'created_at' | 'updated_at' | 'photos'> & { id?: string; reference?: string; created_at?: string; updated_at?: string; photos?: string[] };
        Update: Partial<Omit<BienImmobilier, 'id'>>;
      };
      biens_mobiliers: {
        Row: BienMobilier;
        Insert: Omit<BienMobilier, 'id' | 'reference' | 'created_at' | 'updated_at'> & { id?: string; reference?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<BienMobilier, 'id'>>;
      };
      affectations: {
        Row: Affectation;
        Insert: Omit<Affectation, 'id' | 'reference' | 'created_at' | 'updated_at'> & { id?: string; reference?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Affectation, 'id'>>;
      };
      demandes_intervention: {
        Row: DemandeIntervention;
        Insert: Omit<DemandeIntervention, 'id' | 'reference' | 'created_at' | 'updated_at' | 'photos_avant' | 'photos_apres'> & { id?: string; reference?: string; created_at?: string; updated_at?: string; photos_avant?: string[]; photos_apres?: string[] };
        Update: Partial<Omit<DemandeIntervention, 'id'>>;
      };
      marches_rehabilitation: {
        Row: MarcheRehabilitation;
        Insert: Omit<MarcheRehabilitation, 'id' | 'reference' | 'created_at' | 'updated_at'> & { id?: string; reference?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<MarcheRehabilitation, 'id'>>;
      };
      maintenance_preventive: {
        Row: MaintenancePreventive;
        Insert: Omit<MaintenancePreventive, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<MaintenancePreventive, 'id'>>;
      };
      baux: {
        Row: Bail;
        Insert: Omit<Bail, 'id' | 'reference' | 'created_at' | 'updated_at' | 'montant_impaye'> & { id?: string; reference?: string; created_at?: string; updated_at?: string; montant_impaye?: number };
        Update: Partial<Omit<Bail, 'id'>>;
      };
      paiements: {
        Row: Paiement;
        Insert: Omit<Paiement, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Paiement, 'id'>>;
      };
      cessions: {
        Row: Cession;
        Insert: Omit<Cession, 'id' | 'reference' | 'created_at' | 'updated_at'> & { id?: string; reference?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Cession, 'id'>>;
      };
      mouvements_stock: {
        Row: MouvementStock;
        Insert: Omit<MouvementStock, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<MouvementStock, 'id'>>;
      };
      charges: {
        Row: Charge;
        Insert: Omit<Charge, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Charge, 'id'>>;
      };
      conversations_ia: {
        Row: ConversationIA;
        Insert: Omit<ConversationIA, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<ConversationIA, 'id'>>;
      };
      messages_ia: {
        Row: MessageIA;
        Insert: Omit<MessageIA, 'id' | 'created_at' | 'sources'> & { id?: string; created_at?: string; sources?: string[] };
        Update: Partial<Omit<MessageIA, 'id'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Document, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AuditLog, 'id'>>;
      };
    };
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: Record<string, unknown>;
      };
      get_biens_par_province: {
        Args: Record<string, never>;
        Returns: { province_id: string; province_nom: string; province_code: string; nb_biens: number; valeur_totale: number }[];
      };
      recherche_globale: {
        Args: { terme: string; limite?: number };
        Returns: Record<string, unknown>;
      };
      calculer_impaye: {
        Args: { p_bail_id: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      type_bien_immobilier: TypeBienImmobilier;
      etat_bien_immobilier: EtatBienImmobilier;
      categorie_bien_mobilier: CategorieBienMobilier;
      etat_bien_mobilier: EtatBienMobilier;
      type_affectation: TypeAffectation;
      statut_affectation: StatutAffectation;
      type_intervention: TypeIntervention;
      priorite_intervention: PrioriteIntervention;
      statut_intervention: StatutIntervention;
      frequence_bail: FrequenceBail;
      statut_bail: StatutBail;
      mode_paiement: ModePaiement;
      statut_paiement: StatutPaiement;
      type_charge: TypeCharge;
      statut_charge: StatutCharge;
      statut_marche: StatutMarche;
      frequence_maintenance: FrequenceMaintenance;
      statut_planification: StatutPlanification;
      role_message: RoleMessage;
      type_document: TypeDocument;
      canal_notification: CanalNotification;
      statut_notification: StatutNotification;
      action_audit: ActionAudit;
    };
  };
}
