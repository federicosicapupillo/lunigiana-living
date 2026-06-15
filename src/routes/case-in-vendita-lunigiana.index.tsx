import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { siteUrl } from "@/lib/site-url";

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
  return (
    <>
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
            Cerca per tipologia
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            Case in vendita in Lunigiana
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
            Ogni casa nasce da un'idea diversa: una casa di carattere in pietra,
            un appartamento comodo nel borgo, una villa con giardino, una seconda
            casa per il fine settimana. Scegli da dove vuoi partire — per tipologia
            o{" "}
            <Link to="/case-in-vendita" className="underline hover:text-[var(--terracotta)]">
              per comune
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Tipologie
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              Scegli il tipo di casa
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TIPOLOGIE_SEO.map((t) => (
              <Link
                key={t.slug}
                to="/case-in-vendita-lunigiana/$tipologia"
                params={{ tipologia: t.slug }}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
              >
                <div className="flex items-center gap-2 text-[var(--terracotta)]">
                  <Compass size={16} strokeWidth={1.5} />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em]">Tipologia</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl text-ink">{t.fullName}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                  {t.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  Vedi pagina <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Cerca anche per comune
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              Comuni della Lunigiana
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Ogni borgo ha la sua atmosfera e i suoi servizi. Esplora le pagine
              comunali per scegliere la zona giusta.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMUNE_SEO.map((c) => (
              <Link
                key={c.slug}
                to="/case-in-vendita/$comune"
                params={{ comune: c.slug }}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(36,23,17,0.35)]"
              >
                <div className="flex items-center gap-2 text-[var(--terracotta)]">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em]">Comune</span>
                </div>
                <h3 className="mt-3 font-serif text-lg text-ink">{c.fullName}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--terracotta)] group-hover:underline">
                  Vedi case <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Non sai da dove partire?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/80">
            Scrivici cosa stai cercando: tipologia, zona, budget. Ti aiutiamo a
            capire quali soluzioni in Lunigiana sono davvero coerenti.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/contatti"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-8 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:opacity-90"
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              Raccontaci cosa cerchi
            </Link>
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--warm-ivory)]"
            >
              Vedi tutti gli immobili
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}