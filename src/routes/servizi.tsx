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
      <section className="relative overflow-hidden bg-[var(--cream)] pb-24 pt-32 md:pt-40">
        {/* Soft watermark decorations */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 260"
          className="pointer-events-none absolute left-0 top-16 hidden h-64 w-auto opacity-[0.18] md:block"
          fill="none"
          stroke="var(--terracotta)"
          strokeWidth="0.7"
        >
          <path d="M20 220 L60 220 L60 150 L90 130 L90 90 L110 75 L130 90 L130 130 L160 150 L160 200 L200 200 L200 160 L230 140 L260 160 L260 220 L380 220" />
          <path d="M80 150 L80 130 M100 120 L100 100 M150 150 L150 130 M210 200 L210 180 M240 220 L240 190" />
          <path d="M105 75 L110 60 L115 75" />
          <circle cx="112" cy="58" r="1.5" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 300 300"
          className="pointer-events-none absolute right-0 top-10 hidden h-80 w-auto opacity-[0.16] md:block"
          fill="none"
          stroke="var(--terracotta)"
          strokeWidth="0.8"
        >
          <path d="M260 20 Q200 80 180 180 Q170 240 190 290" />
          <path d="M220 80 Q180 90 170 130 Q200 120 230 100 Z" />
          <path d="M205 140 Q165 150 155 190 Q190 180 220 160 Z" />
          <path d="M195 200 Q155 210 145 250 Q180 240 210 220 Z" />
        </svg>

        <div className="container-editorial relative">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex h-16 w-12 items-center justify-center rounded-t-[28px] border border-[var(--terracotta)]/40 bg-[var(--warm-ivory)]/60 font-serif text-[1rem] tracking-[0.12em] text-[var(--terracotta)]">
              FI
            </div>
            <h1 className="font-serif text-5xl leading-tight text-ink md:text-6xl">
              I nostri servizi
            </h1>
            <div className="mx-auto mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-[var(--terracotta)]/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[var(--terracotta)]" />
              <span className="h-px w-16 bg-[var(--terracotta)]/50" />
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
              Un metodo su misura, radicato nella Lunigiana. Ogni servizio è
              pensato per offrirti chiarezza, cura e risultati concreti, in ogni
              fase del tuo percorso immobiliare.
            </p>
          </div>

          {/* Grid */}
          <div className="mt-24 grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.title}
                className="group relative rounded-2xl border border-[var(--terracotta)]/10 bg-[var(--warm-ivory)]/70 px-7 pb-10 pt-16 text-center shadow-[0_18px_40px_-28px_rgba(36,23,17,0.35)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(36,23,17,0.45)]"
              >
                {/* Floating icon badge */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--terracotta)]/25 bg-[var(--cream)] shadow-[0_8px_20px_-10px_rgba(183,106,76,0.5)]">
                    <s.icon size={26} strokeWidth={1.4} className="text-[var(--terracotta)]" />
                  </div>
                </div>

                <h3 className="font-serif text-[1.55rem] leading-snug text-ink">
                  {s.title}
                </h3>
                <span className="mx-auto mt-4 block h-px w-12 bg-[var(--terracotta)]/60" />
                <p className="mx-auto mt-5 max-w-[28ch] text-[0.95rem] leading-[1.75] text-[var(--ink-soft)]">
                  {s.body}
                </p>

                {/* Bottom decorative bar */}
                <span className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--terracotta)]/60 to-transparent" />
              </article>
            ))}
          </div>

          {/* Editorial footer mark */}
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 60 20"
              className="h-5 w-14 text-[var(--terracotta)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M5 10 Q15 2 30 10 Q45 18 55 10" />
              <circle cx="30" cy="10" r="1.2" fill="currentColor" />
            </svg>
            <div className="flex items-center gap-4">
              <span className="h-px w-20 bg-[var(--terracotta)]/40" />
              <span className="font-serif text-sm uppercase tracking-[0.32em] text-[var(--ink-soft)]">
                Furia Immobiliare · Lunigiana
              </span>
              <span className="h-px w-20 bg-[var(--terracotta)]/40" />
            </div>
          </div>
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