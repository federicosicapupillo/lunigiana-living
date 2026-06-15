import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { COMUNE_SEO, localizeComuneSeo } from "@/lib/seo-comuni";
import { siteUrl } from "@/lib/site-url";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { useDocHead } from "@/hooks/use-localized-head";

export const Route = createFileRoute("/case-in-vendita/")({
  head: () => {
    const url = siteUrl("/case-in-vendita");
    const title = "Case in vendita in Lunigiana — comuni e zone | Furia Immobiliare";
    const description =
      "Esplora le case in vendita per comune in Lunigiana: Pontremoli, Bagnone, Mulazzo, Filattiera, Villafranca, Zeri, Aulla. Una guida locale per scegliere la zona giusta.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
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
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
            {t("seoComuni.hub.eyebrow")}
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t("seoComuni.hub.h1")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            {t("seoComuni.hub.lead")}
          </p>
        </div>
      </section>

      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMUNE_SEO.map((c) => {
              const L = localizeComuneSeo(c, language);
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
                <h2 className="mt-3 font-serif text-2xl text-ink">{c.fullName}</h2>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                  {L.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  {t("seoComuni.hub.tileSee")} {c.name} <ArrowRight size={12} />
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