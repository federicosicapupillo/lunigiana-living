import { createFileRoute, Link } from "@tanstack/react-router";
import heroAsset from "@/assets/real/lunigiana-hero-tramonto.png.asset.json";
import pontremoliAsset from "@/assets/real/pontremoli-lunigiana-v2.png.asset.json";
import bagnoneAsset from "@/assets/real/bagnone-lunigiana.png.asset.json";
import zeriAsset from "@/assets/real/zeri-lunigiana.png.asset.json";
import villafrancaAsset from "@/assets/real/villafranca-lunigiana.png.asset.json";
import filattieraAsset from "@/assets/real/filattiera-lunigiana.png.asset.json";
import mulazzoAsset from "@/assets/real/mulazzo-lunigiana.png.asset.json";
import { territories } from "@/lib/properties";
import { ArrowRight, MapPin, Mountain, Sparkles } from "lucide-react";

const imageBySlug: Record<string, string> = {
  pontremoli: pontremoliAsset.url,
  bagnone: bagnoneAsset.url,
  zeri: zeriAsset.url,
  villafranca: villafrancaAsset.url,
  filattiera: filattieraAsset.url,
  mulazzo: mulazzoAsset.url,
};

export const Route = createFileRoute("/territori")({
  head: () => ({
    meta: [
      { title: "Vivere in Lunigiana — Borghi, paesaggi e atmosfere | Furia Immobiliare" },
      { name: "description", content: "Pontremoli, Villafranca, Bagnone, Filattiera, Mulazzo, Zeri: una guida ai borghi della Lunigiana per scegliere con consapevolezza dove vivere o comprare casa." },
      { property: "og:title", content: "Vivere in Lunigiana — Furia Immobiliare" },
      { property: "og:description", content: "Sei borghi, sei atmosfere. Una guida sincera alla Lunigiana, scritta da chi questa terra la abita e la racconta ogni giorno." },
    ],
    links: [{ rel: "canonical", href: "/territori" }],
  }),
  component: TerritoriPage,
});

function TerritoriPage() {
  return (
    <>
      <section className="relative isolate -mt-20 flex min-h-[80svh] items-end overflow-hidden">
        <img src={heroAsset.url} alt="Paesaggio della Lunigiana al tramonto" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="hero-gradient absolute inset-0 -z-10" />
        <div className="container-editorial pb-20 pt-32">
          <span className="eyebrow text-cream/85">Vivere in Lunigiana</span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-cream md:text-7xl">
            Una terra di confine,<br /><em className="font-normal italic">tre regioni, una luce sola.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/85 md:text-xl">
            La Lunigiana non è un'idea di Toscana, né di Liguria, né di Emilia.
            È il punto in cui le tre si incontrano e diventano qualcos'altro:
            castelli, fiumi, pievi e borghi vivi, dove la casa è ancora una scelta
            di vita e non solo un investimento.
          </p>
        </div>
      </section>

      <section className="bg-warm-cream">
        <div className="container-editorial grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <span className="eyebrow">Il luogo</span>
            <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
              Tra Toscana, Liguria<br /><em className="italic">ed Emilia.</em>
            </h2>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Massa-Carrara · alta valle del Magra
            </p>
            <div className="mt-8 h-px w-16 bg-warm-border" />
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-foreground/85 md:col-span-6 md:col-start-7">
            <p>
              La Lunigiana è una valle stretta fra l'Appennino tosco-emiliano e
              le Alpi Apuane, attraversata dal fiume Magra e dalla via Francigena.
              Per secoli è stata terra di passaggio: pellegrini diretti a Roma,
              mercanti, pastori, eserciti. Da quel transito sono nate pievi
              romaniche, castelli Malaspina e una rete fittissima di borghi in
              pietra arroccati sui crinali.
            </p>
            <p>
              Oggi è uno dei pochi luoghi in Italia dove i centri storici
              medievali sono ancora abitati davvero — non solo visitati — e dove
              il prezzo di una casa di carattere non ha perso il senso delle
              proporzioni. Un'ora dal mare delle Cinque Terre, un'ora dalle piste
              dell'Abetone, mezz'ora dai marmi di Carrara: la Lunigiana è centrale
              proprio perché sembra appartata.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-sand">
        <div className="container-editorial py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="eyebrow">Perché qui</span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              Tre ragioni per <em className="italic">sceglierla.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Posizione strategica",
                body: "Casello A15 della Cisa, stazione di Pontremoli sulla Parma-La Spezia, aeroporti di Pisa e Genova a circa un'ora. Milano in poco più di due ore di auto.",
              },
              {
                icon: Mountain,
                title: "Paesaggio intatto",
                body: "Parco Nazionale dell'Appennino Tosco-Emiliano, Apuane, foreste di castagni e faggi, fiumi balneabili. Una densità abitativa fra le più basse del centro Italia.",
              },
              {
                icon: Sparkles,
                title: "Qualità della vita",
                body: "Servizi essenziali in ogni capoluogo, scuole, sanità di prossimità, mercati settimanali, una scena gastronomica autentica (testaroli, panigacci, funghi di Borgotaro, agnello di Zeri).",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-md border border-warm-border/70 bg-warm-ivory p-8 shadow-[0_1px_2px_rgba(42,33,28,0.04)] transition hover:shadow-[0_8px_24px_-12px_rgba(42,33,28,0.18)] md:p-10"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-ink">{title}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-foreground/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-ivory pb-0 pt-24 md:pt-32">
        <div className="container-editorial pb-20 md:pb-28">
          <span className="eyebrow">I borghi</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl text-ink md:text-5xl">
            Sei luoghi,<br /><em className="italic">sei atmosfere diverse.</em>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/80">
            La Lunigiana cambia carattere ogni dieci chilometri. Un borgo
            commerciale e colto come Pontremoli non somiglia a un'aia di pietra
            di Zeri, e una loggia rinascimentale di Filattiera non racconta la
            stessa storia di un mulino sul torrente di Bagnone. Ti aiutiamo a
            riconoscere queste differenze prima di scegliere dove cercare casa.
          </p>
        </div>

        {territories.map((t, i) => {
          const bands = ["bg-warm-soft", "bg-warm-sand", "bg-warm-cream"];
          const bg = bands[i % bands.length];
          return (
            <div key={t.slug} className={`${bg} border-t border-warm-border/60`}>
              <div className="container-editorial py-20 md:py-28">
                <article
                  className={`grid gap-10 md:grid-cols-12 md:items-center ${i % 2 ? "md:[&>figure]:order-2" : ""}`}
                >
                  <figure className="overflow-hidden rounded-sm shadow-[0_18px_40px_-24px_rgba(36,23,17,0.35)] md:col-span-7">
                    <img
                      src={imageBySlug[t.slug]}
                      alt={t.name}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </figure>
                  <div className="md:col-span-5">
                    <div className="eyebrow">{t.name}</div>
                    <h3 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
                      {t.tagline}
                    </h3>
                    <div className="mt-5 h-px w-12 bg-warm-border" />
                    <p className="mt-5 text-base leading-relaxed text-foreground/80">{t.body}</p>
                    <Link
                      to="/immobili"
                      className="group mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary"
                    >
                      Immobili a {t.name}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-warm-cream">
        <div className="container-editorial grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <span className="eyebrow">Comprare in Lunigiana</span>
            <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
              Cosa si trova,<br /><em className="italic">e a che condizioni.</em>
            </h2>
            <div className="mt-8 h-px w-16 bg-warm-border" />
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-foreground/85 md:col-span-6 md:col-start-7">
          <p>
            Il mercato lunigianese non assomiglia a quello di Lucca o della
            Versilia. Qui si trovano ancora case di paese in pietra a vista,
            rustici da recuperare con porzioni di terreno, casali isolati con
            vista sull'Appennino, appartamenti nei centri storici e ville
            indipendenti in collina. I valori al metro quadro sono fra i più
            accessibili della Toscana, soprattutto fuori dai centri principali.
          </p>
          <p>
            È un mercato che premia chi sa leggere le sfumature: l'esposizione
            del versante, lo stato delle strutture portanti, la viabilità
            invernale, i vincoli paesaggistici, le pratiche edilizie pregresse.
            Sono proprio gli aspetti su cui ti accompagniamo, perché una bella
            foto da sola non basta a dire se quella casa è davvero per te.
          </p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-cream md:py-32">
        <div className="container-editorial max-w-3xl text-center">
          <span className="eyebrow text-cream/70">Trova la tua Lunigiana</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            Non sei sicuro<br />
            <em className="italic">da dove cominciare?</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream/80">
            Raccontaci come immagini la tua casa, il tempo che vorresti
            dedicarle e cosa cerchi intorno: borgo vivo, campagna silenziosa,
            vicinanza al mare o alla montagna. Ti proponiamo i territori e gli
            immobili più coerenti con la tua idea, senza farti perdere tempo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/contatti"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-cream/90"
            >
              Parla con Elena <ArrowRight size={14} />
            </Link>
            <Link
              to="/immobili"
              className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-cream/85 hover:text-cream"
            >
              Vedi gli immobili disponibili
            </Link>
          </div>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-cream/55">
            Consulenza iniziale gratuita · risposta entro 24 ore
          </p>
        </div>
      </section>
    </>
  );
}