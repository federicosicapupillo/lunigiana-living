import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/real/villafranca-panorama.jpg";
import pontremoli from "@/assets/real/pontremoli-scorcio.jpg";
import bagnone from "@/assets/real/bagnone-castello.jpg";
import zeri from "@/assets/real/zeri-monte.jpg";
import villafranca from "@/assets/real/villafranca-ponte.jpg";
import filattiera from "@/assets/real/filattiera.jpg";
import mulazzo from "@/assets/real/mulazzo.jpg";
import { territories } from "@/lib/properties";
import { ArrowRight } from "lucide-react";

const imageBySlug: Record<string, string> = {
  pontremoli, bagnone, zeri, villafranca, filattiera, mulazzo,
};

export const Route = createFileRoute("/territori")({
  head: () => ({
    meta: [
      { title: "Vivere in Lunigiana — Territori e borghi | Furia Immobiliare" },
      { name: "description", content: "Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri: scopri le diverse anime della Lunigiana per scegliere dove vivere." },
      { property: "og:title", content: "Vivere in Lunigiana — Furia Immobiliare" },
      { property: "og:description", content: "Una guida ai borghi e alle atmosfere della Lunigiana." },
    ],
    links: [{ rel: "canonical", href: "/territori" }],
  }),
  component: TerritoriPage,
});

function TerritoriPage() {
  return (
    <>
      <section className="relative isolate -mt-20 flex min-h-[80svh] items-end overflow-hidden">
        <img src={heroImg} alt="Paesaggio della Lunigiana" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="hero-gradient absolute inset-0 -z-10" />
        <div className="container-editorial pb-20 pt-32">
          <span className="eyebrow text-cream/85">Vivere in Lunigiana</span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-cream md:text-7xl">
            Una terra di confine,<br /><em className="font-normal italic">tre regioni, una luce sola.</em>
          </h1>
        </div>
      </section>

      <section className="container-editorial grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5">
          <span className="eyebrow">Il luogo</span>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            Tra Toscana, Liguria ed Emilia.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-6 md:col-start-7">
          <p>
            La Lunigiana è una valle stretta tra l'Appennino e le Alpi Apuane,
            attraversata dal fiume Magra e dalla via Francigena. Per secoli è
            stata terra di passaggio, di pievi, di castelli Malaspina.
          </p>
          <p>
            Oggi è uno dei pochi luoghi in Italia dove i borghi medievali sono
            ancora abitati davvero, e dove il prezzo di una casa di carattere
            non ha ancora perso il senso delle proporzioni.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-24 md:py-32">
        <div className="container-editorial">
          <span className="eyebrow">I borghi</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl text-ink md:text-5xl">
            Sei luoghi, sei atmosfere diverse.
          </h2>

          <div className="mt-16 space-y-24">
            {territories.map((t, i) => (
              <article key={t.slug}
                className={`grid gap-10 md:grid-cols-12 md:items-center ${i % 2 ? "md:[&>figure]:order-2" : ""}`}>
                <figure className="overflow-hidden rounded-sm md:col-span-7">
                  <img src={imageBySlug[t.slug]} alt={t.name} loading="lazy"
                    className="aspect-[4/3] w-full object-cover" />
                </figure>
                <div className="md:col-span-5">
                  <div className="eyebrow">{t.name}</div>
                  <h3 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
                    {t.tagline}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-foreground/80">{t.body}</p>
                  <Link to="/immobili"
                    className="group mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary">
                    Immobili a {t.name}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}