import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { whatsappUrl } from "@/components/whatsapp-float";
import { listPublishedPropertiesSummary, type PublicProperty } from "@/lib/public-properties.functions";
import {
  COMUNE_SEO,
  comunePreposition,
  getComuneSeo,
  localizeComuneSeo,
  municipalityMatches,
} from "@/lib/seo-comuni";
import { TIPOLOGIE_SEO, localizeTipologiaSeo, propertyMatchesTipologia } from "@/lib/seo-tipologie";
import { isForSale, propertyMunicipality } from "@/lib/seo-taxonomy";
import { SEO_1B_UI, getComuneLongform, pick } from "@/lib/seo-editorial";
import { Compass } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";
import { localizePropertyDynamic } from "@/lib/i18n/property-localize";
import { siteUrl } from "@/lib/site-url";
import { propertyPath } from "@/lib/property-url";

export const Route = createFileRoute("/case-in-vendita/$comune")({
  loader: async ({ params }) => {
    const comune = getComuneSeo(params.comune);
    if (!comune) throw notFound();
    const { properties } = await listPublishedPropertiesSummary();
    const inComune = (c: typeof comune, p: (typeof properties)[number]) =>
      municipalityMatches(c, propertyMunicipality(p));
    // Landing con intento "in vendita": solo immobili realmente in vendita
    // (contract_type strutturato). Le locazioni restano nel catalogo /immobili.
    const forSale = properties.filter(isForSale);
    const matched = forSale.filter((p) => inComune(comune, p));
    // Tipologie realmente popolate in questo comune (nuova tassonomia).
    const populatedTypes = TIPOLOGIE_SEO.filter((tp) =>
      matched.some((p) => propertyMatchesTipologia(tp, p)),
    ).map((tp) => tp.slug);
    // Comuni vicini con inventario reale, per il fallback inventory = 0.
    const nearby = COMUNE_SEO.filter(
      (c) => c.slug !== comune.slug && forSale.some((p) => inComune(c, p)),
    ).map((c) => c.slug);
    return { comune, properties: matched, populatedTypes, nearby };
  },
  head: ({ params, loaderData }) => {
    const comune = loaderData?.comune ?? getComuneSeo(params.comune);
    if (!comune) {
      return { meta: [{ title: "Pagina non trovata — Furia Immobiliare" }] };
    }
    const url = siteUrl(`/case-in-vendita/${comune.slug}`);
    const prep = comunePreposition(comune.fullName);
    const title = `Case in vendita ${prep} ${comune.fullName} | Furia Immobiliare`;
    const description = `Scopri case, appartamenti e immobili di carattere ${prep} ${comune.fullName} con Furia Immobiliare. Ti guidiamo nella scelta della casa giusta in Lunigiana.`;
    const items = loaderData?.properties ?? [];
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Case in vendita", item: siteUrl("/case-in-vendita") },
        { "@type": "ListItem", position: 3, name: comune.fullName, item: url },
      ],
    };
    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items.slice(0, 25).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: siteUrl(propertyPath(p)),
        name: p.title,
      })),
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
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
        Il comune richiesto non è disponibile.{" "}
        <Link to="/case-in-vendita" className="underline">
          Vedi tutti i comuni
        </Link>
        .
      </p>
    </div>
  ),
  component: ComuneSeoPage,
});

function ComuneSeoPage() {
  const { comune, properties, populatedTypes, nearby } = Route.useLoaderData() as {
    comune: (typeof COMUNE_SEO)[number];
    properties: PublicProperty[];
    populatedTypes: string[];
    nearby: string[];
  };
  const { language } = useLanguage();
  const t = useT();
  const L = localizeComuneSeo(comune, language);
  useDocHead(L.metaTitle, L.metaDescription);
  const longform = getComuneLongform(comune.slug, language);
  const typesSection = longform?.sections.find((s) => s.id === "types");
  const related = COMUNE_SEO.filter((c) => c.slug !== comune.slug).slice(0, 4);
  const prep = comunePreposition(comune.fullName);
  const populated = populatedTypes
    .map((slug) => TIPOLOGIE_SEO.find((tp) => tp.slug === slug))
    .filter((tp): tp is (typeof TIPOLOGIE_SEO)[number] => !!tp);
  const nearbyComuni = nearby
    .map((slug) => getComuneSeo(slug))
    .filter((c): c is NonNullable<ReturnType<typeof getComuneSeo>> => !!c)
    .slice(0, 4);
  const waMsg =
    language === "en"
      ? `Hi Elena, I'm looking for a home in ${comune.fullName}. Could you help me?`
      : `Ciao Elena, sto cercando casa a ${comune.fullName}. Mi aiuti?`;
  const waHref = whatsappUrl(waMsg);
  const fmt = (key: string, vars: Record<string, string | number>): string => {
    let out = t(key);
    for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v));
    return out;
  };

  return (
    <>
      {/* HERO + BREADCRUMB */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">{t("seoPage.crumb.home")}</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/case-in-vendita" className="hover:text-[var(--terracotta)]">
              {t("seoPage.crumb.comuniHub")}
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">{comune.fullName}</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <MapPin size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">{t("seoPage.areaLabel")}</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {fmt("seoComune.h1", { name: comune.fullName, a: prep })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            {L.subtitle}
          </p>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoComune.section.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {fmt("seoComune.section.title", { name: comune.fullName })}
            </h2>
            <div className="mt-6 h-px w-12 bg-[var(--terracotta)]/60" />
          </div>
          <div className="space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)] md:col-span-6 md:col-start-7">
            <p>{L.paragraphs[0]}</p>
            <p>{L.paragraphs[1]}</p>
          </div>
        </div>
      </section>

      {/* PROPERTIES */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--terracotta)]/20 pb-5">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
                {t("seoPage.availableProperties")}
              </span>
              <h2 className="mt-2 font-serif text-2xl text-ink md:text-3xl">
                {properties.length > 0
                  ? fmt(
                      properties.length === 1
                        ? "seoComune.props.count.one"
                        : "seoComune.props.count.many",
                      { n: properties.length, name: comune.fullName, a: prep },
                    )
                  : fmt("seoComune.props.fallback", { name: comune.fullName, a: prep })}
              </h2>
            </div>
            <Link
              to="/immobili"
              className="text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] hover:underline"
            >
              {t("seoPage.allProperties")}
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] px-8 py-14 text-center">
              <h2 className="mx-auto max-w-xl font-serif text-2xl leading-snug text-ink">
                {fmt("seoComune.empty.title", { name: comune.fullName, a: prep })}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                {t("seoComune.empty.body")}
              </p>
              <div className="mt-6">
                <Link
                  to="/trova-casa-lunigiana"
                  data-track="seo_area_finder_click"
                  onClick={() =>
                    trackClick("seo_area_finder_click", {
                      comune: comune.slug,
                      source: "empty_state",
                    })
                  }
                  className="inline-flex items-center gap-2 text-[0.95rem] text-[var(--terracotta)] underline hover:no-underline"
                >
                  {t("seoComune.empty.finder")} <ArrowRight size={14} />
                </Link>
              </div>
              {nearbyComuni.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-serif text-xl text-ink">
                    {pick(SEO_1B_UI.comune.nearbyH2, language)}
                  </h2>
                  <p className="mt-2 text-[0.8rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {t("seoComune.nearby.title")}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    {nearbyComuni.map((c) => (
                      <Link
                        key={c.slug}
                        to="/case-in-vendita/$comune"
                        params={{ comune: c.slug }}
                        className="rounded-full border border-[var(--terracotta)]/25 bg-[var(--cream)] px-4 py-2 text-[0.85rem] text-ink transition hover:border-[var(--terracotta)]"
                      >
                        {t("seoComuni.hub.tileSee")} {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link
                to="/contatti"
                data-track="seo_area_contact_click"
                onClick={() =>
                  trackClick("seo_area_contact_click", {
                    comune: comune.slug,
                    source: "empty_state",
                  })
                }
                className="mt-8 inline-block rounded-sm bg-ink px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
              >
                {t("seoPage.tellMeWhatYouSeek")}
              </Link>
            </div>
          ) : (
            <div
              className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3"
              onClickCapture={(e) => {
                const target = e.target as HTMLElement;
                const card = target.closest("[data-property-card]");
                if (card) {
                  trackClick("seo_area_property_click", {
                    comune: comune.slug,
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

      {/* LONGFORM EDITORIALE (1B) */}
      {longform && longform.sections.some((s) => s.id !== "types") && (
        <section className="bg-[var(--warm-ivory)] py-20">
          <div className="container-editorial max-w-3xl space-y-14">
            {longform.sections
              .filter((s) => s.id !== "types")
              .map((s) => (
                <div key={s.h2}>
                  <h2 className="font-serif text-3xl text-ink md:text-4xl">{s.h2}</h2>
                  <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
                    {s.paragraphs.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* AUDIENCE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoPage.audienceEyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {fmt("seoComune.audience.title", { name: comune.fullName })}
            </h2>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            {L.audience.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-5"
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

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            {fmt("seoComune.cta.title", { name: comune.fullName, a: prep })}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            {t("seoComune.cta.body")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="seo_area_whatsapp_click"
              onClick={() =>
                trackClick("seo_area_whatsapp_click", {
                  comune: comune.slug,
                  source: "comune_cta",
                })
              }
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {t("seoPage.writeToElena")}
            </a>
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              {t("seoPage.viewAllProperties")}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TIPOLOGIE REALMENTE POPOLATE IN QUESTO COMUNE */}
      {populated.length > 0 && (
        <section className="bg-[var(--cream)] pb-20">
          <div className="container-editorial">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoComune.types.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-2xl text-ink md:text-3xl">
              {typesSection?.h2 ?? fmt("seoComune.types.title", { name: comune.fullName, a: prep })}
            </h2>
            <div className="mt-4 max-w-2xl space-y-4 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">
              {(typesSection?.paragraphs ?? [t("seoComune.types.body")]).map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {populated.map((tp) => {
                const Lt = localizeTipologiaSeo(tp, language);
                return (
                  <Link
                    key={tp.slug}
                    to="/case-in-vendita-lunigiana/$tipologia"
                    params={{ tipologia: tp.slug }}
                    data-track="seo_area_type_click"
                    onClick={() =>
                      trackClick("seo_area_type_click", { comune: comune.slug, to: tp.slug })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--terracotta)]/25 bg-[var(--warm-ivory)] px-4 py-2 text-[0.88rem] text-ink transition hover:border-[var(--terracotta)]"
                  >
                    <Compass size={14} strokeWidth={1.6} className="text-[var(--terracotta)]" />
                    {Lt.fullName}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CERCHI QUALCOSA DI SPECIFICO? (1B) */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            {pick(SEO_1B_UI.comune.specificH2, language)}
          </h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            {pick(SEO_1B_UI.comune.specificBody, language)}
          </p>
          <Link
            to="/trova-casa-lunigiana"
            data-track="seo_area_finder_click"
            onClick={() =>
              trackClick("seo_area_finder_click", { comune: comune.slug, source: "specific_cta" })
            }
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
          >
            {fmt("seoComune.finder.cta", { name: comune.fullName, a: prep })}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FAQ — contenuto HTML, nessun FAQPage JSON-LD (1B) */}
      {longform && longform.faq.length > 0 && (
        <section className="bg-[var(--cream)] py-20">
          <div className="container-editorial max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              {pick(SEO_1B_UI.comune.faqH2, language)}
            </h2>
            <div className="mt-8 space-y-6">
              {longform.faq.slice(0, 3).map((f) => (
                <div
                  key={f.q}
                  className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
                >
                  <h3 className="font-serif text-xl leading-snug text-ink">{f.q}</h3>
                  <p className="mt-3 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {pick(SEO_1B_UI.comune.territoriLead, language)}{" "}
              <Link to="/territori" className="text-[var(--terracotta)] underline hover:no-underline">
                {pick(SEO_1B_UI.comune.territoriAnchor, language)}
              </Link>
              .
            </p>
            {comune.slug === "pontremoli" && (
              <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                <Link
                  to="/vivere-a-pontremoli"
                  className="text-[var(--terracotta)] underline hover:no-underline"
                >
                  Scopri cosa significa vivere a Pontremoli
                </Link>
                : zone, frazioni e vita quotidiana prima di scegliere casa.
              </p>
            )}
          </div>
        </section>
      )}

      {/* RELATED AREAS + LINKS */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoPage.related.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {t("seoPage.related.title")}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {t("seoPage.related.body")}{" "}
              <Link to="/territori" className="underline hover:text-[var(--terracotta)]">
                {t("seoPage.related.guideLink")}
              </Link>
              .
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => {
              const cL = localizeComuneSeo(c, language);
              return (
              <Link
                key={c.slug}
                to="/case-in-vendita/$comune"
                params={{ comune: c.slug }}
                data-track="seo_area_related_area_click"
                onClick={() =>
                  trackClick("seo_area_related_area_click", {
                    from: comune.slug,
                    to: c.slug,
                  })
                }
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
              >
                <div className="flex items-center gap-2 text-[var(--terracotta)]">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em]">{t("seoPage.related.tileLabel")}</span>
                </div>
                <h3 className="mt-3 font-serif text-xl text-ink">{c.name}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">
                  {cL.blurb}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  {t("seoPage.related.tileSee")} <ArrowRight size={12} />
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}