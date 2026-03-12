import { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Building2,
  User,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDemandesGuichet, useGuichetStats, useMinisteres, useProvinces } from '@/hooks/useSupabase';
import { createDemandeGuichet, updateDemandeStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
};

const typeLabels: Record<string, string> = {
  affectation_bien: 'Affectation de bien',
  attribution_concession: 'Attribution concession',
  cession_reforme: 'Cession / Reforme',
  intervention_maintenance: 'Intervention maintenance',
  renouvellement_bail: 'Renouvellement bail',
  reclamation: 'Reclamation',
  renseignement: 'Renseignement',
  autre: 'Autre',
};

const typeBadgeColors: Record<string, string> = {
  affectation_bien: 'bg-blue-100 text-blue-700',
  attribution_concession: 'bg-purple-100 text-purple-700',
  cession_reforme: 'bg-orange-100 text-orange-700',
  intervention_maintenance: 'bg-teal-100 text-teal-700',
  renouvellement_bail: 'bg-indigo-100 text-indigo-700',
  reclamation: 'bg-red-100 text-red-700',
  renseignement: 'bg-cyan-100 text-cyan-700',
  autre: 'bg-slate-100 text-slate-700',
};

const statutLabels: Record<string, string> = {
  deposee: 'Deposee',
  en_instruction: 'En instruction',
  avis_technique: 'Avis technique',
  commission: 'Commission',
  validee: 'Validee',
  rejetee: 'Rejetee',
  classee: 'Classee',
};

const statutSteps = ['deposee', 'en_instruction', 'avis_technique', 'commission', 'validee'];

const getStatutStepIndex = (statut: string) => {
  const idx = statutSteps.indexOf(statut);
  return idx >= 0 ? idx : -1;
};

const getPrioriteBadge = (priorite: string) => {
  switch (priorite) {
    case 'urgente': return 'bg-red-100 text-red-700 border-red-200';
    case 'haute': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'normale': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'basse': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getPrioriteLabel = (priorite: string) => {
  switch (priorite) {
    case 'urgente': return 'Urgente';
    case 'haute': return 'Haute';
    case 'normale': return 'Normale';
    case 'basse': return 'Basse';
    default: return priorite;
  }
};

const getNextStatut = (statut: string): string | null => {
  const idx = statutSteps.indexOf(statut);
  if (idx >= 0 && idx < statutSteps.length - 1) return statutSteps[idx + 1];
  return null;
};

const getSlaDisplay = (dateDepot: string, slaJours: number | null) => {
  if (!dateDepot || !slaJours) return { text: '-', isOverdue: false };
  const depot = new Date(dateDepot);
  const echeance = new Date(depot);
  echeance.setDate(echeance.getDate() + slaJours);
  const now = new Date();
  const diffMs = echeance.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}j en retard`, isOverdue: true };
  if (diffDays === 0) return { text: "Aujourd'hui", isOverdue: true };
  return { text: `${diffDays}j restants`, isOverdue: false };
};

const initialFormData = {
  type: '',
  objet: '',
  description: '',
  priorite: 'normale',
  demandeur_type: 'institution',
  demandeur_nom: '',
  demandeur_organisme: '',
  demandeur_email: '',
  demandeur_telephone: '',
  ministere_id: '',
  province_id: '',
};

export function GuichetUniqueModule() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const { data: demandes, loading, error, refetch } = useDemandesGuichet({
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
    priorite: prioriteFilter || undefined,
    search: search || undefined,
  });
  const { stats, loading: loadingStats } = useGuichetStats();
  const { data: ministeres } = useMinisteres();
  const { data: provinces } = useProvinces();

  const handleCreate = async () => {
    if (!formData.type || !formData.objet || !formData.demandeur_nom) return;
    setSubmitting(true);
    const { error } = await createDemandeGuichet({
      type: formData.type,
      objet: formData.objet,
      description: formData.description || undefined,
      priorite: formData.priorite || undefined,
      demandeur_type: formData.demandeur_type || undefined,
      demandeur_nom: formData.demandeur_nom,
      demandeur_organisme: formData.demandeur_organisme || undefined,
      demandeur_email: formData.demandeur_email || undefined,
      demandeur_telephone: formData.demandeur_telephone || undefined,
      ministere_id: formData.ministere_id || undefined,
      province_id: formData.province_id || undefined,
    });
    setSubmitting(false);
    if (!error) {
      setDialogOpen(false);
      setFormData(initialFormData);
      refetch();
    }
  };

  const handleAdvanceStatut = async (id: string, currentStatut: string) => {
    const next = getNextStatut(currentStatut);
    if (!next) return;
    await updateDemandeStatut(id, next);
    refetch();
  };

  const handleReject = async (id: string) => {
    await updateDemandeStatut(id, 'rejetee');
    refetch();
  };

  if (loading || loadingStats) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-slate-600">Erreur de chargement des donnees</p>
          <Button variant="outline" className="mt-2" onClick={refetch}>Reessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guichet Unique</h1>
          <p className="text-slate-500 mt-1">Gestion centralisee des demandes adressees a la DGPE</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Demandes</p>
                <p className="text-2xl font-bold">{stats?.total_demandes ?? 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Cours</p>
                <p className="text-2xl font-bold">
                  {(stats?.deposees ?? 0) + (stats?.en_instruction ?? 0) + (stats?.avis_technique ?? 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Validees</p>
                <p className="text-2xl font-bold">{stats?.validees ?? 0}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Retard SLA</p>
                <p className="text-2xl font-bold">{stats?.en_retard_sla ?? 0}</p>
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
                <SelectItem value="affectation_bien">Affectation de bien</SelectItem>
                <SelectItem value="attribution_concession">Attribution concession</SelectItem>
                <SelectItem value="cession_reforme">Cession / Reforme</SelectItem>
                <SelectItem value="intervention_maintenance">Intervention maintenance</SelectItem>
                <SelectItem value="renouvellement_bail">Renouvellement bail</SelectItem>
                <SelectItem value="reclamation">Reclamation</SelectItem>
                <SelectItem value="renseignement">Renseignement</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="deposee">Deposee</SelectItem>
                <SelectItem value="en_instruction">En instruction</SelectItem>
                <SelectItem value="avis_technique">Avis technique</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="validee">Validee</SelectItem>
                <SelectItem value="rejetee">Rejetee</SelectItem>
                <SelectItem value="classee">Classee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prioriteFilter} onValueChange={(v) => setPrioriteFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Priorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorites</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes ({demandes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Demandeur</TableHead>
                <TableHead>Priorite</TableHead>
                <TableHead>Date depot</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandes.map((d: any) => {
                const sla = getSlaDisplay(d.date_depot, d.sla_jours);
                const currentStep = getStatutStepIndex(d.statut);
                const nextStatut = getNextStatut(d.statut);
                const isTerminal = d.statut === 'validee' || d.statut === 'rejetee' || d.statut === 'classee';

                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium text-sm">{d.reference}</TableCell>
                    <TableCell>
                      <Badge className={typeBadgeColors[d.type] || 'bg-slate-100 text-slate-700'}>
                        {typeLabels[d.type] || d.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[200px] truncate" title={d.objet}>{d.objet}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {d.demandeur_nom}
                        </p>
                        {d.demandeur_organisme && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {d.demandeur_organisme}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPrioriteBadge(d.priorite)}>
                        {getPrioriteLabel(d.priorite)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(d.date_depot)}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${sla.isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                        {sla.isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {sla.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {statutSteps.map((step, idx) => {
                          let color = 'bg-slate-200';
                          if (d.statut === 'rejetee') {
                            color = idx <= currentStep ? 'bg-red-400' : 'bg-slate-200';
                          } else if (idx <= currentStep) {
                            color = idx === currentStep ? 'bg-emerald-500' : 'bg-emerald-300';
                          }
                          return (
                            <div
                              key={step}
                              className={`w-4 h-1.5 rounded-sm ${color}`}
                              title={statutLabels[step]}
                            />
                          );
                        })}
                        <span className="ml-1.5 text-xs text-slate-600">
                          {statutLabels[d.statut] || d.statut}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!isTerminal && nextStatut && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title={`Avancer vers: ${statutLabels[nextStatut]}`}
                            onClick={() => handleAdvanceStatut(d.id, d.statut)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                        {!isTerminal && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Rejeter"
                            onClick={() => handleReject(d.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {demandes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Aucune demande trouvee avec ces filtres
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: Nouvelle Demande */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Nouvelle Demande
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type & Priorite */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Type de demande *</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affectation_bien">Affectation de bien</SelectItem>
                    <SelectItem value="attribution_concession">Attribution concession</SelectItem>
                    <SelectItem value="cession_reforme">Cession / Reforme</SelectItem>
                    <SelectItem value="intervention_maintenance">Intervention maintenance</SelectItem>
                    <SelectItem value="renouvellement_bail">Renouvellement bail</SelectItem>
                    <SelectItem value="reclamation">Reclamation</SelectItem>
                    <SelectItem value="renseignement">Renseignement</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Priorite</label>
                <Select value={formData.priorite} onValueChange={(v) => setFormData({ ...formData, priorite: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priorite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Objet */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Objet *</label>
              <Input
                placeholder="Objet de la demande"
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                placeholder="Description detaillee de la demande..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Demandeur section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations du demandeur
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Type de demandeur</label>
                  <Select value={formData.demandeur_type} onValueChange={(v) => setFormData({ ...formData, demandeur_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="particulier">Particulier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nom *</label>
                  <Input
                    placeholder="Nom du demandeur"
                    value={formData.demandeur_nom}
                    onChange={(e) => setFormData({ ...formData, demandeur_nom: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Organisme</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Organisme"
                      value={formData.demandeur_organisme}
                      onChange={(e) => setFormData({ ...formData, demandeur_organisme: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.demandeur_email}
                      onChange={(e) => setFormData({ ...formData, demandeur_email: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Telephone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Telephone"
                      value={formData.demandeur_telephone}
                      onChange={(e) => setFormData({ ...formData, demandeur_telephone: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Rattachement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Ministere</label>
                  <Select value={formData.ministere_id} onValueChange={(v) => setFormData({ ...formData, ministere_id: v === 'none' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un ministere" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {ministeres.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>{m.sigle || m.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Province</label>
                  <Select value={formData.province_id} onValueChange={(v) => setFormData({ ...formData, province_id: v === 'none' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner une province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {provinces.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreate}
              disabled={submitting || !formData.type || !formData.objet || !formData.demandeur_nom}
            >
              {submitting ? (
                <Spinner />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Creer la Demande
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
