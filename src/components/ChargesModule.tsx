import { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Droplets,
  Zap,
  Phone,
  HeartPulse,
  Flower2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Check,
  Download
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
import { useCharges } from '@/hooks/useSupabase';
import { updateChargeStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};

// Grille officielle DGPE des frais d'inhumation
const GRILLE_INHUMATION = [
  { categorie: 'Categorie A',                  montant: 1000000 },
  { categorie: 'Categorie B',                  montant: 800000  },
  { categorie: 'Categorie C',                  montant: 700000  },
  { categorie: "Main d'oeuvre non permanente",  montant: 575000  },
  { categorie: 'Conjoint(e)',                   montant: 650000  },
  { categorie: 'Enfants a charge',             montant: 500000  },
  { categorie: 'Retraites',                    montant: 575000  },
  { categorie: 'Eleves et etudiants',          montant: 500000  },
  { categorie: 'Indigents',                    montant: 400000  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'eau': return <Droplets className="w-4 h-4 text-blue-500" />;
    case 'electricite': return <Zap className="w-4 h-4 text-amber-500" />;
    case 'telecom': return <Phone className="w-4 h-4 text-purple-500" />;
    case 'medical': return <HeartPulse className="w-4 h-4 text-red-500" />;
    case 'funerailles': return <Flower2 className="w-4 h-4 text-slate-500" />;
    default: return <Receipt className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'eau': return 'Eau';
    case 'electricite': return 'Électricité';
    case 'telecom': return 'Télécom';
    case 'medical': return 'Remb. Médical';
    case 'funerailles': return 'Frais Funérailles';
    default: return type;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'eau': return 'bg-blue-100 text-blue-700';
    case 'electricite': return 'bg-amber-100 text-amber-700';
    case 'telecom': return 'bg-purple-100 text-purple-700';
    case 'medical': return 'bg-red-100 text-red-700';
    case 'funerailles': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const dataEvolutionCharges = [
  { mois: 'Jan', eau: 2500000, electricite: 4500000, telecom: 1800000, medical: 3200000 },
  { mois: 'Fév', eau: 2300000, electricite: 4200000, telecom: 1750000, medical: 2800000 },
  { mois: 'Mar', eau: 2800000, electricite: 4800000, telecom: 1900000, medical: 3500000 },
];

export function ChargesModule() {
  const { data: charges, loading, error, refetch } = useCharges();
  const [selectedCharge, setSelectedCharge] = useState<any>(null);
  const [paiementDialogOpen, setPaiementDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Erreur lors du chargement des charges : {error}</p>
      </div>
    );
  }

  const totalEnAttente = (charges || []).filter(c => c.statut === 'en_attente').reduce((acc, c) => acc + c.montant, 0);
  const totalPaye = (charges || []).filter(c => c.statut === 'paye').reduce((acc, c) => acc + c.montant, 0);

  const handleConfirmerPaiement = async () => {
    if (!selectedCharge) return;
    await updateChargeStatut(selectedCharge.id, 'paye');
    await refetch();
    setPaiementDialogOpen(false);
    setSelectedCharge(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Charges Administratives & Sociales</h1>
          <p className="text-slate-500 mt-1">Suivi des factures et dépenses sociales des administrations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Charge
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Charges (Mois)</p>
                <p className="text-xl font-bold">{formatCurrency(totalEnAttente + totalPaye)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Payé</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaye)}</p>
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
                <p className="text-sm text-slate-500">En Attente</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(totalEnAttente)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Factures en Retard</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Évolution des Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dataEvolutionCharges}>
              <defs>
                <linearGradient id="colorEau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mois" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v/1000000}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="eau" name="Eau" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEau)" />
              <Area type="monotone" dataKey="electricite" name="Électricité" stroke="#f59e0b" fillOpacity={1} fill="url(#colorElec)" />
              <Area type="monotone" dataKey="telecom" name="Télécom" stroke="#8b5cf6" fillOpacity={0} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="medical" name="Remb. Médical" stroke="#ef4444" fillOpacity={0} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="toutes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="toutes">Toutes</TabsTrigger>
          <TabsTrigger value="eau">Eau</TabsTrigger>
          <TabsTrigger value="electricite">Électricité</TabsTrigger>
          <TabsTrigger value="telecom">Télécom</TabsTrigger>
          <TabsTrigger value="sociales">Charges Sociales</TabsTrigger>
          <TabsTrigger value="inhumation">Frais Inhumation</TabsTrigger>
        </TabsList>

        <TabsContent value="toutes">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Liste des Charges</CardTitle>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Ministère</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date Facture</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(charges || []).map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>
                        <Badge className={getTypeColor(charge.type)}>
                          {getTypeIcon(charge.type)}
                          <span className="ml-1">{getTypeLabel(charge.type)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{charge.beneficiaire}</TableCell>
                      <TableCell>{charge.ministeres?.nom || '-'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(charge.montant)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {charge.date_facture}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={charge.statut === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {charge.statut === 'paye' ? 'Payé' : 'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {charge.statut === 'en_attente' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600"
                              onClick={() => { setSelectedCharge(charge); setPaiementDialogOpen(true); }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {['eau', 'electricite', 'telecom', 'sociales'].map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{type === 'sociales' ? 'Charges Sociales' : getTypeLabel(type)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Ministère</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(charges || [])
                      .filter(c => type === 'sociales' ? (c.type === 'medical' || c.type === 'funerailles') : c.type === type)
                      .map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell>{charge.beneficiaire}</TableCell>
                          <TableCell>{charge.ministeres?.nom || '-'}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(charge.montant)}</TableCell>
                          <TableCell>{charge.date_facture}</TableCell>
                          <TableCell>
                            <Badge className={charge.statut === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {charge.statut === 'paye' ? 'Payé' : 'En attente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        {/* Onglet Inhumation */}
        <TabsContent value="inhumation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grille officielle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-slate-600" />
                  Grille Officielle DGPE
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Montants fixes par la Direction Generale du Patrimoine de l'Etat pour la prise en charge des frais d'inhumation.
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Categorie</TableHead>
                        <TableHead className="font-semibold text-right">Montant FCFA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {GRILLE_INHUMATION.map((g) => (
                        <TableRow key={g.categorie}>
                          <TableCell>{g.categorie}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(g.montant)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-slate-400 mt-3 italic">
                  Source : Direction Generale du Patrimoine de l'Etat — Ministere des Comptes Publics
                </p>
              </CardContent>
            </Card>

            {/* Dossiers funerailles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dossiers de Prise en Charge</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Charges de type funerailles enregistrees dans le systeme.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Beneficiaire</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(charges || [])
                      .filter(c => c.type === 'funerailles')
                      .map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell>{charge.beneficiaire}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(charge.montant)}</TableCell>
                          <TableCell>{charge.date_facture}</TableCell>
                          <TableCell>
                            <Badge className={charge.statut === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {charge.statut === 'paye' ? 'Paye' : 'En attente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {charge.statut === 'en_attente' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-emerald-600"
                                  onClick={() => { setSelectedCharge(charge); setPaiementDialogOpen(true); }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {(charges || []).filter(c => c.type === 'funerailles').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                          Aucun dossier d'inhumation enregistre
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Paiement Dialog */}
      <Dialog open={paiementDialogOpen} onOpenChange={setPaiementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer le Paiement</DialogTitle>
          </DialogHeader>
          {selectedCharge && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-medium">{getTypeLabel(selectedCharge.type)}</p>
                <p className="text-sm text-slate-500 mt-2">Bénéficiaire</p>
                <p className="font-medium">{selectedCharge.beneficiaire}</p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {formatCurrency(selectedCharge.montant)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaiementDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-emerald-600" onClick={handleConfirmerPaiement}>
              Confirmer le Paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
