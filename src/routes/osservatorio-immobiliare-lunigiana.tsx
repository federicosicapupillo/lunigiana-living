import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ChevronRight, ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import {
  PZ_COMUNI,
  PZ_FASCE,
  PZ_FURIA,
  PZ_SOURCE,
  PZ_TIPOLOGIE,
} from "@/lib/prezzi-lunigiana";
import {
  OSS_META,
  OSS_PRESENZA_COMUNI,
  mercatoFacts,
} from "@/lib/osservatorio-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/osservatorio-immobiliare-lunigiana");

// Formattazione italiana esplicita (nessuna dipendenza da ICU lato SSR).
const itNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = (n: number) => `${itNum(n)} €`;
const eurM2 = (n: number) => `${itNum(n)} €/m²`;
const pct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1).replace(".", ",")}%`;

export const Route = createFileRoute("/osservatorio-immobiliare-lunigiana")({
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
          name: "Prezzi case in Lunigiana",
          item: siteUrl("/prezzi-case-lunigiana"),
        },
        { "@type": "ListItem", position: 3, name: "Osservatorio Immobiliare Lunigiana", item: PAGE_URL },
      ],
    };
    const datasetLd = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "@id": `${PAGE_URL}#dataset`,
      name: "Osservatorio Immobiliare Lunigiana",
      description:
        "Quotazioni medie richieste in vendita nei 14 comuni della Lunigiana (fonte esterna Immobiliare.it, rilevazione luglio 2026) e fotografia aggregata del portafoglio di immobili in vendita di Furia Immobiliare al 28 agosto 2026.",
      url: PAGE_URL,
      inLanguage: "it-IT",
      isAccessibleForFree: true,
      creator: { "@id": AGENCY_ID },
      publisher: { "@id": AGENCY_ID },
      spatialCoverage: {
        "@type": "Place",
        name: "Lunigiana, provincia di Massa-Carrara, Toscana, Italia",
      },
      temporalCoverage: OSS_META.temporalCoverage,
      dateModified: OSS_META.isoDate,
      datePublished: OSS_META.isoDate,
      variableMeasured: [
        "Prezzo medio richiesto in vendita (€/m²) per comune",
        "Variazione annua della quotazione richiesta per comune",
        "Prezzo richiesto mediano e medio degli immobili in vendita nel portafoglio Furia",
        "Prezzo richiesto mediano e medio al metro quadro nel portafoglio Furia",
        "Distribuzione degli immobili Furia per fascia di prezzo",
      ],
      measurementTechnique:
        "Quotazioni richieste esterne rilevate dalle statistiche pubbliche di mercato di Immobiliare.it (luglio 2026); indicatori del portafoglio calcolati con query aggregate sul database degli annunci pubblicati di Furia Immobiliare (contratto di vendita, comune di Massa escluso), senza dati personali. Sono prezzi richiesti, non prezzi di compravendita registrati.",
      isPartOf: { "@id": WEBSITE_ID },
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: OSS_META.title,
      description: OSS_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      mainEntity: { "@id": `${PAGE_URL}#dataset` },
      datePublished: OSS_META.isoDate,
      dateModified: OSS_META.isoDate,
    };
    return {
      meta: [
        { title: OSS_META.title },
        { name: "description", content: OSS_META.description },
        { property: "og:title", content: OSS_META.title },
        { property: "og:description", content: OSS_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(datasetLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: OsservatorioPage,
});

const TH = "py-3 pr-4 font-normal";
const ROW = "border-b border-[var(--terracotta)]/10";

function OsservatorioPage() {
  const comuniConLanding = new Set(COMUNE_SEO.map((c) => c.slug));
  const tipologieConLanding = new Set(TIPOLOGIE_SEO.map((t) => t.slug));
  const facts = mercatoFacts();
  // Derivazione locale ordinata per €/m² crescente (copia+sort; PZ_COMUNI resta invariato).
  const comuniSorted = [...PZ_COMUNI].sort((a, b) => a.eurM2 - b.eurM2);
  const tipologie = PZ_TIPOLOGIE.filter((t) => t.campione >= 3);
  const fasceMax = Math.max(...PZ_FASCE.map((f) => f.count));

  return (
    <>
      {/* HERO + RISPOSTA DIRETTA */}
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]"
          >
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/prezzi-case-lunigiana" className="hover:text-[var(--terracotta)]">
              Prezzi case in Lunigiana
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Osservatorio Immobiliare</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <BarChart3 size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Dati e metodologia</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {OSS_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {OSS_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              L&apos;Osservatorio raccoglie in una pagina sola i due tipi di dato che usiamo ogni
              giorno per parlare di prezzi in Lunigiana: da un lato le{" "}
              <strong className="font-normal text-ink">quotazioni richieste</strong> del mercato
              pubblico, comune per comune; dall&apos;altro la{" "}
              <strong className="font-normal text-ink">fotografia del portafoglio Furia</strong>,
              cioè gli immobili in vendita che seguiamo direttamente in questo momento.
            </p>
            <p>
              Sono due cose diverse e le teniamo separate. Nessuno dei numeri qui sotto è un prezzo
              di compravendita registrato dal notaio: si tratta sempre di prezzi richiesti, cioè di
              quanto viene chiesto negli annunci pubblicati.
            </p>
          </div>
        </div>
      </section>

      {/* DUE BOX: MERCATO PUBBLICO VS PORTAFOGLIO */}
      <section className="bg-[var(--warm-ivory)] py-16">
        <div className="container-editorial">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--terracotta)]">
                Mercato pubblico
              </p>
              <h2 className="mt-3 font-serif text-2xl text-ink">
                Quotazioni richieste nei 14 comuni
              </h2>
              <p className="mt-4 text-[0.98rem] leading-[1.8] text-[var(--ink-soft)]">
                Prezzo medio richiesto in vendita al metro quadro, rilevato sull'offerta
                pubblicata del portale. Fonte esterna: {PZ_SOURCE.externalName}, rilevazione{" "}
                {PZ_SOURCE.externalPeriod}. Riflette l'offerta pubblicata sul portale e non
                il solo portafoglio Furia.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-7">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--terracotta)]">
                Portafoglio Furia
              </p>
              <h2 className="mt-3 font-serif text-2xl text-ink">
                Gli immobili che seguiamo noi
              </h2>
              <p className="mt-4 text-[0.98rem] leading-[1.8] text-[var(--ink-soft)]">
                Elaborazione sui nostri annunci in vendita pubblicati al 28 agosto 2026, escluso il
                comune di Massa. È il nostro portafoglio, non il mercato della Lunigiana: descrive
                che tipo di case abbiamo disponibili e a quali prezzi vengono proposte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TABELLA MERCATO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Quotazioni richieste nei 14 comuni
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Prezzo medio richiesto in vendita e variazione rispetto alla rilevazione dell&apos;anno
              precedente. I comuni sono ordinati dal valore più basso al più alto. Non pubblichiamo
              una media unica della Lunigiana: senza il numero di annunci per comune sarebbe una
              media non ponderata e quindi fuorviante.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Comuni rilevati", v: String(facts.totale) },
              { k: "Valore più basso", v: `${eurM2(facts.min.eurM2)} · ${facts.min.nome}` },
              { k: "Valore più alto", v: `${eurM2(facts.max.eurM2)} · ${facts.max.nome}` },
              {
                k: "Variazione annua",
                v: `${facts.inCrescita} in aumento · ${facts.inCalo} in calo`,
              },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                  {item.k}
                </dt>
                <dd className="mt-2 font-serif text-xl text-ink">{item.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Prezzo medio richiesto in vendita nei comuni della Lunigiana, rilevazione{" "}
                {PZ_SOURCE.externalPeriod}
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className={TH}>Comune</th>
                  <th scope="col" className={TH}>Prezzo medio richiesto</th>
                  <th scope="col" className={TH}>Variazione annua</th>
                </tr>
              </thead>
              <tbody>
                {comuniSorted.map((c) => (
                  <tr key={c.nome} className={ROW}>
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {c.slug && comuniConLanding.has(c.slug) ? (
                        <Link
                          to="/case-in-vendita/$comune"
                          params={{ comune: c.slug }}
                          onClick={() => trackClick("oss_comune_click", { comune: c.slug })}
                          className="text-[var(--terracotta)] underline hover:no-underline"
                        >
                          {c.nome}
                        </Link>
                      ) : (
                        c.nome
                      )}
                    </th>
                    <td className="py-3 pr-4 tabular-nums text-ink">{eurM2(c.eurM2)}</td>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">{pct(c.varYoY)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-3xl text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Le variazioni annue dei comuni piccoli vanno lette con prudenza: bastano pochi annunci
            nuovi, o molto diversi dai precedenti, per spostare la media di parecchi punti. Indicano
            un cambiamento nell&apos;offerta pubblicata, non necessariamente nel valore delle
            singole case.
          </p>
        </div>
      </section>

      {/* KPI PORTAFOGLIO */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Fotografia del portafoglio Furia
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Elaborazione sui nostri annunci in vendita pubblicati al 28 agosto 2026, comune di
              Massa escluso. Dei {PZ_FURIA.attivi} immobili attivi, {PZ_FURIA.conPrezzo} hanno un
              prezzo pubblicato e {PZ_FURIA.suRichiesta} è trattato su richiesta. Gli indicatori sono
              calcolati sugli annunci con prezzo.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { k: "Immobili attivi in vendita", v: String(PZ_FURIA.attivi) },
              { k: "Con prezzo pubblicato", v: `${PZ_FURIA.conPrezzo} su ${PZ_FURIA.attivi}` },
              { k: "Prezzo su richiesta", v: String(PZ_FURIA.suRichiesta) },
              { k: "Prezzo mediano richiesto", v: eur(PZ_FURIA.prezzoMediano) },
              { k: "Prezzo medio richiesto", v: eur(PZ_FURIA.prezzoMedio) },
              { k: "Intervallo dei prezzi", v: `${eur(PZ_FURIA.minimo)} – ${eur(PZ_FURIA.massimo)}` },
              { k: "Mediana al metro quadro", v: eurM2(PZ_FURIA.medianaEurM2) },
              { k: "Media al metro quadro", v: eurM2(PZ_FURIA.mediaEurM2) },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                  {item.k}
                </dt>
                <dd className="mt-2 font-serif text-2xl text-ink">{item.v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-3xl text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            La media ({eur(PZ_FURIA.prezzoMedio)}) è superiore alla mediana ({eur(PZ_FURIA.prezzoMediano)}),
            una differenza coerente con la presenza nel portafoglio di alcuni immobili di fascia
            più alta. Gli indicatori al metro quadro sono calcolati solo dove prezzo e superficie
            sono entrambi validi.
          </p>
        </div>
      </section>

      {/* FASCE DI BUDGET */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Cosa si trova per fascia di budget
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Distribuzione degli immobili con prezzo pubblicato nel nostro portafoglio alla data
              della snapshot. È disponibilità attuale: cambia ogni volta che un immobile viene
              venduto o entra in portafoglio.
            </p>
          </div>

          <ul className="mt-10 max-w-2xl space-y-4">
            {PZ_FASCE.map((f) => (
              <li key={f.label}>
                <div className="flex items-baseline justify-between gap-4 text-[0.95rem]">
                  <span className="text-ink">{f.label}</span>
                  <span className="tabular-nums text-[var(--ink-soft)]">
                    {f.count} immobili
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--terracotta)]/10">
                  <div
                    className="h-full rounded-full bg-[var(--terracotta)]/60"
                    style={{ width: `${Math.round((f.count / fasceMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRESENZA PER COMUNE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Presenza Furia per comune
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Numero di annunci con prezzo pubblicato e mediane, comune per comune, alla data della
              snapshot. Il campione (n) è sempre indicato:{" "}
              <strong className="font-normal text-ink">
                i campioni piccoli non rappresentano il mercato del comune
              </strong>{" "}
              e con uno o due annunci la mediana coincide con quei singoli immobili. Il numero di
              annunci dipende dagli incarichi che abbiamo in un dato momento e non dice nulla sulla
              domanda o sull&apos;andamento dei prezzi locali.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[36rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Annunci Furia in vendita per comune, con campione e mediane, al 28 agosto 2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className={TH}>Comune</th>
                  <th scope="col" className={TH}>Annunci (n)</th>
                  <th scope="col" className={TH}>Mediana prezzo</th>
                  <th scope="col" className={TH}>Mediana €/m²</th>
                </tr>
              </thead>
              <tbody>
                {OSS_PRESENZA_COMUNI.map((c) => (
                  <tr key={c.nome} className={ROW}>
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {c.slug && comuniConLanding.has(c.slug) ? (
                        <Link
                          to="/case-in-vendita/$comune"
                          params={{ comune: c.slug }}
                          onClick={() => trackClick("oss_presenza_click", { comune: c.slug })}
                          className="text-[var(--terracotta)] underline hover:no-underline"
                        >
                          {c.nome}
                        </Link>
                      ) : (
                        c.nome
                      )}
                    </th>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">{c.campione}</td>
                    <td className="py-3 pr-4 tabular-nums text-ink">{eur(c.medianaPrezzo)}</td>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">
                      {eurM2(c.medianaEurM2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TIPOLOGIE */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Tipologie presenti nel portafoglio
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Mostriamo solo le tipologie con almeno tre annunci: sotto questa soglia una mediana
              non aggiunge informazione utile. Anche qui restano numeri del nostro portafoglio, non
              del mercato.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Tipologie di immobili Furia in vendita con almeno tre annunci, al 28 agosto 2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className={TH}>Tipologia</th>
                  <th scope="col" className={TH}>Annunci (n)</th>
                  <th scope="col" className={TH}>Mediana prezzo</th>
                  <th scope="col" className={TH}>Mediana €/m²</th>
                </tr>
              </thead>
              <tbody>
                {tipologie.map((t) => (
                  <tr key={t.nome} className={ROW}>
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {t.slug && tipologieConLanding.has(t.slug) ? (
                        <Link
                          to="/case-in-vendita-lunigiana/$tipologia"
                          params={{ tipologia: t.slug }}
                          onClick={() => trackClick("oss_tipologia_click", { tipologia: t.slug })}
                          className="text-[var(--terracotta)] underline hover:no-underline"
                        >
                          {t.nome}
                        </Link>
                      ) : (
                        t.nome
                      )}
                    </th>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">{t.campione}</td>
                    <td className="py-3 pr-4 tabular-nums text-ink">{eur(t.medianaPrezzo)}</td>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">
                      {eurM2(t.medianaEurM2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COME LEGGERE I DATI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Come leggere questi dati</h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              <strong className="font-normal text-ink">Prezzo richiesto</strong> vuol dire quanto
              viene chiesto in un annuncio. Il prezzo a cui una casa viene poi effettivamente
              venduta può essere diverso: il prezzo conclusivo non è il dato misurato da questo
              Osservatorio.
            </p>
            <p>
              <strong className="font-normal text-ink">La mediana</strong> è il valore centrale
              della distribuzione: circa metà delle osservazioni si trova sotto o al valore mediano
              e circa metà sopra o al valore mediano. È meno influenzata dai valori estremi rispetto
              alla media: quando nel gruppo ci sono pochi immobili molto costosi, la media si
              sposta in alto e descrive male la disponibilità tipica.
            </p>
            <p>
              <strong className="font-normal text-ink">Il €/m²</strong> serve per confrontare case
              di dimensioni diverse, ma non racconta lo stato dell&apos;immobile, la frazione, il
              terreno o i lavori da fare. Due case con lo stesso €/m² possono richiedere impegni
              economici molto diversi.
            </p>
            <p>
              <strong className="font-normal text-ink">Il campione (n)</strong> conta più del
              numero: con uno o due annunci il dato descrive quei due immobili, non il comune. Per
              questo lo indichiamo sempre accanto a ogni riga.
            </p>
          </div>
        </div>
      </section>

      {/* METODOLOGIA */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Metodologia e limiti</h2>
          <ul className="mt-6 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <li>
              <strong className="font-normal text-ink">Quotazioni esterne.</strong> I valori €/m²
              dei 14 comuni provengono dalle statistiche pubbliche di mercato di Immobiliare.it,
              rilevazione {PZ_SOURCE.externalPeriod}. Sono prezzi medi richiesti sull'offerta
              pubblicata rilevata dal portale.
            </li>
            <li>
              <strong className="font-normal text-ink">Snapshot Furia.</strong> Gli indicatori del
              portafoglio derivano da query aggregate sui nostri annunci con stato pubblicato e
              contratto di vendita, comune di Massa escluso, al 28 agosto 2026. Nessun dato
              personale è coinvolto.
            </li>
            <li>
              <strong className="font-normal text-ink">Nessun prezzo notarile.</strong> Non
              pubblichiamo prezzi di compravendita registrati: tutti i valori sono prezzi richiesti.
            </li>
            <li>
              <strong className="font-normal text-ink">Campioni piccoli.</strong> Nei comuni con
              pochi annunci le mediane descrivono singoli immobili. Non vanno usate come stima del
              valore di una casa specifica.
            </li>
            <li>
              <strong className="font-normal text-ink">Nessuna media unica.</strong> Non calcoliamo
              un valore medio della Lunigiana: senza il peso del numero di annunci per comune
              sarebbe una media non ponderata e fuorviante.
            </li>
            <li>
              <strong className="font-normal text-ink">I dati cambiano.</strong> Il portafoglio si
              modifica in continuazione e le rilevazioni esterne vengono aggiornate periodicamente:
              la data indicata in alto è il riferimento di questa versione.
            </li>
          </ul>
        </div>
      </section>

      {/* FONTI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Fonti</h2>
          <ul className="mt-6 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <li>
              {PZ_SOURCE.externalName}, rilevazione {PZ_SOURCE.externalPeriod} —{" "}
              <a
                href={PZ_SOURCE.externalUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
              >
                pagina di riferimento
                <ExternalLink size={13} strokeWidth={1.6} />
              </a>
            </li>
            <li>{PZ_SOURCE.internalLabel} — database annunci Furia Immobiliare, snapshot aggregata.</li>
          </ul>
        </div>
      </section>

      {/* CTA EDITORIALI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Continua da qui</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                to: "/prezzi-case-lunigiana" as const,
                title: "Prezzi delle case in Lunigiana",
                body: "La guida ai prezzi comune per comune, con fasce di budget e consigli pratici.",
                ev: "oss_to_prezzi",
              },
              {
                to: "/dove-comprare-casa-lunigiana" as const,
                title: "Dove comprare casa in Lunigiana",
                body: "Come scegliere la zona in base a budget, servizi, collegamenti e stile di vita.",
                ev: "oss_to_dove_comprare",
              },
              {
                to: "/immobili" as const,
                title: "Immobili in vendita",
                body: "L'elenco aggiornato degli immobili che seguiamo, con filtri per zona e tipologia.",
                ev: "oss_to_immobili",
              },
              {
                to: "/valuta-casa" as const,
                title: "Valuta la tua casa",
                body: "Un percorso guidato per ricevere una valutazione sul tuo immobile.",
                ev: "oss_to_valuta",
              },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                onClick={() => trackClick(c.ev, { source: "osservatorio" })}
                className="group rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7 transition-colors hover:border-[var(--terracotta)]/40"
              >
                <h3 className="font-serif text-xl text-ink">{c.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">{c.body}</p>
                <span className="mt-4 inline-block text-[0.8rem] uppercase tracking-[0.18em] text-[var(--terracotta)]">
                  Apri
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
