import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Calendar,
  User,
  Eye,
  Play,
  Check,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { useInterventions, useMarchesRehabilitation, useMaintenancePreventive } from '@/hooks/useSupabase';
import { updateInterventionStatut } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

const getPrioriteBadge = (priorite: string) => {
  switch (priorite) {
    case 'urgente': return 'bg-red-100 text-red-700 border-red-200';
    case 'haute': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'moyenne': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'basse': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'nouveau': return 'bg-blue-100 text-blue-700';
    case 'en_cours': return 'bg-amber-100 text-amber-700';
    case 'termine': return 'bg-emerald-100 text-emerald-700';
    case 'annule': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getMarcheStatutBadge = (statut: string) => {
  switch (statut) {
    case 'en_cours': return 'bg-blue-100 text-blue-700';
    case 'termine': return 'bg-emerald-100 text-emerald-700';
    case 'retarde': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export function MaintenanceModule() {
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  const { data: interventions, loading: loadingInt, refetch: refetchInt } = useInterventions();
  const { data: marches, loading: loadingMarches } = useMarchesRehabilitation();
  const { data: preventive, loading: loadingPrev } = useMaintenancePreventive();
  const loading = loadingInt || loadingMarches || loadingPrev;

  const nouvelles = interventions.filter(d => d.statut === 'nouveau');
  const enCours = interventions.filter(d => d.statut === 'en_cours');
  const terminees = interventions.filter(d => d.statut === 'termine');

  const handleStartIntervention = async (id: string) => {
    await updateInterventionStatut(id, 'en_cours');
    refetchInt();
  };

  const handleCompleteIntervention = async (id: string) => {
    await updateInterventionStatut(id, 'termine');
    refetchInt();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GMAO Maintenance</h1>
          <p className="text-slate-500 mt-1">Gestion de Maintenance Assistée par Ordinateur</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setWhatsappDialogOpen(true)}>
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
            WhatsApp Bot
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Nouvelles Demandes</p>
                <p className="text-2xl font-bold">{nouvelles.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En Cours</p>
                <p className="text-2xl font-bold">{enCours.length}</p>
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
                <p className="text-sm text-slate-500">Terminées (Mois)</p>
                <p className="text-2xl font-bold">{terminees.length}</p>
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
                <p className="text-sm text-slate-500">Marchés Actifs</p>
                <p className="text-2xl font-bold">{marches.filter(m => m.statut === 'en_cours').length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="interventions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="marches">Marchés de Réhabilitation</TabsTrigger>
          <TabsTrigger value="preventif">Maintenance Préventive</TabsTrigger>
        </TabsList>

        <TabsContent value="interventions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Demandes d'Intervention</CardTitle>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="font-medium">{intervention.reference}</TableCell>
                      <TableCell>{intervention.biens_immobiliers?.nom || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {intervention.type === 'corrective' ? 'Corrective' : 'Préventive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPrioriteBadge(intervention.priorite)}>
                          {intervention.priorite === 'urgente' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {intervention.priorite.charAt(0).toUpperCase() + intervention.priorite.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {intervention.demandeur_nom}
                        </div>
                      </TableCell>
                      <TableCell>{intervention.date_demande}</TableCell>
                      <TableCell>
                        <Badge className={getStatutBadge(intervention.statut)}>
                          {intervention.statut.charAt(0).toUpperCase() + intervention.statut.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {intervention.statut === 'nouveau' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-600"
                              onClick={() => handleStartIntervention(intervention.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {intervention.statut === 'en_cours' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600"
                              onClick={() => handleCompleteIntervention(intervention.id)}
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

        <TabsContent value="marches">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {marches.map((marche) => (
              <Card key={marche.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{marche.nom}</h3>
                      <p className="text-sm text-slate-500">{marche.reference}</p>
                    </div>
                    <Badge className={getMarcheStatutBadge(marche.statut)}>
                      {marche.statut.charAt(0).toUpperCase() + marche.statut.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Prestataire</span>
                      <span className="font-medium">{marche.prestataire}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Montant</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(marche.montant)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Période</span>
                      <span className="font-medium">{marche.date_debut} → {marche.date_fin_prevue}</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500">Avancement</span>
                        <span className="font-medium">{marche.taux_avancement}%</span>
                      </div>
                      <Progress value={marche.taux_avancement} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preventif">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier de Maintenance Préventive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventive.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.statut === 'en_retard' ? 'bg-red-100' : item.statut === 'effectue' ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        <Calendar className={`w-5 h-5 ${
                          item.statut === 'en_retard' ? 'text-red-600' : item.statut === 'effectue' ? 'text-emerald-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{item.equipement}</p>
                        <p className="text-sm text-slate-500">
                          {item.frequence} • Prochaine: {item.prochaine_date}
                          {item.biens_immobiliers?.nom && ` • ${item.biens_immobiliers.nom}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      item.statut === 'en_retard'
                        ? 'bg-red-100 text-red-700'
                        : item.statut === 'effectue'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {item.statut === 'en_retard' ? 'En retard' : item.statut === 'effectue' ? 'Effectué' : 'À venir'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* WhatsApp Bot Dialog */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-600" />
              WhatsApp Bot Maintenance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Les agents peuvent signaler des problèmes de maintenance directement via WhatsApp au numéro:
              </p>
              <p className="text-lg font-bold text-green-700 mt-2">+241 60 00 00 00</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Commandes disponibles:</p>
              <div className="space-y-1 text-sm">
                <p><code className="bg-slate-100 px-2 py-1 rounded">/panne [description]</code> - Signaler une panne</p>
                <p><code className="bg-slate-100 px-2 py-1 rounded">/statut [référence]</code> - Vérifier le statut</p>
                <p><code className="bg-slate-100 px-2 py-1 rounded">/aide</code> - Liste des commandes</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Messages récents:</p>
              <div className="space-y-2">
                <div className="flex gap-3 p-2 bg-slate-50 rounded">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">M. Jean Koumba</p>
                    <p className="text-xs text-slate-500">"/panne Climatisation en panne bureau 302"</p>
                    <p className="text-xs text-slate-400">Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setWhatsappDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
