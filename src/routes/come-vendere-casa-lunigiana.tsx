import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ExternalLink, KeyRound } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { AGENCY_ID, WEBSITE_ID } from "@/lib/structured-data";
import {
  VCL_CHECKLIST,
  VCL_ERRORI,
  VCL_FONTI,
  VCL_META,
  VCL_STEPS,
} from "@/lib/vendere-casa-lunigiana";
import { trackClick } from "@/lib/analytics";

const PAGE_URL = siteUrl("/come-vendere-casa-lunigiana");

export const Route = createFileRoute("/come-vendere-casa-lunigiana")({
  head: () => {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Servizi", item: siteUrl("/servizi") },
        {
          "@type": "ListItem",
          position: 3,
          name: "Come vendere casa in Lunigiana",
          item: PAGE_URL,
        },
      ],
    };
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: VCL_META.h1,
      description: VCL_META.description,
      inLanguage: "it-IT",
      datePublished: VCL_META.isoDate,
      dateModified: VCL_META.isoDate,
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
      name: VCL_META.title,
      description: VCL_META.description,
      inLanguage: "it-IT",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      datePublished: VCL_META.isoDate,
      dateModified: VCL_META.isoDate,
    };
    return {
      meta: [
        { title: VCL_META.title },
        { name: "description", content: VCL_META.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: VCL_META.title },
        { property: "og:description", content: VCL_META.description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: VCL_META.title },
        { name: "twitter:description", content: VCL_META.description },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webPageLd) },
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: ComeVendereCasaPage,
});

function ComeVendereCasaPage() {
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
            <Link to="/servizi" className="hover:text-[var(--terracotta)]">Servizi</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Come vendere casa in Lunigiana</span>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <KeyRound size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Guida per chi vende</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {VCL_META.h1}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {VCL_META.updatedLabel}
          </p>

          <div className="mt-7 max-w-2xl space-y-5 text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Vendere bene non significa soltanto pubblicare un annuncio. Nella pratica conviene
              partire da tre cose:{" "}
              <strong className="font-medium text-ink">un prezzo richiesto realistico</strong>, la{" "}
              <strong className="font-medium text-ink">documentazione ordinata</strong> e una{" "}
              <strong className="font-medium text-ink">presentazione onesta dell&apos;immobile</strong>.
              Se questi tre pezzi sono a posto, tutto il resto diventa più semplice.
            </p>
            <p>
              Qui trovi una spiegazione discorsiva dei passaggi, di cosa vale la pena controllare
              prima di far entrare qualcuno in casa e di come si ragiona sul prezzo. È una guida
              informativa: obblighi e documenti dipendono dal caso concreto e dalla normativa
              applicabile, quindi gli aspetti notarili, fiscali, tecnici o legali vanno verificati
              con i professionisti competenti.
            </p>
          </div>

          <div className="mt-9">
            <Link
              to="/valuta-casa"
              onClick={() => trackClick("vcl_hero_valuta_click", { source: "come_vendere_lunigiana" })}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              Richiedi una valutazione <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 PASSAGGI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              I sette passaggi, dall&apos;idea al rogito
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              L&apos;ordine conta più di quanto sembri: molti problemi nascono dall&apos;aver fatto
              una cosa giusta nel momento sbagliato. I tempi, invece, dipendono da immobile, zona e
              momento: non esiste una durata media che valga per tutti.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2">
            {VCL_STEPS.map((s, i) => (
              <li
                key={s.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--terracotta)]/15 bg-[var(--cream)] p-6"
              >
                <span className="mt-0.5 shrink-0 font-serif text-lg text-[var(--terracotta)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-lg leading-snug text-ink">{s.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CHECKLIST DOCUMENTI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Prima di mettere la casa in vendita: cosa controllare
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Non è un elenco di obblighi validi per tutti: è una traccia pratica. Alcune voci non
              riguarderanno la tua casa, altre potrebbero richiedere l&apos;intervento di un tecnico.
              Il Notariato stesso ricorda che la documentazione dipende dal caso e che le liste
              generali non sono esaustive: la verifica va fatta con notaio e, dove serve, con un
              tecnico abilitato.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {VCL_CHECKLIST.map((c) => (
              <li
                key={c.title}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-lg leading-snug text-ink">{c.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{c.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-3xl text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">
            In alcuni casi può essere utile far predisporre una relazione tecnica di tipo
            urbanistico-catastale, che raccoglie in un unico documento la situazione dell&apos;immobile.
            È uno strumento di tutela possibile, non un obbligo generalizzato: se abbia senso o no
            dipende dall&apos;immobile e va valutato con il notaio e con il tecnico.
          </p>
        </div>
      </section>

      {/* PERCHÉ IN LUNIGIANA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Perché in Lunigiana conviene controllare i documenti prima
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Non perché qui ci sia qualcosa di diverso dal resto d&apos;Italia, ma per la varietà
              degli immobili. In poche settimane possiamo trovarci davanti a una casa di borgo con i
              muri in pietra, a un edificio storico nel centro di Pontremoli, a un rustico con
              terreno e piccoli fabbricati accessori, a un appartamento ristrutturato di recente e a
              una casa rimasta come era negli anni Settanta.
            </p>
            <p>
              Immobili così diversi hanno storie documentali diverse: passaggi di successione,
              interventi realizzati in epoche differenti, corti e orti censiti a parte,
              fabbricati accessori nati con destinazioni cambiate nel tempo. Ricostruire con calma
              consistenza, particelle e interventi non è un adempimento burocratico: è quello che
              permette di rispondere con precisione quando un acquirente fa domande.
            </p>
            <p>
              Il momento giusto per farlo è prima di iniziare le visite, non dopo aver ricevuto una
              proposta.
            </p>
          </div>
        </div>
      </section>

      {/* PREZZO RICHIESTO */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Come scegliere il prezzo richiesto
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Il prezzo medio al metro quadro di un comune è un punto di partenza, non una
              risposta. Dentro quella media convivono case molto diverse: moltiplicare i metri
              quadri per un valore medio produce un numero, non una valutazione.
            </p>
            <p>
              Quello che guardiamo, invece, è il confronto con immobili simili nella stessa
              microzona, la tipologia, lo stato reale, gli spazi esterni, la presenza di garage o
              posto auto, cosa è in vendita oggi nella stessa fascia e quale pubblico cerca quel
              tipo di casa. Tipologie diverse possono rivolgersi a pubblici diversi e avere livelli
              di domanda differenti.
            </p>
            <p>
              Se vuoi approfondire i numeri pubblici del territorio, abbiamo tre pagine dedicate:{" "}
              <Link
                to="/quanto-vale-casa-pontremoli"
                onClick={() => trackClick("vcl_to_quanto_vale", { source: "come_vendere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                quanto vale una casa a Pontremoli
              </Link>
              ,{" "}
              <Link
                to="/prezzi-case-lunigiana"
                onClick={() => trackClick("vcl_to_prezzi", { source: "come_vendere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                i prezzi delle case in Lunigiana
              </Link>{" "}
              e l&apos;{" "}
              <Link
                to="/osservatorio-immobiliare-lunigiana"
                onClick={() => trackClick("vcl_to_osservatorio", { source: "come_vendere_lunigiana" })}
                className="text-[var(--terracotta)] underline hover:no-underline"
              >
                Osservatorio Immobiliare Lunigiana
              </Link>
              . Servono a capire il contesto: la richiesta della tua casa si costruisce sui suoi
              dati specifici e, quando possibile, dopo un sopralluogo.
            </p>
          </div>
        </div>
      </section>

      {/* PRESENTAZIONE */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Presentare bene la casa senza nasconderne i difetti
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              Una casa presentata bene è una casa raccontata con chiarezza. Fotografie fatte con
              luce buona e stanze in ordine, una planimetria leggibile quando è disponibile, una
              descrizione che spieghi com&apos;è distribuita la casa, cosa è stato fatto e cosa
              resta da fare.
            </p>
            <p>
              I lavori da fare non vanno nascosti: chi cerca una casa da sistemare esiste, e
              scoprire in visita qualcosa che l&apos;annuncio non diceva fa perdere fiducia. Meglio
              dirlo prima, con parole semplici.
            </p>
            <p>
              Quando usiamo rendering o visualizzazioni per mostrare il potenziale di una casa da
              ristrutturare, lo dichiariamo sempre: sono{" "}
              <strong className="font-medium text-ink">ipotesi progettuali</strong>, non lo stato
              attuale dell&apos;immobile. Le fotografie dello stato reale restano sempre presenti e
              distinte. È una regola che teniamo ferma, perché confondere le due cose danneggia
              prima di tutto il proprietario.
            </p>
          </div>
        </div>
      </section>

      {/* PUBBLICA O OFF MARKET */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Vendita pubblica o off market?
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Sono due modi diversi di gestire l&apos;esposizione, non uno migliore dell&apos;altro.
              La scelta dipende dall&apos;immobile e da quanta visibilità vuoi dargli.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7">
              <h3 className="font-serif text-xl text-ink">Vendita pubblica</h3>
              <p className="mt-3 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">
                Massima esposizione: sito, portali, canali social, richieste che arrivano anche da
                chi non conosceva la zona. È la modalità con la maggiore esposizione quando si vuole
                raggiungere un pubblico ampio.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7">
              <h3 className="font-serif text-xl text-ink">Vendita off market</h3>
              <p className="mt-3 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">
                Diffusione più riservata, verso contatti selezionati. Può essere una scelta
                pertinente per proprietà particolari o per chi preferisce non dare ampia esposizione
                al proprio immobile. È un modo diverso di gestire la riservatezza, non una promessa
                di risultato.
              </p>
              <Link
                to="/off-market"
                onClick={() => trackClick("vcl_to_offmarket", { source: "come_vendere_lunigiana" })}
                className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[var(--terracotta)] hover:underline"
              >
                Scopri Furia Off Market <ArrowRight size={13} className="shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OFFERTA */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">
            Cosa succede quando arriva un&apos;offerta
          </h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            <p>
              In termini semplici: chi vuole comprare formula una proposta, con un prezzo e delle
              condizioni. Se la proposta viene accettata, le parti sono impegnate e si entra in una
              fase con effetti giuridici veri.
            </p>
            <p>
              Da lì il percorso può passare per un contratto preliminare — l&apos;accordo scritto
              che precede l&apos;atto definitivo e che, quando concluso, è soggetto a registrazione
              secondo la disciplina vigente — oppure andare direttamente verso l&apos;atto, a seconda
              del caso e di come sono impostati tempi e condizioni.
            </p>
            <p>
              Si chiude davanti al notaio, con il rogito. Il notaio svolge le proprie verifiche,
              comprese quelle catastali e ipotecarie, e nell&apos;atto trovano posto i dati
              catastali e il riferimento alle planimetrie con la dichiarazione di conformità allo
              stato di fatto.
            </p>
            <p>
              Contenuti, termini e conseguenze di ogni passaggio vanno verificati con il notaio e
              con i professionisti coinvolti: qui non trovi modelli di contratto né indicazioni
              fiscali, perché dipendono dal caso concreto.
            </p>
          </div>
        </div>
      </section>

      {/* ERRORI */}
      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Gli errori pratici che possono complicare una vendita
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
              Non sono statistiche: sono situazioni che nel lavoro quotidiano vediamo creare
              attriti evitabili.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {VCL_ERRORI.map((e) => (
              <li
                key={e.title}
                className="rounded-xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-6"
              >
                <h3 className="font-serif text-lg leading-snug text-ink">{e.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.7] text-[var(--ink-soft)]">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="container-editorial py-20">
        <div className="rounded-sm bg-ink px-6 py-14 text-center text-cream md:px-16 md:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Stai pensando di vendere?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/85">
            Raccontaci la casa in pochi passaggi: comune, tipologia, superficie, stato e spazi
            esterni. Ti ricontattiamo per capire i dettagli e, quando serve, fissare un sopralluogo
            prima di ragionare su una fascia di prezzo.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/valuta-casa"
              onClick={() => trackClick("vcl_cta_valuta_click", { source: "come_vendere_lunigiana" })}
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
          <p className="mx-auto mt-7 max-w-xl text-[0.85rem] leading-relaxed text-cream/70">
            Se la casa è a Pontremoli puoi partire da{" "}
            <Link to="/quanto-vale-casa-pontremoli" className="underline hover:no-underline">
              quanto vale una casa a Pontremoli
            </Link>
            ; se preferisci una vendita riservata, guarda{" "}
            <Link to="/off-market" className="underline hover:no-underline">
              Furia Off Market
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FONTI */}
      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Fonti e nota metodologica</h2>
          <p className="mt-5 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Questa guida è informativa e descrive prassi operative. Obblighi, documenti e
            adempimenti dipendono dal caso concreto, dall&apos;immobile e dalla normativa
            applicabile, e possono variare anche per prassi territoriale: per gli aspetti notarili,
            fiscali, tecnici o legali va coinvolto il professionista competente. Non forniamo
            consulenza legale, notarile o fiscale.
          </p>
          <ul className="mt-8 space-y-5">
            {VCL_FONTI.map((f) => (
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
            {VCL_META.updatedLabel}. I riferimenti normativi e le prassi possono cambiare nel
            tempo: verifica sempre le fonti aggiornate e il tuo caso specifico con i professionisti
            coinvolti.
          </p>
        </div>
      </section>
    </>
  );
}
