import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, KeyRound, Lock, Search, ShieldCheck } from "lucide-react";
import offMarketHero from "@/assets/real/off-market-hero-v2.png.asset.json";
import { OffMarketForm } from "@/components/off-market-forms";
import { trackClick, trackEvent } from "@/lib/analytics";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import {
  OM_BUYER,
  OM_FAQ,
  OM_FINAL,
  OM_HERO,
  OM_META,
  OM_PATHS,
  OM_PRINCIPLE,
  OM_SELLER,
  OM_STEPS,
  OM_WHAT,
} from "@/lib/off-market";

const PAGE_URL = siteUrl("/off-market");

export const Route = createFileRoute("/off-market")({
  head: () => {
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: OM_META.title,
      description: OM_META.description,
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
        { title: OM_META.title },
        { name: "description", content: OM_META.description },
        { property: "og:title", content: OM_META.ogTitle },
        { property: "og:description", content: OM_META.ogDescription },
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
          alt="Colline della Lunigiana al tramonto, in Toscana"
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
            <span className="eyebrow text-cream/85">{OM_HERO.eyebrow}</span>
            <h1 className="mt-4 font-serif text-[2rem] leading-[1.15] text-cream sm:text-4xl md:text-5xl lg:text-6xl">
              {OM_HERO.h1}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/90 sm:text-base">
              {OM_HERO.body}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="#ricerca-riservata"
                onClick={() => trackClick("offmarket_buyer_cta", { source: "hero" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-cream px-7 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:bg-cream/90 sm:w-auto sm:text-xs"
              >
                {OM_HERO.ctaBuyer} <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a
                href="#vendita-riservata"
                onClick={() => trackClick("offmarket_seller_cta", { source: "hero" })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-cream/70 px-7 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:border-cream hover:bg-cream/10 sm:w-auto sm:text-xs"
              >
                {OM_HERO.ctaSeller}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label="Percorso" className="border-b border-warm-border/50 bg-warm-cream">
        <div className="container-editorial flex flex-wrap items-center gap-1.5 py-3 text-[0.7rem] text-foreground/60">
          <Link to="/" className="hover:text-terracotta">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link to="/servizi" className="hover:text-terracotta">Servizi</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="text-ink">Furia Off Market</span>
        </div>
      </nav>

      {/* COS'È */}
      <section className="bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl md:text-4xl">{OM_WHAT.title}</h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {OM_WHAT.body}
            </p>
            <p className="mx-auto mt-8 max-w-xl border-t border-warm-border/60 pt-6 font-serif text-lg leading-snug text-terracotta sm:text-xl">
              {OM_WHAT.claim}
            </p>
          </div>
        </div>
      </section>

      {/* DUE PERCORSI */}
      <section className="bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial grid gap-6 md:grid-cols-2 md:gap-8">
          {OM_PATHS.map((p) => {
            const Icon = p.id === "buyer" ? Search : Lock;
            const anchor = p.id === "buyer" ? "#ricerca-riservata" : "#vendita-riservata";
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-sm border border-warm-border/70 bg-cream p-6 sm:p-9"
              >
                <Icon size={22} className="text-terracotta" aria-hidden="true" />
                <span className="eyebrow mt-5 text-terracotta">{p.label}</span>
                <h3 className="mt-3 font-serif text-xl leading-snug text-ink sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">{p.body}</p>
                <a
                  href={anchor}
                  onClick={() =>
                    trackClick(
                      p.id === "buyer" ? "offmarket_buyer_cta" : "offmarket_seller_cta",
                      { source: "cards" },
                    )
                  }
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-terracotta sm:text-xs"
                >
                  {p.cta} <ArrowRight size={14} aria-hidden="true" />
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
            Come funziona
          </h2>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OM_STEPS.map((s, i) => (
              <li
                key={s.title}
                className="rounded-sm border border-warm-border/60 bg-warm-ivory/60 p-6"
              >
                <span className="font-serif text-2xl text-terracotta">{i + 1}</span>
                <h3 className="mt-3 font-serif text-lg leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACQUIRENTE */}
      <section id="ricerca-riservata" className="scroll-mt-24 bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow text-terracotta">Acquirenti</span>
            <h2 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl md:text-4xl">
              {OM_BUYER.title}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {OM_BUYER.body}
            </p>
            <ul className="mt-8 grid gap-3">
              {OM_BUYER.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/85">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-terracotta" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-warm-border/70 bg-cream p-5 sm:p-8">
            <h3 className="font-serif text-xl text-ink sm:text-2xl">{OM_BUYER.cta}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Poche informazioni essenziali: ci servono per capire se e quando esiste una
              compatibilità reale.
            </p>
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
            <span className="eyebrow text-terracotta">Proprietari</span>
            <h2 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl md:text-4xl">
              {OM_SELLER.title}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {OM_SELLER.body}
            </p>
            <ul className="mt-8 grid gap-3">
              {OM_SELLER.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground/85">
                  <KeyRound size={16} className="mt-0.5 shrink-0 text-terracotta" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-sm border border-warm-border/70 bg-warm-ivory/70 p-5 sm:p-8">
            <h3 className="font-serif text-xl text-ink sm:text-2xl">{OM_SELLER.cta}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75">
              Nessuna pubblicazione online: solo un primo confronto riservato sulla tua
              situazione.
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
            {OM_PRINCIPLE.claim}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-cream/80 sm:text-base">
            {OM_PRINCIPLE.body}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--cream)] py-20 sm:py-24">
        <div className="container-editorial mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-2xl text-ink sm:text-3xl md:text-4xl">
            Domande frequenti
          </h2>
          <div className="mt-10 divide-y divide-warm-border/60 border-y border-warm-border/60">
            {OM_FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-left font-serif text-base text-ink marker:content-none sm:text-lg">
                  <h3 className="font-serif text-base font-normal sm:text-lg">{f.q}</h3>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-terracotta transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-foreground/70">
            <a
              href="#ricerca-riservata"
              onClick={() => trackClick("offmarket_buyer_cta", { source: "faq" })}
              className="text-terracotta underline-offset-4 hover:underline"
            >
              Attiva la Ricerca Riservata
            </a>
          </p>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="bg-[var(--warm-ivory)] py-20 sm:py-24">
        <div className="container-editorial mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl md:text-4xl">{OM_FINAL.title}</h2>
          <p className="mt-4 text-sm text-foreground/80 sm:text-base">{OM_FINAL.subtitle}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#ricerca-riservata"
              onClick={() => trackClick("offmarket_buyer_cta", { source: "final" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-7 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-terracotta sm:w-auto sm:text-xs"
            >
              {OM_HERO.ctaBuyer} <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a
              href="#vendita-riservata"
              onClick={() => trackClick("offmarket_seller_cta", { source: "final" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-ink/30 px-7 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:border-terracotta hover:text-terracotta sm:w-auto sm:text-xs"
            >
              {OM_HERO.ctaSeller}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
