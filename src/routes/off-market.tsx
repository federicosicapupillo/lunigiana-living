import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, KeyRound, Lock, Search, ShieldCheck } from "lucide-react";
import offMarketHero from "@/assets/real/off-market-hero-v2.png.asset.json";
import { OffMarketForm } from "@/components/off-market-forms";
import { trackClick, trackEvent } from "@/lib/analytics";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import { useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import {
  OM_BUYER_POINTS,
  OM_FAQ_IDS,
  OM_PATHS,
  OM_SELLER_POINTS,
  OM_STEP_IDS,
} from "@/lib/off-market";

const PAGE_URL = siteUrl("/off-market");
const META_TITLE = "Immobili Off Market in Toscana | Furia Immobiliare";
const META_DESC =
  "Furia Off Market: ricerca riservata per chi cerca casa e vendita riservata per chi preferisce non pubblicizzare subito il proprio immobile.";

export const Route = createFileRoute("/off-market")({
  head: () => {
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: META_TITLE,
      description: META_DESC,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": AGENCY_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    };
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Servizi", item: siteUrl("/servizi") },
        { "@type": "ListItem", position: 3, name: "Furia Off Market", item: PAGE_URL },
      ],
    };
    return {
      meta: [
        { title: META_TITLE },
        { name: "description", content: META_DESC },
        { property: "og:title", content: "Furia Off Market — Non tutte le case si vedono" },
        {
          property: "og:description",
          content:
            "Ricerca riservata per gli acquirenti, vendita riservata per i proprietari. Riservatezza, selezione e incontro tra domanda e offerta.",
        },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: OffMarketPage,
});

function OffMarketPage() {
  const t = useT();
  useLocalizedHead("om.meta.title", "om.meta.desc");

  useEffect(() => {
    trackEvent("offmarket_view", { source: "off_market_page" });
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={offMarketHero.url}
          sizes="100vw"
          alt={t("om.hero.imgAlt")}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{ objectPosition: "center 45%" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/55 via-ink/45 to-ink/65" />
        <div className="container-editorial py-24 sm:py-28 md:py-36">
          <div className="max-w-2xl">
            <span className="eyebrow text-cream/85">{t("om.hero.eyebrow")}</span>
            <h1 className="mt-4 font-serif text-[2rem] leading-[1.15] text-cream sm:text-4xl md:text-5xl lg:text-6xl">
              {t("om.hero.h1")}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/90 sm:text-base">
              {t("om.hero.body")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="#ricerca-riservata"
                onClick={() => trackClick("offmarket_buyer_cta", { source: "hero" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-cream px-6 py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-ink transition hover:bg-cream/90 sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.2em]"
              >
                {t("om.hero.ctaBuyer")} <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
              </a>
              <a
                href="#vendita-riservata"
                onClick={() => trackClick("offmarket_seller_cta", { source: "hero" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-cream/70 px-6 py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-cream transition hover:border-cream hover:bg-cream/10 sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.2em]"
              >
                {t("om.hero.ctaSeller")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label={t("om.breadcrumb.aria")} className="border-b border-warm-border/50 bg-warm-cream">
        <div className="container-editorial flex flex-wrap items-center gap-1.5 py-3 text-[0.7rem] text-foreground/60">
          <Link to="/" className="hover:text-terracotta">{t("nav.home")}</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link to="/servizi" className="hover:text-terracotta">{t("nav.servizi")}</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="text-ink">{t("om.breadcrumb.current")}</span>
        </div>
      </nav>

      {/* COS'È */}
      <section className="bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl md:text-4xl">{t("om.what.title")}</h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {t("om.what.body")}
            </p>
            <p className="mx-auto mt-8 max-w-xl border-t border-warm-border/60 pt-6 font-serif text-lg leading-snug text-terracotta sm:text-xl">
              {t("om.what.claim")}
            </p>
          </div>
        </div>
      </section>

      {/* DUE PERCORSI */}
      <section className="bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial grid gap-6 md:grid-cols-2 md:gap-8">
          {OM_PATHS.map((p) => {
            const Icon = p.id === "buyer" ? Search : Lock;
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-sm border border-warm-border/70 bg-cream p-6 sm:p-9"
              >
                <Icon size={22} className="text-terracotta" aria-hidden="true" />
                <span className="eyebrow mt-5 text-terracotta">{t(`om.path.${p.id}.label`)}</span>
                <h3 className="mt-3 font-serif text-xl leading-snug text-ink sm:text-2xl">
                  {t(`om.path.${p.id}.title`)}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  {t(`om.path.${p.id}.body`)}
                </p>
                <a
                  href={p.anchor}
                  onClick={() =>
                    trackClick(
                      p.id === "buyer" ? "offmarket_buyer_cta" : "offmarket_seller_cta",
                      { source: "cards" },
                    )
                  }
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-5 py-3.5 text-center text-[0.7rem] uppercase tracking-[0.16em] text-cream transition hover:bg-terracotta sm:px-6 sm:text-xs sm:tracking-[0.2em]"
                >
                  {t(`om.path.${p.id}.cta`)} <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial">
          <h2 className="text-center font-serif text-2xl text-ink sm:text-3xl md:text-4xl">
            {t("om.steps.title")}
          </h2>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OM_STEP_IDS.map((n) => (
              <li
                key={n}
                className="rounded-sm border border-warm-border/60 bg-warm-ivory/60 p-6"
              >
                <span className="font-serif text-2xl text-terracotta">{n}</span>
                <h3 className="mt-3 font-serif text-lg leading-snug text-ink">{t(`om.step${n}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{t(`om.step${n}.b`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACQUIRENTE */}
      <section id="ricerca-riservata" className="scroll-mt-24 bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow text-terracotta">{t("om.buyer.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl md:text-4xl">
              {t("om.buyer.title")}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {t("om.buyer.body")}
            </p>
            <ul className="mt-8 grid gap-3">
              {OM_BUYER_POINTS.map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm text-foreground/85">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-terracotta" aria-hidden="true" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-warm-border/70 bg-cream p-5 sm:p-8">
            <h3 className="font-serif text-xl text-ink sm:text-2xl">{t("om.buyer.cta")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">{t("om.buyer.formNote")}</p>
            <div className="mt-6">
              <OffMarketForm variant="buyer" />
            </div>
          </div>
        </div>
      </section>

      {/* PROPRIETARIO */}
      <section id="vendita-riservata" className="scroll-mt-24 bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow text-terracotta">{t("om.seller.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl md:text-4xl">
              {t("om.seller.title")}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {t("om.seller.body")}
            </p>
            <ul className="mt-8 grid gap-3">
              {OM_SELLER_POINTS.map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm text-foreground/85">
                  <KeyRound size={16} className="mt-0.5 shrink-0 text-terracotta" aria-hidden="true" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-warm-border/70 bg-warm-ivory/70 p-5 sm:p-8">
            <h3 className="font-serif text-xl text-ink sm:text-2xl">{t("om.seller.cta")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">{t("om.seller.formNote")}</p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-foreground/60">
              {t("om.seller.guide.pre")}{" "}
              <Link
                to="/come-vendere-casa-lunigiana"
                className="text-terracotta underline hover:no-underline"
              >
                {t("om.seller.guide.link")}
              </Link>
              .
            </p>
            <div className="mt-6">
              <OffMarketForm variant="seller" />
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPIO */}
      <section className="bg-ink py-20 text-cream sm:py-24">
        <div className="container-editorial mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl uppercase tracking-[0.06em] sm:text-3xl md:text-4xl">
            {t("om.principle.claim")}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-cream/80 sm:text-base">
            {t("om.principle.body")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-2xl text-ink sm:text-3xl md:text-4xl">
            {t("om.faq.title")}
          </h2>
          <div className="mt-10 divide-y divide-warm-border/60 border-y border-warm-border/60">
            {OM_FAQ_IDS.map((n) => (
              <details key={n} className="group py-4">
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-left font-serif text-base text-ink marker:content-none sm:text-lg">
                  <h3 className="font-serif text-base font-normal sm:text-lg">{t(`om.faq${n}.q`)}</h3>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-terracotta transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{t(`om.faq${n}.a`)}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-foreground/70">
            <a
              href="#ricerca-riservata"
              onClick={() => trackClick("offmarket_buyer_cta", { source: "faq" })}
              className="text-terracotta underline-offset-4 hover:underline"
            >
              {t("om.faq.cta")}
            </a>
          </p>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl md:text-4xl">{t("om.final.title")}</h2>
          <p className="mt-4 text-sm text-foreground/80 sm:text-base">{t("om.final.subtitle")}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#ricerca-riservata"
              onClick={() => trackClick("offmarket_buyer_cta", { source: "final" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-cream transition hover:bg-terracotta sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.2em]"
            >
              {t("om.hero.ctaBuyer")} <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
            </a>
            <a
              href="#vendita-riservata"
              onClick={() => trackClick("offmarket_seller_cta", { source: "final" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-ink/30 px-6 py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-ink transition hover:border-terracotta hover:text-terracotta sm:w-auto sm:px-7 sm:text-xs sm:tracking-[0.2em]"
            >
              {t("om.hero.ctaSeller")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
