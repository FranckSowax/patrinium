import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Users,
  ClipboardCheck,
  Key,
  FileSearch,
  Search,
  CheckCircle,
  XCircle,
  Building2,
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
import { useRdvInspections, useGuichetStats } from '@/hooks/useSupabase';
import { createRdvInspection, updateRdvStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

// ─── Helpers ────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'visite_bien', label: 'Visite de bien' },
  { value: 'etat_des_lieux', label: 'Etat des lieux' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'remise_cles', label: 'Remise des cles' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'expertise', label: 'Expertise' },
  { value: 'autre', label: 'Autre' },
] as const;

const STATUT_OPTIONS = [
  { value: 'planifie', label: 'Planifie' },
  { value: 'confirme', label: 'Confirme' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Termine' },
  { value: 'annule', label: 'Annule' },
  { value: 'reporte', label: 'Reporte' },
] as const;

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'visite_bien': return <MapPin className="w-4 h-4" />;
    case 'etat_des_lieux': return <ClipboardCheck className="w-4 h-4" />;
    case 'inspection': return <Search className="w-4 h-4" />;
    case 'remise_cles': return <Key className="w-4 h-4" />;
    case 'reunion': return <Users className="w-4 h-4" />;
    case 'expertise': return <FileSearch className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) =>
  TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'planifie': return 'bg-amber-100 text-amber-700';
    case 'confirme': return 'bg-indigo-100 text-indigo-700';
    case 'en_cours': return 'bg-blue-100 text-blue-700';
    case 'termine': return 'bg-emerald-100 text-emerald-700';
    case 'annule': return 'bg-red-100 text-red-700';
    case 'reporte': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut: string) =>
  STATUT_OPTIONS.find((s) => s.value === statut)?.label ?? statut;

const formatDateTimeFR = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }) + ' a ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const formatTimeFR = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const formatDateGroupKey = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const dateKey = (iso: string) => {
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return iso;
  }
};

// ─── Empty form state ───────────────────────────────────────────────────

const EMPTY_FORM = {
  type: 'visite_bien',
  objet: '',
  date_rdv: '',
  duree_minutes: 60,
  lieu: '',
  agent_nom: '',
  agent_telephone: '',
  visiteur_nom: '',
  visiteur_telephone: '',
  visiteur_organisme: '',
  notes: '',
};

// ─── Component ──────────────────────────────────────────────────────────

export function RendezVousModule() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  const { data: rdvs, loading, error, refetch } = useRdvInspections({
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
  });

  const { loading: loadingStats } = useGuichetStats();

  // ── Derived counts ──────────────────────────────────────────────────

  const totalRdv = rdvs.length;
  const planifies = rdvs.filter((r: any) => r.statut === 'planifie').length;
  const confirmes = rdvs.filter((r: any) => r.statut === 'confirme').length;
  const termines = rdvs.filter((r: any) => r.statut === 'termine').length;

  // ── Grouped by date (calendar view) ────────────────────────────────

  const upcomingRdvs = rdvs
    .filter((r: any) => r.statut !== 'annule' && r.statut !== 'termine')
    .sort((a: any, b: any) => new Date(a.date_rdv).getTime() - new Date(b.date_rdv).getTime());

  const groupedByDate: Record<string, any[]> = {};
  for (const rdv of upcomingRdvs) {
    const key = dateKey(rdv.date_rdv);
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(rdv);
  }

  // ── Handlers ───────────────────────────────────────────────────────

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createRdvInspection({
        type: form.type,
        objet: form.objet,
        date_rdv: form.date_rdv,
        duree_minutes: form.duree_minutes,
        lieu: form.lieu,
        agent_nom: form.agent_nom,
        agent_telephone: form.agent_telephone || undefined,
        visiteur_nom: form.visiteur_nom || undefined,
        visiteur_telephone: form.visiteur_telephone || undefined,
        visiteur_organisme: form.visiteur_organisme || undefined,
        notes: form.notes || undefined,
      });
      setDialogOpen(false);
      setForm({ ...EMPTY_FORM });
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmer = async (id: string) => {
    await updateRdvStatut(id, 'confirme');
    await refetch();
  };

  const handleTerminer = async (id: string) => {
    await updateRdvStatut(id, 'termine');
    await refetch();
  };

  const handleAnnuler = async (id: string) => {
    await updateRdvStatut(id, 'annule');
    await refetch();
  };

  const handleReporter = async (id: string) => {
    await updateRdvStatut(id, 'reporte');
    await refetch();
  };

  const updateField = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Loading / Error states ─────────────────────────────────────────

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Erreur lors du chargement des rendez-vous : {error}</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rendez-vous & Inspections</h1>
          <p className="text-slate-500 mt-1">Planification et suivi des visites, inspections et reunions</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total RDV</p>
                <p className="text-2xl font-bold">{totalRdv}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Planifies</p>
                <p className="text-2xl font-bold">{planifies}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Confirmes</p>
                <p className="text-2xl font-bold">{confirmes}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Termines</p>
                <p className="text-2xl font-bold">{termines}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de RDV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="calendrier" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          <TabsTrigger value="liste">Liste</TabsTrigger>
        </TabsList>

        {/* ── Calendrier View ──────────────────────────────────────── */}
        <TabsContent value="calendrier" className="space-y-4">
          {Object.keys(groupedByDate).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Aucun rendez-vous a venir
              </CardContent>
            </Card>
          )}

          {Object.entries(groupedByDate).map(([key, items]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {formatDateGroupKey(items[0].date_rdv)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((rdv: any) => (
                  <div
                    key={rdv.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {getTypeIcon(rdv.type)}
                      </div>
                      <div>
                        <p className="font-medium">{rdv.objet}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeFR(rdv.date_rdv)}
                            {rdv.duree_minutes && ` (${rdv.duree_minutes} min)`}
                          </span>
                          {rdv.lieu && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {rdv.lieu}
                            </span>
                          )}
                          {rdv.visiteur_nom && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {rdv.visiteur_nom}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatutBadge(rdv.statut)}>
                      {getStatutLabel(rdv.statut)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Liste View ───────────────────────────────────────────── */}
        <TabsContent value="liste">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Rendez-vous ({rdvs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Duree</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Visiteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rdvs.map((rdv: any) => (
                    <TableRow key={rdv.id}>
                      <TableCell className="font-mono text-sm">{rdv.reference ?? '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(rdv.type)}
                          <span>{getTypeLabel(rdv.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{rdv.objet}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTimeFR(rdv.date_rdv)}</TableCell>
                      <TableCell>{rdv.duree_minutes ? `${rdv.duree_minutes} min` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {rdv.lieu || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{rdv.agent_nom || '-'}</TableCell>
                      <TableCell>
                        {rdv.visiteur_nom ? (
                          <div>
                            <span className="font-medium">{rdv.visiteur_nom}</span>
                            {rdv.visiteur_organisme && (
                              <span className="text-xs text-slate-500 block">{rdv.visiteur_organisme}</span>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadge(rdv.statut)}>
                          {getStatutLabel(rdv.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rdv.statut === 'planifie' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-indigo-600"
                              title="Confirmer"
                              onClick={() => handleConfirmer(rdv.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {(rdv.statut === 'planifie' || rdv.statut === 'confirme') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600"
                              title="Terminer"
                              onClick={() => handleTerminer(rdv.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {rdv.statut !== 'annule' && rdv.statut !== 'termine' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-600"
                                title="Reporter"
                                onClick={() => handleReporter(rdv.id)}
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                title="Annuler"
                                onClick={() => handleAnnuler(rdv.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rdvs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                        Aucun rendez-vous trouve
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── New RDV Dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Nouveau Rendez-vous
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Objet */}
            <div>
              <label className="text-sm font-medium mb-1 block">Objet</label>
              <Input
                placeholder="Objet du rendez-vous"
                value={form.objet}
                onChange={(e) => updateField('objet', e.target.value)}
              />
            </div>

            {/* Date & Duree */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date & Heure</label>
                <Input
                  type="datetime-local"
                  value={form.date_rdv}
                  onChange={(e) => updateField('date_rdv', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duree (minutes)</label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={form.duree_minutes}
                  onChange={(e) => updateField('duree_minutes', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="text-sm font-medium mb-1 block">Lieu</label>
              <Input
                placeholder="Adresse ou lieu du RDV"
                value={form.lieu}
                onChange={(e) => updateField('lieu', e.target.value)}
              />
            </div>

            {/* Agent */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Agent (Nom)</label>
                <Input
                  placeholder="Nom de l'agent"
                  value={form.agent_nom}
                  onChange={(e) => updateField('agent_nom', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Agent (Telephone)</label>
                <Input
                  placeholder="+241 ..."
                  value={form.agent_telephone}
                  onChange={(e) => updateField('agent_telephone', e.target.value)}
                />
              </div>
            </div>

            {/* Visiteur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Visiteur (Nom)</label>
                <Input
                  placeholder="Nom du visiteur"
                  value={form.visiteur_nom}
                  onChange={(e) => updateField('visiteur_nom', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Visiteur (Telephone)</label>
                <Input
                  placeholder="+241 ..."
                  value={form.visiteur_telephone}
                  onChange={(e) => updateField('visiteur_telephone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Organisme du visiteur</label>
              <Input
                placeholder="Organisme / Ministere"
                value={form.visiteur_organisme}
                onChange={(e) => updateField('visiteur_organisme', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
                placeholder="Notes complementaires..."
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting || !form.objet || !form.date_rdv || !form.lieu || !form.agent_nom}
              onClick={handleCreate}
            >
              {submitting ? <Spinner /> : 'Creer le RDV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
