import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { whatsappUrl } from "@/components/whatsapp-float";
import {
  listPublishedPropertiesSummary,
  type PublicProperty,
} from "@/lib/public-properties.functions";
import {
  TIPOLOGIE_SEO,
  filterPropertiesForTipologia,
  getTipologiaSeo,
  localizeTipologiaSeo,
  type TipologiaSeo,
} from "@/lib/seo-tipologie";
import { COMUNE_SEO, getComuneSeo, localizeComuneSeo } from "@/lib/seo-comuni";
import { trackClick } from "@/lib/analytics";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";
import { localizePropertyDynamic } from "@/lib/i18n/property-localize";
import { siteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/case-in-vendita-lunigiana/$tipologia")({
  loader: async ({ params }) => {
    const tipologia = getTipologiaSeo(params.tipologia);
    if (!tipologia) throw notFound();
    const { properties } = await listPublishedPropertiesSummary();
    const matched = filterPropertiesForTipologia(tipologia, properties);
    return { tipologia, properties: matched };
  },
  head: ({ params, loaderData }) => {
    const tipologia = loaderData?.tipologia ?? getTipologiaSeo(params.tipologia);
    if (!tipologia) {
      return { meta: [{ title: "Pagina non trovata — Furia Immobiliare" }] };
    }
    const url = siteUrl(`/case-in-vendita-lunigiana/${tipologia.slug}`);
    const items = loaderData?.properties ?? [];
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "Case in vendita in Lunigiana",
          item: siteUrl("/case-in-vendita-lunigiana"),
        },
        { "@type": "ListItem", position: 3, name: tipologia.fullName, item: url },
      ],
    };
    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items.slice(0, 25).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: siteUrl(`/immobili/${p.slug || p.id}`),
        name: p.title,
      })),
    };
    return {
      meta: [
        { title: tipologia.metaTitle },
        { name: "description", content: tipologia.metaDescription },
        { property: "og:title", content: tipologia.metaTitle },
        { property: "og:description", content: tipologia.metaDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        ...(items.length > 0
          ? [{ type: "application/ld+json", children: JSON.stringify(itemListLd) }]
          : []),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-editorial py-32 text-center">
      <p className="text-muted-foreground">Errore nel caricamento: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-editorial py-32 text-center">
      <h1 className="font-serif text-3xl text-ink">Pagina non trovata</h1>
      <p className="mt-4 text-muted-foreground">
        La tipologia richiesta non è disponibile.{" "}
        <Link to="/case-in-vendita-lunigiana" className="underline">
          Vedi tutte le tipologie
        </Link>
        .
      </p>
    </div>
  ),
  component: TipologiaSeoPage,
});

function TipologiaSeoPage() {
  const { tipologia, properties } = Route.useLoaderData() as {
    tipologia: TipologiaSeo;
    properties: PublicProperty[];
  };
  const { language } = useLanguage();
  const related = tipologia.relatedTypes
    .map((s) => TIPOLOGIE_SEO.find((t) => t.slug === s))
    .filter((t): t is TipologiaSeo => !!t);
  const suggestedComuni = tipologia.suggestedComuni
    .map((s) => getComuneSeo(s))
    .filter((c): c is NonNullable<ReturnType<typeof getComuneSeo>> => !!c);
  const waMsg = `Ciao Elena, sto cercando ${tipologia.name.toLowerCase()} in Lunigiana. Mi aiuti?`;
  const waHref = whatsappUrl(waMsg);

  return (
    <>
      {/* HERO + BREADCRUMB */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/case-in-vendita-lunigiana" className="hover:text-[var(--terracotta)]">
              Case in vendita in Lunigiana
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">{tipologia.fullName}</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <Compass size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Tipologia</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {tipologia.fullName} in vendita in Lunigiana
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            {tipologia.subtitle}
          </p>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Capire la tipologia
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {tipologia.fullName} in Lunigiana
            </h2>
            <div className="mt-6 h-px w-12 bg-[var(--terracotta)]/60" />
          </div>
          <div className="space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)] md:col-span-6 md:col-start-7">
            <p>{tipologia.paragraphs[0]}</p>
            <p>{tipologia.paragraphs[1]}</p>
          </div>
        </div>
      </section>

      {/* PROPERTIES */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--terracotta)]/20 pb-5">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
                Immobili disponibili
              </span>
              <h2 className="mt-2 font-serif text-2xl text-ink md:text-3xl">
                {properties.length > 0
                  ? `${properties.length} immobile${properties.length === 1 ? "" : "i"} coerent${
                      properties.length === 1 ? "e" : "i"
                    } con questa tipologia`
                  : `${tipologia.fullName} in Lunigiana`}
              </h2>
            </div>
            <Link
              to="/immobili"
              className="text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] hover:underline"
            >
              Tutti gli immobili
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] px-8 py-14 text-center">
              <h3 className="mx-auto max-w-xl font-serif text-2xl leading-snug text-ink">
                Non ci sono immobili pubblicati in questa categoria al momento
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-[var(--ink-soft)]">
                Possiamo però aiutarti a cercare una soluzione simile in Lunigiana
                o avvisarti quando arriva un immobile adatto.
              </p>
              <Link
                to="/contatti"
                data-track="seo_type_contact_click"
                onClick={() =>
                  trackClick("seo_type_contact_click", {
                    tipologia: tipologia.slug,
                    source: "empty_state",
                  })
                }
                className="mt-8 inline-block rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
              >
                Raccontaci cosa cerchi
              </Link>
            </div>
          ) : (
            <div
              className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3"
              onClickCapture={(e) => {
                const target = e.target as HTMLElement;
                const card = target.closest("[data-property-card]");
                if (card) {
                  trackClick("seo_type_property_click", {
                    tipologia: tipologia.slug,
                    property_id: card.getAttribute("data-property-id") || undefined,
                  });
                }
              }}
            >
              {properties.map((p) => (
                <PropertyCard key={p.id} p={localizePropertyDynamic(p, language)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Per chi è adatto
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {tipologia.fullName}: la scelta giusta se…
            </h2>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            {tipologia.audience.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-5"
              >
                <CheckCircle2
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[var(--terracotta)]"
                />
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CONSIDERATIONS */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Cosa valutare
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              Prima di comprare {tipologia.name.toLowerCase()}
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Qualche punto concreto che con i nostri clienti verifichiamo sempre
              insieme, prima di proporre un'offerta.
            </p>
          </div>
          <ol className="space-y-3 md:col-span-6 md:col-start-7">
            {tipologia.considerations.map((point, i) => (
              <li
                key={point}
                className="flex items-start gap-4 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-5"
              >
                <span className="font-serif text-lg text-[var(--terracotta)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  {point}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Cerchi {tipologia.name.toLowerCase()} in Lunigiana?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            Scrivi a Elena: ti aiuterà a capire quali immobili sono davvero coerenti
            con il tuo progetto.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="seo_type_whatsapp_click"
              onClick={() =>
                trackClick("seo_type_whatsapp_click", {
                  tipologia: tipologia.slug,
                  source: "type_cta",
                })
              }
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              Scrivi a Elena
            </a>
            <Link
              to="/contatti"
              data-track="seo_type_contact_click"
              onClick={() =>
                trackClick("seo_type_contact_click", {
                  tipologia: tipologia.slug,
                  source: "type_cta",
                })
              }
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              Vai ai contatti
            </Link>
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 rounded-sm bg-cream/10 px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-cream/20"
            >
              Vedi tutti gli immobili
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* RELATED TYPES */}
      {related.length > 0 && (
        <section className="bg-[var(--warm-ivory)] py-20">
          <div className="container-editorial">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
                Altre tipologie correlate
              </span>
              <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
                Esplora altre categorie
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  to="/case-in-vendita-lunigiana/$tipologia"
                  params={{ tipologia: t.slug }}
                  data-track="seo_type_related_type_click"
                  onClick={() =>
                    trackClick("seo_type_related_type_click", {
                      from: tipologia.slug,
                      to: t.slug,
                    })
                  }
                  className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
                >
                  <div className="flex items-center gap-2 text-[var(--terracotta)]">
                    <Compass size={16} strokeWidth={1.5} />
                    <span className="text-[0.7rem] uppercase tracking-[0.22em]">Tipologia</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl text-ink">{t.fullName}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">
                    {t.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                    Vedi pagina <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SUGGESTED COMUNI */}
      {suggestedComuni.length > 0 && (
        <section className="bg-[var(--cream)] py-20">
          <div className="container-editorial">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
                Cerca anche per zona
              </span>
              <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
                Comuni consigliati per questa tipologia
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                Alcuni comuni della Lunigiana sono particolarmente coerenti con questa scelta.{" "}
                <Link to="/territori" className="underline hover:text-[var(--terracotta)]">
                  Scopri tutta la Lunigiana
                </Link>
                .
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedComuni.map((c) => (
                <Link
                  key={c.slug}
                  to="/case-in-vendita/$comune"
                  params={{ comune: c.slug }}
                  data-track="seo_type_related_area_click"
                  onClick={() =>
                    trackClick("seo_type_related_area_click", {
                      tipologia: tipologia.slug,
                      comune: c.slug,
                    })
                  }
                  className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
                >
                  <div className="flex items-center gap-2 text-[var(--terracotta)]">
                    <MapPin size={16} strokeWidth={1.5} />
                    <span className="text-[0.7rem] uppercase tracking-[0.22em]">Comune</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl text-ink">{c.fullName}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">
                    {c.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                    Vedi case a {c.name} <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INTERNAL LINKS */}
      <section className="bg-[var(--warm-ivory)] py-16">
        <div className="container-editorial text-center">
          <p className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            Vuoi capire di più sul territorio?{" "}
            <Link to="/territori" className="underline hover:text-[var(--terracotta)]">
              Scopri la guida ai territori
            </Link>{" "}
            o leggi{" "}
            <Link to="/servizi" className="underline hover:text-[var(--terracotta)]">
              come lavoriamo
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}