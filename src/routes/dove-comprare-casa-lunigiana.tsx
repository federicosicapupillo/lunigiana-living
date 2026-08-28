import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Compass, ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { PZ_COMUNI, PZ_SOURCE } from "@/lib/prezzi-lunigiana";
import {
  DC_DOMANDE,
  DC_FONTI,
  DC_META,
  DC_PROFILI,
  DC_SCHEDE,
} from "@/lib/dove-comprare-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/dove-comprare-casa-lunigiana");

// Formattazione italiana esplicita (come nella guida prezzi): evita differenze
// SSR/client dovute ai dati ICU non garantiti nel runtime server.
const itNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eurM2 = (n: number) => `${itNum(n)} €/m²`;

/** Prezzo medio richiesto: unica fonte è PZ_COMUNI. */
const prezzoDi = (nome: string) => PZ_COMUNI.find((c) => c.nome === nome);

export const Route = createFileRoute("/dove-comprare-casa-lunigiana")({
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
          name: "Vivere in Lunigiana",
          item: siteUrl("/vivere-in-lunigiana"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Dove comprare casa in Lunigiana",
          item: PAGE_URL,
        },
      ],
    };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: DC_META.h1,
      description: DC_META.description,
      inLanguage: "it-IT",
      datePublished: DC_META.isoDate,
      dateModified: DC_META.isoDate,
      author: { "@id": AGENCY_ID },
      publisher: { "@id": AGENCY_ID },
      isPartOf: { "@id": `${PAGE_URL}#webpage` },
      mainEntityOfPage: { "@id": `${PAGE_URL}#webpage` },
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: DC_META.title,
      description: DC_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      datePublished: DC_META.isoDate,
      dateModified: DC_META.isoDate,
    };
    return {
      meta: [
        { title: DC_META.title },
        { name: "description", content: DC_META.description },
        { property: "og:title", content: DC_META.title },
        { property: "og:description", content: DC_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: DoveComprarePage,
});

function DoveComprarePage() {
  const landing = new Set(COMUNE_SEO.map((c) => c.slug));

  return (
    <>
      {/* HERO */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/vivere-in-lunigiana" className="hover:text-[var(--terracotta)]">
              Vivere in Lunigiana
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Dove comprare casa</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <Compass size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Guida ai comuni</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {DC_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {DC_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Non esiste il comune migliore della Lunigiana. Esiste il comune più adatto a come
              volete vivere. La differenza tra una scelta felice e un ripensamento, nella nostra
              esperienza, non sta nel nome del paese: sta in cinque cose molto concrete.
            </p>
            <p>
              Le cinque cose sono: il <strong className="font-medium text-ink">budget</strong>{" "}
              complessivo, i <strong className="font-medium text-ink">servizi</strong> che vi
              servono ogni giorno, i{" "}
              <strong className="font-medium text-ink">collegamenti</strong> (autostrada, treno,
              strade), quanto <strong className="font-medium text-ink">dipendete dall&apos;auto</strong>{" "}
              e il <strong className="font-medium text-ink">tipo di casa</strong> e di vita che
              cercate — centro, paese, borgo o campagna.
            </p>
            <p>
              Qui sotto trovate i quattordici comuni della Lunigiana letti con questi criteri, con il
              prezzo medio richiesto del 2026 accanto a ciascuno. Non è una classifica e non parliamo
              di investimenti: parliamo di come si vive in ciascun posto.
            </p>
          </div>
        </div>
      </section>

      {/* IN BREVE: 5 PROFILI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              In breve: quale zona scegliere?
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Cinque profili, non una graduatoria. Trovate quello che assomiglia di più alla vita che
              avete in mente, poi leggete la scheda del comune più avanti.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {DC_PROFILI.map((p) => (
              <article
                key={p.titolo}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-xl leading-snug text-ink">{p.titolo}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">
                  {p.comuni}
                </p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TABELLA DECISIONALE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              I quattordici comuni a confronto
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Prezzo medio richiesto in vendita da {PZ_SOURCE.externalName}, rilevazione{" "}
              {PZ_SOURCE.externalPeriod}. Collegamenti e servizi sono descritti in forma sintetica;
              la colonna &laquo;adatto soprattutto a&raquo; è una lettura editoriale nostra, non un
              dato statistico.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[46rem] border-collapse text-left text-[0.92rem]">
              <caption className="sr-only">
                Comuni della Lunigiana: prezzo medio richiesto 2026, collegamenti e profilo adatto
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className="py-3 pr-4 font-normal">Comune</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Prezzo medio richiesto</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Collegamenti e servizi</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Adatto soprattutto a</th>
                </tr>
              </thead>
              <tbody>
                {DC_SCHEDE.map((s) => {
                  const p = prezzoDi(s.nome);
                  return (
                    <tr key={s.nome} className="border-b border-[var(--terracotta)]/10 align-top">
                      <th scope="row" className="py-3 pr-4 font-normal text-ink">
                        {p?.slug && landing.has(p.slug) ? (
                          <Link
                            to="/case-in-vendita/$comune"
                            params={{ comune: p.slug }}
                            data-track="dc_comune_click"
                            onClick={() => trackClick("dc_comune_click", { comune: p.slug })}
                            className="text-[var(--terracotta)] underline hover:no-underline"
                          >
                            {s.nome}
                          </Link>
                        ) : (
                          s.nome
                        )}
                      </th>
                      <td className="py-3 pr-4 tabular-nums text-ink">
                        {p ? eurM2(p.eurM2) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-[var(--ink-soft)]">{s.chiave}</td>
                      <td className="py-3 pr-4 text-[var(--ink-soft)]">{s.adattoA}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SCHEDE COMUNE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Comune per comune: come si vive e per chi ha senso
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Per ogni comune: il tipo di vita che offre, un punto di forza pratico, il compromesso
              da accettare e il prezzo medio richiesto nel 2026.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {DC_SCHEDE.map((s) => {
              const p = prezzoDi(s.nome);
              return (
                <article
                  key={s.nome}
                  className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
                >
                  <h3 className="font-serif text-2xl text-ink">{s.nome}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--terracotta)]">
                    Prezzo medio richiesto 2026: {p ? eurM2(p.eurM2) : "dato non disponibile"}
                  </p>
                  <div className="mt-4 space-y-3 text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">
                    {s.paragrafi.map((par) => (
                      <p key={par.slice(0, 24)}>{par}</p>
                    ))}
                  </div>
                  {p?.slug && landing.has(p.slug) ? (
                    <Link
                      to="/case-in-vendita/$comune"
                      params={{ comune: p.slug }}
                      data-track="dc_scheda_landing"
                      onClick={() => trackClick("dc_scheda_landing", { comune: p.slug })}
                      className="mt-4 inline-flex items-center gap-1 text-[0.9rem] text-[var(--terracotta)] underline hover:no-underline"
                    >
                      Case in vendita a {s.nome} <ArrowRight size={13} />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SENZA AUTO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Comprare senza usare sempre l&apos;auto
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Sulla linea ferroviaria Parma–La Spezia le fermate lunigianesi sono: <strong className="font-medium text-ink">Pontremoli</strong>,{" "}
              <strong className="font-medium text-ink">Filattiera</strong>,{" "}
              <strong className="font-medium text-ink">Villafranca-Bagnone</strong> e{" "}
              <strong className="font-medium text-ink">Aulla-Lunigiana</strong>. Da Aulla parte anche
              la linea verso Lucca, che serve il territorio di Fivizzano e l'area di Casola in
              Lunigiana. Le fermate possono trovarsi in frazioni e non necessariamente nel capoluogo,
              quindi la distanza dalla singola casa va valutata caso per caso. Se volete ridurre la
              dipendenza dall&apos;auto, è da qui che conviene partire nella scelta della zona.
            </p>
            <p>
              Non promettiamo frequenze né tempi di percorrenza: gli orari cambiano nel corso
              dell&apos;anno e vanno verificati sui canali ufficiali del servizio ferroviario prima
              di decidere. Lo stesso vale per gli autobus di collegamento verso i paesi collinari.
            </p>
            <p>
              Per l&apos;auto, i caselli dell&apos;A15 in Lunigiana sono due, Pontremoli e Aulla,
              mentre la SS62 percorre il fondovalle attraversando Pontremoli, Filattiera,
              Villafranca, Licciana Nardi e Aulla. Da Aulla si diramano i collegamenti verso
              Fivizzano e Casola; da Terrarossa si sale verso Licciana Nardi e Comano.
            </p>
            <p className="text-[0.95rem]">
              Fonti su collegamenti e accessi:{" "}
              {DC_FONTI.slice(0, 2).map((f, i) => (
                <span key={f.url}>
                  {i > 0 ? " e " : ""}
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
                  >
                    {f.label}
                    <ExternalLink size={12} />
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>

      {/* SANITÀ */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Se per te contano ospedale e servizi sanitari
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              In Lunigiana i presidi ospedalieri sono due:{" "}
              <strong className="font-medium text-ink">Pontremoli</strong> per l&apos;alta valle e{" "}
              <strong className="font-medium text-ink">Fivizzano</strong> per il versante orientale.
              Per chi ha esigenze di salute continuative, la distanza da uno di questi due punti è
              spesso il criterio che pesa più del prezzo.
            </p>
            <p>
              Negli altri comuni esistono servizi territoriali — ambulatori, medici di famiglia,
              farmacie, prelievi — ma la loro presenza, gli orari e le sedi cambiano nel tempo:
              vanno verificati caso per caso sui canali dell&apos;azienda sanitaria e presso il
              comune, non dati per scontati.
            </p>
            <p className="text-[0.95rem]">
              Fonti:{" "}
              {DC_FONTI.slice(2).map((f, i) => (
                <span key={f.url}>
                  {i > 0 ? " e " : ""}
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
                  >
                    {f.label}
                    <ExternalLink size={12} />
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>

      {/* COME SCEGLIERE IN 10 MINUTI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Come scegliere in 10 minuti
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Cinque domande, in questo ordine. Rispondete con una frase ciascuna: quello che resta è
              già una lista breve di comuni.
            </p>
          </div>
          <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DC_DOMANDE.map((d, i) => (
              <li
                key={d.domanda}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-5"
              >
                <span className="mt-0.5 shrink-0 font-serif text-lg text-[var(--terracotta)]">
                  {i + 1}
                </span>
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">{d.domanda}</strong> {d.body}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Se volete mettere dei numeri accanto a queste risposte, la guida{" "}
            <Link
              to="/prezzi-case-lunigiana"
              data-track="dc_to_prezzi_click"
              onClick={() => trackClick("dc_to_prezzi_click", { source: "dove_comprare" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              prezzi delle case in Lunigiana
            </Link>{" "}
            entra nel dettaglio delle quotazioni richieste comune per comune, delle fasce di budget e
            di come leggere il prezzo al metro quadro. E se state ancora valutando il territorio in
            generale, la guida{" "}
            <Link
              to="/vivere-in-lunigiana"
              data-track="dc_to_vivere_click"
              onClick={() => trackClick("dc_to_vivere_click", { source: "dove_comprare" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              vivere in Lunigiana
            </Link>{" "}
            racconta come funziona la vita quotidiana qui.
          </p>
        </div>
      </section>

      {/* METODOLOGIA E FONTI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Metodologia e fonti</h2>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              <strong className="font-medium text-ink">Quotazioni richieste.</strong> I valori €/m²
              citati in questa pagina sono gli stessi della nostra guida ai prezzi e provengono da{" "}
              {PZ_SOURCE.externalName}, rilevazione {PZ_SOURCE.externalPeriod}. Sono prezzi medi{" "}
              <strong className="font-medium text-ink">richiesti</strong> dagli annunci in vendita:
              descrivono l&apos;offerta pubblicata, non i prezzi finali conclusi nelle compravendite.
            </p>
            <p>
              <strong className="font-medium text-ink">Informazioni infrastrutturali.</strong>{" "}
              Caselli autostradali, fermate ferroviarie, tracciato della SS62 e presidi ospedalieri
              derivano dalle fonti pubbliche elencate qui sotto. Frequenze, orari e organizzazione
              dei servizi possono cambiare: vanno verificati prima di decidere.
            </p>
            <p>
              <strong className="font-medium text-ink">Giudizi &laquo;adatto a&raquo;.</strong> Le
              indicazioni su chi può trovarsi bene in un comune sono una lettura editoriale di Furia
              Immobiliare, basata sul lavoro quotidiano sul territorio. Non sono dati statistici, non
              sono classifiche e non riguardano il rendimento o la rivalutazione di un immobile.
            </p>
            <ul className="mt-2 space-y-2">
              {DC_FONTI.map((f) => (
                <li key={f.url}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
                  >
                    {f.label}
                    <ExternalLink size={12} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={PZ_SOURCE.externalUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
                >
                  Immobiliare.it, mercato immobiliare provincia di Massa-Carrara
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Il passo successivo</h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Quando avete due o tre comuni in mente, il modo più rapido per capire se la scelta tiene
            è guardare le case che ci sono davvero. Se invece dovete vendere, partiamo dalla zona e
            dallo stato reale dell&apos;immobile.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/immobili"
              data-track="dc_cta_immobili"
              onClick={() => trackClick("dc_cta_immobili", { source: "dove_comprare" })}
              className="inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              Vedi gli immobili in vendita <ArrowRight size={14} />
            </Link>
            <Link
              to="/trova-casa-lunigiana"
              data-track="dc_cta_trova"
              onClick={() => trackClick("dc_cta_trova", { source: "dove_comprare" })}
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--terracotta)]/40 px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] transition hover:bg-[var(--warm-ivory)]"
            >
              Trova la tua casa ideale
            </Link>
            <Link
              to="/valuta-casa"
              data-track="dc_cta_valuta"
              onClick={() => trackClick("dc_cta_valuta", { source: "dove_comprare" })}
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--terracotta)]/40 px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] transition hover:bg-[var(--warm-ivory)]"
            >
              Valuta la tua casa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
