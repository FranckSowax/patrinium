import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Landmark,
  Wrench,
  FileText,
  ArrowRightLeft,
  MessageSquare,
  Flower2,
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

/* ── Scroll-reveal hook (Intersection Observer) ── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Hover glow colors per service ── */
const HOVER_SHADOWS: Record<string, string> = {
  "bg-emerald-100 text-emerald-700": "hover:shadow-emerald-200/60",
  "bg-blue-100 text-blue-700": "hover:shadow-blue-200/60",
  "bg-orange-100 text-orange-700": "hover:shadow-orange-200/60",
  "bg-purple-100 text-purple-700": "hover:shadow-purple-200/60",
  "bg-red-100 text-red-700": "hover:shadow-red-200/60",
  "bg-gray-100 text-gray-700": "hover:shadow-slate-200/60",
  "bg-slate-100 text-slate-700": "hover:shadow-slate-200/60",
};

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
    icon: Flower2,
    title: "Frais d'Inhumation",
    description:
      "Demandez la prise en charge des frais d'inhumation selon la grille officielle de la DGPE.",
    color: "bg-gray-100 text-gray-700",
    href: "/services/inhumation",
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

/* ── Animation A+C : Services cards with fade-in cascade & hover lift/glow ── */
function ServicesSection() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="services" className="bg-slate-50 py-16 sm:py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className={`text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Nos Services
          </h2>
          <p
            className={`mt-3 text-base text-slate-600 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Effectuez vos demarches en ligne
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            const hoverShadow = HOVER_SHADOWS[service.color] ?? "hover:shadow-slate-200/60";
            return (
              <Card
                key={service.title}
                className={`group relative overflow-hidden transition-all duration-500 ease-out
                  hover:-translate-y-2 hover:shadow-xl ${hoverShadow}
                  ${visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
                style={{ transitionDelay: visible ? `${150 + idx * 100}ms` : "0ms" }}
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${service.color}`}
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
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Animation D : Steps with progressive line & pulse circles ── */
function StepsSection() {
  const { ref, visible } = useScrollReveal(0.2);

  return (
    <section id="comment-ca-marche" className="bg-white py-16 sm:py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className={`text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comment ca marche
          </h2>
          <p
            className={`mt-3 text-base text-slate-600 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Quatre etapes simples pour votre demarche
          </p>
        </div>

        <div className="relative mt-16">
          {/* Animated connector line (desktop) */}
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 lg:block">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-[1800ms] ease-out origin-left"
              style={{
                transform: visible ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
              }}
            />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const delay = 300 + idx * 400;
              return (
                <div
                  key={step.title}
                  className={`relative text-center transition-all duration-600 ease-out ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
                >
                  {/* Step circle with pulse */}
                  <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                    {/* Pulse ring */}
                    <div
                      className={`absolute inset-0 rounded-full bg-emerald-200 ${
                        visible ? "animate-ping" : ""
                      }`}
                      style={{
                        animationDelay: `${delay}ms`,
                        animationDuration: "1s",
                        animationIterationCount: "1",
                      }}
                    />
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        visible ? "bg-emerald-100 scale-100" : "bg-emerald-50 scale-75"
                      }`}
                      style={{ transitionDelay: `${delay}ms` }}
                    />
                    <Icon className="relative h-7 w-7 text-emerald-700" />
                    <span
                      className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white transition-all duration-300 ${
                        visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      }`}
                      style={{ transitionDelay: `${delay + 200}ms` }}
                    >
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
  );
}

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
            <img src="/logo-dgpe.png" alt="DGPE" className="h-[72px] w-[72px] rounded-full object-cover" />
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
                Direction Generale du
                <br />
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
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-900/60" />
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

      {/* ============ SERVICES SECTION (A: fade-in cascade + C: hover lift & glow) ============ */}
      <ServicesSection />


      {/* ============ COMMENT CA MARCHE (D: progressive line + pulse) ============ */}
      <StepsSection />

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-2">
                <img src="/logo-dgpe.png" alt="DGPE" className="h-[72px] w-[72px] rounded-full object-cover" />
                <div className="leading-tight">
                  <span className="text-sm font-bold text-white leading-snug">
                    Direction Generale du
                    <br />
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
