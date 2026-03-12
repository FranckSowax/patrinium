import {
  Building2,
  Package,
  TrendingUp,
  Wrench,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  AlertCircle,
  Car,
  Landmark,
  ArrowRightLeft,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  useDashboardStats,
  useRevenusVsCharges,
  useBiensParProvince,
  useEtatBiens,
  useInterventionsMensuelles,
  useInterventions,
  useBaux,
  usePatrimoineGlobalStats
} from '@/hooks/useSupabase';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value);

export function Dashboard() {
  const { stats, loading } = useDashboardStats();
  const { data: dataRevenusMensuels } = useRevenusVsCharges();
  const { data: dataBiensParProvince } = useBiensParProvince();
  const { data: dataEtatBiens } = useEtatBiens();
  const { data: dataInterventions } = useInterventionsMensuelles();
  const { data: interventionsRaw } = useInterventions();
  const { data: bauxRaw } = useBaux();
  const { stats: patrimoineStats } = usePatrimoineGlobalStats();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interventions = interventionsRaw as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baux = bauxRaw as any[];

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-96"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500 mt-1">Vue d'ensemble du patrimoine de l'État gabonais</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
          Système opérationnel
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Biens Immobiliers</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatNumber(stats.total_biens_immobiliers)}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">+12</span>
                  <span className="text-sm text-slate-400">ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Biens Mobiliers</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatNumber(stats.total_biens_mobiliers)}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">+234</span>
                  <span className="text-sm text-slate-400">ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Valeur du Patrimoine</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(stats.valeur_patrimoine_immobilier + stats.valeur_patrimoine_mobilier).replace('XAF', '')}</h3>
                <p className="text-xs text-slate-400">FCFA</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">+5.2%</span>
                  <span className="text-sm text-slate-400">vs 2023</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Interventions</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.interventions_en_cours}</h3>
                <p className="text-sm text-slate-400 mt-1">en cours</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">-8%</span>
                  <span className="text-sm text-slate-400">vs mois dernier</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Revenus Loyers (Annuels)</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.revenus_loyers_annuels)}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">+12%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Taux d'Occupation</p>
                  <p className="text-lg font-bold text-slate-900">{stats.taux_occupation ?? 0}%</p>
                </div>
              </div>
              <div className="w-24"><Progress value={stats.taux_occupation ?? 0} className="h-2" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                <div>
                  <p className="text-sm text-slate-500">Impayés</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.total_impayes)}</p>
                </div>
              </div>
              <Badge variant="destructive">{baux.filter((b: { montant_impaye: number }) => b.montant_impaye > 0).length} baux</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patrimoine Elargi — Missions DGPE */}
      {patrimoineStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Car className="w-5 h-5 text-indigo-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500">Parc Automobile</p>
                    <p className="text-lg font-bold text-slate-900">{patrimoineStats.total_vehicules ?? 0} vehicules</p>
                    <p className="text-xs text-emerald-600">{patrimoineStats.vehicules_en_service ?? 0} en service</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><Landmark className="w-5 h-5 text-teal-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500">Concessions Domaniales</p>
                    <p className="text-lg font-bold text-slate-900">{patrimoineStats.total_concessions ?? 0} parcelles</p>
                    <p className="text-xs text-slate-500">{formatNumber(patrimoineStats.superficie_totale_ha ?? 0)} ha</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-orange-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500">Cessions</p>
                    <p className="text-lg font-bold text-slate-900">{patrimoineStats.total_cessions ?? 0} operations</p>
                    <p className="text-xs text-amber-600">{patrimoineStats.cessions_en_cours ?? 0} en cours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-cyan-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500">Redevances Annuelles</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(patrimoineStats.redevances_annuelles ?? 0)}</p>
                    <p className="text-xs text-slate-500">concessions attribuees</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Évolution des Revenus vs Charges</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dataRevenusMensuels}>
                <defs>
                  <linearGradient id="colorLoyers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorCharges" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="loyers" name="Loyers" stroke="#10b981" fillOpacity={1} fill="url(#colorLoyers)" />
                <Area type="monotone" dataKey="charges" name="Charges" stroke="#ef4444" fillOpacity={1} fill="url(#colorCharges)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Biens par Province</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataBiensParProvince} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="province" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="biens" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">État des Biens</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataEtatBiens} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="count">
                  {dataEtatBiens.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg font-semibold">Interventions Mensuelles</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataInterventions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="nouvelles" name="Nouvelles demandes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="terminees" name="Interventions terminées" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Interventions Récentes</CardTitle>
            <Badge variant="outline" className="text-xs">{interventions.filter((i: { statut: string }) => i.statut !== 'termine' && i.statut !== 'annule').length} en cours</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interventions.slice(0, 5).map((intervention: { id: string; statut: string; biens_immobiliers?: { nom: string }; description: string; priorite: string; date_demande: string }) => (
                <div key={intervention.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${intervention.statut === 'nouveau' ? 'bg-blue-500' : intervention.statut === 'en_cours' ? 'bg-amber-500' : intervention.statut === 'termine' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{intervention.biens_immobiliers?.nom || 'Bien non spécifié'}</p>
                    <p className="text-xs text-slate-500 truncate">{intervention.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{intervention.priorite === 'urgente' ? 'Urgent' : intervention.priorite === 'haute' ? 'Haute' : intervention.priorite === 'moyenne' ? 'Moyenne' : 'Basse'}</Badge>
                      <span className="text-xs text-slate-400">{intervention.date_demande}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Baux Actifs</CardTitle>
            <Badge variant="outline" className="text-xs">{baux.filter((b: { statut: string }) => b.statut === 'actif').length} actifs</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {baux.filter((b: { statut: string }) => b.statut === 'actif').slice(0, 5).map((bail: { id: string; biens_immobiliers?: { nom: string }; reference: string; locataire_nom: string; montant_loyer: number; montant_impaye: number }) => (
                <div key={bail.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{bail.biens_immobiliers?.nom || bail.reference}</p>
                    <p className="text-xs text-slate-500 truncate">{bail.locataire_nom}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium text-emerald-600">{formatCurrency(bail.montant_loyer)}/mois</span>
                      {bail.montant_impaye > 0 && <Badge variant="destructive" className="text-xs">{formatCurrency(bail.montant_impaye)} impayé</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
