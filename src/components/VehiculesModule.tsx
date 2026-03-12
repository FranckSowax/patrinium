import { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Fuel,
  Gauge,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  XCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVehicules, useProvinces, useMinisteres } from '@/hooks/useSupabase';
import { Spinner } from '@/components/ui/spinner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value);

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'en_service': return 'bg-emerald-100 text-emerald-700';
    case 'en_panne': return 'bg-red-100 text-red-700';
    case 'en_reparation': return 'bg-amber-100 text-amber-700';
    case 'reforme': return 'bg-slate-100 text-slate-700';
    case 'vole': return 'bg-purple-100 text-purple-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutIcon = (statut: string) => {
  switch (statut) {
    case 'en_service': return <CheckCircle2 className="w-3 h-3" />;
    case 'en_panne': return <XCircle className="w-3 h-3" />;
    case 'en_reparation': return <Wrench className="w-3 h-3" />;
    case 'reforme': return <AlertTriangle className="w-3 h-3" />;
    default: return null;
  }
};

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'en_service': return 'En service';
    case 'en_panne': return 'En panne';
    case 'en_reparation': return 'En reparation';
    case 'reforme': return 'Reforme';
    case 'vole': return 'Vole';
    default: return statut;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    berline: 'Berline', suv: 'SUV', '4x4': '4x4', pickup: 'Pick-up',
    minibus: 'Minibus', camion: 'Camion', moto: 'Moto', autre: 'Autre'
  };
  return labels[type] || type;
};

export function VehiculesModule() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [ministereFilter, setMinistereFilter] = useState('');

  const { data: vehicules, loading } = useVehicules({
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
    province_id: provinceFilter || undefined,
    ministere_id: ministereFilter || undefined,
    search: search || undefined,
  });
  const { data: provinces } = useProvinces();
  const { data: ministeres } = useMinisteres();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  const enService = vehicules.filter((v: any) => v.statut === 'en_service');
  const enPanne = vehicules.filter((v: any) => v.statut === 'en_panne' || v.statut === 'en_reparation');
  const totalValeur = vehicules.reduce((sum: number, v: any) => sum + Number(v.valeur_actuelle || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parc Automobile de l'Etat</h1>
          <p className="text-slate-500 mt-1">Gestion et suivi du parc vehicules de l'administration</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Vehicule
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Vehicules</p>
                <p className="text-2xl font-bold">{vehicules.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Service</p>
                <p className="text-2xl font-bold">{enService.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valeur du Parc</p>
                <p className="text-lg font-bold">{formatCurrency(totalValeur)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Panne / Reparation</p>
                <p className="text-2xl font-bold">{enPanne.length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres Dynamiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="berline">Berline</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
                <SelectItem value="pickup">Pick-up</SelectItem>
                <SelectItem value="minibus">Minibus</SelectItem>
                <SelectItem value="camion">Camion</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_service">En service</SelectItem>
                <SelectItem value="en_panne">En panne</SelectItem>
                <SelectItem value="en_reparation">En reparation</SelectItem>
                <SelectItem value="reforme">Reforme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provinceFilter} onValueChange={(v) => setProvinceFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les provinces</SelectItem>
                {provinces.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ministereFilter} onValueChange={(v) => setMinistereFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Ministere" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les ministeres</SelectItem>
                {ministeres.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.sigle || m.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Vehicules ({vehicules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Vehicule</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Annee</TableHead>
                <TableHead>Km</TableHead>
                <TableHead>Affectataire</TableHead>
                <TableHead>Valeur Actuelle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicules.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.immatriculation}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{v.marque} {v.modele}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Fuel className="w-3 h-3" /> {v.energie}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(v.type)}</Badge>
                  </TableCell>
                  <TableCell>{v.annee}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      {formatNumber(v.kilometrage)} km
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{v.affectataire_nom || '-'}</p>
                      {v.affectataire_poste && (
                        <p className="text-xs text-slate-500">{v.affectataire_poste}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(v.valeur_actuelle)}</TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(v.statut)}>
                      {getStatutIcon(v.statut)}
                      <span className="ml-1">{getStatutLabel(v.statut)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {vehicules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Aucun vehicule trouve avec ces filtres
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
