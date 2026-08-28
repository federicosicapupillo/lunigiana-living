import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ExternalLink, TrendingUp } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import { COMUNE_SEO } from "@/lib/seo-comuni";
import { TIPOLOGIE_SEO } from "@/lib/seo-tipologie";
import {
  PZ_BUDGET,
  PZ_COMUNI,
  PZ_CONSIGLI,
  PZ_FASCE,
  PZ_FURIA,
  PZ_META,
  PZ_SOURCE,
  PZ_TIPOLOGIE,
} from "@/lib/prezzi-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/prezzi-case-lunigiana");

// Formattazione italiana esplicita: il runtime SSR non garantisce i dati ICU
// per it-IT, quindi evitiamo toLocaleString e differenze SSR/client.
const itNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const eur = (n: number) => `${itNum(n)} €`;
const eurM2 = (n: number) => `${itNum(n)} €/m²`;
const pct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1).replace(".", ",")}%`;

export const Route = createFileRoute("/prezzi-case-lunigiana")({
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
        { "@type": "ListItem", position: 3, name: "Prezzi case in Lunigiana", item: PAGE_URL },
      ],
    };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: PZ_META.h1,
      description: PZ_META.description,
      inLanguage: "it-IT",
      datePublished: PZ_META.isoDate,
      dateModified: PZ_META.isoDate,
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
      name: PZ_META.title,
      description: PZ_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      datePublished: PZ_META.isoDate,
      dateModified: PZ_META.isoDate,
    };
    return {
      meta: [
        { title: PZ_META.title },
        { name: "description", content: PZ_META.description },
        { property: "og:title", content: PZ_META.title },
        { property: "og:description", content: PZ_META.description },
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
  component: PrezziLunigianaPage,
});

function PrezziLunigianaPage() {
  const comuniConLanding = new Set(COMUNE_SEO.map((c) => c.slug));
  const tipologieConLanding = new Set(TIPOLOGIE_SEO.map((t) => t.slug));
  const min = PZ_COMUNI[0];
  const max = PZ_COMUNI[PZ_COMUNI.length - 1];

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
            <span className="text-ink">Prezzi case in Lunigiana</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <TrendingUp size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Guida ai prezzi</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {PZ_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {PZ_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              La Lunigiana non ha un prezzo solo. Nella rilevazione di {PZ_SOURCE.externalPeriod}{" "}
              i prezzi medi richiesti nei quattordici comuni della valle vanno da circa{" "}
              {eurM2(min.eurM2)} a {min.nome} a circa {eurM2(max.eurM2)} a {max.nome}: quasi il
              triplo, all&apos;interno dello stesso territorio e a mezz&apos;ora di auto di distanza.
            </p>
            <p>
              In pratica, chi cerca casa qui si muove più spesso per budget complessivo che per
              metro quadro. Nel nostro portafoglio il prezzo mediano richiesto degli immobili in
              vendita è {eur(PZ_FURIA.prezzoMediano)}, e {PZ_FASCE[0].count} immobili su{" "}
              {PZ_FURIA.conPrezzo}
              stanno sotto i 100.000 €. Qui sotto trovate i dati comune per comune, cosa significano
              davvero e cosa si trova oggi con budget diversi.
            </p>
            <p className="text-[0.95rem]">
              Tutti i valori esterni citati sono <strong className="font-medium text-ink">prezzi
              medi richiesti</strong> dall&apos;offerta pubblicata, non prezzi di compravendita
              registrati.
            </p>
          </div>
        </div>
      </section>

      {/* TABELLA COMUNI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Prezzi delle case in Lunigiana, comune per comune
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Prezzo medio richiesto in vendita e variazione rispetto a luglio 2025. Fonte:{" "}
              {PZ_SOURCE.externalName}, rilevazione {PZ_SOURCE.externalPeriod}. I comuni sono
              ordinati dal più economico al più caro.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Prezzi medi richiesti in vendita nei comuni della Lunigiana, luglio 2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className="py-3 pr-4 font-normal">Comune</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Prezzo medio richiesto</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Var. su luglio 2025</th>
                </tr>
              </thead>
              <tbody>
                {PZ_COMUNI.map((c) => (
                  <tr key={c.nome} className="border-b border-[var(--terracotta)]/10">
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {c.slug && comuniConLanding.has(c.slug) ? (
                        <Link
                          to="/case-in-vendita/$comune"
                          params={{ comune: c.slug }}
                          data-track="pz_comune_click"
                          onClick={() => trackClick("pz_comune_click", { comune: c.slug })}
                          className="text-[var(--terracotta)] underline hover:no-underline"
                        >
                          {c.nome}
                        </Link>
                      ) : (
                        c.nome
                      )}
                    </th>
                    <td className="py-3 pr-4 tabular-nums text-ink">{eurM2(c.eurM2)}</td>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">
                      {pct(c.varYoY)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 max-w-3xl space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Tra i valori più bassi del gruppo compaiono Zeri, Filattiera, Casola in Lunigiana,
              Mulazzo e Tresana. I due valori più alti sono invece Fosdinovo, con {eurM2(1713)},
              e Aulla, con {eurM2(1229)}.
            </p>
            <p>
              Le variazioni annue vanno lette con prudenza: in comuni piccoli bastano pochi annunci
              nuovi, o molto diversi dai precedenti, per spostare la media di parecchi punti. Il −13,7%
              di Filattiera o il +8,3% di Zeri raccontano soprattutto un cambio nell&apos;offerta
              pubblicata, non necessariamente un crollo o un rialzo dei valori delle singole case.
            </p>
          </div>
        </div>
      </section>

      {/* COSA SIGNIFICA IL €/M² */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Cosa significa davvero il prezzo al metro quadro in Lunigiana
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Il prezzo medio di un comune è la sintesi di case molto diverse fra loro. A Pontremoli,
              per esempio, nello stesso dato convivono l&apos;appartamento ristrutturato nel centro
              storico, la casa di borgo da rimettere a posto e la villetta anni Ottanta con giardino
              in zona residenziale: hanno costi, lavori e mercati differenti.
            </p>
            <p>
              Le variabili che spostano di più il valore, nella nostra esperienza quotidiana, sono
              cinque: lo stato dell&apos;immobile (abitabile subito o da ristrutturare), la frazione
              esatta e la sua distanza dai servizi, la presenza di terreno o giardino, il panorama e
              l&apos;esposizione, e l&apos;accessibilità reale — strada asfaltata, parcheggio, come
              si arriva in inverno.
            </p>
            <p>
              Sul recupero pesa anche il tipo di edificio: sui rustici in pietra il costo dei lavori
              può avvicinarsi o superare il prezzo di acquisto, mentre su un appartamento in paese
              spesso si tratta di impianti e finiture. Per questo due immobili con lo stesso €/m²
              possono richiedere impegni economici molto lontani.
            </p>
          </div>
        </div>
      </section>

      {/* PORTAFOGLIO FURIA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Cosa si trova oggi nel portafoglio Furia
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Questa è la fotografia del portafoglio Furia al 28 agosto 2026, non del mercato
              dell&apos;intera Lunigiana: sono gli immobili in vendita che seguiamo direttamente,
              esclusa Massa. Dà però un&apos;idea concreta di cosa circola davvero e a che cifre.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Immobili in vendita", v: String(PZ_FURIA.attivi) },
              { k: "Prezzo mediano richiesto", v: eur(PZ_FURIA.prezzoMediano) },
              { k: "Prezzo medio richiesto", v: eur(PZ_FURIA.prezzoMedio) },
              { k: "Mediana al metro quadro", v: eurM2(PZ_FURIA.medianaEurM2) },
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

          <div className="mt-8 max-w-3xl space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Dei {PZ_FURIA.attivi} immobili attivi, {PZ_FURIA.conPrezzo} hanno un prezzo pubblicato
              e {PZ_FURIA.suRichiesta} è trattato su richiesta. I valori vanno da{" "}
              {eur(PZ_FURIA.minimo)} a {eur(PZ_FURIA.massimo)}, con una media al metro quadro di{" "}
              {eurM2(PZ_FURIA.mediaEurM2)}. La differenza tra media ({eur(PZ_FURIA.prezzoMedio)}) e
              mediana ({eur(PZ_FURIA.prezzoMediano)}) dipende dai pochi immobili di fascia alta, che
              alzano la media senza rappresentare la disponibilità tipica.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[26rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Distribuzione per fascia di prezzo degli immobili Furia in vendita al 28 agosto 2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className="py-3 pr-4 font-normal">Fascia di prezzo</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Immobili</th>
                </tr>
              </thead>
              <tbody>
                {PZ_FASCE.map((f) => (
                  <tr key={f.label} className="border-b border-[var(--terracotta)]/10">
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">{f.label}</th>
                    <td className="py-3 pr-4 tabular-nums text-[var(--ink-soft)]">{f.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
            È disponibilità attuale: cambia ogni volta che un immobile viene venduto o entra in
            portafoglio. L&apos;elenco aggiornato in tempo reale è nella pagina{" "}
            <Link
              to="/immobili"
              data-track="pz_to_immobili_click"
              onClick={() => trackClick("pz_to_immobili_click", { source: "prezzi_lunigiana" })}
              className="text-[var(--terracotta)] underline hover:no-underline"
            >
              immobili in vendita
            </Link>
            .
          </p>
        </div>
      </section>

      {/* BUDGET */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Cosa puoi trovare con 100.000, 150.000, 200.000 e 300.000 euro
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Le indicazioni qui sotto descrivono cosa c&apos;è nel nostro portafoglio al 28 agosto
              2026. Non sono una promessa di disponibilità futura: la composizione cambia di
              settimana in settimana.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PZ_BUDGET.map((b) => (
              <div
                key={b.soglia}
                className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-2xl text-ink">{b.soglia}</h3>
                <p className="mt-3 text-[0.96rem] leading-[1.75] text-[var(--ink-soft)]">{b.intro}</p>
                <p className="mt-3 text-[0.96rem] leading-[1.75] text-[var(--ink-soft)]">
                  {b.composizione}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOLOGIE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Quanto costano appartamenti, case indipendenti, rustici e ville
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Mediane calcolate sul portafoglio Furia al 28 agosto 2026. I campioni sono piccoli —
              in alcuni casi tre o quattro immobili — quindi vanno letti come ordine di grandezza,
              non come quotazione di categoria.
            </p>
          </div>

          <div className="mt-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[36rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">
                Mediane di prezzo per tipologia nel portafoglio Furia al 28 agosto 2026
              </caption>
              <thead>
                <tr className="border-b border-[var(--terracotta)]/25 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <th scope="col" className="py-3 pr-4 font-normal">Tipologia</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Immobili</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Mediana prezzo</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Mediana €/m²</th>
                </tr>
              </thead>
              <tbody>
                {PZ_TIPOLOGIE.map((t) => (
                  <tr key={t.nome} className="border-b border-[var(--terracotta)]/10">
                    <th scope="row" className="py-3 pr-4 font-normal text-ink">
                      {t.slug && tipologieConLanding.has(t.slug) ? (
                        <Link
                          to="/case-in-vendita-lunigiana/$tipologia"
                          params={{ tipologia: t.slug }}
                          data-track="pz_tipologia_click"
                          onClick={() => trackClick("pz_tipologia_click", { tipologia: t.slug })}
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

          <div className="mt-8 max-w-3xl space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Gli appartamenti sono la categoria più rappresentata, con 19 immobili e una mediana di{" "}
              {eur(115000)}: è la soluzione più frequente per chi cerca una casa già pronta in paese.
              Le case indipendenti, sette in portafoglio, hanno una mediana di prezzo più alta ({eur(159000)})
              ma un €/m² più basso ({eurM2(813)}), perché di norma sono più grandi e più spesso da
              sistemare.
            </p>
            <p>
              I rustici — solo tre casi, quindi un campione molto ridotto — partono da cifre basse,
              con mediana {eur(40000)}, ma sono immobili da recuperare: il conto vero si fa sommando
              acquisto e lavori. Ville e semindipendenti stanno nella parte alta della scala, con
              mediane rispettivamente di {eur(240000)} e {eur(225000)} su tre casi ciascuna: numeri
              indicativi, non medie di mercato.
            </p>
          </div>
        </div>
      </section>

      {/* DOVE COSTA MENO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Dove costa meno comprare casa in Lunigiana?
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Secondo la rilevazione di luglio 2026 i prezzi medi richiesti più bassi sono a Zeri
              ({eurM2(559)}), Filattiera ({eurM2(729)}), Casola in Lunigiana ({eurM2(730)}), Mulazzo
              ({eurM2(805)}) e Tresana ({eurM2(809)}). Pontremoli, che è il centro più grande e
              servito della valle alta, resta su {eurM2(866)}: un dato interessante, perché unisce
              quotazioni contenute e servizi cittadini.
            </p>
            <p>
              Il prezzo più basso, però, non è automaticamente la scelta migliore. Zeri è splendida
              e autentica, ma è montagna vera: distanze maggiori, inverni impegnativi, meno servizi
              a portata di mano. Casola e Comano guardano al versante appenninico dell&apos;alta
              valle del Taverone, con logiche diverse dal fondovalle. In generale, dove il valore è
              più basso c&apos;è più spesso da ristrutturare, e la spesa si sposta dall&apos;acquisto
              ai lavori.
            </p>
            <p>
              Il criterio che suggeriamo è semplice: prima si definiscono servizi indispensabili,
              tempi di spostamento accettabili e disponibilità reale per i lavori, poi si guarda
              dove il proprio budget rende di più. È l&apos;approccio del percorso guidato{" "}
              <Link
                to="/trova-casa-lunigiana"
                data-track="pz_to_trova_click"
                onClick={() => trackClick("pz_to_trova_click", { source: "prezzi_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                trova casa in Lunigiana
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CONSIGLI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Come leggere questi dati prima di comprare
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Sette accortezze che, nel nostro lavoro, evitano la maggior parte delle sorprese.
            </p>
          </div>
          <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PZ_CONSIGLI.map((item, i) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-5"
              >
                <span className="mt-0.5 shrink-0 font-serif text-lg text-[var(--terracotta)]">
                  {i + 1}
                </span>
                <span className="text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                  <strong className="font-medium text-ink">{item.title}.</strong> {item.body}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* METODOLOGIA E FONTI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Metodologia e fonti</h2>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              I valori comune per comune provengono da {PZ_SOURCE.externalName}, rilevazione{" "}
              {PZ_SOURCE.externalPeriod}, e riguardano i quattordici comuni della Lunigiana. Sono
              prezzi medi <strong className="font-medium text-ink">richiesti</strong> dagli annunci
              in vendita: descrivono l&apos;offerta pubblicata, non i prezzi finali degli atti
              notarili, che non sono pubblici in forma disaggregata.
            </p>
            <p>
              I dati sul portafoglio derivano dal nostro database immobili, con estrazione al 28
              agosto 2026 limitata agli annunci pubblicati, in vendita ed esclusa Massa: 44 immobili
              attivi, di cui 43 con prezzo numerico e 1 su richiesta. Medie e mediane per tipologia
              sono calcolate su campioni ridotti (in diversi casi tre o quattro immobili) e non sono
              rappresentative dell&apos;intero mercato della Lunigiana.
            </p>
            <p>
              Le due fonti non sono confrontabili in modo diretto: la prima misura l&apos;offerta di
              tutti gli operatori su base comunale, la seconda descrive un portafoglio specifico.
              Entrambe fotografano un momento e cambiano nel tempo.
            </p>
            <p>
              Fonte esterna:{" "}
              <a
                href={PZ_SOURCE.externalUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-[var(--terracotta)] underline hover:no-underline"
              >
                Immobiliare.it, mercato immobiliare provincia di Massa-Carrara
                <ExternalLink size={12} />
              </a>
              . Dati proprietari: {PZ_SOURCE.internalLabel}.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Da dove partire</h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Se avete un budget in mente, il passo successivo è vedere cosa corrisponde davvero. Se
            invece state pensando di vendere, una valutazione basata sulla zona e sullo stato reale
            dell&apos;immobile è più utile di qualsiasi media.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/immobili"
              data-track="pz_cta_immobili"
              onClick={() => trackClick("pz_cta_immobili", { source: "prezzi_lunigiana" })}
              className="inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              Vedi gli immobili in vendita <ArrowRight size={14} />
            </Link>
            <Link
              to="/trova-casa-lunigiana"
              data-track="pz_cta_trova"
              onClick={() => trackClick("pz_cta_trova", { source: "prezzi_lunigiana" })}
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--terracotta)]/40 px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] transition hover:bg-[var(--cream)]"
            >
              Trova la tua casa ideale
            </Link>
            <Link
              to="/valuta-casa"
              data-track="pz_cta_valuta"
              onClick={() => trackClick("pz_cta_valuta", { source: "prezzi_lunigiana" })}
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--terracotta)]/40 px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--terracotta)] transition hover:bg-[var(--cream)]"
            >
              Valuta la tua casa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
