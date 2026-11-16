import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { siteUrl } from "@/lib/site-url";
import { bonfireDateLabel, pontremoliEventCalendar as calendar } from "@/lib/pontremoli-event-calendar";

const PAGE_URL = siteUrl("/eventi-pontremoli");
const TITLE = `Eventi a Pontremoli ${calendar.year}: falò, Bancarella e Medievalis | Furia Immobiliare`;
const DESC =
  `Eventi a Pontremoli ${calendar.year}: date tradizionali dei falò di gennaio, Premio Bancarella e Medievalis. Programmi e date dell'edizione ancora da confermare, con fonti.`;

const MILLS = [
  {
    name: "Disfida dei falò",
    place: `Date tradizionali · ${bonfireDateLabel} · programma da confermare`,
    text: "L'antica rivalità tra le parrocchie di San Nicolò e San Geminiano si accende ogni gennaio. Il 17 gennaio brucia il falò di San Nicolò sulle sponde del Magra; il 31 gennaio, festa del patrono, quello di San Geminiano sotto il ponte della Cresa, accanto al torrente Verde. Il 13 gennaio si accende il falò più piccolo di Sant'Ilario, accanto all'omonima chiesa. I gruppi lavorano per mesi a raccogliere le fascine e migliaia di persone arrivano in città.",
    sources: [
      { label: "Visit Pontremoli", href: "https://visitpontremoli.it/vivi-pontremoli/manifestazioni/" },
      { label: "Visit Tuscany", href: "https://www.visittuscany.com/it/eventi/disfida-dei-falo/" },
    ],
  },
  {
    name: "Premio Bancarella",
    place: `Tradizionalmente a luglio · date ${calendar.year} non ancora annunciate nelle fonti consultate`,
    text: "Premio letterario nato nel 1953 a Mulazzo per celebrare i librai ambulanti della Lunigiana, che giravano l'Italia vendendo libri. Si svolge ogni anno a Pontremoli: il centro storico, all'ombra del Campanone, si anima con incontri tra autori, librai e lettori che vanno oltre la serata finale.",
    sources: [{ label: "Fondazione Città del Libro", href: "https://www.fondazionecittadellibro.it/" }],
  },
  {
    name: "Medievalis",
    place: `Tradizionalmente ad agosto · date ${calendar.year} non ancora annunciate nelle fonti consultate`,
    text: "Rievocazione storica che ricorda il diploma di Libero Comune concesso a Pontremoli da Federico II nel 1226. Il centro storico ospita figuranti, mercanti, carrozze e cavalieri. La organizza la Compagnia del Piagnaro. Durata, programma e limitazioni al traffico dell'edizione 2027 sono da verificare con gli organizzatori.",
    sources: [{ label: "Medievalis", href: "https://www.medievalis.eu/" }],
  },
];

const FAQ = [
  {
    q: "Qual è l'evento più famoso di Pontremoli?",
    a: "I più conosciuti sono la Disfida dei falò di gennaio, che richiama migliaia di persone, e il Premio Bancarella, premio letterario nazionale assegnato ogni estate in città.",
  },
  {
    q: "Quando si fanno i falò di Pontremoli nel 2027?",
    a: `Le date tradizionali sono il ${bonfireDateLabel}: Sant'Ilario il 13, San Nicolò il 17 e San Geminiano il 31. Sono ricorrenze annuali, non un programma 2027 confermato: verifica orari ed eventuali variazioni con gli organizzatori.`,
  },
  {
    q: "Sono già disponibili le date 2027 del Premio Bancarella e di Medievalis?",
    a: "Al 16 novembre 2026, le fonti ufficiali consultate non riportano le date delle edizioni 2027. Il Bancarella si svolge tradizionalmente a luglio e Medievalis ad agosto: questi mesi non costituiscono conferma del calendario 2027.",
  },
  {
    q: "Conviene comprare casa vicino al centro storico per vivere gli eventi?",
    a: "Abitare in centro significa avere feste ed eventi a pochi passi, ma anche più movimento e limiti al traffico in quei giorni (durante Medievalis le auto lasciano il centro). Chi preferisce la quiete può scegliere le frazioni collinari, a pochi minuti dalla città. Furia Immobiliare può aiutarti a valutare la zona giusta.",
  },
];

export const Route = createFileRoute("/eventi-pontremoli")({
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
          headline: `Eventi a Pontremoli ${calendar.year}`,
          description: DESC,
          inLanguage: "it-IT",
          url: PAGE_URL,
          dateModified: calendar.checkedOn,
          author: { "@type": "Organization", name: "Furia Immobiliare" },
          about: MILLS.map((m) => ({ "@type": "Thing", name: m.name, description: m.place })),
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
            { "@type": "ListItem", position: 3, name: "Eventi a Pontremoli", item: PAGE_URL },
          ],
        }),
      },
    ],
  }),
  component: EventiPage,
});

function EventiPage() {
  return (
    <>
      <section className="bg-[var(--cream)] pb-12 pt-28 md:pt-36">
        <div className="container-editorial">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            <Link to="/" className="hover:text-[var(--terracotta)]">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link to="/territori" className="hover:text-[var(--terracotta)]">Territori</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">Eventi a Pontremoli</span>
          </nav>
          <div className="mt-8 flex items-center gap-2 text-[var(--terracotta)]">
            <MapPin size={18} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.24em]">Pontremoli</span>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            Eventi a Pontremoli {calendar.year}
          </h1>
          <p className="mt-7 max-w-2xl text-[1.02rem] leading-[1.8] text-[var(--ink-soft)]">
            Nel 2027 le ricorrenze tradizionali dei falò cadono il {bonfireDateLabel}. Il Premio Bancarella si tiene abitualmente a luglio e Medievalis ad agosto, ma le date delle edizioni 2027 non risultano ancora annunciate nelle fonti ufficiali consultate. Anche il programma dei falò è da confermare.
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
            Calendario 2027 in attesa dei programmi ufficiali. Le date tradizionali non garantiscono lo svolgimento: verifica sempre con gli organizzatori prima di andare. Fonti consultate il 16/11/2026; le date 2026 non sono riportate come appuntamenti futuri.
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
            Ti piace l’idea di vivere qui? Guarda le{" "}
            <Link to="/case-in-vendita/$comune" params={{ comune: "pontremoli" }} className="text-[var(--terracotta)] underline hover:no-underline">case in vendita a Pontremoli</Link>, la guida{" "}
            <Link to="/vivere-a-pontremoli" className="text-[var(--terracotta)] underline hover:no-underline">vivere a Pontremoli</Link>{" "}
            oppure{" "}
            <Link to="/contatti" className="text-[var(--terracotta)] underline hover:no-underline">contattaci</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
