import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { siteUrl } from "@/lib/site-url";

const PAGE_URL = siteUrl("/mulini-storici-lunigiana");
const TITLE = "Mulini storici della Lunigiana: dove vederli | Furia Immobiliare";
const DESC =
  "Guida ai mulini ad acqua della Lunigiana: Arlia a Fivizzano, i mulini di Filattiera e cosa sapere se cerchi un rustico vicino a un torrente. Fonti verificate.";

const MILLS = [
  {
    name: "Antico Mulino di Arlia",
    place: "Arlia, comune di Fivizzano",
    text: "Mulino ad acqua a ruota orizzontale sul torrente Rosaro, attivo almeno dal XIX secolo e rimasto in uso fino al 1968. Conserva tre macine in pietra: castagne, grano e granturco. Restaurato dall'ente montano della Lunigiana, ha di nuovo il meccanismo idraulico funzionante e ospita una mostra didattica sui mulini del territorio. Apertura su richiesta al Comune di Fivizzano e durante le dimostrazioni di macinatura.",
    sources: [
      { label: "Museo Galileo", href: "https://brunelleschi.imss.fi.it/itinerari/luogo/AnticoMulinoArlia.html" },
      { label: "Lunigiana World", href: "https://www.lunigianaworld.it/attivita-turistiche-lunigiana/mulini/mulino-di-arlia/" },
    ],
  },
  {
    name: "Mulini di Filattiera",
    place: "Piana di Filattiera e Rocca Sigillina",
    text: "Filattiera è tra i comuni dove si trovano ancora mulini in uso: nella piana verso il Magra un mulino ad acqua macina ancora grano e castagne con macine in pietra, e alle pendici dell'Appennino si trova l'antico mulino di Rocca Sigillina.",
    sources: [
      { label: "Lunigiana World – Mulini", href: "https://www.lunigianaworld.it/lunigiana/attivita-turistiche-lunigiana/mulini/" },
      { label: "Mulino Moscatelli", href: "https://agriturismomulinomoscatelli2.webnode.it/il-mulino/" },
    ],
  },
  {
    name: "Mulini nei boschi e lungo i torrenti",
    place: "Tutta la Lunigiana",
    text: "In un territorio di torrenti e cascate quasi ogni località aveva il suo mulino, usato fino agli anni '60-'70 per trasformare castagne, grano e granturco in farina. Tra gli esempi documentati: il mulino del torrente Scervola (inciso 1872), i Mulini di Marzo di fine Ottocento e il mulino del Canale Trauri.",
    sources: [{ label: "Lunigiana World – Mulini", href: "https://www.lunigianaworld.it/lunigiana/attivita-turistiche-lunigiana/mulini/" }],
  },
];

const FAQ = [
  {
    q: "Dove si può vedere un mulino ad acqua funzionante in Lunigiana?",
    a: "L'Antico Mulino di Arlia, vicino a Fivizzano, è stato restaurato con il meccanismo idraulico di nuovo funzionante ed è visitabile su richiesta al Comune. A Filattiera ci sono mulini ancora in attività.",
  },
  {
    q: "Cosa si macinava nei mulini della Lunigiana?",
    a: "Soprattutto castagne, grano e granturco: ad Arlia ognuno aveva la sua macina dedicata. La farina di castagne era un alimento base delle comunità di montagna.",
  },
  {
    q: "Si può comprare un vecchio mulino o un rustico vicino a un torrente?",
    a: "A volte compaiono in vendita rustici e casali in pietra vicino ai corsi d'acqua. Prima di un'offerta conviene far verificare a un tecnico la situazione urbanistica e catastale, l'accesso, i vincoli e il rischio idraulico della zona, ed eventuali diritti sull'acqua. Furia Immobiliare può aiutarti a impostare queste verifiche.",
  },
];

export const Route = createFileRoute("/mulini-storici-lunigiana")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Mulini storici della Lunigiana: dove vederli",
          description: DESC,
          inLanguage: "it-IT",
          url: PAGE_URL,
          dateModified: "2026-11-16",
          author: { "@type": "Organization", name: "Furia Immobiliare" },
          about: MILLS.map((m) => ({ "@type": "Place", name: m.name, address: m.place })),
          citation: MILLS.flatMap((m) => m.sources.map((s) => s.href)),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Territori", item: siteUrl("/territori") },
            { "@type": "ListItem", position: 3, name: "Mulini storici", item: PAGE_URL },
          ],
        }),
      },
    ],
  }),
  component: MuliniPage,
});

function MuliniPage() {
  return (
    <>
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/territori" className="hover:text-[var(--terracotta)]">Territori</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Mulini storici</span>
          </nav>
          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <MapPin size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Lunigiana</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            Mulini storici della Lunigiana: dove vederli
          </h1>
          <p className="mt-7 max-w-2xl text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            In breve: il mulino più facile da visitare è l'Antico Mulino di Arlia, vicino a Fivizzano,
            restaurato e di nuovo funzionante; a Filattiera alcuni mulini ad acqua macinano ancora.
            Per secoli questi edifici in pietra lungo i torrenti hanno trasformato castagne, grano e
            granturco nella farina delle comunità di montagna.
          </p>
        </div>
      </section>

      <section className="bg-[var(--warm-ivory)] py-20">
        <div className="container-editorial max-w-3xl space-y-10">
          {MILLS.map((m) => (
            <article key={m.name}>
              <h2 className="font-serif text-3xl text-ink">{m.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--terracotta)]">{m.place}</p>
              <p className="mt-4 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">{m.text}</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                Fonti:{" "}
                {m.sources.map((s, i) => (
                  <span key={s.href}>
                    {i > 0 && ", "}
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[var(--terracotta)] underline hover:no-underline">{s.label}</a>
                  </span>
                ))}
              </p>
            </article>
          ))}
          <p className="text-sm text-[var(--ink-soft)]">
            Orari e aperture cambiano: verifica sempre con il Comune o il gestore prima di andare. Informazioni controllate il 16/11/2026.
          </p>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-20">
        <div className="container-editorial max-w-3xl">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Domande frequenti</h2>
          <div className="mt-8 space-y-8">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-serif text-xl text-ink">{f.q}</h3>
                <p className="mt-2 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[1rem] leading-[1.8] text-[var(--ink-soft)]">
            Cerchi una casa in pietra in un contesto simile? Guarda i{" "}
            <Link to="/case-in-vendita-lunigiana/$tipologia" params={{ tipologia: "rustici-casali" }} className="text-[var(--terracotta)] underline hover:no-underline">rustici e casali in vendita</Link>, la guida{" "}
            <Link to="/vivere-in-lunigiana" className="text-[var(--terracotta)] underline hover:no-underline">vivere in Lunigiana</Link>{" "}
            oppure{" "}
            <Link to="/contatti" className="text-[var(--terracotta)] underline hover:no-underline">contattaci</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
