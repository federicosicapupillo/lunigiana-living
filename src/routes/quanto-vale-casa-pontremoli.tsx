import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ExternalLink, Home } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import {
  QV_FATTORI,
  QV_FURIA,
  QV_META,
  QV_METODO,
  QV_PUBBLICO,
} from "@/lib/quanto-vale-pontremoli";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/quanto-vale-casa-pontremoli");

// Formattazione italiana esplicita: il runtime SSR non garantisce i dati ICU
// per it-IT, quindi evitiamo toLocaleString e differenze SSR/client.
const itNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = (n: number) => `${itNum(n)} €`;
const eurM2 = (n: number) => `${itNum(n)} €/m²`;
const pct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2).replace(".", ",")}%`;

export const Route = createFileRoute("/quanto-vale-casa-pontremoli")({
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
        {
          "@type": "ListItem",
          position: 3,
          name: "Quanto vale una casa a Pontremoli",
          item: PAGE_URL,
        },
      ],
    };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: QV_META.h1,
      description: QV_META.description,
      inLanguage: "it-IT",
      datePublished: QV_META.isoDate,
      dateModified: QV_META.isoDate,
      author: { "@id": AGENCY_ID },
      publisher: { "@id": AGENCY_ID },
      isPartOf: { "@id": `${PAGE_URL}#webpage` },
      mainEntityOfPage: { "@id": `${PAGE_URL}#webpage` },
      about: { "@type": "Place", name: "Pontremoli", address: { "@type": "PostalAddress", addressLocality: "Pontremoli", addressRegion: "Toscana", addressCountry: "IT" } },
    };
    const webPageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: QV_META.title,
      description: QV_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      datePublished: QV_META.isoDate,
      dateModified: QV_META.isoDate,
    };
    return {
      meta: [
        { title: QV_META.title },
        { name: "description", content: QV_META.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: QV_META.title },
        { property: "og:description", content: QV_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: QV_META.title },
        { name: "twitter:description", content: QV_META.description },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: QuantoValePontremoliPage,
});

function QuantoValePontremoliPage() {
  return (
    <>
      {/* HERO — RISPOSTA DIRETTA */}
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
            <span className="text-ink">Quanto vale una casa a Pontremoli</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <Home size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Valutazione a Pontremoli</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {QV_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {QV_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              La risposta onesta è che il valore di una casa a Pontremoli non si ottiene
              moltiplicando i metri quadri per {eurM2(QV_PUBBLICO.eurM2Medio)}. Quel numero è il
              <strong className="font-medium text-ink"> prezzo medio richiesto</strong> dagli annunci
              in vendita pubblicati sul portale a {QV_PUBBLICO.periodo}: una sintesi di case molto
              diverse fra loro, non la misura di un immobile specifico.
            </p>
            <p>
              Nella stessa rilevazione le quotazioni richieste vanno da{" "}
              {eurM2(QV_PUBBLICO.rangeMin)} a {eurM2(QV_PUBBLICO.rangeMax)}. Una casa concreta può
              stare molto sopra o molto sotto la media, a seconda di stato, posizione, esterni e
              caratteristiche. Per questo, prima di parlare di cifre, guardiamo la casa.
            </p>
            <p className="text-[0.95rem]">
              In questa pagina trovi il dato pubblico su Pontremoli, la fotografia del nostro
              portafoglio in vendita nel comune e i criteri con cui prepariamo una valutazione.
            </p>
          </div>

          <div className="mt-9">
            <Link
              to="/valuta-casa"
              data-track="qv_hero_valuta_click"
              onClick={() => trackClick("qv_hero_valuta_click", { source: "quanto_vale_pontremoli" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              Richiedi una valutazione <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* DATO PUBBLICO */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Il dato pubblico su Pontremoli
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Sono quotazioni <strong className="font-medium text-ink">richieste</strong>{" "}
              dall&apos;offerta pubblicata sul portale, non prezzi di compravendita registrati.
              Rilevazione di {QV_PUBBLICO.periodo}.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                k: "Prezzo medio richiesto",
                v: eurM2(QV_PUBBLICO.eurM2Medio),
                n: `rilevazione ${QV_PUBBLICO.periodo}`,
              },
              {
                k: `Variazione su ${QV_PUBBLICO.confrontoPeriodo}`,
                v: pct(QV_PUBBLICO.varYoY),
                n: "sulle quotazioni richieste",
              },
              {
                k: "Intervallo pubblicato",
                v: `${itNum(QV_PUBBLICO.rangeMin)}–${itNum(QV_PUBBLICO.rangeMax)} €/m²`,
                n: "estremi indicati dalla fonte",
              },
              {
                k: "Annunci in vendita mostrati",
                v: itNum(QV_PUBBLICO.annunciPortale),
                n: `conteggio del portale — ${QV_PUBBLICO.annunciDataLabel}`,
              },
            ].map((b) => (
              <div
                key={b.k}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {b.k}
                </dt>
                <dd className="mt-3 font-serif text-2xl tabular-nums text-ink">{b.v}</dd>
                <p className="mt-2 text-[0.82rem] leading-[1.6] text-[var(--ink-soft)]">{b.n}</p>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-3xl text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">
            Fonte: {QV_PUBBLICO.fonteNome},{" "}
            <a
              href={QV_PUBBLICO.fonteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
            >
              pagina di riferimento
              <ExternalLink size={13} strokeWidth={1.6} />
            </a>
            . La variazione annua di un comune di queste dimensioni va letta con prudenza: bastano
            pochi annunci nuovi, o molto diversi dai precedenti, per spostare la media. Il conteggio
            degli annunci è quello mostrato dal portale al momento della verifica del{" "}
            {QV_PUBBLICO.annunciDataLabel}, distinto dalla rilevazione dei prezzi di{" "}
            {QV_PUBBLICO.periodo}.
          </p>
        </div>
      </section>

      {/* FOTOGRAFIA FURIA */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              La fotografia del portafoglio Furia a Pontremoli
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Estrazione dal nostro database al {QV_FURIA.dataLabel}: annunci pubblicati, contratto
              di vendita, comune di Pontremoli. È la fotografia di{" "}
              <strong className="font-medium text-ink">quello che seguiamo noi</strong>, non del
              mercato complessivo del comune. Anche qui si tratta di prezzi richiesti.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                k: "Immobili attivi",
                v: itNum(QV_FURIA.attivi),
                n: `di cui ${QV_FURIA.conPrezzo} con prezzo pubblicato e ${QV_FURIA.suRichiesta} su richiesta`,
              },
              {
                k: "Prezzo richiesto mediano",
                v: eur(QV_FURIA.prezzoMediano),
                n: `campione: ${QV_FURIA.conPrezzo} immobili con prezzo pubblicato`,
              },
              {
                k: "Prezzo richiesto medio",
                v: eur(QV_FURIA.prezzoMedio),
                n: "la media è più sensibile ai valori estremi della mediana",
              },
              {
                k: "Richiesta minima e massima",
                v: `${eur(QV_FURIA.prezzoMin)} – ${eur(QV_FURIA.prezzoMax)}`,
                n: `estremi del campione di ${QV_FURIA.conPrezzo} immobili`,
              },
              {
                k: "Mediana €/m²",
                v: eurM2(QV_FURIA.medianaM2),
                n: `campione effettivo: ${QV_FURIA.campioneM2} immobili con prezzo e superficie`,
              },
              {
                k: "Media €/m²",
                v: eurM2(QV_FURIA.mediaM2),
                n: `stesso campione di ${QV_FURIA.campioneM2} immobili`,
              },
            ].map((b) => (
              <div
                key={b.k}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  {b.k}
                </dt>
                <dd className="mt-3 font-serif text-2xl tabular-nums text-ink">{b.v}</dd>
                <p className="mt-2 text-[0.82rem] leading-[1.6] text-[var(--ink-soft)]">{b.n}</p>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-3xl text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">
            Il campione è piccolo e composto da immobili molto diversi: un solo annuncio in più o in
            meno può spostare i valori. Per questo lo presentiamo come fotografia del nostro
            portafoglio in una data precisa, e non come indicazione del valore della singola casa.
          </p>
        </div>
      </section>

      {/* PERCHÉ LA MEDIA NON È IL VALORE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Perché {eurM2(QV_PUBBLICO.eurM2Medio)} non è il valore della tua casa
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Nella stessa media convivono l&apos;appartamento ristrutturato in centro, la casa di
              borgo da sistemare e la villetta con giardino in zona residenziale. Ecco gli elementi
              che, nel lavoro di tutti i giorni, spostano di più la richiesta.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {QV_FATTORI.map((f) => (
              <li
                key={f.title}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <h3 className="font-serif text-lg leading-snug text-ink">{f.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ESEMPIO DIDATTICO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Due case da 100 m², due storie diverse
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              La prima è un appartamento in centro, secondo piano senza ascensore, impianti da
              rivedere, nessuno spazio esterno e nessun posto auto. La seconda ha la stessa
              superficie ma è abitabile subito, con terrazzo, vista aperta sulla valle e garage.
            </p>
            <p>
              Sulla carta hanno gli stessi metri quadri. Nella pratica parlano a pubblici diversi,
              hanno tempi di vendita diversi e richieste che possono distare parecchio fra loro. È
              esattamente ciò che una media al metro quadro non può raccontare.
            </p>
            <p>
              Per questo non troverai qui un calcolatore che restituisce una cifra: un numero
              generato da due dati non descrive la tua casa e rischia di orientare male una
              decisione importante.
            </p>
          </div>
        </div>
      </section>

      {/* COME FACCIAMO UNA VALUTAZIONE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Come facciamo una valutazione
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Sei passaggi, nell&apos;ordine in cui li affrontiamo. Una stima attendibile richiede i
              dati specifici dell&apos;immobile e, quando possibile, un sopralluogo: senza vedere la
              casa si può solo ragionare per ipotesi.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2">
            {QV_METODO.map((p, i) => (
              <li
                key={p.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <span className="mt-0.5 shrink-0 font-serif text-lg text-[var(--terracotta)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-lg leading-snug text-ink">{p.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SE VUOI VENDERE — CTA */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Se stai pensando di vendere a Pontremoli
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/85">
            Raccontaci la casa in pochi passaggi: zona, tipologia, stato, superficie e spazi
            esterni. Ti richiamiamo per capire i dettagli e, quando serve, fissare un sopralluogo
            prima di indicare una fascia di prezzo.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/valuta-casa"
              data-track="qv_cta_valuta_click"
              onClick={() => trackClick("qv_cta_valuta_click", { source: "quanto_vale_pontremoli" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-cream px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-[var(--terracotta)] hover:text-cream"
            >
              Richiedi una valutazione <ArrowRight size={14} className="shrink-0" />
            </Link>
            <Link
              to="/contatti"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-cream/35 px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:border-cream"
            >
              Parla con noi
            </Link>
          </div>
        </div>
      </section>

      {/* APPROFONDIMENTI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Continua da qui</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                to: "/osservatorio-immobiliare-lunigiana" as const,
                title: "Osservatorio Immobiliare Lunigiana",
                body: "Quotazioni richieste nei quattordici comuni e fotografia aggregata del nostro portafoglio.",
                ev: "qv_to_osservatorio",
              },
              {
                to: "/prezzi-case-lunigiana" as const,
                title: "Prezzi delle case in Lunigiana",
                body: "La guida ai prezzi richiesti comune per comune, con fasce di budget e metodologia.",
                ev: "qv_to_prezzi",
              },
              {
                to: "/case-in-vendita/$comune" as const,
                params: { comune: "pontremoli" },
                title: "Case in vendita a Pontremoli",
                body: "Gli immobili che seguiamo oggi nel comune, con schede complete e fotografie.",
                ev: "qv_to_pontremoli",
              },
              {
                to: "/vivere-a-pontremoli" as const,
                title: "Vivere a Pontremoli",
                body: "Servizi, quartieri, collegamenti e vita quotidiana nel capoluogo della Lunigiana.",
                ev: "qv_to_vivere",
              },
            ].map((c) => (
              <Link
                key={c.title}
                to={c.to}
                params={c.params as never}
                onClick={() => trackClick(c.ev, { source: "quanto_vale_pontremoli" })}
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

      {/* METODOLOGIA E FONTI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Metodologia e fonti</h2>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              I dati esterni citati in questa pagina sono{" "}
              <strong className="font-medium text-ink">prezzi medi richiesti</strong> rilevati
              sull&apos;offerta pubblicata da un portale immobiliare a {QV_PUBBLICO.periodo}. Non
              sono prezzi di compravendita e non misurano i valori registrati negli atti: i prezzi di
              chiusura non sono osservabili in questa pagina.
            </p>
            <p>
              I dati del portafoglio Furia derivano da un&apos;estrazione del nostro database al{" "}
              {QV_FURIA.dataLabel}, limitata agli annunci pubblicati, in vendita, nel comune di
              Pontremoli. Prezzo pubblicato e prezzo su richiesta sono contati separatamente: le
              statistiche sui prezzi usano solo i {QV_FURIA.conPrezzo} immobili con prezzo
              pubblicato, mentre i valori €/m² usano i {QV_FURIA.campioneM2} immobili con prezzo e
              superficie entrambi valorizzati.
            </p>
            <p>
              Mediana e media rispondono a domande diverse: la mediana è il valore centrale del
              campione, la media è più influenzata dai valori molto alti o molto bassi. Con campioni
              di poche decine di immobili, entrambe vanno lette come indicazioni di contesto.
            </p>
            <p>
              Questa pagina non fornisce una valutazione e non indica un valore per un immobile
              specifico. Una stima attendibile richiede i dati dell&apos;immobile, la verifica dei
              documenti e, idealmente, un sopralluogo.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
