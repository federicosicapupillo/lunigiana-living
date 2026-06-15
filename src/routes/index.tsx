import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroTramontoVignetiAsset from "@/assets/real/hero-tramonto-ulivi.png.asset.json";
import heroPontremoliCentroStorico from "@/assets/real/pontremoli-hero-centro-storico.png.asset.json";
import heroElenaCometa from "@/assets/elena-furia.png.asset.json";
import territoryPontremoli from "@/assets/real/pontremoli-lunigiana-v2.png.asset.json";
import territoryBagnone from "@/assets/real/bagnone-lunigiana.png.asset.json";
import territoryZeri from "@/assets/real/zeri-lunigiana.png.asset.json";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchBar } from "@/components/property-search-bar";
import { listPublishedPropertiesSummary, type PublicProperty } from "@/lib/public-properties.functions";
import { getLocalizedProperties } from "@/lib/property-i18n.functions";
import { getHomeHeroVariant, type HomeHeroVariant } from "@/lib/site-settings.functions";
import { LeadForm } from "@/components/lead-form";
import { GuidedChoiceSection } from "@/components/guided-choice";
import { LeadMagnetBlock } from "@/components/lead-magnet-block";
import { ReviewsTrustBlock } from "@/components/reviews-trust-block";
import { ArrowRight, Compass, KeyRound, Sparkles, ShieldCheck, MapPin, Home as HomeIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { localizePropertyDynamic } from "@/lib/i18n/property-localize";

const AGENCY_FACTS = {
  yearsActive: 18,
  propertiesManaged: 500,
  comuniCovered: 6,
  association: "FIAIP",
  phone: "0187 830229",
  mobile: "320 7019985",
  address: "Via Pirandello 7, 54027 Pontremoli (MS)",
  email: "furiaimmobiliare@libero.it",
  googleReviewsUrl: "https://share.google/XuLvMM0CG6tmjlwpO",
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Furia Immobiliare",
  description:
    "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e dimore di carattere in Lunigiana.",
  url: "https://furiaimmobiliare.it/",
  telephone: "+39 0187 830229",
  email: AGENCY_FACTS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Pirandello 7",
    addressLocality: "Pontremoli",
    postalCode: "54027",
    addressRegion: "MS",
    addressCountry: "IT",
  },
  areaServed: [
    "Pontremoli",
    "Villafranca in Lunigiana",
    "Filattiera",
    "Mulazzo",
    "Bagnone",
    "Zeri",
  ],
  memberOf: { "@type": "Organization", name: "FIAIP" },
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const [props, hero] = await Promise.all([listPublishedPropertiesSummary(), getHomeHeroVariant()]);
    return { ...props, heroVariant: hero.variant };
  },
  head: () => ({
    meta: [
      { title: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { name: "description", content: "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e immobili in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:title", content: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { property: "og:description", content: "Trova il tuo posto in Lunigiana. Immobili scelti per chi cerca autenticità, panorama e qualità del vivere." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: heroTramontoVignetiAsset.url, fetchpriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANIZATION_JSONLD),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const t = useT();
  const { language } = useLanguage();
  useLocalizedHead("seo.home.title", "seo.home.desc");
  const { properties, heroVariant } = Route.useLoaderData() as {
    properties: PublicProperty[];
    heroVariant: HomeHeroVariant;
  };
  const featuredProperties = properties
    .filter(
      (p) =>
        p.featured &&
        p.category === "vendita" &&
        p.image &&
        !p.image.startsWith("data:"),
    )
    .slice(0, 6);
  const localizeMany = useServerFn(getLocalizedProperties);
  const localizedQuery = useQuery({
    queryKey: ["home-properties-localized", language, featuredProperties.map((p) => p.id).join(",")],
    queryFn: () => localizeMany({ data: { ids: featuredProperties.map((p) => p.id), lang: language } }),
    enabled: language === "en" && featuredProperties.length > 0,
    staleTime: 1000 * 60 * 60,
  });
  const localizedById = new Map((localizedQuery.data?.properties ?? []).map((p) => [p.id, p as PublicProperty]));
  const isPontremoli = heroVariant === "pontremoli_historic_center";
  const isElena = heroVariant === "elena_cometa";
  const heroSrc = isElena
    ? heroElenaCometa.url
    : isPontremoli
      ? heroPontremoliCentroStorico.url
      : heroTramontoVignetiAsset.url;
  const heroAlt = isPontremoli
    ? "Pontremoli: il fiume Magra, il Duomo con cupola in rame, il centro storico e il Castello del Piagnaro sullo sfondo"
    : isElena
    ? "Elena Furia con Cometa, volto di Furia Immobiliare in Lunigiana"
    : "Tramonto infuocato sulle Apuane con vigneti, uliveti e borgo della Lunigiana in lontananza";
  const heroObjectPosition = isPontremoli ? "center center" : "center";
  return (
    <>
      {/* HERO */}
      {isElena ? (
        <section className="relative isolate -mt-20 overflow-hidden bg-cream">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-cream to-[hsl(var(--muted))]" />
          <div className="container-editorial grid min-h-[88svh] grid-cols-1 items-center gap-10 pb-12 pt-32 sm:min-h-[92svh] sm:pb-16 sm:pt-40 md:min-h-[100svh] md:grid-cols-12 md:gap-12 md:pb-24">
            <div className="md:col-span-6 lg:col-span-6">
              <span className="eyebrow text-primary">{t("home.eyebrow")}</span>
              <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] text-ink sm:text-5xl sm:leading-[1.02] md:text-6xl lg:text-7xl">
                {t("home.hero.title1")}<br />
                <em className="font-normal italic">{t("home.hero.title2")}</em>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg">
                {t("home.hero.lead")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
                <Link
                  to="/immobili"
                  className="inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
                >
                  {t("cta.searchYourHome")} <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://wa.me/393207019985?text=${encodeURIComponent(t("wa.defaultMsg"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:bg-ink hover:text-cream sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
                >
                  {t("cta.talkToElena")}
                </a>
              </div>
            </div>
            <div className="md:col-span-6 lg:col-span-6">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm shadow-2xl md:max-w-none">
                <img
                  src={heroElenaCometa.url}
                  alt={heroAlt}
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/40 to-transparent p-5">
                  <div className="text-[0.65rem] uppercase tracking-[0.22em] text-cream/90">
                    {t("home.hero.elenaCaption")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
      <section className="relative isolate -mt-20 flex min-h-[88svh] items-end overflow-hidden sm:min-h-[92svh] md:min-h-[100svh]">
        <img
          src={heroSrc}
          alt={heroAlt}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover animate-in fade-in duration-700"
          style={{ objectPosition: heroObjectPosition }}
        />
        <div className="hero-gradient absolute inset-0 -z-10" />

        <div className="container-editorial w-full pb-12 pt-32 sm:pb-16 sm:pt-40 md:pb-24">
          <div className="max-w-3xl">
            <span className="eyebrow text-cream/90">{t("home.eyebrow")}</span>
            <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] text-cream sm:text-5xl sm:leading-[1.02] md:text-7xl">
              {t("home.hero.title1")}<br />
              <em className="font-normal italic text-cream/95">{t("home.hero.title2")}</em>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base md:text-lg">
              {t("home.hero.leadAlt")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:bg-cream/90 sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
            >
              {t("cta.viewProperties")} <ArrowRight size={14} />
            </Link>
            <a
              href={`https://wa.me/393207019985?text=${encodeURIComponent(t("wa.defaultMsg"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-cream/70 px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-cream hover:text-ink sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
            >
              {t("cta.talkToElenaWA")}
            </a>
          </div>
        </div>
      </section>
      )}

      {/* TRUST STRIP */}
      <section className="border-b border-warm-border/60 section-ivory">
        <div className="container-editorial grid grid-cols-2 gap-6 py-6 sm:grid-cols-4 sm:py-7">
          {[
            { icon: HomeIcon, value: "18+", label: t("home.trust.years") },
            { icon: MapPin, value: "500+", label: t("home.trust.properties") },
            { icon: Compass, value: "6", label: t("home.trust.comuni") },
            { icon: ShieldCheck, value: "FIAIP", label: t("home.trust.fiaip") },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 sm:gap-4">
              <s.icon size={22} className="shrink-0 text-primary" />
              <div>
                <div className="font-serif text-xl leading-tight text-ink sm:text-2xl">{s.value}</div>
                <div className="text-[0.7rem] uppercase tracking-[0.15em] text-foreground/70">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="section-cream">
      <div className="container-editorial grid gap-10 py-12 sm:py-16 md:grid-cols-12 md:gap-12 md:py-24">
        <div className="md:col-span-5">
          <span className="eyebrow">{t("home.brand.eyebrow")}</span>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            {t("home.brand.title1")}<br />{t("home.brand.title2")}
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-6 md:col-start-7">
          <p>{t("home.brand.p1")}</p>
          <p>{t("home.brand.p2")}</p>
          <Link
            to="/chi-siamo"
            className="group inline-flex items-center gap-2 pt-4 text-sm uppercase tracking-[0.2em] text-primary underline decoration-primary/40 decoration-1 underline-offset-[6px] transition-colors hover:text-[color:var(--terracotta-hover)] hover:decoration-[color:var(--terracotta-hover)]"
          >
            {t("cta.ourStory")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      </section>

      {/* GUIDED CHOICE */}
      <GuidedChoiceSection />

      {/* LEAD MAGNET — Guida Lunigiana */}
      <section className="section-ivory py-14 sm:py-20">
        <div className="container-editorial">
          <LeadMagnetBlock source="home" />
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="section-sand py-16 sm:py-20 md:py-32">
        <div className="container-editorial">
          <div className="text-center">
            <span className="eyebrow">{t("home.featured.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
              {t("home.featured.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70">
              {t("home.featured.subtitle")}
            </p>
          </div>

          <div className="mt-10">
            <PropertySearchBar />
          </div>

          <div className="mt-10 grid gap-8 sm:mt-14 sm:gap-10 md:grid-cols-3">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} p={localizedById.get(p.id) ?? localizePropertyDynamic(p, language)} />
            ))}
          </div>

          <div className="mt-12 flex justify-center sm:mt-16">
            <Link
              to="/immobili"
              className="inline-flex items-center gap-3 rounded-sm bg-terracotta px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-[color:var(--terracotta-hover)] sm:px-10 sm:py-5 sm:text-sm"
            >
              {t("cta.viewAllProperties")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="section-ivory py-16 sm:py-20 md:py-24">
        <div className="container-editorial grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("home.lead.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              {t("home.lead.title1")}<br />{t("home.lead.title2")}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/80">
              {t("home.lead.subtitle")}
            </p>
            <div className="mt-6 hidden text-sm text-foreground/70 md:block">
              <div className="font-medium text-ink">Furia Immobiliare</div>
              <div className="mt-1">{AGENCY_FACTS.address}</div>
              <div className="mt-1">Tel. {AGENCY_FACTS.phone} · Cell. {AGENCY_FACTS.mobile}</div>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-md border border-warm-border/70 bg-warm-cream p-5 shadow-[0_1px_0_rgba(36,23,17,.04),0_18px_38px_-24px_rgba(36,23,17,.25)] sm:p-6">
              <LeadForm variant="search" source="home" showPromise={false} />
            </div>
          </div>
        </div>
      </section>

      {/* WHY LUNIGIANA */}
      <section className="section-cream">
      <div className="container-editorial py-16 sm:py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8 lg:col-span-7">
            <span className="eyebrow">{t("home.why.eyebrow")}</span>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              {t("home.why.title")}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80">
              {t("home.why.body")}
            </p>
            <Link
              to="/territori"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-terracotta px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-[color:var(--terracotta-hover)]"
            >
              {t("cta.exploreTerritory")} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      </section>

      {/* TERRITORIES STRIP */}
      <section className="bg-ink py-16 text-cream sm:py-20 md:py-32">
        <div className="container-editorial">
          <span className="eyebrow text-cream/70">{t("home.territories.eyebrow")}</span>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl text-cream sm:text-4xl md:text-5xl">
            {t("home.territories.title")}
          </h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm bg-cream/10 sm:mt-14 md:grid-cols-3">
            {[
                { name: "Pontremoli", img: territoryPontremoli.url, body: t("home.territories.t1.body") },
                { name: "Bagnone", img: territoryBagnone.url, body: t("home.territories.t2.body") },
                { name: "Zeri", img: territoryZeri.url, body: t("home.territories.t3.body") },
            ].map((terr) => (
              <Link
                key={terr.name}
                to="/territori"
                className="group relative block aspect-[16/10] overflow-hidden bg-ink md:aspect-[4/5]"
              >
                <img src={terr.img} alt={terr.name} loading="lazy" decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="ink-overlay absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="font-serif text-2xl text-cream sm:text-3xl">{terr.name}</div>
                  <p className="mt-2 text-sm text-cream/75">{terr.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-ivory">
      <div className="container-editorial py-16 sm:py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("home.services.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              {t("home.services.title1")}<br />{t("home.services.title2")}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75">
              {t("home.services.lead")}
            </p>
          </div>
          <div className="grid gap-6 md:col-span-7">
            {[
              { icon: Compass, title: t("home.services.s1.t"), body: t("home.services.s1.b") },
              { icon: KeyRound, title: t("home.services.s2.t"), body: t("home.services.s2.b") },
              { icon: Sparkles, title: t("home.services.s3.t"), body: t("home.services.s3.b") },
            ].map((s) => (
              <div key={s.title} className="card-service">
                <span className="icon-badge"><s.icon size={20} /></span>
                <h3 className="font-serif text-2xl text-ink">{s.title}</h3>
                <span className="title-rule" />
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>

      {/* OLD SERVICES PLACEHOLDER REMOVED */}
      {/* REVIEWS */}
      <ReviewsTrustBlock variant="full" source="home" className="section-sand py-16 sm:py-20 md:py-24" />

      {/* CTA */}
      <section className="container-editorial pb-20 sm:pb-32">
        <div className="relative overflow-hidden rounded-sm bg-secondary px-6 py-14 text-center text-cream sm:px-8 sm:py-20 md:px-16 md:py-28 mt-16 sm:mt-20">
          <span className="eyebrow text-cream/80">{t("home.finalCta.eyebrow")}</span>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-6xl">
            {t("home.finalCta.title1")}<br />
            <em className="font-normal italic">{t("home.finalCta.title2")}</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base">
            {t("home.finalCta.body")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={`https://wa.me/393207019985?text=${encodeURIComponent(t("wa.defaultMsg"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-7 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-cream/90"
            >
              {t("home.finalCta.waBtn")} <ArrowRight size={14} />
            </a>
            <Link
              to="/contatti"
              className="inline-flex items-center gap-2 rounded-sm border border-cream/70 px-7 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-cream hover:text-ink"
            >
              {t("home.finalCta.formBtn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
