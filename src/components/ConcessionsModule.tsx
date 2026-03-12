import { useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Filter,
  MapPin,
  TreePine,
  Mountain,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Scale
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
import { useConcessions, useProvinces } from '@/hooks/useSupabase';
import { Spinner } from '@/components/ui/spinner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value);

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'attribue': return 'bg-emerald-100 text-emerald-700';
    case 'libre': return 'bg-blue-100 text-blue-700';
    case 'en_litige': return 'bg-red-100 text-red-700';
    case 'en_cours_attribution': return 'bg-amber-100 text-amber-700';
    case 'resilie': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    attribue: 'Attribue',
    libre: 'Libre',
    en_litige: 'En litige',
    en_cours_attribution: 'En cours',
    resilie: 'Resilie'
  };
  return labels[statut] || statut;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    terrain_nu: 'Terrain nu',
    terrain_bati: 'Terrain bati',
    concession_forestiere: 'Forestiere',
    concession_miniere: 'Miniere',
    concession_agricole: 'Agricole',
    emprise_routiere: 'Emprise routiere',
    domaine_maritime: 'Maritime',
    autre: 'Autre'
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'concession_forestiere': return <TreePine className="w-4 h-4 text-green-600" />;
    case 'concession_miniere': return <Mountain className="w-4 h-4 text-amber-600" />;
    case 'domaine_maritime': return <Waves className="w-4 h-4 text-blue-600" />;
    default: return <MapPin className="w-4 h-4 text-slate-600" />;
  }
};

export function ConcessionsModule() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');

  const { data: concessions, loading } = useConcessions({
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
    province_id: provinceFilter || undefined,
    search: search || undefined,
  });
  const { data: provinces } = useProvinces();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  const attribuees = concessions.filter((c: any) => c.statut === 'attribue');
  const enLitige = concessions.filter((c: any) => c.statut === 'en_litige');
  const superficieTotale = concessions.reduce((sum: number, c: any) => sum + Number(c.superficie_ha || 0), 0);
  const redevancesTotales = attribuees.reduce((sum: number, c: any) => sum + Number(c.redevance_annuelle || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Concessions & Domaines</h1>
          <p className="text-slate-500 mt-1">Gestion des terrains domaniaux, concessions forestieres et minieres</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Concession
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Concessions</p>
                <p className="text-2xl font-bold">{concessions.length}</p>
              </div>
              <Landmark className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Attribuees</p>
                <p className="text-2xl font-bold">{attribuees.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Superficie Totale</p>
                <p className="text-lg font-bold">{formatNumber(superficieTotale)} ha</p>
              </div>
              <MapPin className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Redevances/an</p>
                <p className="text-lg font-bold">{formatCurrency(redevancesTotales)}</p>
              </div>
              <Scale className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Litige</p>
                <p className="text-2xl font-bold">{enLitige.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectItem value="terrain_nu">Terrain nu</SelectItem>
                <SelectItem value="terrain_bati">Terrain bati</SelectItem>
                <SelectItem value="concession_forestiere">Forestiere</SelectItem>
                <SelectItem value="concession_miniere">Miniere</SelectItem>
                <SelectItem value="concession_agricole">Agricole</SelectItem>
                <SelectItem value="emprise_routiere">Emprise routiere</SelectItem>
                <SelectItem value="domaine_maritime">Maritime</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="attribue">Attribue</SelectItem>
                <SelectItem value="libre">Libre</SelectItem>
                <SelectItem value="en_litige">En litige</SelectItem>
                <SelectItem value="en_cours_attribution">En cours</SelectItem>
                <SelectItem value="resilie">Resilie</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registre des Concessions ({concessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Superficie</TableHead>
                <TableHead>Beneficiaire</TableHead>
                <TableHead>Valeur Estimee</TableHead>
                <TableHead>Redevance/an</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concessions.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.reference}</TableCell>
                  <TableCell className="font-medium max-w-48 truncate">{c.nom}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(c.type)}
                      <span className="text-sm">{getTypeLabel(c.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="max-w-32 truncate">{c.localisation}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatNumber(c.superficie_ha)} ha</TableCell>
                  <TableCell className="text-sm">{c.beneficiaire_nom || '-'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(c.valeur_estimee)}</TableCell>
                  <TableCell>{c.redevance_annuelle > 0 ? formatCurrency(c.redevance_annuelle) : '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(c.statut)}>
                      {getStatutLabel(c.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {concessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    Aucune concession trouvee avec ces filtres
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
