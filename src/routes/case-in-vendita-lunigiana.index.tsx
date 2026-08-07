import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { TIPOLOGIE_SEO, localizeTipologiaSeo } from "@/lib/seo-tipologie";
import { HUB_TIPOLOGIE_INTRO, SEO_1B_UI, TIPOLOGIA_HUB_COPY, pick } from "@/lib/seo-editorial";
import { siteUrl } from "@/lib/site-url";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";

export const Route = createFileRoute("/case-in-vendita-lunigiana/")({
  head: () => {
    const url = siteUrl("/case-in-vendita-lunigiana");
    const title = "Case in vendita in Lunigiana per tipologia | Furia Immobiliare";
    const description =
      "Cerca case in vendita in Lunigiana per tipologia: rustici e casali, case indipendenti, appartamenti, ville, case con giardino, case economiche, seconde case.";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "Case in vendita in Lunigiana per tipologia",
          item: url,
        },
      ],
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
      ],
    };
  },
  component: TipologieHub,
});

function TipologieHub() {
  const { language } = useLanguage();
  const t = useT();
  useDocHead(t("seoTipologie.meta.title"), t("seoTipologie.meta.desc"));
  return (
    <>
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">
              {t("seoPage.crumb.home")}
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">{t("seoHub.crumb.current.tipologie")}</span>
          </nav>
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
            {t("seoTipologie.hub.eyebrow")}
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t("seoTipologie.hub.h1")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            {t("seoTipologie.hub.lead.a")}{" "}
            <Link to="/case-in-vendita" className="underline hover:text-[var(--terracotta)]">
              {t("seoTipologie.hub.lead.byComune")}
            </Link>
            .
          </p>
          <div className="mt-6 max-w-2xl space-y-4 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">
            {pick(HUB_TIPOLOGIE_INTRO, language).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <p className="mt-5">
            <Link
              to="/trova-casa-lunigiana"
              className="inline-flex items-center gap-2 text-[0.95rem] text-[var(--terracotta)] underline hover:no-underline"
            >
              {t("seoHub.finder.link")} <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoTipologie.hub.types.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {pick(SEO_1B_UI.hubTipologie.liveH2, language)}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TIPOLOGIE_SEO.map((tp) => {
              const L = localizeTipologiaSeo(tp, language);
              const micro = TIPOLOGIA_HUB_COPY[tp.slug];
              return (
                <Link
                  key={tp.slug}
                  to="/case-in-vendita-lunigiana/$tipologia"
                  params={{ tipologia: tp.slug }}
                  className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
                >
                  <div className="flex items-center gap-2 text-[var(--terracotta)]">
                    <Compass size={16} strokeWidth={1.5} />
                    <span className="text-[0.7rem] uppercase tracking-[0.22em]">{t("seoPage.typeLabel")}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-ink">{L.fullName}</h3>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                    {micro ? pick(micro, language) : L.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                    {t("seoTipologie.hub.types.tileSee")} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            {pick(SEO_1B_UI.hubTipologie.areaH2, language)}
          </h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            {pick(SEO_1B_UI.hubTipologie.areaBody, language)}
          </p>
          <Link
            to="/case-in-vendita"
            className="mt-6 inline-flex items-center gap-2 text-[0.98rem] text-[var(--terracotta)] underline hover:no-underline"
          >
            <MapPin size={15} strokeWidth={1.6} />
            {pick(SEO_1B_UI.hubTipologie.areaAnchor, language)}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            {pick(SEO_1B_UI.hubTipologie.finalH2, language)}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            {pick(SEO_1B_UI.hubTipologie.finalBody, language)}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/trova-casa-lunigiana"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {pick(SEO_1B_UI.hubTipologie.finalCta, language)}
            </Link>
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
    </>
  );
}