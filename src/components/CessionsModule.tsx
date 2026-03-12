import { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  DollarSign,
  Building2,
  Package
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
import { useCessions } from '@/hooks/useSupabase';
import { updateCessionStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'finalisee': return 'bg-emerald-100 text-emerald-700';
    case 'en_cours': return 'bg-amber-100 text-amber-700';
    case 'annulee': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'finalisee': return 'Finalisee';
    case 'en_cours': return 'En cours';
    case 'annulee': return 'Annulee';
    default: return statut;
  }
};

export function CessionsModule() {
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const { data: cessions, loading, refetch } = useCessions({
    statut: statutFilter || undefined,
    search: search || undefined,
  });

  const handleFinaliser = async (id: string) => {
    await updateCessionStatut(id, 'finalisee');
    await refetch();
  };

  const handleAnnuler = async (id: string) => {
    await updateCessionStatut(id, 'annulee');
    await refetch();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  const enCours = cessions.filter((c: any) => c.statut === 'en_cours');
  const finalisees = cessions.filter((c: any) => c.statut === 'finalisee');
  const totalMontant = finalisees.reduce((sum: number, c: any) => sum + Number(c.montant || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cessions du Patrimoine</h1>
          <p className="text-slate-500 mt-1">Suivi des ventes et transferts de biens de l'Etat</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Cession
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Cessions</p>
                <p className="text-2xl font-bold">{cessions.length}</p>
              </div>
              <ArrowRightLeft className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Cours</p>
                <p className="text-2xl font-bold">{enCours.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Finalisees</p>
                <p className="text-2xl font-bold">{finalisees.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Montant Total</p>
                <p className="text-lg font-bold">{formatCurrency(totalMontant)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par reference ou acheteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="finalisee">Finalisee</SelectItem>
                <SelectItem value="annulee">Annulee</SelectItem>
              </SelectContent>
            </Select>
            <div />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registre des Cessions ({cessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Bien</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Acheteur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date Cession</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cessions.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.reference}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {c.biens_immobiliers?.nom ? (
                        <>
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span>{c.biens_immobiliers.nom}</span>
                        </>
                      ) : c.biens_mobiliers?.nom ? (
                        <>
                          <Package className="w-4 h-4 text-purple-500" />
                          <span>{c.biens_mobiliers.nom}</span>
                        </>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {c.biens_immobiliers ? 'Immobilier' : 'Mobilier'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.acheteur_nom}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(c.montant)}</TableCell>
                  <TableCell>{c.date_cession}</TableCell>
                  <TableCell className="text-sm max-w-32 truncate">{c.motif || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(c.statut)}>
                      {getStatutLabel(c.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {c.statut === 'en_cours' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600"
                            onClick={() => handleFinaliser(c.id)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => handleAnnuler(c.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {cessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Aucune cession trouvee
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
