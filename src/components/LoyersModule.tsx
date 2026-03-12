import { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Building2,
  User,
  Calendar,
  Phone,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useBaux, usePaiements } from '@/hooks/useSupabase';

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
  Legend,
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'actif': return 'bg-emerald-100 text-emerald-700';
    case 'resilie': return 'bg-red-100 text-red-700';
    case 'expire': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const dataPaiementsMode = [
  { name: 'Airtel Money', value: 45, color: '#ef4444' },
  { name: 'Moov Money', value: 30, color: '#3b82f6' },
  { name: 'Virement', value: 20, color: '#10b981' },
  { name: 'Espèces', value: 5, color: '#f59e0b' },
];

const dataRevenusMensuels = [
  { mois: 'Jan', prevu: 15000000, recu: 14200000 },
  { mois: 'Fév', prevu: 15000000, recu: 13800000 },
  { mois: 'Mar', prevu: 15000000, recu: 14500000 },
  { mois: 'Avr', prevu: 15500000, recu: 0 },
];

export function LoyersModule() {
  const [selectedBail, setSelectedBail] = useState<any>(null);
  const [paiementDialogOpen, setPaiementDialogOpen] = useState(false);

  const { data: bauxData, loading: loadingBaux } = useBaux();
  const { data: paiementsData, loading: loadingPaiements } = usePaiements();
  const loading = loadingBaux || loadingPaiements;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  const totalPrevu = bauxData.filter(b => b.statut === 'actif').reduce((acc, b) => acc + b.montant_loyer, 0);
  const totalImpaye = bauxData.reduce((acc, b) => acc + (b.montant_impaye || 0), 0);
  const totalRecu = paiementsData.reduce((acc, p) => acc + p.montant, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Valorisation & Loyers</h1>
          <p className="text-slate-500 mt-1">Gestion locative et encaissement des revenus patrimoniaux</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapport
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Bail
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Loyers Prévus (Mois)</p>
                <p className="text-xl font-bold">{formatCurrency(totalPrevu)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Loyers Reçus</p>
                <p className="text-xl font-bold">{formatCurrency(totalRecu)}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Impayés</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalImpaye)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Taux de Recouvrement</p>
                <p className="text-xl font-bold">{totalPrevu > 0 ? Math.round((totalRecu / totalPrevu) * 100) : 0}%</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prévu vs Reçu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataRevenusMensuels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="prevu" name="Prévu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recu" name="Reçu" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modes de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataPaiementsMode}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPaiementsMode.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="baux" className="space-y-4">
        <TabsList>
          <TabsTrigger value="baux">Baux Actifs</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
          <TabsTrigger value="impayes">
            Impayés
            {totalImpaye > 0 && <Badge className="ml-2 bg-red-500">!</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cessions">Cessions</TabsTrigger>
        </TabsList>

        <TabsContent value="baux">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Registre des Baux</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Loyer</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bauxData.map((bail) => (
                    <TableRow key={bail.id}>
                      <TableCell className="font-medium">{bail.reference}</TableCell>
                      <TableCell>{bail.biens_immobiliers?.nom || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {bail.locataire_nom}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatCurrency(bail.montant_loyer)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{bail.date_debut} → {bail.date_fin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadge(bail.statut)}>
                          {bail.statut.charAt(0).toUpperCase() + bail.statut.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedBail(bail); setPaiementDialogOpen(true); }}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paiements">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiementsData.map((paiement) => (
                    <TableRow key={paiement.id}>
                      <TableCell className="font-medium">{paiement.reference_transaction}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(paiement.montant)}</TableCell>
                      <TableCell>{paiement.date_paiement}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {paiement.mode === 'airtel_money' && <Smartphone className="w-4 h-4 text-red-500" />}
                          {paiement.mode === 'moov_money' && <Smartphone className="w-4 h-4 text-blue-500" />}
                          {paiement.mode === 'virement' && <CreditCard className="w-4 h-4 text-emerald-500" />}
                          <span className="capitalize">{paiement.mode.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={paiement.statut === 'succes' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {paiement.statut === 'succes' ? 'Succès' : 'Échec'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impayes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Loyers Impayés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bauxData.filter(b => (b.montant_impaye || 0) > 0).map((bail) => (
                  <div key={bail.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{bail.biens_immobiliers?.nom || '-'}</p>
                        <p className="text-sm text-slate-500">{bail.locataire_nom}</p>
                        <p className="text-xs text-slate-400">Dernier paiement: {bail.dernier_paiement || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{formatCurrency(bail.montant_impaye || 0)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-1" />
                          Relancer
                        </Button>
                        <Button size="sm" className="bg-emerald-600">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Payer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cessions">
          <Card>
            <CardHeader>
              <CardTitle>Biens en Cession</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Aucun bien en cession pour le moment</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Initier une cession
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Paiement Dialog */}
      <Dialog open={paiementDialogOpen} onOpenChange={setPaiementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un Paiement</DialogTitle>
          </DialogHeader>
          {selectedBail && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Bail</p>
                <p className="font-medium">{selectedBail.reference}</p>
                <p className="text-sm">{selectedBail.biens_immobiliers?.nom || '-'}</p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {formatCurrency(selectedBail.montant_loyer)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-red-500" />
                    Airtel Money
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    Moov Money
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    Virement
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    Espèces
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaiementDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-emerald-600">
              Confirmer le Paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
