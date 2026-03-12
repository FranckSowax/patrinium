import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  User,
  Building2,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useDemandesGuichet, useMessagesDossier, useGuichetStats } from '@/hooks/useSupabase';
import { createMessageDossier } from '@/lib/mutations';
import { Spinner } from '@/components/ui/spinner';

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'deposee': return 'bg-blue-100 text-blue-700';
    case 'en_instruction': return 'bg-amber-100 text-amber-700';
    case 'validee': return 'bg-emerald-100 text-emerald-700';
    case 'rejetee': return 'bg-red-100 text-red-700';
    case 'cloturee': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'deposee': return 'Deposee';
    case 'en_instruction': return 'En instruction';
    case 'validee': return 'Validee';
    case 'rejetee': return 'Rejetee';
    case 'cloturee': return 'Cloturee';
    default: return statut;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'demandeur': return 'bg-slate-200 text-slate-700';
    case 'agent': return 'bg-emerald-100 text-emerald-700';
    case 'superviseur': return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'demandeur': return 'Demandeur';
    case 'agent': return 'Agent';
    case 'superviseur': return 'Superviseur';
    default: return role;
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export function MessagerieModule() {
  const { data: demandes, loading: loadingDemandes, error: errorDemandes } = useDemandesGuichet();
  const { stats, loading: loadingStats } = useGuichetStats();

  const [selectedDemandeId, setSelectedDemandeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const selectedDemande = useMemo(
    () => demandes.find((d: any) => d.id === selectedDemandeId) ?? null,
    [demandes, selectedDemandeId]
  );

  const {
    data: messages,
    loading: loadingMessages,
    error: errorMessages,
    refetch: refetchMessages,
  } = useMessagesDossier(selectedDemandeId ?? undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Build a map of last message per demande and unread status
  const { data: allMessages } = useMessagesDossier(undefined);

  const messagesByDemande = useMemo(() => {
    const map: Record<string, { lastMessage: any; hasUnread: boolean }> = {};
    (allMessages ?? []).forEach((m: any) => {
      const existing = map[m.demande_id];
      if (!existing || new Date(m.created_at) > new Date(existing.lastMessage.created_at)) {
        map[m.demande_id] = {
          lastMessage: m,
          hasUnread: m.lu === false && m.auteur_role === 'demandeur',
        };
      }
      if (m.lu === false && m.auteur_role === 'demandeur') {
        if (map[m.demande_id]) map[m.demande_id].hasUnread = true;
      }
    });
    return map;
  }, [allMessages]);

  // Filter demandes by search query
  const filteredDemandes = useMemo(() => {
    if (!searchQuery.trim()) return demandes;
    const q = searchQuery.toLowerCase();
    return demandes.filter((d: any) =>
      (d.reference ?? '').toLowerCase().includes(q) ||
      (d.objet ?? '').toLowerCase().includes(q) ||
      (d.demandeur_nom ?? '').toLowerCase().includes(q)
    );
  }, [demandes, searchQuery]);

  // Count active dossiers (non-closed)
  const dossiersActifs = useMemo(
    () => demandes.filter((d: any) => d.statut !== 'cloturee').length,
    [demandes]
  );

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedDemandeId) return;
    setSending(true);
    try {
      await createMessageDossier({
        demande_id: selectedDemandeId,
        auteur_nom: 'Agent DGPE',
        auteur_role: 'agent',
        contenu: messageContent.trim(),
      });
      setMessageContent('');
      refetchMessages();
    } catch {
      // Error handling silently - toast could be added
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loadingDemandes) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (errorDemandes) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <AlertCircle className="w-8 h-8" />
        <p>Erreur lors du chargement des dossiers: {errorDemandes}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messagerie Dossiers</h1>
        <p className="text-slate-500 mt-1">Communications et echanges sur les dossiers du guichet unique</p>
      </div>

      {/* KPI Bar */}
      <div className="flex items-center gap-4">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Messages non lus</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">
                  {loadingStats ? '-' : (stats?.messages_non_lus ?? 0)}
                </p>
                {!loadingStats && (stats?.messages_non_lus ?? 0) > 0 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Dossiers actifs</p>
              <p className="text-lg font-bold">{dossiersActifs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split Panel */}
      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Left Panel - Dossier List */}
        <Card className="w-1/3 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un dossier..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDemandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-4">
                <Search className="w-6 h-6" />
                <p className="text-sm text-center">Aucun dossier trouve</p>
              </div>
            ) : (
              filteredDemandes.map((demande: any) => {
                const info = messagesByDemande[demande.id];
                const isSelected = selectedDemandeId === demande.id;
                return (
                  <button
                    key={demande.id}
                    className={`w-full text-left p-3 border-b hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
                    }`}
                    onClick={() => setSelectedDemandeId(demande.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {demande.reference}
                          </span>
                          {info?.hasUnread && (
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate mt-0.5">
                          {truncate(demande.objet, 40)}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          <span className="truncate">{demande.demandeur_nom}</span>
                        </div>
                        {info?.lastMessage && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            {truncate(info.lastMessage.contenu, 50)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDate(demande.date_depot)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Panel - Conversation */}
        <Card className="w-2/3 flex flex-col overflow-hidden">
          {!selectedDemande ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
              <MessageSquare className="w-12 h-12" />
              <p className="text-lg">Selectionnez un dossier pour voir la conversation</p>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedDemande.reference}
                      </h2>
                      <Badge className={getStatutBadge(selectedDemande.statut)}>
                        {getStatutLabel(selectedDemande.statut)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{selectedDemande.objet}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>{selectedDemande.demandeur_nom}</span>
                    {selectedDemande.ministeres?.nom && (
                      <>
                        <Building2 className="w-4 h-4 ml-2" />
                        <span>{selectedDemande.ministeres.nom}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner />
                  </div>
                ) : errorMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <p className="text-sm">Erreur: {errorMessages}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <MessageSquare className="w-8 h-8" />
                    <p className="text-sm">Aucun message pour ce dossier</p>
                    <p className="text-xs">Envoyez le premier message ci-dessous</p>
                  </div>
                ) : (
                  messages.map((message: any) => {
                    const isDemandeur = message.auteur_role === 'demandeur';
                    const isSuperviseur = message.auteur_role === 'superviseur';
                    const bgColor = isDemandeur
                      ? 'bg-slate-100'
                      : isSuperviseur
                      ? 'bg-blue-50'
                      : 'bg-emerald-50';
                    const alignment = isDemandeur ? 'items-start' : 'items-end';

                    return (
                      <div key={message.id} className={`flex flex-col ${alignment}`}>
                        <div className={`max-w-[75%] rounded-lg p-3 ${bgColor}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">
                              {message.auteur_nom}
                            </span>
                            <Badge className={`text-xs ${getRoleBadge(message.auteur_role)}`}>
                              {getRoleLabel(message.auteur_role)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {message.contenu}
                          </p>
                          {message.pieces_jointes && message.pieces_jointes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.pieces_jointes.map((pj: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 text-xs text-blue-600 bg-white rounded px-2 py-1 border"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>{typeof pj === 'string' ? pj : pj.nom ?? 'Fichier'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(message.created_at)}</span>
                            {message.lu && (
                              <CheckCircle className="w-3 h-3 text-emerald-500 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ecrire un message..."
                    className="resize-none min-h-[44px] max-h-32"
                    rows={1}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 self-end"
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sending}
                  >
                    {sending ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
