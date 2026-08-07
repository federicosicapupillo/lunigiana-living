import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Compass, MapPin } from "lucide-react";
import { COMUNE_SEO, localizeComuneSeo } from "@/lib/seo-comuni";
import { COMUNE_HUB_COPY, HUB_COMUNI_INTRO, SEO_1B_UI, pick } from "@/lib/seo-editorial";
import { siteUrl } from "@/lib/site-url";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";

export const Route = createFileRoute("/case-in-vendita/")({
  head: () => {
    const url = siteUrl("/case-in-vendita");
    const title = "Case in vendita in Lunigiana per comune | Furia Immobiliare";
    const description =
      "Esplora le case in vendita per comune in Lunigiana: Pontremoli, Bagnone, Mulazzo, Filattiera, Villafranca, Zeri, Aulla. Una guida locale per scegliere la zona giusta.";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Case in vendita in Lunigiana per comune", item: url },
      ],
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbLd) }],
    };
  },
  component: CaseInVenditaIndex,
});

function CaseInVenditaIndex() {
  const { language } = useLanguage();
  const t = useT();
  useDocHead(t("seoComuni.meta.title"), t("seoComuni.meta.desc"));
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
            <span className="text-ink">{t("seoHub.crumb.current.comuni")}</span>
          </nav>
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
            {t("seoComuni.hub.eyebrow")}
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t("seoComuni.hub.h1")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            {t("seoComuni.hub.lead")}
          </p>
          <div className="mt-6 max-w-2xl space-y-4 text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">
            {pick(HUB_COMUNI_INTRO, language).map((p) => (
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
          <h2 className="mb-10 font-serif text-3xl text-ink md:text-4xl">
            {pick(SEO_1B_UI.hubComuni.whereH2, language)}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMUNE_SEO.map((c) => {
              const L = localizeComuneSeo(c, language);
              const micro = COMUNE_HUB_COPY[c.slug];
              return (
              <Link
                key={c.slug}
                to="/case-in-vendita/$comune"
                params={{ comune: c.slug }}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
              >
                <div className="flex items-center gap-2 text-[var(--terracotta)]">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em]">
                    {t("seoPage.areaLabel")}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-2xl text-ink">{c.fullName}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                  {micro ? pick(micro, language) : L.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  {t("seoComuni.hub.tileSee")} {c.name} <ArrowRight size={12} />
                </span>
              </Link>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7">
            <p className="text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
              {pick(SEO_1B_UI.hubComuni.byTypeLead, language)}{" "}
              <Link
                to="/case-in-vendita-lunigiana"
                className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
              >
                <Compass size={14} strokeWidth={1.6} />
                {pick(SEO_1B_UI.hubComuni.byTypeAnchor, language)}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            {pick(SEO_1B_UI.hubComuni.helpH2, language)}
          </h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            {pick(SEO_1B_UI.hubComuni.helpBody, language)}
          </p>
          <Link
            to="/trova-casa-lunigiana"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
          >
            {pick(SEO_1B_UI.hubComuni.helpCta, language)}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}