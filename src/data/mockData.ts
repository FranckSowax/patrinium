// Données mockées pour PATRINIUM

import type { 
  BienImmobilier, 
  BienMobilier, 
  Affectation, 
  DemandeIntervention, 
  Bail, 
  Paiement,
  Charge,
  MarcheRehabilitation,
  MessageIA,
  Province
} from '@/types';

export const provinces: Province[] = [
  { id: '1', nom: 'Estuaire', code: 'EST', biensCount: 145 },
  { id: '2', nom: 'Haut-Ogooué', code: 'HOG', biensCount: 67 },
  { id: '3', nom: 'Moyen-Ogooué', code: 'MOG', biensCount: 34 },
  { id: '4', nom: 'Ngounié', code: 'NGO', biensCount: 28 },
  { id: '5', nom: 'Nyanga', code: 'NYA', biensCount: 22 },
  { id: '6', nom: 'Ogooué-Ivindo', code: 'OIV', biensCount: 31 },
  { id: '7', nom: 'Ogooué-Lolo', code: 'OLO', biensCount: 19 },
  { id: '8', nom: 'Ogooué-Maritime', code: 'OMA', biensCount: 43 },
  { id: '9', nom: 'Woleu-Ntem', code: 'WNT', biensCount: 38 },
];

export const biensImmobiliers: BienImmobilier[] = [
  {
    id: '1',
    reference: 'IM-2024-001',
    nom: 'Immeuble Administratif Central',
    type: 'bureau',
    adresse: 'Boulevard Triomphal, Libreville',
    province: 'Estuaire',
    superficie: 2500,
    valeur: 2500000000,
    etat: 'bon',
    affectataire: 'Ministère des Comptes Publics',
    dateAcquisition: '2015-03-15',
    titreFoncier: 'TF-12345-LBV',
    latitude: 0.4162,
    longitude: 9.4673,
    photos: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'],
    qrCode: 'QR-IM-001'
  },
  {
    id: '2',
    reference: 'IM-2024-002',
    nom: 'Résidence du Gouverneur',
    type: 'logement',
    adresse: 'Quartier Louis, Port-Gentil',
    province: 'Ogooué-Maritime',
    superficie: 800,
    valeur: 800000000,
    etat: 'excellent',
    affectataire: 'Gouverneur Ogooué-Maritime',
    dateAcquisition: '2018-07-22',
    titreFoncier: 'TF-23456-PGE',
    latitude: -0.7167,
    longitude: 8.7833,
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
    qrCode: 'QR-IM-002'
  },
  {
    id: '3',
    reference: 'IM-2024-003',
    nom: 'Entrepôt Provincial',
    type: 'entrepot',
    adresse: 'Zone Industrielle, Franceville',
    province: 'Haut-Ogooué',
    superficie: 1500,
    valeur: 450000000,
    etat: 'moyen',
    affectataire: 'Ministère des Travaux Publics',
    dateAcquisition: '2012-11-08',
    titreFoncier: 'TF-34567-FRV',
    latitude: -1.6333,
    longitude: 13.5833,
    photos: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'],
    qrCode: 'QR-IM-003'
  },
  {
    id: '4',
    reference: 'IM-2024-004',
    nom: 'Terrain vacant - Akanda',
    type: 'terrain',
    adresse: 'Akanda, Libreville',
    province: 'Estuaire',
    superficie: 5000,
    valeur: 500000000,
    etat: 'bon',
    dateAcquisition: '2020-01-10',
    titreFoncier: 'TF-45678-AKD',
    latitude: 0.4667,
    longitude: 9.5167,
    photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
    qrCode: 'QR-IM-004'
  },
  {
    id: '5',
    reference: 'IM-2024-005',
    nom: 'Bureau Régional Oyem',
    type: 'bureau',
    adresse: 'Centre-ville, Oyem',
    province: 'Woleu-Ntem',
    superficie: 400,
    valeur: 200000000,
    etat: 'bon',
    affectataire: 'Direction Régionale des Impôts',
    dateAcquisition: '2019-05-20',
    titreFoncier: 'TF-56789-OYE',
    latitude: 1.6000,
    longitude: 11.5667,
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'],
    qrCode: 'QR-IM-005'
  },
  {
    id: '6',
    reference: 'IM-2024-006',
    nom: 'Immeuble de Rapport',
    type: 'bureau',
    adresse: 'Rue du Commerce, Libreville',
    province: 'Estuaire',
    superficie: 1200,
    valeur: 1200000000,
    etat: 'excellent',
    dateAcquisition: '2017-09-14',
    titreFoncier: 'TF-67890-LBV2',
    latitude: 0.3900,
    longitude: 9.4500,
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
    qrCode: 'QR-IM-006'
  },
  {
    id: '7',
    reference: 'IM-2024-007',
    nom: 'Centre de Santé Mouila',
    type: 'autre',
    adresse: 'Mouila Centre',
    province: 'Ngounié',
    superficie: 600,
    valeur: 300000000,
    etat: 'moyen',
    affectataire: 'Ministère de la Santé',
    dateAcquisition: '2016-04-30',
    titreFoncier: 'TF-78901-MOU',
    latitude: -1.8667,
    longitude: 11.0667,
    photos: ['https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400'],
    qrCode: 'QR-IM-007'
  },
  {
    id: '8',
    reference: 'IM-2024-008',
    nom: 'Résidence Fonctionnaire',
    type: 'logement',
    adresse: 'Quartier Résidentiel, Lambaréné',
    province: 'Moyen-Ogooué',
    superficie: 350,
    valeur: 175000000,
    etat: 'bon',
    affectataire: 'Préfet Moyen-Ogooué',
    dateAcquisition: '2021-08-12',
    titreFoncier: 'TF-89012-LAM',
    latitude: -0.7000,
    longitude: 10.2333,
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
    qrCode: 'QR-IM-008'
  }
];

export const biensMobiliers: BienMobilier[] = [
  {
    id: '1',
    reference: 'MO-2024-001',
    nom: 'Toyota Land Cruiser',
    categorie: 'vehicule',
    marque: 'Toyota',
    modele: 'Land Cruiser Prado',
    numeroSerie: 'JTELU5JR9B5000001',
    valeur: 45000000,
    dateAcquisition: '2023-02-15',
    etat: 'bon',
    affectataire: 'DGPE - Directeur Général',
    ministere: 'Ministère des Comptes Publics',
    localisation: 'Libreville',
    qrCode: 'QR-MO-001'
  },
  {
    id: '2',
    reference: 'MO-2024-002',
    nom: 'Ordinateur Portable HP',
    categorie: 'ordinateur',
    marque: 'HP',
    modele: 'EliteBook 840',
    numeroSerie: '5CG1234567',
    valeur: 850000,
    dateAcquisition: '2023-06-20',
    etat: 'neuf',
    affectataire: 'Service Informatique DGPE',
    ministere: 'Ministère des Comptes Publics',
    localisation: 'Libreville',
    qrCode: 'QR-MO-002'
  },
  {
    id: '3',
    reference: 'MO-2024-003',
    nom: 'Mobilier Bureau Direction',
    categorie: 'mobilier',
    valeur: 2500000,
    dateAcquisition: '2022-11-10',
    etat: 'bon',
    affectataire: 'Cabinet DGPE',
    ministere: 'Ministère des Comptes Publics',
    localisation: 'Libreville',
    qrCode: 'QR-MO-003'
  },
  {
    id: '4',
    reference: 'MO-2024-004',
    nom: 'Groupe Électrogène',
    categorie: 'equipement',
    marque: 'Cummins',
    modele: 'C33D5',
    numeroSerie: 'CUM-2024-001',
    valeur: 8500000,
    dateAcquisition: '2023-01-08',
    etat: 'bon',
    affectataire: 'Direction Provinciale Estuaire',
    ministere: 'Ministère des Comptes Publics',
    localisation: 'Libreville',
    qrCode: 'QR-MO-004'
  },
  {
    id: '5',
    reference: 'MO-2024-005',
    nom: 'Imprimante Multifonction',
    categorie: 'equipement',
    marque: 'Canon',
    modele: 'imageRUNNER C3226i',
    numeroSerie: 'CN-123456',
    valeur: 1200000,
    dateAcquisition: '2023-09-05',
    etat: 'neuf',
    affectataire: 'Service Administratif',
    ministere: 'Ministère des Comptes Publics',
    localisation: 'Libreville',
    qrCode: 'QR-MO-005'
  }
];

export const affectations: Affectation[] = [
  {
    id: '1',
    reference: 'AFF-2024-001',
    type: 'immobilier',
    bienId: '1',
    bienNom: 'Immeuble Administratif Central',
    demandeur: 'Ministère des Comptes Publics',
    ministere: 'Ministère des Comptes Publics',
    dateDemande: '2024-01-15',
    dateValidation: '2024-01-20',
    statut: 'approuve',
    validePar: 'Directeur Général DGPE',
    pvAffectation: 'PV-2024-001'
  },
  {
    id: '2',
    reference: 'AFF-2024-002',
    type: 'mobilier',
    bienId: '2',
    bienNom: 'Ordinateur Portable HP',
    demandeur: 'Service Informatique',
    ministere: 'Ministère des Comptes Publics',
    dateDemande: '2024-02-10',
    statut: 'en_attente'
  },
  {
    id: '3',
    reference: 'AFF-2024-003',
    type: 'immobilier',
    bienId: '4',
    bienNom: 'Terrain vacant - Akanda',
    demandeur: 'Ministère de l\'Éducation',
    ministere: 'Ministère de l\'Éducation Nationale',
    dateDemande: '2024-02-20',
    statut: 'en_attente'
  }
];

export const demandesIntervention: DemandeIntervention[] = [
  {
    id: '1',
    reference: 'INT-2024-001',
    bienId: '1',
    bienNom: 'Immeuble Administratif Central',
    type: 'corrective',
    priorite: 'haute',
    description: 'Climatisation en panne - Bureau du Directeur',
    demandeur: 'M. Jean Koumba',
    contact: '+241 06 12 34 56',
    dateDemande: '2024-03-10',
    dateIntervention: '2024-03-12',
    statut: 'termine',
    technicien: 'TechnoClim SARL',
    cout: 450000,
    whatsappNotif: true
  },
  {
    id: '2',
    reference: 'INT-2024-002',
    bienId: '3',
    bienNom: 'Entrepôt Provincial',
    type: 'preventive',
    priorite: 'moyenne',
    description: 'Entretien annuel groupe électrogène',
    demandeur: 'Mme Marie Nkoghe',
    contact: '+241 07 23 45 67',
    dateDemande: '2024-03-15',
    statut: 'en_cours',
    technicien: 'Cummins Gabon',
    whatsappNotif: true
  },
  {
    id: '3',
    reference: 'INT-2024-003',
    bienId: '7',
    bienNom: 'Centre de Santé Mouila',
    type: 'corrective',
    priorite: 'urgente',
    description: 'Fuite d\'eau importante - Salle d\'attente',
    demandeur: 'Dr. Paul Mba',
    contact: '+241 05 34 56 78',
    dateDemande: '2024-03-18',
    statut: 'nouveau',
    whatsappNotif: false
  }
];

export const baux: Bail[] = [
  {
    id: '1',
    reference: 'BAIL-2024-001',
    bienId: '6',
    bienNom: 'Immeuble de Rapport',
    locataire: 'Société Gabonaise de Banque',
    contact: '+241 01 72 00 00',
    montantLoyer: 2500000,
    frequence: 'mensuel',
    dateDebut: '2023-01-01',
    dateFin: '2025-12-31',
    statut: 'actif',
    dernierPaiement: '2024-03-01',
    impaye: 0
  },
  {
    id: '2',
    reference: 'BAIL-2024-002',
    bienId: '2',
    bienNom: 'Résidence du Gouverneur (Annexe)',
    locataire: 'M. Alain Ondo',
    contact: '+241 06 45 67 89',
    montantLoyer: 1500000,
    frequence: 'mensuel',
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    statut: 'actif',
    dernierPaiement: '2024-02-01',
    impaye: 1500000
  }
];

export const paiements: Paiement[] = [
  {
    id: '1',
    bailId: '1',
    montant: 2500000,
    datePaiement: '2024-03-01',
    mode: 'virement',
    referenceTransaction: 'VIR-2024-001',
    statut: 'succes'
  },
  {
    id: '2',
    bailId: '1',
    montant: 2500000,
    datePaiement: '2024-02-01',
    mode: 'airtel_money',
    referenceTransaction: 'AM-123456789',
    statut: 'succes'
  }
];

export const charges: Charge[] = [
  {
    id: '1',
    type: 'electricite',
    beneficiaire: 'Immeuble Administratif Central',
    ministere: 'Ministère des Comptes Publics',
    montant: 2500000,
    dateFacture: '2024-02-28',
    datePaiement: '2024-03-05',
    statut: 'paye',
    reference: 'FACT-SEEG-2024-001'
  },
  {
    id: '2',
    type: 'eau',
    beneficiaire: 'Résidence du Gouverneur',
    ministere: 'Ministère de l\'Intérieur',
    montant: 450000,
    dateFacture: '2024-02-28',
    statut: 'en_attente',
    reference: 'FACT-SEEG-2024-002'
  },
  {
    id: '3',
    type: 'medical',
    beneficiaire: 'M. Jean Koumba',
    ministere: 'Ministère des Comptes Publics',
    montant: 750000,
    dateFacture: '2024-03-01',
    statut: 'en_attente'
  }
];

export const marchesRehabilitation: MarcheRehabilitation[] = [
  {
    id: '1',
    reference: 'MAR-2024-001',
    nom: 'Réhabilitation Immeuble Administratif',
    prestataire: 'BTP Gabon SARL',
    montant: 150000000,
    dateDebut: '2024-01-15',
    dateFinPrevu: '2024-06-15',
    tauxAvancement: 45,
    statut: 'en_cours'
  },
  {
    id: '2',
    reference: 'MAR-2024-002',
    nom: 'Rénovation Résidence Gouverneur',
    prestataire: 'Construction Moderne SA',
    montant: 85000000,
    dateDebut: '2023-09-01',
    dateFinPrevu: '2024-02-01',
    dateFinReelle: '2024-03-01',
    tauxAvancement: 100,
    statut: 'termine'
  }
];

export const messagesIA: MessageIA[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Bonjour ! Je suis l\'assistant IA de la DGPE. Comment puis-je vous aider aujourd\'hui ?',
    timestamp: '2024-03-18T08:00:00Z'
  }
];

// Statistiques pour le dashboard
export const statsDashboard = {
  totalBiensImmobiliers: 487,
  totalBiensMobiliers: 12543,
  valeurTotalePatrimoine: 285000000000,
  tauxOccupation: 78,
  revenusLoyersAnnuels: 156000000,
  interventionsEnCours: 23,
  interventionsTerminees: 156,
  bauxActifs: 89,
  impayes: 12500000,
  affectationsEnAttente: 12
};

// Données pour les graphiques
export const dataRevenusMensuels = [
  { mois: 'Jan', loyers: 12500000, charges: 8500000 },
  { mois: 'Fév', loyers: 13200000, charges: 7800000 },
  { mois: 'Mar', loyers: 12800000, charges: 9200000 },
  { mois: 'Avr', loyers: 13500000, charges: 8100000 },
  { mois: 'Mai', loyers: 14000000, charges: 7600000 },
  { mois: 'Juin', loyers: 13800000, charges: 8900000 },
];

export const dataBiensParProvince = [
  { province: 'Estuaire', biens: 145 },
  { province: 'Haut-Ogooué', biens: 67 },
  { province: 'Ogooué-Maritime', biens: 43 },
  { province: 'Woleu-Ntem', biens: 38 },
  { province: 'Ogooué-Ivindo', biens: 31 },
  { province: 'Autres', biens: 163 },
];

export const dataEtatBiens = [
  { etat: 'Excellent', count: 89, color: '#10b981' },
  { etat: 'Bon', count: 234, color: '#3b82f6' },
  { etat: 'Moyen', count: 112, color: '#f59e0b' },
  { etat: 'Mauvais', count: 52, color: '#ef4444' },
];

export const dataInterventions = [
  { mois: 'Jan', nouvelles: 45, terminees: 38 },
  { mois: 'Fév', nouvelles: 52, terminees: 48 },
  { mois: 'Mar', nouvelles: 48, terminees: 52 },
  { mois: 'Avr', nouvelles: 61, terminees: 55 },
  { mois: 'Mai', nouvelles: 55, terminees: 58 },
  { mois: 'Juin', nouvelles: 67, terminees: 62 },
];
