// Types pour PATRINIUM - Gabon Patrimoine Digital

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent_central' | 'province' | 'ministere';
  province?: string;
  avatar?: string;
}

export interface BienImmobilier {
  id: string;
  reference: string;
  nom: string;
  type: 'bureau' | 'logement' | 'entrepot' | 'terrain' | 'autre';
  adresse: string;
  province: string;
  superficie: number;
  valeur: number;
  etat: 'excellent' | 'bon' | 'moyen' | 'mauvais';
  affectataire?: string;
  dateAcquisition: string;
  titreFoncier?: string;
  latitude: number;
  longitude: number;
  photos: string[];
  qrCode?: string;
}

export interface BienMobilier {
  id: string;
  reference: string;
  nom: string;
  categorie: 'ordinateur' | 'vehicule' | 'mobilier' | 'equipement';
  marque?: string;
  modele?: string;
  numeroSerie?: string;
  valeur: number;
  dateAcquisition: string;
  etat: 'neuf' | 'bon' | 'usé' | 'hors_service';
  affectataire: string;
  ministere: string;
  localisation: string;
  qrCode?: string;
}

export interface Affectation {
  id: string;
  reference: string;
  type: 'immobilier' | 'mobilier';
  bienId: string;
  bienNom: string;
  demandeur: string;
  ministere: string;
  dateDemande: string;
  dateValidation?: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  validePar?: string;
  motif?: string;
  pvAffectation?: string;
}

export interface DemandeIntervention {
  id: string;
  reference: string;
  bienId: string;
  bienNom: string;
  type: 'corrective' | 'preventive';
  priorite: 'basse' | 'moyenne' | 'haute' | 'urgente';
  description: string;
  demandeur: string;
  contact: string;
  dateDemande: string;
  dateIntervention?: string;
  statut: 'nouveau' | 'en_cours' | 'termine' | 'annule';
  technicien?: string;
  cout?: number;
  whatsappNotif: boolean;
}

export interface Bail {
  id: string;
  reference: string;
  bienId: string;
  bienNom: string;
  locataire: string;
  contact: string;
  montantLoyer: number;
  frequence: 'mensuel' | 'trimestriel' | 'annuel';
  dateDebut: string;
  dateFin: string;
  statut: 'actif' | 'resilie' | 'expire';
  dernierPaiement?: string;
  impaye: number;
}

export interface Paiement {
  id: string;
  bailId: string;
  montant: number;
  datePaiement: string;
  mode: 'airtel_money' | 'moov_money' | 'virement' | 'especes';
  referenceTransaction: string;
  statut: 'succes' | 'echec' | 'en_attente';
}

export interface Charge {
  id: string;
  type: 'eau' | 'electricite' | 'telecom' | 'medical' | 'funerailles';
  beneficiaire: string;
  ministere: string;
  montant: number;
  dateFacture: string;
  datePaiement?: string;
  statut: 'en_attente' | 'paye';
  reference?: string;
}

export interface MarcheRehabilitation {
  id: string;
  reference: string;
  nom: string;
  prestataire: string;
  montant: number;
  dateDebut: string;
  dateFinPrevu: string;
  dateFinReelle?: string;
  tauxAvancement: number;
  statut: 'en_cours' | 'termine' | 'retarde';
}

export interface MessageIA {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface KPI {
  label: string;
  value: number | string;
  variation?: number;
  unite?: string;
  icon: string;
}

export interface Province {
  id: string;
  nom: string;
  code: string;
  biensCount: number;
}
