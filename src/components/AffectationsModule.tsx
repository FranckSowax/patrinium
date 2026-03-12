import { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Eye,
  Check,
  X
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
import { Textarea } from '@/components/ui/textarea';
import { useAffectations } from '@/hooks/useSupabase';
import { updateAffectationStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'approuve': return 'bg-emerald-100 text-emerald-700';
    case 'rejete': return 'bg-red-100 text-red-700';
    case 'en_attente': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutIcon = (statut: string) => {
  switch (statut) {
    case 'approuve': return <CheckCircle2 className="w-4 h-4" />;
    case 'rejete': return <XCircle className="w-4 h-4" />;
    case 'en_attente': return <Clock className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export function AffectationsModule() {
  const { data: affectations, loading, refetch } = useAffectations();
  const [selectedAffectation, setSelectedAffectation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approuver' | 'rejeter' | null>(null);

  const handleAction = (affectation: any, action: 'approuver' | 'rejeter') => {
    setSelectedAffectation(affectation);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAffectation || !actionType) return;
    await updateAffectationStatut(
      selectedAffectation.id,
      actionType === 'approuver' ? 'approuve' : 'rejete'
    );
    await refetch();
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const enAttente = affectations.filter((a: any) => a.statut === 'en_attente');
  const approuvees = affectations.filter((a: any) => a.statut === 'approuve');
  const rejetees = affectations.filter((a: any) => a.statut === 'rejete');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Affectations</h1>
          <p className="text-slate-500 mt-1">Workflow numerique de demande et validation des affectations</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Demandes</p>
                <p className="text-2xl font-bold">{affectations.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Attente</p>
                <p className="text-2xl font-bold">{enAttente.length}</p>
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
                <p className="text-sm text-slate-500">Approuvees</p>
                <p className="text-2xl font-bold">{approuvees.length}</p>
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
                <p className="text-sm text-slate-500">Rejetees</p>
                <p className="text-2xl font-bold">{rejetees.length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="en_attente" className="space-y-4">
        <TabsList>
          <TabsTrigger value="en_attente">
            En Attente
            {enAttente.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{enAttente.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approuvees">Approuvees</TabsTrigger>
          <TabsTrigger value="rejetees">Rejetees</TabsTrigger>
          <TabsTrigger value="toutes">Toutes</TabsTrigger>
        </TabsList>

        {['en_attente', 'approuvees', 'rejetees', 'toutes'].map((tab) => {
          const data = tab === 'toutes' ? affectations :
                       tab === 'en_attente' ? enAttente :
                       tab === 'approuvees' ? approuvees : rejetees;

          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="capitalize">
                      Demandes {tab.replace('_', ' ')}
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Rechercher..."
                          className="pl-9 w-64"
                        />
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
                        <TableHead>Reference</TableHead>
                        <TableHead>Bien</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Ministere</TableHead>
                        <TableHead>Date Demande</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((affectation: any) => (
                        <TableRow key={affectation.id}>
                          <TableCell className="font-medium">{affectation.reference}</TableCell>
                          <TableCell>{affectation.biens_immobiliers?.nom || affectation.biens_mobiliers?.nom || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {affectation.type === 'immobilier' ? 'Immobilier' : 'Mobilier'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              {affectation.demandeur_nom}
                            </div>
                          </TableCell>
                          <TableCell>{affectation.ministeres?.nom || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {affectation.date_demande}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatutBadge(affectation.statut)}>
                              {getStatutIcon(affectation.statut)}
                              <span className="ml-1 capitalize">{affectation.statut.replace('_', ' ')}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {affectation.statut === 'en_attente' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    onClick={() => handleAction(affectation, 'approuver')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleAction(affectation, 'rejeter')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
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
          );
        })}
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approuver' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAffectation && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Bien concerne</p>
                <p className="font-medium">{selectedAffectation.biens_immobiliers?.nom || selectedAffectation.biens_mobiliers?.nom || '-'}</p>
                <p className="text-sm text-slate-500 mt-2">Demandeur</p>
                <p className="font-medium">{selectedAffectation.demandeur_nom}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Commentaire (optionnel)</label>
              <Textarea placeholder="Ajouter un commentaire..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className={actionType === 'approuver' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleConfirmAction}
            >
              {actionType === 'approuver' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
