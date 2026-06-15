import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { whatsappUrl } from "@/components/whatsapp-float";
import { listPublishedPropertiesSummary, type PublicProperty } from "@/lib/public-properties.functions";
import { COMUNE_SEO, getComuneSeo, localizeComuneSeo, municipalityMatches } from "@/lib/seo-comuni";
import { trackClick } from "@/lib/analytics";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";
import { localizePropertyDynamic } from "@/lib/i18n/property-localize";
import { siteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/case-in-vendita/$comune")({
  loader: async ({ params }) => {
    const comune = getComuneSeo(params.comune);
    if (!comune) throw notFound();
    const { properties } = await listPublishedPropertiesSummary();
    const matched = properties.filter((p) => {
      // p.location is "<municipality> · <area_zone>" — match on the leading part.
      const head = (p.location || "").split("·")[0]?.trim();
      return municipalityMatches(comune, head);
    });
    return { comune, properties: matched };
  },
  head: ({ params, loaderData }) => {
    const comune = loaderData?.comune ?? getComuneSeo(params.comune);
    if (!comune) {
      return { meta: [{ title: "Pagina non trovata — Furia Immobiliare" }] };
    }
    const url = siteUrl(`/case-in-vendita/${comune.slug}`);
    const title = `Case in vendita a ${comune.fullName} | Furia Immobiliare`;
    const description = `Scopri case, appartamenti e immobili di carattere a ${comune.fullName} con Furia Immobiliare. Ti guidiamo nella scelta della casa giusta in Lunigiana.`;
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
        url: siteUrl(`/immobili/${p.slug || p.id}`),
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
  const { comune, properties } = Route.useLoaderData() as {
    comune: (typeof COMUNE_SEO)[number];
    properties: PublicProperty[];
  };
  const { language } = useLanguage();
  const t = useT();
  const L = localizeComuneSeo(comune, language);
  useDocHead(L.metaTitle, L.metaDescription);
  const related = COMUNE_SEO.filter((c) => c.slug !== comune.slug).slice(0, 4);
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
            {fmt("seoComune.h1", { name: comune.fullName })}
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
                  ? fmt(properties.length === 1 ? "seoComune.props.count.one" : "seoComune.props.count.many", { n: properties.length, name: comune.fullName })
                  : fmt("seoComune.props.fallback", { name: comune.fullName })}
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
              <p className="mx-auto max-w-xl font-serif text-2xl leading-snug text-ink">
                {t("seoPage.empty.title")}
              </p>
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

      {/* AUDIENCE */}
      <section className="bg-[var(--warm-ivory)] py-20">
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

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            {fmt("seoComune.cta.title", { name: comune.fullName })}
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