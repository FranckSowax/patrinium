import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  QrCode,
  Laptop,
  Car,
  Armchair,
  Wrench,
  Building2,
  Eye,
  Edit,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw
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
} from '@/components/ui/dialog';
import { useBiensMobiliers } from '@/hooks/useSupabase';
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

const getCategorieIcon = (categorie: string) => {
  switch (categorie) {
    case 'ordinateur': return <Laptop className="w-4 h-4" />;
    case 'vehicule': return <Car className="w-4 h-4" />;
    case 'mobilier': return <Armchair className="w-4 h-4" />;
    case 'equipement': return <Wrench className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const getCategorieColor = (categorie: string) => {
  switch (categorie) {
    case 'ordinateur': return 'bg-blue-100 text-blue-700';
    case 'vehicule': return 'bg-emerald-100 text-emerald-700';
    case 'mobilier': return 'bg-amber-100 text-amber-700';
    case 'equipement': return 'bg-purple-100 text-purple-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getEtatColor = (etat: string) => {
  switch (etat) {
    case 'neuf': return 'bg-emerald-100 text-emerald-700';
    case 'bon': return 'bg-blue-100 text-blue-700';
    case 'use': return 'bg-amber-100 text-amber-700';
    case 'hors_service': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const dataParCategorie = [
  { name: 'Ordinateurs', value: 5234, color: '#3b82f6' },
  { name: 'Véhicules', value: 892, color: '#10b981' },
  { name: 'Mobilier', value: 4210, color: '#f59e0b' },
  { name: 'Équipements', value: 2207, color: '#8b5cf6' },
];

const dataParMinistere = [
  { ministere: 'Comptes Publics', biens: 3245 },
  { ministere: 'Éducation', biens: 2890 },
  { ministere: 'Santé', biens: 2156 },
  { ministere: 'Intérieur', biens: 1876 },
  { ministere: 'Travaux Publics', biens: 1234 },
  { ministere: 'Autres', biens: 3142 },
];

export function InventaireModule() {
  const { data: biensMobiliers, loading, error } = useBiensMobiliers();
  const [selectedBien, setSelectedBien] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600">Erreur lors du chargement des biens mobiliers</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comptabilité-Matières</h1>
          <p className="text-slate-500 mt-1">Inventaire interministériel des biens mobiliers de l'État</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Synchroniser
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Bien
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Biens</p>
                <p className="text-2xl font-bold">12,543</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valeur Totale</p>
                <p className="text-lg font-bold">{formatCurrency(28500000000).replace('XAF', '')} FCFA</p>
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
                <p className="text-sm text-slate-500">Ministères Connectés</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">À Réformer</p>
                <p className="text-2xl font-bold text-red-600">156</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataParCategorie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataParCategorie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biens par Ministère</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataParMinistere} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="ministere" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="biens" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tous" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tous">Tous les Biens</TabsTrigger>
          <TabsTrigger value="ordinateurs">Ordinateurs</TabsTrigger>
          <TabsTrigger value="vehicules">Véhicules</TabsTrigger>
          <TabsTrigger value="mobilier">Mobilier</TabsTrigger>
          <TabsTrigger value="equipements">Équipements</TabsTrigger>
        </TabsList>

        <TabsContent value="tous">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Inventaire des Biens Mobiliers</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scanner QR
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Marque/Modèle</TableHead>
                    <TableHead>Affectataire</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {biensMobiliers.map((bien) => (
                    <TableRow key={bien.id}>
                      <TableCell className="font-medium">{bien.reference}</TableCell>
                      <TableCell>{bien.nom}</TableCell>
                      <TableCell>
                        <Badge className={getCategorieColor(bien.categorie)}>
                          {getCategorieIcon(bien.categorie)}
                          <span className="ml-1 capitalize">{bien.categorie}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bien.marque && bien.modele ? `${bien.marque} ${bien.modele}` : '-'}
                      </TableCell>
                      <TableCell>{bien.affectataire}</TableCell>
                      <TableCell>
                        <Badge className={getEtatColor(bien.etat)}>
                          {bien.etat === 'neuf' ? 'Neuf' :
                           bien.etat === 'bon' ? 'Bon' :
                           bien.etat === 'use' ? 'Usé' : 'Hors service'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(bien.valeur)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setSelectedBien(bien); setQrDialogOpen(true); }}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
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

        {['ordinateurs', 'vehicules', 'mobilier', 'equipements'].map((categorie) => (
          <TabsContent key={categorie} value={categorie}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{categorie}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Marque/Modèle</TableHead>
                      <TableHead>N° Série</TableHead>
                      <TableHead>Affectataire</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead>Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {biensMobiliers
                      .filter(b => b.categorie === categorie.slice(0, -1))
                      .map((bien) => (
                        <TableRow key={bien.id}>
                          <TableCell className="font-medium">{bien.reference}</TableCell>
                          <TableCell>{bien.nom}</TableCell>
                          <TableCell>{bien.marque} {bien.modele}</TableCell>
                          <TableCell>{bien.numero_serie || '-'}</TableCell>
                          <TableCell>{bien.affectataire}</TableCell>
                          <TableCell>
                            <Badge className={getEtatColor(bien.etat)}>
                              {bien.etat}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(bien.valeur)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code du Bien</DialogTitle>
          </DialogHeader>
          {selectedBien && (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
              <div>
                <p className="font-medium">{selectedBien.nom}</p>
                <p className="text-sm text-slate-500">{selectedBien.reference}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="outline" className="flex-1">
                  Imprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
