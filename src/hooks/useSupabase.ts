import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Hook générique ─────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useSupabaseQuery(
  queryFn: () => PromiseLike<{ data: any[] | null; error: { message: string } | null }>,
  deps: unknown[] = []
): UseQueryResult<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await queryFn();
    if (error) setError(error.message);
    else setData((data ?? []));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Référentiels ───────────────────────────────────────────────────────

export function useProvinces() {
  return useSupabaseQuery(() =>
    supabase.from('provinces').select('*').order('nom')
  );
}

export function useMinisteres() {
  return useSupabaseQuery(() =>
    supabase.from('ministeres').select('*').order('nom')
  );
}

// ─── Module 1 : Cadastre Numérique (SIG) ────────────────────────────────

export function useBiensImmobiliers(filters?: { province_id?: string; type?: string; search?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('biens_immobiliers')
      .select('*, provinces!inner(nom, code), ministeres(nom)')
      .order('created_at', { ascending: false });

    if (filters?.province_id) q = q.eq('province_id', filters.province_id);
    if (filters?.type) q = q.eq('type', filters.type);
    if (filters?.search) q = q.or(`nom.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
    return q;
  }, [filters?.province_id, filters?.type, filters?.search]);
}

// ─── Module 2 : Affectations ────────────────────────────────────────────

export function useAffectations(filters?: { statut?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('affectations')
      .select('*, ministeres(nom), biens_immobiliers(nom), biens_mobiliers(nom)')
      .order('date_demande', { ascending: false });

    if (filters?.statut) q = q.eq('statut', filters.statut);
    return q;
  }, [filters?.statut]);
}

// ─── Module 3 : GMAO Maintenance ────────────────────────────────────────

export function useInterventions(filters?: { statut?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('demandes_intervention')
      .select('*, biens_immobiliers(nom, adresse)')
      .order('date_demande', { ascending: false });

    if (filters?.statut) q = q.eq('statut', filters.statut);
    return q;
  }, [filters?.statut]);
}

export function useMarchesRehabilitation() {
  return useSupabaseQuery(() =>
    supabase
      .from('marches_rehabilitation')
      .select('*, biens_immobiliers(nom)')
      .order('date_debut', { ascending: false })
  );
}

export function useMaintenancePreventive() {
  return useSupabaseQuery(() =>
    supabase
      .from('maintenance_preventive')
      .select('*, biens_immobiliers(nom)')
      .order('prochaine_date')
  );
}

// ─── Module 4 : Valorisation & Loyers ───────────────────────────────────

export function useBaux(filters?: { statut?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('baux')
      .select('*, biens_immobiliers(nom, adresse)')
      .order('created_at', { ascending: false });

    if (filters?.statut) q = q.eq('statut', filters.statut);
    return q;
  }, [filters?.statut]);
}

export function usePaiements(bailId?: string) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('paiements')
      .select('*, baux(reference, locataire_nom)')
      .order('date_paiement', { ascending: false });

    if (bailId) q = q.eq('bail_id', bailId);
    return q;
  }, [bailId]);
}

// ─── Module 5 : Comptabilité-Matières ───────────────────────────────────

export function useBiensMobiliers(filters?: { categorie?: string; search?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('biens_mobiliers')
      .select('*, ministeres(nom)')
      .order('created_at', { ascending: false });

    if (filters?.categorie) q = q.eq('categorie', filters.categorie);
    if (filters?.search) q = q.or(`nom.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
    return q;
  }, [filters?.categorie, filters?.search]);
}

// ─── Module 6 : Charges ─────────────────────────────────────────────────

export function useCharges(filters?: { type?: string; statut?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('charges')
      .select('*, ministeres(nom)')
      .order('date_facture', { ascending: false });

    if (filters?.type) {
      if (filters.type === 'sociales') {
        q = q.in('type', ['medical', 'funerailles']);
      } else {
        q = q.eq('type', filters.type);
      }
    }
    if (filters?.statut) q = q.eq('statut', filters.statut);
    return q;
  }, [filters?.type, filters?.statut]);
}

// ─── Module 7 / Dashboard : Stats ───────────────────────────────────────

interface DashboardStats {
  total_biens_immobiliers: number;
  total_biens_mobiliers: number;
  valeur_patrimoine_immobilier: number;
  valeur_patrimoine_mobilier: number;
  baux_actifs: number;
  revenus_loyers_annuels: number;
  total_impayes: number;
  interventions_en_cours: number;
  interventions_terminees_mois: number;
  affectations_en_attente: number;
  taux_occupation: number;
  provinces_couvertes: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) setError(error.message);
    else setStats(data as unknown as DashboardStats);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}

// ─── Données graphiques (requêtes agrégées) ─────────────────────────────

export function useBiensParProvince() {
  const [data, setData] = useState<{ province: string; biens: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase.rpc('get_biens_par_province') as { data: any[] | null };
      if (rows) {
        setData(rows.map((r: { province_nom: string; nb_biens: number }) => ({
          province: r.province_nom,
          biens: Number(r.nb_biens)
        })));
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}

export function useRevenusVsCharges() {
  const [data, setData] = useState<{ mois: string; loyers: number; charges: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Revenus par mois
      const { data: paiements } = await supabase
        .from('paiements')
        .select('montant, date_paiement')
        .eq('statut', 'succes');

      // Charges par mois
      const { data: charges } = await supabase
        .from('charges')
        .select('montant, date_facture');

      const moisMap: Record<string, { loyers: number; charges: number }> = {};

      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      (paiements ?? []).forEach((p: { montant: number; date_paiement: string }) => {
        const d = new Date(p.date_paiement);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const label = moisNoms[d.getMonth()];
        if (!moisMap[key]) moisMap[key] = { loyers: 0, charges: 0 };
        moisMap[key].loyers += Number(p.montant);
        // Store label for later
        (moisMap[key] as { loyers: number; charges: number; label?: string }).label = label;
      });

      (charges ?? []).forEach((c: { montant: number; date_facture: string }) => {
        const d = new Date(c.date_facture);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const label = moisNoms[d.getMonth()];
        if (!moisMap[key]) moisMap[key] = { loyers: 0, charges: 0 };
        moisMap[key].charges += Number(c.montant);
        (moisMap[key] as { loyers: number; charges: number; label?: string }).label = label;
      });

      const result = Object.entries(moisMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => ({
          mois: (v as { label?: string }).label || '',
          loyers: v.loyers,
          charges: v.charges
        }));

      setData(result);
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}

export function useEtatBiens() {
  const [data, setData] = useState<{ etat: string; count: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from('biens_immobiliers')
        .select('etat');

      const colors: Record<string, string> = {
        excellent: '#10b981',
        bon: '#3b82f6',
        moyen: '#f59e0b',
        mauvais: '#ef4444'
      };

      const counts: Record<string, number> = {};
      (rows ?? []).forEach((r: { etat: string }) => {
        counts[r.etat] = (counts[r.etat] || 0) + 1;
      });

      setData(Object.entries(counts).map(([etat, count]) => ({
        etat: etat.charAt(0).toUpperCase() + etat.slice(1),
        count,
        color: colors[etat] || '#94a3b8'
      })));
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}

// ─── Module : Parc Automobile ──────────────────────────────────────────

export function useVehicules(filters?: { type?: string; statut?: string; ministere_id?: string; province_id?: string; search?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('vehicules')
      .select('*, ministeres(nom), provinces(nom, code)')
      .order('created_at', { ascending: false });

    if (filters?.type) q = q.eq('type', filters.type);
    if (filters?.statut) q = q.eq('statut', filters.statut);
    if (filters?.ministere_id) q = q.eq('ministere_id', filters.ministere_id);
    if (filters?.province_id) q = q.eq('province_id', filters.province_id);
    if (filters?.search) q = q.or(`marque.ilike.%${filters.search}%,modele.ilike.%${filters.search}%,immatriculation.ilike.%${filters.search}%`);
    return q;
  }, [filters?.type, filters?.statut, filters?.ministere_id, filters?.province_id, filters?.search]);
}

// ─── Module : Concessions Domaniales ──────────────────────────────────

export function useConcessions(filters?: { type?: string; statut?: string; province_id?: string; search?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('concessions_domaniales')
      .select('*, provinces(nom, code)')
      .order('created_at', { ascending: false });

    if (filters?.type) q = q.eq('type', filters.type);
    if (filters?.statut) q = q.eq('statut', filters.statut);
    if (filters?.province_id) q = q.eq('province_id', filters.province_id);
    if (filters?.search) q = q.or(`nom.ilike.%${filters.search}%,reference.ilike.%${filters.search}%,beneficiaire_nom.ilike.%${filters.search}%`);
    return q;
  }, [filters?.type, filters?.statut, filters?.province_id, filters?.search]);
}

// ─── Module : Cessions ────────────────────────────────────────────────

export function useCessions(filters?: { statut?: string; search?: string }) {
  return useSupabaseQuery(() => {
    let q = supabase
      .from('cessions')
      .select('*, biens_immobiliers(nom), biens_mobiliers(nom)')
      .order('date_cession', { ascending: false });

    if (filters?.statut) q = q.eq('statut', filters.statut);
    if (filters?.search) q = q.or(`reference.ilike.%${filters.search}%,acheteur_nom.ilike.%${filters.search}%`);
    return q;
  }, [filters?.statut, filters?.search]);
}

// ─── Stats Patrimoine Global ──────────────────────────────────────────

export function usePatrimoineGlobalStats() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_patrimoine_global_stats') as { data: any; error: any };
    if (!error && data) setStats(data as Record<string, number>);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, refetch: fetch };
}

export function useInterventionsMensuelles() {
  const [data, setData] = useState<{ mois: string; nouvelles: number; terminees: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from('demandes_intervention')
        .select('date_demande, date_fin, statut');

      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const moisMap: Record<string, { nouvelles: number; terminees: number }> = {};

      (rows ?? []).forEach((r: { date_demande: string; date_fin: string | null; statut: string }) => {
        const d = new Date(r.date_demande);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        if (!moisMap[key]) moisMap[key] = { nouvelles: 0, terminees: 0 };
        moisMap[key].nouvelles += 1;
        if (r.statut === 'termine' && r.date_fin) {
          const df = new Date(r.date_fin);
          const keyF = `${df.getFullYear()}-${String(df.getMonth()).padStart(2, '0')}`;
          if (!moisMap[keyF]) moisMap[keyF] = { nouvelles: 0, terminees: 0 };
          moisMap[keyF].terminees += 1;
        }
      });

      const result = Object.entries(moisMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => ({
          mois: moisNoms[parseInt(key.split('-')[1])],
          ...v
        }));

      setData(result);
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}
