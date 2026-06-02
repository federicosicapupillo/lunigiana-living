import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, KeyRound, Sparkles, FileSearch, Home, Handshake } from "lucide-react";

export const Route = createFileRoute("/servizi")({
  head: () => ({
    meta: [
      { title: "Servizi — Furia Immobiliare in Lunigiana" },
      { name: "description", content: "Ricerca su misura, consulenza, valutazioni, assistenza alla vendita e accompagnamento all'acquisto in Lunigiana." },
      { property: "og:title", content: "Servizi — Furia Immobiliare" },
      { property: "og:description", content: "Un servizio sartoriale, una conoscenza locale." },
    ],
    links: [{ rel: "canonical", href: "/servizi" }],
  }),
  component: ServiziPage,
});

const services = [
  { icon: Compass, title: "Ricerca su misura", body: "Comprendiamo il tuo progetto di vita: famiglia, lavoro, ritmi, panorami. Poi cerchiamo la casa che lo accoglie." },
  { icon: Home, title: "Vendita di immobili", body: "Valorizziamo il tuo immobile con fotografia curata, racconto editoriale e una rete di acquirenti reali." },
  { icon: KeyRound, title: "Accompagnamento all'acquisto", body: "Dalla prima visita al rogito notarile: ti guidiamo in ogni passaggio tecnico e burocratico." },
  { icon: Sparkles, title: "Valutazioni immobiliari", body: "Stime trasparenti, basate sul mercato reale della Lunigiana, non su algoritmi generici." },
  { icon: FileSearch, title: "Consulenza pre-acquisto", body: "Verifichiamo per te documenti, conformità urbanistiche e potenzialità di ristrutturazione." },
  { icon: Handshake, title: "Affitti selezionati", body: "Una piccola selezione di immobili in locazione, per chi vuole conoscere la Lunigiana prima di comprare." },
];

function ServiziPage() {
  return (
    <>
      <section className="border-b border-border bg-muted/30 pb-16 pt-32 md:pt-40">
        <div className="container-editorial">
          <span className="eyebrow">Servizi</span>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight text-ink md:text-6xl">
            Un'agenzia che parte<br />dalle persone, non dalle case.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/75">
            Ogni cliente arriva da noi con una storia diversa. Il nostro lavoro
            è ascoltarla, e tradurla in una casa che abbia senso.
          </p>
        </div>
      </section>

      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="border-t border-border pt-7">
              <s.icon size={24} className="text-primary" />
              <h3 className="mt-5 font-serif text-2xl text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial pb-32">
        <div className="rounded-sm bg-ink px-8 py-20 text-center text-cream md:px-16">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl md:text-5xl">
            Parliamone, senza fretta.
          </h2>
          <Link to="/contatti"
            className="mt-8 inline-block rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink">
            Prenota una consulenza
          </Link>
        </div>
      </section>
    </>
  );
}