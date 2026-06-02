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
            Una presenza vera,<br /><em className="font-normal italic">dal primo passo</em><br />alla firma finale.
          </h1>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-5 md:pt-12">
          <p>
            Furia Immobiliare è guidata dalla Dott.ssa Furia Elena, che ha
            fondato l'agenzia con un'idea chiara: offrire a Pontremoli e in
            tutta la Lunigiana un servizio immobiliare diverso — meno
            affrettato, più attento.
          </p>
          <p>
            Non ci limitiamo a mostrare case. Ascoltiamo prima di tutto,
            capiamo cosa cercate e poi camminiamo insieme, con calma e
            competenza, fino al rogito notarile.
          </p>
        </div>
      </section>

      <figure className="container-editorial">
        <img src={heroImg} alt="Pontremoli" loading="lazy"
          className="aspect-[21/9] w-full rounded-sm object-cover" />
      </figure>

      <section className="container-editorial py-24 md:py-32">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <span className="eyebrow">Il nostro modo di lavorare</span>
          <p className="text-base leading-relaxed text-foreground/85">
            Conosciamo ogni strada, ogni borgo, ogni proprietà che proponiamo.
            Seguiamo le compravendite e le locazioni con professionalità e un
            tratto personale che solo chi vive veramente il territorio può
            offrire. Ogni consulenza è su misura, perché ogni cliente ha una
            storia diversa.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {[
            {
              t: "Ascolto prima di tutto",
              b: "Capire il vostro progetto è il nostro primo passo. Solo dopo cerchiamo l'immobile giusto.",
            },
            {
              t: "Conoscenza del territorio",
              b: "Ogni borgo, ogni proprietà, ogni dettaglio che conta. La Lunigiana la conosciamo davvero.",
            },
            {
              t: "Presenza costante",
              b: "Dalla prima visita all'assistenza tecnico-contrattuale: sempre al vostro fianco, fino al rogito.",
            },
          ].map((s) => (
            <div key={s.t} className="border-t border-border pt-6">
              <h3 className="font-serif text-2xl text-ink">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial pb-24 md:pb-32">
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
