import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { TIPOLOGIE_SEO, localizeTipologiaSeo } from "@/lib/seo-tipologie";
import { COMUNE_SEO, localizeComuneSeo } from "@/lib/seo-comuni";
import { siteUrl } from "@/lib/site-url";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";

export const Route = createFileRoute("/case-in-vendita-lunigiana/")({
  head: () => {
    const url = siteUrl("/case-in-vendita-lunigiana");
    const title = "Case in vendita in Lunigiana — per tipologia | Furia Immobiliare";
    const description =
      "Cerca case in vendita in Lunigiana per tipologia: rustici e casali, case indipendenti, appartamenti, ville, case con giardino, case economiche, seconde case.";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Case in vendita in Lunigiana", item: url },
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
        </div>
      </section>

      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoTipologie.hub.types.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {t("seoTipologie.hub.types.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TIPOLOGIE_SEO.map((tp) => {
              const L = localizeTipologiaSeo(tp, language);
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
                    {L.blurb}
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
        <div className="container-editorial">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              {t("seoTipologie.hub.comuni.eyebrow")}
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {t("seoTipologie.hub.comuni.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {t("seoTipologie.hub.comuni.body")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMUNE_SEO.map((c) => {
              const Lc = localizeComuneSeo(c, language);
              return (
                <Link
                  key={c.slug}
                  to="/case-in-vendita/$comune"
                  params={{ comune: c.slug }}
                  className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
                >
                  <div className="flex items-center gap-2 text-[var(--terracotta)]">
                    <MapPin size={16} strokeWidth={1.5} />
                    <span className="text-[0.7rem] uppercase tracking-[0.22em]">{t("seoPage.related.tileLabel")}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-lg text-ink">{Lc.fullName}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                    {t("seoPage.related.tileSee")} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            {t("seoTipologie.hub.cta.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            {t("seoTipologie.hub.cta.body")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/contatti"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {t("seoTipologie.hub.cta.primary")}
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