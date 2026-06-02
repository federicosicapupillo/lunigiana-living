import { createFileRoute, Link } from "@tanstack/react-router";
import elenaAsset from "@/assets/elena-furia.png.asset.json";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — Furia Immobiliare, Pontremoli" },
      { name: "description", content: "Dietro Furia Immobiliare c'è Elena: un volto, una voce e una presenza costante per chi sceglie casa in Lunigiana. Consulenze personalizzate e assistenza completa." },
      { property: "og:title", content: "Chi siamo — Furia Immobiliare" },
      { property: "og:description", content: "Crediamo che una casa non sia solo metri quadri, ma un pezzo di vita. Mettiamo al centro le persone prima degli immobili." },
    ],
    links: [{ rel: "canonical", href: "/chi-siamo" }],
  }),
  component: ChiSiamoPage,
});

function ChiSiamoPage() {
  return (
    <>
      <section className="container-editorial grid items-center gap-12 pb-20 pt-32 md:grid-cols-12 md:gap-16 md:pt-40">
        <div className="md:col-span-6 lg:col-span-7">
          <span className="eyebrow">Chi siamo</span>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-ink md:text-6xl lg:text-7xl">
            Una casa non si sceglie<br />
            <em className="font-normal italic">solo con gli occhi.</em>
          </h1>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
            <p>
              Furia Immobiliare nasce da un legame profondo con la Lunigiana:
              i suoi borghi, i suoi silenzi, le sue colline e quel modo di
              vivere più lento, autentico e umano.
            </p>
            <p>
              Accompagniamo chi cerca una casa non solo a trovare un immobile,
              ma a riconoscere un luogo in cui sentirsi davvero a casa.
            </p>
            <p>
              Ogni proprietà racconta una storia. Il nostro compito è
              ascoltarla, valorizzarla e farla incontrare con le persone
              giuste.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/immobili"
              className="inline-block rounded-sm bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:opacity-90">
              Scopri gli immobili
            </Link>
            <Link to="/contatti"
              className="inline-block rounded-sm border border-ink/20 px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-cream">
              Parlaci della casa che cerchi
            </Link>
          </div>
        </div>
        <figure className="md:col-span-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-sm shadow-xl shadow-ink/10">
            <img
              src={elenaAsset.url}
              alt="Elena di Furia Immobiliare con il suo cane in giardino, Lunigiana"
              loading="eager"
              className="aspect-[3/4] w-full object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 eyebrow text-center md:text-left">
            Elena · Furia Immobiliare
          </figcaption>
        </figure>
      </section>

      <section className="bg-warm-sand">
        <div className="container-editorial py-20 md:py-28">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <span className="eyebrow">Il nostro modo di lavorare</span>
            <h2 className="font-serif text-3xl text-ink md:text-5xl">
              Persone, prima degli immobili.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { t: "Ascolto", b: "Prima di proporre una casa, ascoltiamo il modo in cui vuoi vivere." },
              { t: "Territorio", b: "Conosciamo la Lunigiana non solo come mercato, ma come luogo da abitare." },
              { t: "Cura", b: "Ogni immobile viene raccontato con attenzione, rispetto e sensibilità." },
            ].map((s) => (
              <div
                key={s.t}
                className="rounded-md border border-warm-border/70 bg-warm-ivory p-8 shadow-[0_1px_2px_rgba(42,33,28,0.04)] transition hover:shadow-[0_8px_24px_-12px_rgba(42,33,28,0.18)] md:p-10"
              >
                <div className="h-px w-10 bg-primary/60" />
                <h3 className="mt-5 font-serif text-2xl text-ink">{s.t}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/80">{s.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            {[
              { n: "30+", l: "Anni sul territorio", b: "Una presenza continua a Pontremoli e in tutta la Lunigiana." },
              { n: "500+", l: "Famiglie accompagnate", b: "Compratori italiani e internazionali che hanno scelto questa terra." },
              { n: "6", l: "Comuni di riferimento", b: "Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-md border border-warm-border/70 bg-warm-cream p-8 text-center md:p-10"
              >
                <div className="font-serif text-5xl text-primary md:text-6xl">{s.n}</div>
                <div className="mt-3 eyebrow">{s.l}</div>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-foreground/75">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-editorial py-24 md:py-32">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-3xl italic leading-relaxed text-ink md:text-4xl">
            "Hanno trovato non una casa, ma il nostro posto.
            Hanno capito quello che cercavamo prima di noi."
          </p>
          <footer className="mt-6 eyebrow">Anna e Marco · acquirenti a Bagnone</footer>
        </blockquote>

        <div className="mt-20 border-t border-border pt-16 text-center">
          <h2 className="font-serif text-3xl text-ink md:text-5xl">
            Cerchi una casa in Lunigiana?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
            Raccontaci cosa immagini: ti aiuteremo a trovare il luogo giusto.
          </p>
          <Link to="/contatti"
            className="mt-8 inline-block rounded-sm bg-primary px-10 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:opacity-90">
            Contattaci
          </Link>
        </div>
      </section>
    </>
  );
}
