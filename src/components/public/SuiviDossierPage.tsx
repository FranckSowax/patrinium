import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  MessageSquare,
  ArrowLeft,
  Hash,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Demande {
  id: string;
  reference: string;
  statut: string;
  priorite: string;
  type_demande: string;
  objet: string;
  description: string;
  demandeur_nom: string;
  demandeur_organisme: string;
  agent_instructeur: string | null;
  date_depot: string;
  date_limite_sla: string | null;
  created_at: string;
  updated_at: string;
  ministeres?: { nom: string } | null;
  provinces?: { nom: string } | null;
  date_instruction?: string | null;
  date_avis_technique?: string | null;
  date_commission?: string | null;
  date_validation?: string | null;
}

interface Message {
  id: string;
  demande_id: string;
  auteur: string;
  role: string;
  contenu: string;
  created_at: string;
}

const WORKFLOW_STEPS = [
  { key: 'deposee', label: 'Deposee' },
  { key: 'en_instruction', label: 'En instruction' },
  { key: 'avis_technique', label: 'Avis technique' },
  { key: 'commission', label: 'Commission' },
  { key: 'validee', label: 'Validee / Rejetee' },
];

function getStatutIndex(statut: string): number {
  const map: Record<string, number> = {
    deposee: 0,
    en_instruction: 1,
    avis_technique: 2,
    commission: 3,
    validee: 4,
    rejetee: 4,
  };
  return map[statut] ?? 0;
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    deposee: 'bg-blue-100 text-blue-800',
    en_instruction: 'bg-amber-100 text-amber-800',
    avis_technique: 'bg-purple-100 text-purple-800',
    commission: 'bg-indigo-100 text-indigo-800',
    validee: 'bg-emerald-100 text-emerald-800',
    rejetee: 'bg-red-100 text-red-800',
  };
  return colors[statut] ?? 'bg-gray-100 text-gray-800';
}

function getPrioriteColor(priorite: string): string {
  const colors: Record<string, string> = {
    basse: 'bg-gray-100 text-gray-700',
    normale: 'bg-blue-100 text-blue-700',
    haute: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700',
  };
  return colors[priorite] ?? 'bg-gray-100 text-gray-700';
}

function formatDateFR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getStepDate(demande: Demande, stepKey: string): string | null {
  const map: Record<string, string | null | undefined> = {
    deposee: demande.date_depot || demande.created_at,
    en_instruction: demande.date_instruction,
    avis_technique: demande.date_avis_technique,
    commission: demande.date_commission,
    validee: demande.date_validation,
  };
  return map[stepKey] ?? null;
}

export function SuiviDossierPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchRef, setSearchRef] = useState(searchParams.get('ref') || '');
  const [result, setResult] = useState<Demande | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(
    async (ref: string) => {
      const trimmed = ref.trim();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setResult(null);
      setMessages([]);
      setSearched(true);

      try {
        const { data, error: fetchError } = await supabase
          .from('demandes_guichet')
          .select('*, ministeres(nom), provinces(nom)')
          .eq('reference', trimmed)
          .single();

        if (fetchError || !data) {
          setError(trimmed);
          setLoading(false);
          return;
        }

        const demande = data as unknown as Demande;
        setResult(demande);

        const { data: msgs } = await supabase
          .from('messages_dossier')
          .select('*')
          .eq('demande_id', demande.id)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs as Message[]);
        }
      } catch {
        setError(trimmed);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setSearchRef(refParam);
      handleSearch(refParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      setSearchParams({ ref: searchRef.trim() });
      handleSearch(searchRef.trim());
    }
  };

  const currentStepIndex = result ? getStatutIndex(result.statut) : 0;
  const isOverdue =
    result?.date_limite_sla && new Date(result.date_limite_sla) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-dgpe.png" alt="DGPE" className="h-20 w-20 rounded-full object-cover" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">PATRINIUM</h1>
              <p className="text-xs text-gray-500">DGPE Gabon</p>
            </div>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Search Section */}
        <div className="mx-auto max-w-xl text-center mb-8">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Search className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Suivi de Dossier</h2>
            <p className="mt-2 text-gray-500">
              Entrez votre numero de reference pour consulter l'avancement de votre demande
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="Ex: DEM-00001"
              className="flex-1 h-11"
            />
            <Button
              type="submit"
              disabled={loading || !searchRef.trim()}
              className="h-11 bg-emerald-600 hover:bg-emerald-700"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <span className="ml-3 text-gray-500">Recherche en cours...</span>
          </div>
        )}

        {/* Error / Not Found */}
        {!loading && error && searched && (
          <Card className="mx-auto max-w-xl border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-3 pt-6">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  Aucun dossier trouve avec la reference{' '}
                  <span className="font-mono font-bold">{error}</span>.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Verifiez le numero et reessayez.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gray-100 text-gray-800 font-mono gap-1">
                    <Hash className="h-3 w-3" />
                    {result.reference}
                  </Badge>
                  <Badge className={getStatutColor(result.statut)}>
                    {result.statut === 'validee' && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {result.statut === 'rejetee' && (
                      <XCircle className="h-3 w-3" />
                    )}
                    {result.statut.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                  </Badge>
                  <Badge className={getPrioriteColor(result.priorite)}>
                    {result.priorite === 'urgente' && (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    Priorite : {result.priorite}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Type de demande</p>
                      <p className="text-sm font-medium text-gray-900">
                        {result.type_demande}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Date de depot</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateFR(result.date_depot || result.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Demandeur</p>
                      <p className="text-sm font-medium text-gray-900">
                        {result.demandeur_nom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Organisme</p>
                      <p className="text-sm font-medium text-gray-900">
                        {result.demandeur_organisme || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Agent instructeur</p>
                      <p className="text-sm font-medium text-gray-900">
                        {result.agent_instructeur || (
                          <span className="italic text-gray-400">
                            Non encore assigne
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-4 w-4 mt-1 shrink-0 ${
                        isOverdue ? 'text-red-500' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs text-gray-500">Date limite SLA</p>
                      <p
                        className={`text-sm font-medium ${
                          isOverdue ? 'text-red-600 font-bold' : 'text-gray-900'
                        }`}
                      >
                        {formatDateFR(result.date_limite_sla)}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-500">(Depassee)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objet & Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Objet de la demande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium text-gray-900">{result.objet}</p>
                {result.description && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {result.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Timeline / Workflow Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  Avancement du dossier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 bg-gray-200 sm:left-0 sm:top-5 sm:h-0.5 sm:w-[calc(100%-2rem)]" />

                  <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-0">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const isPast = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const isFuture = index > currentStepIndex;
                      const stepDate = getStepDate(result, step.key);

                      return (
                        <div
                          key={step.key}
                          className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2"
                        >
                          {/* Circle indicator */}
                          <div
                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              isPast
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : isCurrent
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100'
                                  : 'border-gray-300 bg-white text-gray-400'
                            }`}
                          >
                            {isPast ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : isCurrent ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>

                          {/* Label & date */}
                          <div className={`sm:text-center ${isFuture ? 'opacity-50' : ''}`}>
                            <p
                              className={`text-sm font-medium ${
                                isCurrent
                                  ? 'text-emerald-700'
                                  : isPast
                                    ? 'text-gray-700'
                                    : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            {stepDate && (isPast || isCurrent) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDateFR(stepDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages Section */}
            {messages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Echanges sur votre dossier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isDemandeur = msg.role === 'demandeur';

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isDemandeur ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              isDemandeur
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-emerald-50 text-gray-900'
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-sm font-medium">{msg.auteur}</span>
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${
                                  isDemandeur
                                    ? 'bg-gray-200 text-gray-600'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {msg.role}
                              </Badge>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>
                            <p className="mt-2 text-xs text-gray-400">
                              {formatDateFR(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state before search */}
        {!loading && !searched && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">
              Saisissez votre numero de reference pour commencer le suivi
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
