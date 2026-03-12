#!/usr/bin/env node
// Seed Supabase avec les données de démonstration PATRINIUM
import pg from 'pg';

const DATABASE_URL = 'postgresql://postgres:BPePyKVgslFm6SVL@db.cubjvrpgqalhoidmnerg.supabase.co:5432/postgres';

async function seed() {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connecte. Insertion des donnees...');

  // Récupérer les IDs des provinces
  const { rows: provRows } = await client.query(`SELECT id, nom FROM provinces ORDER BY nom`);
  const prov = Object.fromEntries(provRows.map(r => [r.nom, r.id]));

  // Récupérer les IDs des ministères
  const { rows: minRows } = await client.query(`SELECT id, nom FROM ministeres ORDER BY nom`);
  const min = Object.fromEntries(minRows.map(r => [r.nom, r.id]));

  // ─── BIENS IMMOBILIERS ───
  console.log('  Biens immobiliers...');
  const biensImmo = [
    { ref: 'IM-2024-001', nom: 'Immeuble Administratif Central', type: 'bureau', adresse: 'Boulevard Triomphal, Libreville', province: 'Estuaire', superficie: 2500, valeur: 2500000000, etat: 'bon', ministere: 'Ministère des Comptes Publics', date: '2015-03-15', titre: 'TF-12345-LBV', lat: 0.4162, lng: 9.4673, qr: 'QR-IM-001', etages: 5, annee: 2014 },
    { ref: 'IM-2024-002', nom: 'Résidence du Gouverneur', type: 'logement', adresse: 'Quartier Louis, Port-Gentil', province: 'Ogooué-Maritime', superficie: 800, valeur: 800000000, etat: 'excellent', ministere: "Ministère de l'Intérieur", date: '2018-07-22', titre: 'TF-23456-PGE', lat: -0.7167, lng: 8.7833, qr: 'QR-IM-002', etages: 2, annee: 2017 },
    { ref: 'IM-2024-003', nom: 'Entrepôt Provincial', type: 'entrepot', adresse: 'Zone Industrielle, Franceville', province: 'Haut-Ogooué', superficie: 1500, valeur: 450000000, etat: 'moyen', ministere: 'Ministère des Travaux Publics', date: '2012-11-08', titre: 'TF-34567-FRV', lat: -1.6333, lng: 13.5833, qr: 'QR-IM-003', etages: 1, annee: 2010 },
    { ref: 'IM-2024-004', nom: 'Terrain vacant - Akanda', type: 'terrain', adresse: 'Akanda, Libreville', province: 'Estuaire', superficie: 5000, valeur: 500000000, etat: 'bon', ministere: null, date: '2020-01-10', titre: 'TF-45678-AKD', lat: 0.4667, lng: 9.5167, qr: 'QR-IM-004', etages: null, annee: null },
    { ref: 'IM-2024-005', nom: 'Bureau Régional Oyem', type: 'bureau', adresse: 'Centre-ville, Oyem', province: 'Woleu-Ntem', superficie: 400, valeur: 200000000, etat: 'bon', ministere: "Ministère de l'Économie et des Finances", date: '2019-05-20', titre: 'TF-56789-OYE', lat: 1.6000, lng: 11.5667, qr: 'QR-IM-005', etages: 3, annee: 2018 },
    { ref: 'IM-2024-006', nom: 'Immeuble de Rapport', type: 'bureau', adresse: 'Rue du Commerce, Libreville', province: 'Estuaire', superficie: 1200, valeur: 1200000000, etat: 'excellent', ministere: null, date: '2017-09-14', titre: 'TF-67890-LBV2', lat: 0.3900, lng: 9.4500, qr: 'QR-IM-006', etages: 6, annee: 2016 },
    { ref: 'IM-2024-007', nom: 'Centre de Santé Mouila', type: 'autre', adresse: 'Mouila Centre', province: 'Ngounié', superficie: 600, valeur: 300000000, etat: 'moyen', ministere: 'Ministère de la Santé', date: '2016-04-30', titre: 'TF-78901-MOU', lat: -1.8667, lng: 11.0667, qr: 'QR-IM-007', etages: 1, annee: 2015 },
    { ref: 'IM-2024-008', nom: 'Résidence Fonctionnaire', type: 'logement', adresse: 'Quartier Résidentiel, Lambaréné', province: 'Moyen-Ogooué', superficie: 350, valeur: 175000000, etat: 'bon', ministere: "Ministère de l'Intérieur", date: '2021-08-12', titre: 'TF-89012-LAM', lat: -0.7000, lng: 10.2333, qr: 'QR-IM-008', etages: 1, annee: 2020 },
    { ref: 'IM-2024-009', nom: 'Préfecture de Tchibanga', type: 'bureau', adresse: 'Centre-ville, Tchibanga', province: 'Nyanga', superficie: 700, valeur: 380000000, etat: 'bon', ministere: "Ministère de l'Intérieur", date: '2014-06-18', titre: 'TF-90123-TCH', lat: -2.85, lng: 11.0167, qr: 'QR-IM-009', etages: 2, annee: 2013 },
    { ref: 'IM-2024-010', nom: 'Lycée National de Makokou', type: 'autre', adresse: 'Boulevard Principal, Makokou', province: 'Ogooué-Ivindo', superficie: 3000, valeur: 900000000, etat: 'moyen', ministere: "Ministère de l'Éducation Nationale", date: '2008-09-01', titre: 'TF-01234-MAK', lat: 0.5667, lng: 12.85, qr: 'QR-IM-010', etages: 2, annee: 2007 },
    { ref: 'IM-2024-011', nom: 'Tribunal de Koulamoutou', type: 'bureau', adresse: 'Avenue de la Justice, Koulamoutou', province: 'Ogooué-Lolo', superficie: 550, valeur: 280000000, etat: 'bon', ministere: 'Ministère de la Justice', date: '2016-03-22', titre: 'TF-11234-KOU', lat: -1.1333, lng: 12.4833, qr: 'QR-IM-011', etages: 2, annee: 2015 },
    { ref: 'IM-2024-012', nom: 'Caserne Militaire Estuaire', type: 'autre', adresse: 'Camp de Baraka, Libreville', province: 'Estuaire', superficie: 8000, valeur: 3500000000, etat: 'bon', ministere: 'Ministère de la Défense Nationale', date: '2000-01-15', titre: null, lat: 0.41, lng: 9.48, qr: 'QR-IM-012', etages: 3, annee: 1998 },
  ];

  const bienImmoIds = {};
  for (const b of biensImmo) {
    const { rows } = await client.query(
      `INSERT INTO biens_immobiliers (reference, nom, type, adresse, province_id, superficie, valeur, etat, affectataire_id, date_acquisition, titre_foncier, latitude, longitude, qr_code, nombre_etages, annee_construction)
       VALUES ($1,$2,$3::type_bien_immobilier,$4,$5,$6,$7,$8::etat_bien_immobilier,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (reference) DO NOTHING RETURNING id`,
      [b.ref, b.nom, b.type, b.adresse, prov[b.province], b.superficie, b.valeur, b.etat, b.ministere ? min[b.ministere] : null, b.date, b.titre, b.lat, b.lng, b.qr, b.etages, b.annee]
    );
    if (rows.length) bienImmoIds[b.ref] = rows[0].id;
  }

  // ─── BIENS MOBILIERS ───
  console.log('  Biens mobiliers...');
  const biensMob = [
    { ref: 'MO-2024-001', nom: 'Toyota Land Cruiser', cat: 'vehicule', marque: 'Toyota', modele: 'Land Cruiser Prado', serie: 'JTELU5JR9B5000001', valeur: 45000000, date: '2023-02-15', etat: 'bon', affect: 'DGPE - Directeur Général', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-001' },
    { ref: 'MO-2024-002', nom: 'Ordinateur Portable HP', cat: 'ordinateur', marque: 'HP', modele: 'EliteBook 840', serie: '5CG1234567', valeur: 850000, date: '2023-06-20', etat: 'neuf', affect: 'Service Informatique DGPE', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-002' },
    { ref: 'MO-2024-003', nom: 'Mobilier Bureau Direction', cat: 'mobilier', marque: null, modele: null, serie: null, valeur: 2500000, date: '2022-11-10', etat: 'bon', affect: 'Cabinet DGPE', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-003' },
    { ref: 'MO-2024-004', nom: 'Groupe Électrogène', cat: 'equipement', marque: 'Cummins', modele: 'C33D5', serie: 'CUM-2024-001', valeur: 8500000, date: '2023-01-08', etat: 'bon', affect: 'Direction Provinciale Estuaire', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-004' },
    { ref: 'MO-2024-005', nom: 'Imprimante Multifonction', cat: 'equipement', marque: 'Canon', modele: 'imageRUNNER C3226i', serie: 'CN-123456', valeur: 1200000, date: '2023-09-05', etat: 'neuf', affect: 'Service Administratif', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-005' },
    { ref: 'MO-2024-006', nom: 'Nissan Patrol', cat: 'vehicule', marque: 'Nissan', modele: 'Patrol Y62', serie: 'JN1TBSY62Z0000123', valeur: 38000000, date: '2022-05-10', etat: 'bon', affect: 'Directeur Patrimoine Immobilier', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-006' },
    { ref: 'MO-2024-007', nom: 'Serveur Dell PowerEdge', cat: 'ordinateur', marque: 'Dell', modele: 'PowerEdge R740', serie: 'DELL-SRV-001', valeur: 12000000, date: '2023-03-15', etat: 'neuf', affect: 'Data Center DGPE', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-007' },
    { ref: 'MO-2024-008', nom: 'Climatiseur Split', cat: 'equipement', marque: 'Samsung', modele: 'WindFree 24000BTU', serie: 'SAM-AC-001', valeur: 950000, date: '2023-07-20', etat: 'neuf', affect: 'Bureau DG', ministere: 'Ministère des Comptes Publics', loc: 'Libreville', qr: 'QR-MO-008' },
    { ref: 'MO-2024-009', nom: 'Photocopieur Ricoh', cat: 'equipement', marque: 'Ricoh', modele: 'MP C3003', serie: 'RIC-789012', valeur: 3500000, date: '2021-11-20', etat: 'use', affect: 'Service Courrier', ministere: "Ministère de l'Éducation Nationale", loc: 'Libreville', qr: 'QR-MO-009' },
    { ref: 'MO-2024-010', nom: 'Ambulance Toyota Hiace', cat: 'vehicule', marque: 'Toyota', modele: 'Hiace Ambulance', serie: 'TOY-AMB-001', valeur: 32000000, date: '2022-09-01', etat: 'bon', affect: 'Centre de Santé Mouila', ministere: 'Ministère de la Santé', loc: 'Mouila', qr: 'QR-MO-010' },
  ];

  const bienMobIds = {};
  for (const b of biensMob) {
    const { rows } = await client.query(
      `INSERT INTO biens_mobiliers (reference, nom, categorie, marque, modele, numero_serie, valeur, date_acquisition, etat, affectataire, ministere_id, province_id, localisation, qr_code)
       VALUES ($1,$2,$3::categorie_bien_mobilier,$4,$5,$6,$7,$8,$9::etat_bien_mobilier,$10,$11,$12,$13,$14)
       ON CONFLICT (reference) DO NOTHING RETURNING id`,
      [b.ref, b.nom, b.cat, b.marque, b.modele, b.serie, b.valeur, b.date, b.etat, b.affect, min[b.ministere], prov['Estuaire'], b.loc, b.qr]
    );
    if (rows.length) bienMobIds[b.ref] = rows[0].id;
  }

  // ─── DEMANDES D'INTERVENTION ───
  console.log('  Demandes intervention...');
  const interventions = [
    { ref: 'INT-2024-001', bien: 'IM-2024-001', type: 'corrective', priorite: 'haute', desc: "Climatisation en panne - Bureau du Directeur", demandeur: 'M. Jean Koumba', contact: '+241 06 12 34 56', date: '2024-03-10', dateInt: '2024-03-12', dateFin: '2024-03-12', statut: 'termine', tech: 'TechnoClim SARL', cout: 450000, whatsapp: true },
    { ref: 'INT-2024-002', bien: 'IM-2024-003', type: 'preventive', priorite: 'moyenne', desc: "Entretien annuel groupe électrogène", demandeur: 'Mme Marie Nkoghe', contact: '+241 07 23 45 67', date: '2024-03-15', dateInt: null, dateFin: null, statut: 'en_cours', tech: 'Cummins Gabon', cout: null, whatsapp: true },
    { ref: 'INT-2024-003', bien: 'IM-2024-007', type: 'corrective', priorite: 'urgente', desc: "Fuite d'eau importante - Salle d'attente", demandeur: 'Dr. Paul Mba', contact: '+241 05 34 56 78', date: '2024-03-18', dateInt: null, dateFin: null, statut: 'nouveau', tech: null, cout: null, whatsapp: false },
    { ref: 'INT-2024-004', bien: 'IM-2024-005', type: 'corrective', priorite: 'haute', desc: "Panne électrique généralisée 2ème étage", demandeur: 'M. Albert Ndong', contact: '+241 06 45 00 12', date: '2024-03-20', dateInt: null, dateFin: null, statut: 'nouveau', tech: null, cout: null, whatsapp: true },
    { ref: 'INT-2024-005', bien: 'IM-2024-002', type: 'preventive', priorite: 'basse', desc: "Révision annuelle système anti-incendie", demandeur: 'M. Patrick Obame', contact: '+241 07 11 22 33', date: '2024-02-20', dateInt: '2024-03-01', dateFin: '2024-03-02', statut: 'termine', tech: 'Sécurité Gabon SA', cout: 780000, whatsapp: false },
  ];

  for (const i of interventions) {
    await client.query(
      `INSERT INTO demandes_intervention (reference, bien_immobilier_id, type, priorite, description, demandeur_nom, demandeur_contact, date_demande, date_intervention, date_fin, statut, technicien, cout, whatsapp_notif)
       VALUES ($1,$2,$3::type_intervention,$4::priorite_intervention,$5,$6,$7,$8,$9,$10,$11::statut_intervention,$12,$13,$14)
       ON CONFLICT (reference) DO NOTHING`,
      [i.ref, bienImmoIds[i.bien], i.type, i.priorite, i.desc, i.demandeur, i.contact, i.date, i.dateInt, i.dateFin, i.statut, i.tech, i.cout, i.whatsapp]
    );
  }

  // ─── MARCHÉS DE RÉHABILITATION ───
  console.log('  Marchés réhabilitation...');
  const marches = [
    { ref: 'MAR-2024-001', nom: 'Réhabilitation Immeuble Administratif', prest: 'BTP Gabon SARL', bien: 'IM-2024-001', montant: 150000000, debut: '2024-01-15', finPrev: '2024-06-15', finReel: null, taux: 45, statut: 'en_cours' },
    { ref: 'MAR-2024-002', nom: 'Rénovation Résidence Gouverneur', prest: 'Construction Moderne SA', bien: 'IM-2024-002', montant: 85000000, debut: '2023-09-01', finPrev: '2024-02-01', finReel: '2024-03-01', taux: 100, statut: 'termine' },
    { ref: 'MAR-2024-003', nom: 'Étanchéité Centre de Santé Mouila', prest: 'Bâtipro Gabon', bien: 'IM-2024-007', montant: 25000000, debut: '2024-02-01', finPrev: '2024-04-30', finReel: null, taux: 30, statut: 'retarde' },
  ];

  for (const m of marches) {
    await client.query(
      `INSERT INTO marches_rehabilitation (reference, nom, prestataire, bien_immobilier_id, montant, date_debut, date_fin_prevu, date_fin_reelle, taux_avancement, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::statut_marche)
       ON CONFLICT (reference) DO NOTHING`,
      [m.ref, m.nom, m.prest, bienImmoIds[m.bien], m.montant, m.debut, m.finPrev, m.finReel, m.taux, m.statut]
    );
  }

  // ─── MAINTENANCE PRÉVENTIVE ───
  console.log('  Maintenance préventive...');
  const maintPrev = [
    { bien: 'IM-2024-001', equip: 'Climatisation - Immeuble Central', freq: 'trimestrielle', proch: '2024-04-15', dern: '2024-01-15', statut: 'a_venir', cout: 350000 },
    { bien: 'IM-2024-003', equip: 'Groupe Électrogène - Entrepôt Franceville', freq: 'mensuelle', proch: '2024-04-01', dern: '2024-03-01', statut: 'en_retard', cout: 120000 },
    { bien: 'IM-2024-005', equip: 'Ascenseur - Bureau Régional Oyem', freq: 'semestrielle', proch: '2024-05-20', dern: '2023-11-20', statut: 'a_venir', cout: 500000 },
    { bien: 'IM-2024-001', equip: 'Système Incendie - Immeuble Central', freq: 'annuelle', proch: '2024-06-10', dern: '2023-06-10', statut: 'a_venir', cout: 280000 },
  ];

  for (const mp of maintPrev) {
    await client.query(
      `INSERT INTO maintenance_preventive (bien_immobilier_id, equipement, frequence, prochaine_date, derniere_date, statut, cout_estime)
       VALUES ($1,$2,$3::frequence_maintenance,$4,$5,$6::statut_planification,$7)`,
      [bienImmoIds[mp.bien], mp.equip, mp.freq, mp.proch, mp.dern, mp.statut, mp.cout]
    );
  }

  // ─── BAUX ───
  console.log('  Baux...');
  const bauxData = [
    { ref: 'BAIL-2024-001', bien: 'IM-2024-006', loc: 'Société Gabonaise de Banque', contact: '+241 01 72 00 00', email: 'contact@sgb.ga', loyer: 2500000, freq: 'mensuel', debut: '2023-01-01', fin: '2025-12-31', statut: 'actif', dernPaie: '2024-03-01', impaye: 0, caution: 5000000 },
    { ref: 'BAIL-2024-002', bien: 'IM-2024-002', loc: 'M. Alain Ondo', contact: '+241 06 45 67 89', email: null, loyer: 1500000, freq: 'mensuel', debut: '2024-01-01', fin: '2024-12-31', statut: 'actif', dernPaie: '2024-02-01', impaye: 1500000, caution: 3000000 },
    { ref: 'BAIL-2024-003', bien: 'IM-2024-001', loc: 'Cabinet Juridique Mba & Associés', contact: '+241 01 44 55 66', email: 'cabinet@mba-assoc.ga', loyer: 3500000, freq: 'mensuel', debut: '2022-06-01', fin: '2025-05-31', statut: 'actif', dernPaie: '2024-03-01', impaye: 0, caution: 7000000 },
    { ref: 'BAIL-2024-004', bien: 'IM-2024-006', loc: 'Assurances NSIA Gabon', contact: '+241 01 76 22 33', email: 'nsia@nsia.ga', loyer: 2800000, freq: 'mensuel', debut: '2023-03-01', fin: '2026-02-28', statut: 'actif', dernPaie: '2024-01-01', impaye: 5600000, caution: 5600000 },
  ];

  const bauxIds = {};
  for (const b of bauxData) {
    const { rows } = await client.query(
      `INSERT INTO baux (reference, bien_immobilier_id, locataire_nom, locataire_contact, locataire_email, montant_loyer, frequence, date_debut, date_fin, statut, dernier_paiement, montant_impaye, caution)
       VALUES ($1,$2,$3,$4,$5,$6,$7::frequence_bail,$8,$9,$10::statut_bail,$11,$12,$13)
       ON CONFLICT (reference) DO NOTHING RETURNING id`,
      [b.ref, bienImmoIds[b.bien], b.loc, b.contact, b.email, b.loyer, b.freq, b.debut, b.fin, b.statut, b.dernPaie, b.impaye, b.caution]
    );
    if (rows.length) bauxIds[b.ref] = rows[0].id;
  }

  // ─── PAIEMENTS ───
  console.log('  Paiements...');
  const paiementsData = [
    { bail: 'BAIL-2024-001', montant: 2500000, date: '2024-03-01', mode: 'virement', ref: 'VIR-2024-001', statut: 'succes' },
    { bail: 'BAIL-2024-001', montant: 2500000, date: '2024-02-01', mode: 'airtel_money', ref: 'AM-123456789', statut: 'succes' },
    { bail: 'BAIL-2024-001', montant: 2500000, date: '2024-01-01', mode: 'airtel_money', ref: 'AM-123456780', statut: 'succes' },
    { bail: 'BAIL-2024-002', montant: 1500000, date: '2024-02-01', mode: 'moov_money', ref: 'MM-987654321', statut: 'succes' },
    { bail: 'BAIL-2024-002', montant: 1500000, date: '2024-01-01', mode: 'moov_money', ref: 'MM-987654320', statut: 'succes' },
    { bail: 'BAIL-2024-003', montant: 3500000, date: '2024-03-01', mode: 'virement', ref: 'VIR-2024-010', statut: 'succes' },
    { bail: 'BAIL-2024-003', montant: 3500000, date: '2024-02-01', mode: 'virement', ref: 'VIR-2024-009', statut: 'succes' },
    { bail: 'BAIL-2024-004', montant: 2800000, date: '2024-01-01', mode: 'especes', ref: 'ESP-2024-001', statut: 'succes' },
    { bail: 'BAIL-2024-002', montant: 1500000, date: '2024-03-15', mode: 'airtel_money', ref: 'AM-ECHEC-001', statut: 'echec' },
  ];

  for (const p of paiementsData) {
    if (!bauxIds[p.bail]) continue;
    await client.query(
      `INSERT INTO paiements (bail_id, montant, date_paiement, mode, reference_transaction, statut)
       VALUES ($1,$2,$3,$4::mode_paiement,$5,$6::statut_paiement)`,
      [bauxIds[p.bail], p.montant, p.date, p.mode, p.ref, p.statut]
    );
  }

  // ─── CHARGES ───
  console.log('  Charges...');
  const chargesData = [
    { type: 'electricite', benef: 'Immeuble Administratif Central', ministere: 'Ministère des Comptes Publics', bien: 'IM-2024-001', montant: 2500000, dateFact: '2024-02-28', datePaie: '2024-03-05', statut: 'paye', ref: 'FACT-SEEG-2024-001', fourn: 'SEEG' },
    { type: 'eau', benef: 'Résidence du Gouverneur', ministere: "Ministère de l'Intérieur", bien: 'IM-2024-002', montant: 450000, dateFact: '2024-02-28', datePaie: null, statut: 'en_attente', ref: 'FACT-SEEG-2024-002', fourn: 'SEEG' },
    { type: 'medical', benef: 'M. Jean Koumba', ministere: 'Ministère des Comptes Publics', bien: null, montant: 750000, dateFact: '2024-03-01', datePaie: null, statut: 'en_attente', ref: 'REMB-MED-2024-001', fourn: 'CNAMGS' },
    { type: 'electricite', benef: 'Bureau Régional Oyem', ministere: "Ministère de l'Économie et des Finances", bien: 'IM-2024-005', montant: 680000, dateFact: '2024-02-28', datePaie: '2024-03-10', statut: 'paye', ref: 'FACT-SEEG-2024-003', fourn: 'SEEG' },
    { type: 'telecom', benef: 'DGPE - Central', ministere: 'Ministère des Comptes Publics', bien: 'IM-2024-001', montant: 1200000, dateFact: '2024-03-01', datePaie: null, statut: 'en_attente', ref: 'FACT-GABON-TEL-001', fourn: 'Gabon Télécom' },
    { type: 'funerailles', benef: 'Famille Mba (agent retraité)', ministere: 'Ministère des Comptes Publics', bien: null, montant: 500000, dateFact: '2024-03-05', datePaie: '2024-03-08', statut: 'paye', ref: 'REMB-FUN-2024-001', fourn: null },
    { type: 'eau', benef: 'Entrepôt Provincial Franceville', ministere: 'Ministère des Travaux Publics', bien: 'IM-2024-003', montant: 320000, dateFact: '2024-02-28', datePaie: null, statut: 'en_attente', ref: 'FACT-SEEG-2024-004', fourn: 'SEEG' },
    { type: 'electricite', benef: 'Centre de Santé Mouila', ministere: 'Ministère de la Santé', bien: 'IM-2024-007', montant: 890000, dateFact: '2024-02-28', datePaie: null, statut: 'en_attente', ref: 'FACT-SEEG-2024-005', fourn: 'SEEG' },
  ];

  for (const c of chargesData) {
    await client.query(
      `INSERT INTO charges (type, beneficiaire, ministere_id, bien_immobilier_id, montant, date_facture, date_paiement, statut, reference, fournisseur)
       VALUES ($1::type_charge,$2,$3,$4,$5,$6,$7,$8::statut_charge,$9,$10)`,
      [c.type, c.benef, min[c.ministere], c.bien ? bienImmoIds[c.bien] : null, c.montant, c.dateFact, c.datePaie, c.statut, c.ref, c.fourn]
    );
  }

  // ─── AFFECTATIONS ───
  // Note: sans auth.users, on ne peut pas créer de profils liés, donc on insert
  // les affectations sans demandeur_id pour le seed
  console.log('  Affectations...');
  // Skip affectations requiring profile references for now - they need auth users

  console.log('\nSeed terminé avec succès !');

  // Résumé
  const counts = await client.query(`
    SELECT
      (SELECT count(*) FROM biens_immobiliers) as biens_immo,
      (SELECT count(*) FROM biens_mobiliers) as biens_mob,
      (SELECT count(*) FROM demandes_intervention) as interventions,
      (SELECT count(*) FROM marches_rehabilitation) as marches,
      (SELECT count(*) FROM maintenance_preventive) as maint_prev,
      (SELECT count(*) FROM baux) as baux,
      (SELECT count(*) FROM paiements) as paiements,
      (SELECT count(*) FROM charges) as charges,
      (SELECT count(*) FROM provinces) as provinces,
      (SELECT count(*) FROM ministeres) as ministeres
  `);
  console.log('\nRésumé :');
  const c = counts.rows[0];
  console.log(`  Provinces:              ${c.provinces}`);
  console.log(`  Ministères:             ${c.ministeres}`);
  console.log(`  Biens immobiliers:      ${c.biens_immo}`);
  console.log(`  Biens mobiliers:        ${c.biens_mob}`);
  console.log(`  Demandes intervention:  ${c.interventions}`);
  console.log(`  Marchés réhabilitation: ${c.marches}`);
  console.log(`  Maintenance préventive: ${c.maint_prev}`);
  console.log(`  Baux:                   ${c.baux}`);
  console.log(`  Paiements:              ${c.paiements}`);
  console.log(`  Charges:                ${c.charges}`);

  await client.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
