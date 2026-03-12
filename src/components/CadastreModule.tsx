import { useState } from 'react';
import { 
  Map as MapIcon, 
  Search, 
  Plus, 
  QrCode, 
  FileText,
  Building2,
  Home,
  Warehouse,
  MapPin,
  Download,
  Eye,
  Edit
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
import { useBiensImmobiliers, useProvinces } from '@/hooks/useSupabase';
import { Spinner } from '@/components/ui/spinner';

// Composant carte simplifié (sans Leaflet pour éviter les problèmes SSR)
function SimpleMap({ biens, onSelectBien }: { biens: any[], onSelectBien: (bien: any) => void }) {
  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden">
      {/* Fond de carte stylisé */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50">
        {/* Grille de coordonnées */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Représentation simplifiée du Gabon */}
        <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full opacity-30">
          <path 
            d="M150,50 Q200,30 250,60 Q300,100 320,150 Q340,200 330,250 Q320,300 280,350 Q240,400 200,450 Q160,420 120,380 Q80,340 70,280 Q60,220 80,160 Q100,100 150,50Z" 
            fill="#10b981" 
            stroke="#059669" 
            strokeWidth="2"
          />
        </svg>

        {/* Marqueurs de biens */}
        {biens.map((bien, index) => {
          // Position simplifiée basée sur l'index pour la démo
          const top = 20 + (index * 12) % 60;
          const left = 15 + (index * 15) % 70;
          
          return (
            <button
              key={bien.id}
              onClick={() => onSelectBien(bien)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45" />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded">
                    {bien.nom}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium text-slate-700 mb-2">Légende</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full" />
            <span className="text-xs text-slate-600">Bureau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-slate-600">Logement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-xs text-slate-600">Entrepôt</span>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="bg-white shadow-lg">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" className="bg-white shadow-lg">
          <MapIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'bureau': return <Building2 className="w-4 h-4" />;
    case 'logement': return <Home className="w-4 h-4" />;
    case 'entrepot': return <Warehouse className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'bureau': return 'bg-blue-100 text-blue-700';
    case 'logement': return 'bg-emerald-100 text-emerald-700';
    case 'entrepot': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getEtatColor = (etat: string) => {
  switch (etat) {
    case 'excellent': return 'bg-emerald-100 text-emerald-700';
    case 'bon': return 'bg-blue-100 text-blue-700';
    case 'moyen': return 'bg-amber-100 text-amber-700';
    case 'mauvais': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};

export function CadastreModule() {
  const [selectedBien, setSelectedBien] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');

  const { data: biensImmobiliers, loading: biensLoading, error: biensError } = useBiensImmobiliers({
    province_id: filterProvince || undefined,
    search: searchTerm || undefined,
  });
  const { data: provinces, loading: provincesLoading } = useProvinces();

  const filteredBiens = biensImmobiliers ?? [];

  if (biensLoading || provincesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (biensError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Erreur de chargement : {biensError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastre Numérique</h1>
          <p className="text-slate-500 mt-1">Système d'Information Géographique du patrimoine immobilier</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
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
                <p className="text-2xl font-bold">{filteredBiens.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valeur Totale</p>
                <p className="text-lg font-bold">{formatCurrency(6835000000).replace('XAF', '')} FCFA</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Provinces Couvertes</p>
                <p className="text-2xl font-bold">9</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Titres Fonciers</p>
                <p className="text-2xl font-bold">{filteredBiens.filter(b => b.titre_foncier).length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="carte" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carte">Vue Carte</TabsTrigger>
          <TabsTrigger value="liste">Vue Liste</TabsTrigger>
          <TabsTrigger value="titres">Coffre-fort Titres</TabsTrigger>
        </TabsList>

        <TabsContent value="carte" className="space-y-4">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <SimpleMap biens={filteredBiens} onSelectBien={setSelectedBien} />
            </CardContent>
          </Card>

          {selectedBien && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedBien.nom}</CardTitle>
                    <p className="text-sm text-slate-500">{selectedBien.reference}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <Badge className={getTypeColor(selectedBien.type)}>
                      {getTypeIcon(selectedBien.type)}
                      <span className="ml-1 capitalize">{selectedBien.type}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">État</p>
                    <Badge className={getEtatColor(selectedBien.etat)}>
                      {selectedBien.etat}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Superficie</p>
                    <p className="font-medium">{selectedBien.superficie} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Valeur</p>
                    <p className="font-medium">{formatCurrency(selectedBien.valeur)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="liste">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Liste des Biens Immobiliers</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Rechercher..."
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                  >
                    <option value="">Toutes les provinces</option>
                    {(provinces ?? []).map(p => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Superficie</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBiens.map((bien) => (
                    <TableRow key={bien.id}>
                      <TableCell className="font-medium">{bien.reference}</TableCell>
                      <TableCell>{bien.nom}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(bien.type)}>
                          {getTypeIcon(bien.type)}
                          <span className="ml-1 capitalize">{bien.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{bien.provinces?.nom}</TableCell>
                      <TableCell>{bien.superficie} m²</TableCell>
                      <TableCell>{formatCurrency(bien.valeur)}</TableCell>
                      <TableCell>
                        <Badge className={getEtatColor(bien.etat)}>
                          {bien.etat}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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

        <TabsContent value="titres">
          <Card>
            <CardHeader>
              <CardTitle>Coffre-fort Numérique des Titres de Propriété</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBiens.filter(b => b.titre_foncier).map((bien) => (
                  <Card key={bien.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{bien.titre_foncier}</p>
                          <p className="text-sm text-slate-500 truncate">{bien.nom}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {bien.provinces?.nom}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              Acq. {new Date(bien.date_acquisition).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Consulter
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
