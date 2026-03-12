import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createDemandeGuichet } from '@/lib/mutations';
import { useProvinces } from '@/hooks/useSupabase';

// ─── Service type configuration ─────────────────────────────────────────

type ServiceKey = 'affectation' | 'concession' | 'maintenance' | 'bail' | 'cession' | 'reclamation' | 'renseignement' | 'inhumation';

interface ServiceConfig {
  title: string;
  type_enum: string;
  sla: number;
  description: string;
  placeholder: string;
}

const SERVICE_CONFIGS: Record<ServiceKey, ServiceConfig> = {
  affectation: {
    title: "Demande d'Affectation de Bien",
    type_enum: 'affectation_bien',
    sla: 15,
    description:
      "Formulez votre demande d'affectation d'un bien immobilier ou mobilier de l'Etat. Un agent traitera votre dossier dans un delai de 15 jours ouvrables.",
    placeholder: "Ex: Demande d'affectation d'un bureau au Ministere...",
  },
  concession: {
    title: "Demande d'Attribution de Concession",
    type_enum: 'attribution_concession',
    sla: 30,
    description:
      "Deposez votre demande d'attribution de concession domaniale. Le traitement prend en moyenne 30 jours ouvrables.",
    placeholder: 'Ex: Attribution de concession pour usage agricole...',
  },
  maintenance: {
    title: "Signalement & Demande d'Intervention",
    type_enum: 'intervention_maintenance',
    sla: 7,
    description:
      "Signalez un probleme ou demandez une intervention de maintenance sur un bien de l'Etat. Delai moyen de traitement : 7 jours ouvrables.",
    placeholder: 'Ex: Fuite au niveau du batiment administratif...',
  },
  bail: {
    title: 'Renouvellement de Bail',
    type_enum: 'renouvellement_bail',
    sla: 20,
    description:
      'Soumettez votre demande de renouvellement de bail pour un bien domanial. Delai de traitement estime : 20 jours ouvrables.',
    placeholder: 'Ex: Renouvellement du bail du local commercial situe...',
  },
  cession: {
    title: 'Demande de Cession de Bien',
    type_enum: 'cession_reforme',
    sla: 30,
    description:
      "Deposez votre demande de cession ou de reforme d'un bien de l'Etat. Le traitement prend environ 30 jours ouvrables.",
    placeholder: "Ex: Demande de cession du vehicule de service immatricule...",
  },
  reclamation: {
    title: 'Reclamation ou Contestation',
    type_enum: 'reclamation',
    sla: 20,
    description:
      "Deposez une reclamation ou contestation relative a la gestion du patrimoine public. Delai de reponse : 20 jours ouvrables.",
    placeholder: 'Ex: Contestation de la decision d\'affectation du...',
  },
  renseignement: {
    title: 'Demande de Renseignement',
    type_enum: 'renseignement',
    sla: 10,
    description:
      "Posez votre question ou demandez des informations sur le patrimoine public. Reponse sous 10 jours ouvrables.",
    placeholder: 'Ex: Renseignement sur la disponibilite de locaux dans...',
  },
  inhumation: {
    title: 'Prise en Charge des Frais d\'Inhumation',
    type_enum: 'prise_en_charge_inhumation',
    sla: 15,
    description:
      "Demandez la prise en charge des frais d'inhumation par la DGPE. Le montant est determine selon la grille officielle en fonction de la categorie du defunt.",
    placeholder: 'Ex: Prise en charge inhumation de M./Mme...',
  },
};

// ─── Grille officielle des frais d'inhumation DGPE ──────────────────────

const GRILLE_INHUMATION = [
  { code: 'cat_a',    label: 'Categorie A',                     montant: 1000000 },
  { code: 'cat_b',    label: 'Categorie B',                     montant: 800000  },
  { code: 'cat_c',    label: 'Categorie C',                     montant: 700000  },
  { code: 'monp',     label: "Main d'oeuvre non permanente",     montant: 575000  },
  { code: 'conjoint', label: 'Conjoint(e)',                      montant: 650000  },
  { code: 'enfant',   label: 'Enfants a charge',                montant: 500000  },
  { code: 'retraite', label: 'Retraites',                       montant: 575000  },
  { code: 'eleve',    label: 'Eleves et etudiants',             montant: 500000  },
  { code: 'indigent', label: 'Indigents',                       montant: 400000  },
];

const formatXAF = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

// ─── Component ──────────────────────────────────────────────────────────

export function ServiceFormPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { data: provinces } = useProvinces();

  const config = type ? SERVICE_CONFIGS[type as ServiceKey] : undefined;

  // ── Form state ──
  const [objet, setObjet] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState('normale');
  const [demandeurType, setDemandeurType] = useState('particulier');
  const [nomComplet, setNomComplet] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [poste, setPoste] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [provinceId, setProvinceId] = useState('');

  // ── Inhumation-specific state ──
  const [categorieInhumation, setCategorieInhumation] = useState('');
  const [defuntNom, setDefuntNom] = useState('');
  const [defuntLienParente, setDefuntLienParente] = useState('');
  const [defuntMatricule, setDefuntMatricule] = useState('');

  const isInhumation = type === 'inhumation';
  const selectedGrille = GRILLE_INHUMATION.find(g => g.code === categorieInhumation);
  const montantInhumation = selectedGrille?.montant ?? 0;

  // ── UI state ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // ── Unknown service type ──
  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-10">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Service introuvable</h2>
            <p className="text-muted-foreground mb-6">
              Le type de service demande n'existe pas.
            </p>
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Retour a l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Validation ──
  function validate(): boolean {
    const errors: Record<string, boolean> = {};
    if (!isInhumation && !objet.trim()) errors.objet = true;
    if (!isInhumation && !description.trim()) errors.description = true;
    if (!nomComplet.trim()) errors.nomComplet = true;
    if (!email.trim()) errors.email = true;
    if (!telephone.trim()) errors.telephone = true;
    if (isInhumation) {
      if (!categorieInhumation) errors.categorieInhumation = true;
      if (!defuntNom.trim()) errors.defuntNom = true;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      // Build objet & description for inhumation
      const finalObjet = isInhumation
        ? `Prise en charge inhumation - ${selectedGrille?.label} - ${defuntNom.trim()}`
        : objet.trim();
      const finalDescription = isInhumation
        ? [
            `Categorie: ${selectedGrille?.label}`,
            `Montant grille: ${formatXAF(montantInhumation)}`,
            `Nom du defunt: ${defuntNom.trim()}`,
            defuntLienParente ? `Lien de parente: ${defuntLienParente.trim()}` : '',
            defuntMatricule ? `Matricule agent: ${defuntMatricule.trim()}` : '',
            description.trim() ? `Observations: ${description.trim()}` : '',
          ].filter(Boolean).join('\n')
        : description.trim();

      const { data, error: mutError } = await createDemandeGuichet({
        type: config!.type_enum,
        objet: finalObjet,
        description: finalDescription,
        priorite,
        demandeur_type: demandeurType,
        demandeur_nom: nomComplet.trim(),
        demandeur_organisme: demandeurType === 'institution' ? organisme.trim() : undefined,
        demandeur_poste: demandeurType === 'institution' ? poste.trim() : undefined,
        demandeur_email: email.trim(),
        demandeur_telephone: telephone.trim(),
        province_id: provinceId || undefined,
        sla_jours: config!.sla,
      });

      if (mutError) throw new Error(mutError.message);

      const ref = data?.reference || `DEM-${String(data?.id || Date.now()).slice(-5).padStart(5, '0')}`;
      setReference(ref);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors du depot de votre demande. Veuillez reessayer.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Success view ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-dgpe.png" alt="DGPE" className="w-[72px] h-[72px] rounded-full object-cover" />
              <span className="text-lg font-bold text-gray-900">PATRINIUM</span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center px-4 py-16">
          <Card className="max-w-lg w-full">
            <CardContent className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Votre demande a ete deposee avec succes !
                </h2>
                <p className="text-muted-foreground">
                  Numero de dossier :{' '}
                  <span className="font-mono font-semibold text-emerald-700">{reference}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Conservez ce numero pour suivre l'avancement de votre dossier.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigate(`/suivi?ref=${reference}`)}
                >
                  Suivre mon dossier
                </Button>
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Retour a l'accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Form view ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-dgpe.png" alt="DGPE" className="w-[72px] h-[72px] rounded-full object-cover" />
            <span className="text-lg font-bold text-gray-900">PATRINIUM</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Card */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{config.description}</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Section: Inhumation — Grille & Defunt */}
          {isInhumation ? (
            <>
              {/* Grille officielle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grille Officielle des Montants</CardTitle>
                  <CardDescription>
                    Selectionnez la categorie du defunt. Le montant de prise en charge est fixe par la DGPE.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tableau grille */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left px-4 py-2.5 font-medium text-slate-700">Categorie</th>
                          <th className="text-right px-4 py-2.5 font-medium text-slate-700">Montant FCFA</th>
                          <th className="px-4 py-2.5 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {GRILLE_INHUMATION.map((g) => (
                          <tr
                            key={g.code}
                            onClick={() => {
                              setCategorieInhumation(g.code);
                              if (validationErrors.categorieInhumation)
                                setValidationErrors((v) => ({ ...v, categorieInhumation: false }));
                            }}
                            className={`cursor-pointer border-t transition-colors ${
                              categorieInhumation === g.code
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-2.5">{g.label}</td>
                            <td className="px-4 py-2.5 text-right font-semibold">
                              {new Intl.NumberFormat('fr-FR').format(g.montant)} FCFA
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className={`w-4 h-4 rounded-full border-2 mx-auto flex items-center justify-center ${
                                categorieInhumation === g.code
                                  ? 'border-emerald-600 bg-emerald-600'
                                  : 'border-slate-300'
                              }`}>
                                {categorieInhumation === g.code && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {validationErrors.categorieInhumation && (
                    <p className="text-sm text-red-500">Veuillez selectionner une categorie.</p>
                  )}

                  {/* Montant selectionne */}
                  {selectedGrille && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Montant de prise en charge</p>
                        <p className="text-xs text-emerald-600">{selectedGrille.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">{formatXAF(montantInhumation)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info sur le defunt */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations sur le defunt</CardTitle>
                  <CardDescription>Renseignez les informations relatives a la personne decedee.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defunt-nom">
                      Nom complet du defunt <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="defunt-nom"
                      placeholder="Prenom et nom du defunt"
                      value={defuntNom}
                      onChange={(e) => {
                        setDefuntNom(e.target.value);
                        if (validationErrors.defuntNom)
                          setValidationErrors((v) => ({ ...v, defuntNom: false }));
                      }}
                      className={validationErrors.defuntNom ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defunt-lien">Lien de parente avec le demandeur</Label>
                      <Select value={defuntLienParente} onValueChange={setDefuntLienParente}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectionnez..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent_lui_meme">L'agent lui-meme</SelectItem>
                          <SelectItem value="conjoint">Conjoint(e)</SelectItem>
                          <SelectItem value="enfant">Enfant</SelectItem>
                          <SelectItem value="parent">Pere / Mere</SelectItem>
                          <SelectItem value="autre_proche">Autre proche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defunt-matricule">Matricule de l'agent (si applicable)</Label>
                      <Input
                        id="defunt-matricule"
                        placeholder="Ex: 123456-A"
                        value={defuntMatricule}
                        onChange={(e) => setDefuntMatricule(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description-inhumation">Observations complementaires</Label>
                    <Textarea
                      id="description-inhumation"
                      placeholder="Informations supplementaires, pieces jointes a fournir, etc."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
          /* Section: Votre demande (services classiques) */
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Votre demande</CardTitle>
              <CardDescription>Decrivez le motif et les details de votre demande.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Objet */}
              <div className="space-y-2">
                <Label htmlFor="objet">
                  Objet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="objet"
                  placeholder={config.placeholder}
                  value={objet}
                  onChange={(e) => {
                    setObjet(e.target.value);
                    if (validationErrors.objet) setValidationErrors((v) => ({ ...v, objet: false }));
                  }}
                  className={validationErrors.objet ? 'border-red-500' : ''}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Decrivez votre demande en detail"
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationErrors.description)
                      setValidationErrors((v) => ({ ...v, description: false }));
                  }}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
              </div>

              {/* Priorite */}
              <div className="space-y-2">
                <Label htmlFor="priorite">Priorite</Label>
                <Select value={priorite} onValueChange={setPriorite}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectionnez une priorite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Section: Vos coordonnees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vos coordonnees</CardTitle>
              <CardDescription>
                Renseignez vos informations de contact pour le suivi du dossier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type de demandeur */}
              <div className="space-y-3">
                <Label>Type de demandeur</Label>
                <RadioGroup
                  value={demandeurType}
                  onValueChange={setDemandeurType}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="institution" id="type-institution" />
                    <Label htmlFor="type-institution" className="font-normal cursor-pointer">
                      Institution / Administration
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="particulier" id="type-particulier" />
                    <Label htmlFor="type-particulier" className="font-normal cursor-pointer">
                      Particulier
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Nom complet */}
              <div className="space-y-2">
                <Label htmlFor="nom-complet">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom-complet"
                  placeholder="Prenom et nom"
                  value={nomComplet}
                  onChange={(e) => {
                    setNomComplet(e.target.value);
                    if (validationErrors.nomComplet)
                      setValidationErrors((v) => ({ ...v, nomComplet: false }));
                  }}
                  className={validationErrors.nomComplet ? 'border-red-500' : ''}
                />
              </div>

              {/* Organisme (institution only) */}
              {demandeurType === 'institution' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organisme">Organisme / Institution</Label>
                    <Input
                      id="organisme"
                      placeholder="Nom de l'institution ou du ministere"
                      value={organisme}
                      onChange={(e) => setOrganisme(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poste">Poste / Fonction</Label>
                    <Input
                      id="poste"
                      placeholder="Votre poste ou fonction"
                      value={poste}
                      onChange={(e) => setPoste(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email)
                      setValidationErrors((v) => ({ ...v, email: false }));
                  }}
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
              </div>

              {/* Telephone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">
                  Telephone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+241 XX XX XX XX"
                  value={telephone}
                  onChange={(e) => {
                    setTelephone(e.target.value);
                    if (validationErrors.telephone)
                      setValidationErrors((v) => ({ ...v, telephone: false }));
                  }}
                  className={validationErrors.telephone ? 'border-red-500' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section: Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Localisation</CardTitle>
              <CardDescription>Precisez la province concernee (optionnel).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select value={provinceId} onValueChange={setProvinceId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectionnez une province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p: { id: string; nom: string }) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Deposer ma demande
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
