import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/real/pontremoli-scorcio.jpg";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — Furia Immobiliare, Pontremoli" },
      { name: "description", content: "Da Pontremoli accompagniamo chi cerca casa in Lunigiana con competenza, ascolto e conoscenza profonda del territorio." },
      { property: "og:title", content: "Chi siamo — Furia Immobiliare" },
      { property: "og:description", content: "La nostra storia: una famiglia, un'agenzia, una terra." },
    ],
    links: [{ rel: "canonical", href: "/chi-siamo" }],
  }),
  component: ChiSiamoPage,
});

function ChiSiamoPage() {
  return (
    <>
      <section className="container-editorial grid gap-16 pb-24 pt-32 md:grid-cols-12 md:pt-40">
        <div className="md:col-span-7">
          <span className="eyebrow">Chi siamo</span>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-ink md:text-7xl">
            Una famiglia,<br /><em className="font-normal italic">una terra,</em><br />un mestiere antico.
          </h1>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-5 md:pt-12">
          <p>
            Furia Immobiliare nasce a Pontremoli, nel cuore della Lunigiana. La
            nostra è una storia di radici: siamo cresciuti qui, conosciamo le
            persone, le strade, le case e i loro silenzi.
          </p>
          <p>
            Lavoriamo con poche case, ma scelte. Preferiamo accompagnare bene
            che vendere in fretta. Crediamo che una casa non sia solo un bene,
            ma un modo di stare al mondo.
          </p>
        </div>
      </section>

      <figure className="container-editorial">
        <img src={heroImg} alt="Pontremoli" loading="lazy"
          className="aspect-[21/9] w-full rounded-sm object-cover" />
      </figure>

      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            { n: "30+", l: "Anni sul territorio", b: "Una presenza continua a Pontremoli e in tutta la Lunigiana." },
            { n: "500+", l: "Famiglie accompagnate", b: "Compratori italiani e internazionali che hanno scelto questa terra." },
            { n: "6", l: "Comuni di riferimento", b: "Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
          ].map((s) => (
            <div key={s.l} className="border-t border-border pt-6">
              <div className="font-serif text-6xl text-primary">{s.n}</div>
              <div className="mt-3 eyebrow">{s.l}</div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial pb-32">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-3xl italic leading-relaxed text-ink md:text-4xl">
            "Hanno trovato non una casa, ma il nostro posto.
            Hanno capito quello che cercavamo prima di noi."
          </p>
          <footer className="mt-6 eyebrow">Anna e Marco · acquirenti a Bagnone</footer>
        </blockquote>

        <div className="mt-16 text-center">
          <Link to="/contatti"
            className="inline-block rounded-sm bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground">
            Scrivici
          </Link>
        </div>
      </section>
    </>
  );
}