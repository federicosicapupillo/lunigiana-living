import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ExternalLink, Home } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import { PZ_COMUNI, PZ_SOURCE } from "@/lib/prezzi-lunigiana";
import {
  SC_CHECKLIST,
  SC_FONTI,
  SC_GRUPPI,
  SC_MANTENIMENTO,
  SC_META,
  SC_PROFILI,
  SC_TERRITORIO,
  SC_TIPOLOGIE,
} from "@/lib/seconda-casa-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/seconda-casa-lunigiana");

/** Prezzo medio richiesto €/m², luglio 2026, letto da PZ_COMUNI. */
function comune(nome: string) {
  return PZ_COMUNI.find((c) => c.nome === nome);
}

function eur(value: number) {
  return `${value.toLocaleString("it-IT")} €/m²`;
}

/** Estremi comunali della rilevazione: non una fascia di prezzo delle case. */
const estremi = {
  min: PZ_COMUNI.reduce((a, b) => (b.eurM2 < a.eurM2 ? b : a)),
  max: PZ_COMUNI.reduce((a, b) => (b.eurM2 > a.eurM2 ? b : a)),
};

export const Route = createFileRoute("/seconda-casa-lunigiana")({
  head: () => {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "Dove comprare casa in Lunigiana",
          item: siteUrl("/dove-comprare-casa-lunigiana"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Seconda casa in Lunigiana",
          item: PAGE_URL,
        },
      ],
    };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: SC_META.h1,
      description: SC_META.description,
      inLanguage: "it-IT",
      datePublished: SC_META.isoDate,
      dateModified: SC_META.isoDate,
      author: { "@id": AGENCY_ID },
      publisher: { "@id": AGENCY_ID },
      isPartOf: { "@id": `${PAGE_URL}#webpage` },
      mainEntityOfPage: { "@id": `${PAGE_URL}#webpage` },
      about: {
        "@type": "Place",
        name: "Lunigiana",
        address: {
          "@type": "PostalAddress",
          addressRegion: "Toscana",
          addressCountry: "IT",
        },
      },
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: SC_META.title,
      description: SC_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      datePublished: SC_META.isoDate,
      dateModified: SC_META.isoDate,
    };
    return {
      meta: [
        { title: SC_META.title },
        { name: "description", content: SC_META.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: SC_META.title },
        { property: "og:description", content: SC_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: SC_META.title },
        { name: "twitter:description", content: SC_META.description },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: SecondaCasaPage,
});

function SecondaCasaPage() {
  return (
    <>
      {/* 1. HERO + RISPOSTA DIRETTA */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/dove-comprare-casa-lunigiana" className="hover:text-[var(--terracotta)]">
              Dove comprare casa
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Seconda casa in Lunigiana</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <Home size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Guida per la seconda casa</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {SC_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {SC_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Una buona seconda casa non è quella più bella sulla carta: è quella che riesci{" "}
              <strong className="font-medium text-ink">davvero a usare e a gestire</strong>. Prima di
              scegliere il comune o l&apos;immobile, conviene mettere in fila poche domande concrete:
              quanto spesso ci vai, come arrivi, quali servizi ti servono, quanti lavori e quanta
              manutenzione richiede, che spazi esterni ha, come si vive d&apos;inverno, dove
              parcheggi e qual è il budget complessivo.
            </p>
            <p>
              Questa guida non promette rendimenti, rivalutazioni o convenienza futura: aiuta a
              scegliere in base all&apos;uso reale della casa. I prezzi che troverai sono{" "}
              <strong className="font-medium text-ink">prezzi medi richiesti</strong> dell&apos;offerta
              pubblicata, non valori di singoli immobili.
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/immobili"
              onClick={() => trackClick("sc_hero_immobili_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              Vedi gli immobili in vendita <ArrowRight size={14} className="shrink-0" />
            </Link>
            <Link
              to="/trova-casa-lunigiana"
              onClick={() => trackClick("sc_hero_trova_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-ink/25 px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:border-ink"
            >
              Percorso guidato
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PROFILI D'USO */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Prima domanda: come userai la casa?
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Non sono classifiche e non portano a un comune perfetto: sono quattro modi diversi di
              usare una seconda casa, ognuno con le sue verifiche. Molte persone si riconoscono in
              due profili insieme, ed è utile capire quale dei due pesa di più.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {SC_PROFILI.map((p) => (
              <article
                key={p.titolo}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-xl leading-snug text-ink">{p.titolo}</h3>
                <p className="mt-3 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">
                  {p.sintesi}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">
                  Cosa controllare
                </p>
                <ul className="mt-2 space-y-1.5">
                  {p.daControllare.map((d) => (
                    <li
                      key={d}
                      className="flex gap-2 text-[0.92rem] leading-[1.65] text-[var(--ink-soft)]"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--terracotta)]" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DOVE GUARDARE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Dove guardare in Lunigiana, in base allo stile di seconda casa
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              I quattordici comuni sono raggruppati per caratteristiche pratiche, non per gradimento.
              Accanto a ciascuno c&apos;è il prezzo medio richiesto in vendita rilevato a{" "}
              {PZ_SOURCE.externalPeriod} da {PZ_SOURCE.externalName.split(" — ")[0]}: è un
              orientamento sull&apos;offerta pubblicata nel comune, non il prezzo di una casa
              specifica.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {SC_GRUPPI.map((g) => (
              <article
                key={g.titolo}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6 md:p-8"
              >
                <h3 className="font-serif text-xl leading-snug text-ink md:text-2xl">{g.titolo}</h3>
                <p className="mt-3 max-w-3xl text-[0.98rem] leading-[1.75] text-[var(--ink-soft)]">
                  {g.body}
                </p>
                <p className="mt-3 max-w-3xl text-[0.92rem] leading-[1.7] text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">Da valutare:</strong> {g.attenzioni}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {g.comuni.map((nome) => {
                    const c = comune(nome);
                    if (!c) return null;
                    const label = `${nome} — ${eur(c.eurM2)}`;
                    return (
                      <li key={nome}>
                        {c.slug ? (
                          <Link
                            to="/case-in-vendita/$comune"
                            params={{ comune: c.slug }}
                            onClick={() =>
                              trackClick("sc_comune_click", { source: "seconda_casa", comune: nome })
                            }
                            className="inline-flex min-h-[36px] items-center rounded-sm border border-[var(--terracotta)]/30 bg-[var(--cream)] px-3 py-1.5 text-[0.85rem] text-ink transition hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                          >
                            {label}
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-[36px] items-center rounded-sm border border-[var(--terracotta)]/15 px-3 py-1.5 text-[0.85rem] text-[var(--ink-soft)]">
                            {label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-[0.92rem] leading-[1.7] text-[var(--ink-soft)]">
            Le schede comune per comune, con servizi, collegamenti e stile di vita, sono nella guida{" "}
            <Link
              to="/dove-comprare-casa-lunigiana"
              onClick={() => trackClick("sc_to_dove_click", { source: "seconda_casa" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              dove comprare casa in Lunigiana
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 4. BUDGET */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Quanto budget serve?</h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Il prezzo al metro quadro di un comune è una media delle richieste pubblicate: dice
              qualcosa sull&apos;offerta di quel territorio, non quanto costerà la casa che ti
              interessa. Due immobili nella stessa via, uno ristrutturato e uno da rifare, non
              appartengono allo stesso mercato.
            </p>
            <p>
              Nella rilevazione di {PZ_SOURCE.externalPeriod} i valori comunali vanno da{" "}
              <strong className="font-medium text-ink">
                {estremi.min.nome} {eur(estremi.min.eurM2)}
              </strong>{" "}
              a{" "}
              <strong className="font-medium text-ink">
                {estremi.max.nome} {eur(estremi.max.eurM2)}
              </strong>
              . Sono i due estremi di <em>medie comunali richieste</em>: non una fascia di prezzo
              delle singole case, e non una media della Lunigiana, che non calcoliamo perché
              richiederebbe una ponderazione che non abbiamo.
            </p>
            <p>
              Al budget d&apos;acquisto va sempre affiancato quello dei lavori iniziali e del
              mantenimento annuale: sono le due voci che, nella pratica, decidono se la casa verrà
              usata come immaginavi.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/prezzi-case-lunigiana"
              onClick={() => trackClick("sc_to_prezzi_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-ink"
            >
              Prezzi case in Lunigiana <ArrowRight size={14} className="shrink-0" />
            </Link>
            <Link
              to="/osservatorio-immobiliare-lunigiana"
              onClick={() => trackClick("sc_to_osservatorio_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-ink"
            >
              Osservatorio immobiliare <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MANTENIMENTO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Il costo che spesso si dimentica: mantenere la seconda casa
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Non indichiamo cifre, perché dipendono dall&apos;immobile, dagli impianti e dalle tue
              abitudini. Serve però sapere quali voci mettere in conto prima di scegliere, non dopo
              il primo inverno.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {SC_MANTENIMENTO.map((m) => (
              <li
                key={m.title}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-lg leading-snug text-ink">{m.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{m.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. TIPOLOGIE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Casa di borgo, appartamento, rustico o indipendente?
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Un confronto pratico su come si usano e su cosa chiedono. Nessuna tipologia garantisce
              un andamento di valore: la differenza la fanno l&apos;immobile specifico, il suo stato
              e quanto si adatta al tuo modo di usarlo.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {SC_TIPOLOGIE.map((t) => (
              <article
                key={t.nome}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-xl leading-snug text-ink">{t.nome}</h3>
                <p className="mt-3 text-[0.94rem] leading-[1.7] text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">Punti pratici:</strong> {t.pro}
                </p>
                <p className="mt-2 text-[0.94rem] leading-[1.7] text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">Attenzioni:</strong> {t.attenzioni}
                </p>
                {t.slug ? (
                  <Link
                    to="/case-in-vendita-lunigiana/$tipologia"
                    params={{ tipologia: t.slug }}
                    onClick={() =>
                      trackClick("sc_tipologia_click", { source: "seconda_casa", tipologia: t.slug })
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.9rem] text-[var(--terracotta)] underline hover:no-underline"
                  >
                    Vedi gli immobili di questa tipologia
                    <ArrowRight size={13} className="shrink-0" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-[0.92rem] leading-[1.7] text-[var(--ink-soft)]">
            Se stai cercando in particolare una casa da usare nei periodi liberi, c&apos;è anche la
            pagina dedicata alle{" "}
            <Link
              to="/case-in-vendita-lunigiana/$tipologia"
              params={{ tipologia: "seconde-case" }}
              onClick={() => trackClick("sc_to_seconde_case_click", { source: "seconda_casa" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              seconde case in Lunigiana
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 7. DA RISTRUTTURARE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Una seconda casa da ristrutturare: quando ha senso?
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Ha senso quando il recupero è un progetto che ti interessa, non solo una scorciatoia
              sul prezzo d&apos;acquisto. Chi affronta un cantiere con questo spirito arriva in
              fondo con meno frustrazione, anche quando i tempi si allungano.
            </p>
            <p>
              Prima della proposta conviene guardare tre cose insieme: il budget dei lavori con un
              margine, l&apos;accessibilità del cantiere — strada, spazio per mezzi e materiali,
              possibilità di montare un ponteggio — e la disponibilità di tecnici e imprese sul
              posto. A questo si aggiungono vincoli, pratiche e autorizzazioni, che dipendono
              dall&apos;immobile e vanno verificati con i professionisti competenti: sono anche la
              variabile che incide più spesso sui tempi.
            </p>
            <p>
              Quando pubblichiamo un rendering, è sempre un&apos;ipotesi progettuale: rappresenta una
              possibilità di trasformazione, non lo stato reale dell&apos;immobile, che va visto e
              verificato dal vivo.
            </p>
          </div>
          <Link
            to="/case-in-vendita-lunigiana/$tipologia"
            params={{ tipologia: "rustici-casali" }}
            onClick={() => trackClick("sc_to_rustici_click", { source: "seconda_casa" })}
            className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-ink"
          >
            Rustici e casali in vendita <ArrowRight size={14} className="shrink-0" />
          </Link>
        </div>
      </section>

      {/* 8. TERRITORIO */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Weekend e tempo libero: cosa offre il territorio
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Qualche riferimento essenziale, ripreso dalle fonti ufficiali del turismo toscano e
              dal portale della destinazione. Sono informazioni sul territorio: non dicono nulla
              sull&apos;andamento del mercato immobiliare né sui flussi turistici futuri.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {SC_TERRITORIO.map((t) => (
              <li
                key={t.title}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-lg leading-snug text-ink">{t.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. CHECKLIST */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Checklist prima di fare una proposta
          </h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Dieci domande da farsi con calma, meglio scritte. Non sostituiscono le verifiche
            tecniche, notarili o fiscali sull&apos;immobile: quelle vanno fatte con i professionisti
            competenti.
          </p>
          <ol className="mt-9 space-y-3">
            {SC_CHECKLIST.map((q, i) => (
              <li
                key={q}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-5"
              >
                <span className="mt-0.5 shrink-0 font-serif text-lg text-[var(--terracotta)]">
                  {i + 1}
                </span>
                <span className="text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10. CTA FINALE */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Cerchi una seconda casa in Lunigiana?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/85">
            Raccontaci come pensi di usarla — weekend, vacanze lunghe, terreno, un progetto di
            recupero — e ti aiutiamo a restringere il campo su comuni e tipologie che stanno davvero
            in piedi per te.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/trova-casa-lunigiana"
              onClick={() => trackClick("sc_cta_trova_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-cream px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--terracotta)] hover:text-cream"
            >
              Percorso guidato <ArrowRight size={14} className="shrink-0" />
            </Link>
            <Link
              to="/immobili"
              onClick={() => trackClick("sc_cta_immobili_click", { source: "seconda_casa" })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-cream/35 px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:border-cream"
            >
              Immobili in vendita
            </Link>
          </div>
          <p className="mx-auto mt-7 max-w-xl text-[0.85rem] leading-relaxed text-cream/70">
            Vuoi approfondire? Guarda{" "}
            <Link to="/dove-comprare-casa-lunigiana" className="underline hover:no-underline">
              dove comprare casa in Lunigiana
            </Link>
            ,{" "}
            <Link to="/prezzi-case-lunigiana" className="underline hover:no-underline">
              i prezzi comune per comune
            </Link>{" "}
            e{" "}
            <Link to="/vivere-in-lunigiana" className="underline hover:no-underline">
              com&apos;è vivere in Lunigiana
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 11. FONTI E METODOLOGIA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Fonti e nota metodologica</h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            I valori in €/m² sono prezzi medi <strong className="font-medium text-ink">richiesti</strong>{" "}
            dell&apos;offerta pubblicata in vendita nel comune ({PZ_SOURCE.externalPeriod}): non sono
            prezzi di compravendita conclusi e non descrivono un singolo immobile. Non calcoliamo una
            media della Lunigiana. I contenuti sul territorio sono informativi e provengono dalle
            fonti ufficiali qui sotto: non sono indicatori di mercato né previsioni. La scelta di una
            casa specifica richiede una verifica concreta dell&apos;immobile, con sopralluogo e, dove
            serve, con notaio e tecnico. Non forniamo consulenza legale, notarile o fiscale.
          </p>
          <ul className="mt-8 space-y-5">
            {SC_FONTI.map((f) => (
              <li key={f.url} className="border-t border-[var(--terracotta)]/15 pt-5">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 font-medium text-[var(--terracotta)] underline hover:no-underline"
                >
                  {f.nome}
                  <ExternalLink size={13} strokeWidth={1.6} className="mt-1 shrink-0" />
                </a>
                <p className="mt-2 text-[0.92rem] leading-[1.7] text-[var(--ink-soft)]">{f.nota}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.9rem] leading-[1.7] text-[var(--ink-soft)]">
            {SC_META.updatedLabel}. Disponibilità, prezzi richiesti e informazioni territoriali
            possono cambiare nel tempo: verifica sempre le fonti aggiornate.
          </p>
        </div>
      </section>
    </>
  );
}
