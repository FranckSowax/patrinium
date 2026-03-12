import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Clock,
  User,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardStats } from '@/hooks/useSupabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};

// Données pour les prédictions
const dataPredictionMaintenance = [
  { annee: '2024', reel: 85000000, prevu: 82000000 },
  { annee: '2025', reel: null, prevu: 92000000 },
  { annee: '2026', reel: null, prevu: 105000000 },
];

const dataOccupationPredictive = [
  { mois: 'Jan', taux: 78 },
  { mois: 'Fév', taux: 79 },
  { mois: 'Mar', taux: 77 },
  { mois: 'Avr', taux: 80 },
  { mois: 'Mai', taux: 82 },
  { mois: 'Juin', taux: 81 },
];

const suggestions = [
  "Quels sont les biens nécessitant une maintenance urgente ?",
  "Générer le rapport annuel pour le Parlement",
  "Quel est le taux d'occupation par province ?",
  "Prévoir le budget maintenance 2025",
  "Lister les impayés de loyers",
  "Analyser la valorisation du patrimoine"
];

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant' as const,
    content: "Bonjour ! Je suis l'assistant IA de la DGPE. Je peux vous aider à analyser les données patrimoniales, générer des rapports et répondre à vos questions. Comment puis-je vous aider ?",
    timestamp: new Date().toISOString()
  }
];

export function AIAssistantModule() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { stats, loading: statsLoading } = useDashboardStats();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const responses: Record<string, string> = {
        'maintenance': "D'après l'analyse des données, 3 biens nécessitent une maintenance urgente :\n\n1. **Centre de Santé Mouila** - Fuite d'eau (INT-2024-003)\n2. **Immeuble Administratif** - Climatisation défectueuse\n3. **Entrepôt Provincial** - Groupe électrogène à réviser\n\nBudget estimé pour ces interventions : **2 150 000 FCFA**",
        'rapport': "Je peux générer le rapport annuel d'activités de la DGPE pour 2024. Le rapport comprendra :\n\n- Inventaire du patrimoine immobilier et mobilier\n- Bilan des affectations et cessions\n- État des revenus locatifs\n- Suivi des marchés de réhabilitation\n- Charges administratives et sociales\n\nSouhaitez-vous que je le génère au format PDF ou Word ?",
        'occupation': "**Taux d'occupation par province (2024)** :\n\n🟢 **Estuaire** : 89% (129/145 biens)\n🟢 **Haut-Ogooué** : 76% (51/67 biens)\n🟡 **Ogooué-Maritime** : 72% (31/43 biens)\n🟡 **Woleu-Ntem** : 68% (26/38 biens)\n🔴 **Ngounié** : 54% (15/28 biens)\n\n**Taux national moyen : 78%**",
        'budget': "**Prévision budget maintenance 2025** :\n\nBasé sur l'analyse des données historiques et l'âge du patrimoine :\n\n📊 **Budget total estimé : 92 000 000 FCFA**\n\nDétail par catégorie :\n- Maintenance corrective : 45% (41.4M)\n- Maintenance préventive : 35% (32.2M)\n- Réhabilitations majeures : 20% (18.4M)\n\n⚠️ **Alerte** : Hausse de 12% par rapport à 2024 due au vieillissement de 15% du parc immobilier.",
        'impayes': "**Situation des impayés de loyers** :\n\n💰 **Total impayés : 12 500 000 FCFA**\n\nDétail par bail :\n1. **BAIL-2024-002** - M. Alain Ondo : 1 500 000 FCFA\n2. **BAIL-2024-007** - Société ABC : 4 200 000 FCFA\n3. **BAIL-2024-012** - Mme Kassa : 2 800 000 FCFA\n4. Autres : 4 000 000 FCFA\n\n📞 **Actions recommandées** : Relances téléphoniques + mise en demeure pour les dépassant 3 mois.",
        'default': `Je comprends votre demande concernant "${inputMessage}". \n\nEn tant qu'assistant IA de la DGPE, je peux vous aider à :\n\n🔍 **Analyser** les données patrimoniales\n📊 **Générer** des rapports et tableaux de bord\n💡 **Prédire** les besoins en maintenance\n📋 **Consulter** les décrets et procédures\n\nPourriez-vous préciser votre demande ou choisir une suggestion ci-dessous ?`
      };

      let responseText = responses['default'];
      const lowerInput = inputMessage.toLowerCase();

      if (lowerInput.includes('maintenance') || lowerInput.includes('panne') || lowerInput.includes('urgent')) {
        responseText = responses['maintenance'];
      } else if (lowerInput.includes('rapport') || lowerInput.includes('parlement')) {
        responseText = responses['rapport'];
      } else if (lowerInput.includes('occupation') || lowerInput.includes('taux')) {
        responseText = responses['occupation'];
      } else if (lowerInput.includes('budget') || lowerInput.includes('prévision')) {
        responseText = responses['budget'];
      } else if (lowerInput.includes('impayé') || lowerInput.includes('loyer')) {
        responseText = responses['impayes'];
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const valeurPatrimoniale = stats
    ? stats.valeur_patrimoine_immobilier + stats.valeur_patrimoine_mobilier
    : 0;
  const revenus = stats ? stats.revenus_loyers_annuels : 0;
  const tauxOccupation = stats ? stats.taux_occupation : 0;
  const biensInventories = stats
    ? stats.total_biens_immobiliers + stats.total_biens_mobiliers
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assistant IA & Business Intelligence</h1>
          <p className="text-slate-500 mt-1">Chatbot RAG et tableaux de bord prédictifs</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Sparkles className="w-3 h-3 mr-1" />
          IA Générative
        </Badge>
      </div>

      <Tabs defaultValue="chatbot" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chatbot">Assistant IA</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="bi">Tableau de Bord BI</TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Assistant DGPE</CardTitle>
                    <p className="text-sm text-slate-500">Propulsé par Claude AI - RAG Documentaire</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-emerald-100'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-100 p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Posez votre question sur le patrimoine..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm flex items-center justify-between group"
                    >
                      <span>{suggestion}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">Sources documentaires</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <FileText className="w-4 h-4" />
                      <span>Décret N° 000216/PR/MEF</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <FileText className="w-4 h-4" />
                      <span>Procédures DGPE v2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <FileText className="w-4 h-4" />
                      <span>Code des biens publics</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Prévision Budget Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dataPredictionMaintenance}>
                    <defs>
                      <linearGradient id="colorPrevu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="annee" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `${v/1000000}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="prevu"
                      name="Budget Prévu"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorPrevu)"
                      strokeDasharray="5 5"
                    />
                    <Area
                      type="monotone"
                      dataKey="reel"
                      name="Budget Réel"
                      stroke="#10b981"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Alerte Prédictive</p>
                      <p className="text-sm text-amber-700">
                        Hausse de 12% prévue pour 2025 due au vieillissement du parc immobilier.
                        15% des biens dépasseront 20 ans d'âge.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Prévision Taux d'Occupation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dataOccupationPredictive}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mois" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[70, 90]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line
                      type="monotone"
                      dataKey="taux"
                      name="Taux d'occupation"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Recommandation IA</p>
                      <p className="text-sm text-emerald-700">
                        Le taux d'occupation devrait atteindre 82% en mai.
                        Opportunité d'augmenter les loyers de 3-5% sur les biens sous-demandés.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights Générés par l'IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <p className="font-medium">Maintenance Préventive</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    23 équipements nécessitent une maintenance préventive d'ici 30 jours.
                    Économie estimée : 15M FCFA vs maintenance corrective.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-5 h-5 text-emerald-500" />
                    <p className="font-medium">Optimisation Patrimoine</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    12 biens sont sous-utilisés (&lt;30% d'occupation).
                    Recommandation : Cession ou réaffectation pour 450M FCFA de valeur.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <p className="font-medium">Projection Financière</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Les revenus locatifs devraient croître de 8% en 2025
                    grâce à la digitalisation des paiements Mobile Money.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tableau de Bord Exécutif</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                  <p className="text-sm opacity-80">Valeur Patrimoniale</p>
                  <p className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(valeurPatrimoniale)}</p>
                  <p className="text-sm opacity-80">+5.2% vs 2023</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg text-white">
                  <p className="text-sm opacity-80">Revenus Annuels</p>
                  <p className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(revenus)}</p>
                  <p className="text-sm opacity-80">+12% vs 2023</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg text-white">
                  <p className="text-sm opacity-80">Taux Occupation</p>
                  <p className="text-2xl font-bold">{statsLoading ? '...' : `${tauxOccupation}%`}</p>
                  <p className="text-sm opacity-80">Objectif: 85%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white">
                  <p className="text-sm opacity-80">Biens Inventoriés</p>
                  <p className="text-2xl font-bold">{statsLoading ? '...' : biensInventories.toLocaleString('fr-FR')}</p>
                  <p className="text-sm opacity-80">100% du patrimoine</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Performance par Province</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { province: 'Estuaire', occupation: 89, recouvrement: 95 },
                      { province: 'Haut-Ogooué', occupation: 76, recouvrement: 88 },
                      { province: 'Ogooué-Maritime', occupation: 72, recouvrement: 82 },
                      { province: 'Woleu-Ntem', occupation: 68, recouvrement: 75 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="province" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="occupation" name="Occupation %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recouvrement" name="Recouvrement %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Indicateurs Clés</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Interventions résolues &lt; 48h</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Biens avec titre foncier</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Paiements digitalisés</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ministères connectés</span>
                        <span className="font-medium">100%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
