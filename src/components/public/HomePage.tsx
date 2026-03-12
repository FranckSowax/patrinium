import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Landmark,
  Wrench,
  FileText,
  ArrowRightLeft,
  MessageSquare,
  Hash,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Accueil", href: "#" },
  { label: "Services", href: "#services" },
  { label: "Suivi Dossier", href: "/suivi" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    icon: Building2,
    title: "Affectation de Bien",
    description:
      "Demandez l'affectation d'un bien immobilier ou mobilier de l'Etat a votre institution.",
    color: "bg-emerald-100 text-emerald-700",
    href: "/services/affectation",
  },
  {
    icon: Landmark,
    title: "Concession Domaniale",
    description:
      "Sollicitez l'attribution d'un terrain ou d'une concession du domaine public ou prive de l'Etat.",
    color: "bg-blue-100 text-blue-700",
    href: "/services/concession",
  },
  {
    icon: Wrench,
    title: "Signalement & Maintenance",
    description:
      "Signalez un probleme ou demandez une intervention sur un batiment ou equipement de l'Etat.",
    color: "bg-orange-100 text-orange-700",
    href: "/services/maintenance",
  },
  {
    icon: FileText,
    title: "Bail & Renouvellement",
    description:
      "Gerez vos baux, demandez un renouvellement ou signalez un changement de situation.",
    color: "bg-purple-100 text-purple-700",
    href: "/services/bail",
  },
  {
    icon: ArrowRightLeft,
    title: "Cession de Bien Reforme",
    description:
      "Demandez la cession ou la vente aux encheres de biens reformes de l'Etat.",
    color: "bg-red-100 text-red-700",
    href: "/services/cession",
  },
  {
    icon: MessageSquare,
    title: "Reclamation & Renseignement",
    description:
      "Deposez une reclamation, contestez une decision ou demandez des informations.",
    color: "bg-slate-100 text-slate-700",
    href: "/services/reclamation",
  },
];

const STEPS = [
  {
    icon: FileText,
    title: "Deposez votre demande",
    description:
      "Remplissez le formulaire en ligne avec vos informations et documents",
  },
  {
    icon: Hash,
    title: "Recevez votre numero",
    description:
      "Un numero de dossier unique vous est attribue immediatement",
  },
  {
    icon: Clock,
    title: "Suivi en temps reel",
    description:
      "Suivez l'avancement de votre dossier a tout moment",
  },
  {
    icon: CheckCircle,
    title: "Decision notifiee",
    description:
      "Recevez la decision par email et consultez-la en ligne",
  },
];

const STATS = [
  { value: "2 500+", label: "Biens geres" },
  { value: "8 000+", label: "Demandes traitees" },
  { value: "9", label: "Provinces couvertes" },
  { value: "24/7", label: "Accessible" },
];

export function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (!id) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HEADER / NAVBAR ============ */}
      <header
        className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                PATRINIUM
              </span>
              <span className="block text-[11px] text-slate-500">
                Patrimoine de l'Etat
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="hidden bg-emerald-700 text-white hover:bg-emerald-800 sm:inline-flex"
              onClick={() => navigate("/dashboard")}
            >
              Espace Agent
            </Button>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              )
            )}
            <Button
              size="sm"
              className="mt-2 w-full bg-emerald-700 text-white hover:bg-emerald-800"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/dashboard");
              }}
            >
              Espace Agent
            </Button>
          </div>
        )}
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800">
        {/* Decorative pattern overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-white/5" />
          <div className="absolute right-1/4 top-1/3 h-[200px] w-[200px] rounded-full bg-teal-600/20" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300">
              Republique Gabonaise
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Direction Generale du Patrimoine de l'Etat
            </h1>
            <p className="mt-6 text-base leading-relaxed text-emerald-100/90 sm:text-lg">
              Plateforme digitale de gestion et d'interaction avec le patrimoine
              public du Gabon
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="w-full bg-white text-emerald-900 shadow-lg hover:bg-emerald-50 sm:w-auto"
                onClick={() => navigate("/services/affectation")}
              >
                Deposer une demande
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
                onClick={() => navigate("/suivi")}
              >
                Suivre mon dossier
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-5 text-center sm:px-6"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-emerald-200/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES SECTION ============ */}
      <section id="services" className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Nos Services
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Effectuez vos demarches en ligne
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className="group relative overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                    <Link
                      to={service.href}
                      className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900"
                    >
                      Faire une demande
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ COMMENT CA MARCHE ============ */}
      <section id="comment-ca-marche" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Comment ca marche
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Quatre etapes simples pour votre demarche
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 border-t-2 border-dashed border-emerald-200 lg:block" />

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative text-center">
                    {/* Step number badge */}
                    <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-emerald-100" />
                      <Icon className="relative h-7 w-7 text-emerald-700" />
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="text-lg font-bold text-white">
                    PATRINIUM
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Patrimoine de l'Etat
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Plateforme digitale de gestion du patrimoine public du Gabon,
                au service des citoyens et des institutions.
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Republique Gabonaise
              </p>
            </div>

            {/* Col 2 — Liens rapides */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Liens Rapides
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="#services"
                    onClick={(e) => handleAnchorClick(e, "#services")}
                    className="transition-colors hover:text-white"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <Link
                    to="/suivi"
                    className="transition-colors hover:text-white"
                  >
                    Suivi de Dossier
                  </Link>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => handleAnchorClick(e, "#contact")}
                    className="transition-colors hover:text-white"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="transition-colors hover:text-white"
                  >
                    Espace Agent
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Contact
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>Libreville, Gabon</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <a
                    href="mailto:contact@dgpe.ga"
                    className="transition-colors hover:text-white"
                  >
                    contact@dgpe.ga
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>+241 XX XX XX XX</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-slate-500">
              &copy; 2026 DGPE - Direction Generale du Patrimoine de l'Etat.
              Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
