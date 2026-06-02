import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import heroPanoramico from "@/assets/real/hero-pontremoli-castello.jpg";
import heroIntimo from "@/assets/real/hero-centro-storico.jpg";
import heroColline from "@/assets/real/hero-pontremoli-colline.jpg";
import heroBorgoAsset from "@/assets/real/bagnone-borgo.jpg.asset.json";
import heroCastelloTramontoAsset from "@/assets/real/hero-castello-tramonto.jpg.asset.json";
import heroCastelloAereoAsset from "@/assets/real/hero-castello-aereo.jpg.asset.json";
import heroCastelloBorgoAsset from "@/assets/real/hero-castello-borgo.png.asset.json";
import heroTramontoVignetiAsset from "@/assets/real/hero-tramonto-vigneti.png.asset.json";
import territoryPontremoli from "@/assets/real/pontremoli-scorcio.jpg";
import territoryBagnone from "@/assets/real/bagnone-castello.jpg";
import territoryZeri from "@/assets/real/zeri-monte.jpg";
import lifestyleFood from "@/assets/real/bagnone-torrente.jpg";
import { PropertySearch } from "@/components/property-search";
import { PropertyCard } from "@/components/property-card";
import { featuredProperties } from "@/lib/properties";
import { ArrowRight, Compass, KeyRound, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { name: "description", content: "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e immobili in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:title", content: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { property: "og:description", content: "Trova il tuo posto in Lunigiana. Immobili scelti per chi cerca autenticità, panorama e qualità del vivere." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [heroVariant, setHeroVariant] = useState<
    "castelloBorgo" | "tramontoVigneti" | "panoramico" | "intimo" | "colline" | "borgo" | "tramonto" | "aereo"
  >("castelloBorgo");
  const heroMap = {
    castelloBorgo: {
      src: heroCastelloBorgoAsset.url,
      alt: "Castello e borgo medievale in pietra della Lunigiana immersi nei boschi",
      label: "Castello · Borgo",
    },
    tramontoVigneti: {
      src: heroTramontoVignetiAsset.url,
      alt: "Tramonto infuocato sulle Apuane con vigneti, uliveti e borgo della Lunigiana in lontananza",
      label: "Tramonto · Vigneti",
    },
    panoramico: {
      src: heroPanoramico,
      alt: "Pontremoli e il castello del Piagnaro al tramonto, panorama sulla Lunigiana",
      label: "Panorama · Castello",
    },
    intimo: {
      src: heroIntimo,
      alt: "Scorcio intimo del centro storico di Pontremoli con ponte sul fiume Magra",
      label: "Centro storico",
    },
    colline: {
      src: heroColline,
      alt: "Pontremoli immersa nelle colline verdi della Lunigiana con vista sulle montagne dell'Appennino",
      label: "Colline · Territorio",
    },
    borgo: {
      src: heroBorgoAsset.url,
      alt: "Borgo di Bagnone con ponte in pietra sul torrente e case storiche affacciate sull'acqua",
      label: "Borgo · Bagnone",
    },
    tramonto: {
      src: heroCastelloTramontoAsset.url,
      alt: "Borgo e castello panoramico della Lunigiana al tramonto, vista aerea sulle colline verso il mare",
      label: "Tramonto · Castello",
    },
    aereo: {
      src: heroCastelloAereoAsset.url,
      alt: "Vista aerea ravvicinata del borgo medievale e del castello arroccato sulla collina della Lunigiana",
      label: "Vista aerea · Borgo",
    },
  } as const;
  const heroSrc = heroMap[heroVariant].src;
  const heroAlt = heroMap[heroVariant].alt;
  return (
    <>
      {/* HERO */}
      <section className="relative isolate -mt-20 flex min-h-[100svh] items-end overflow-hidden">
        <img
          key={heroVariant}
          src={heroSrc}
          alt={heroAlt}
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover animate-in fade-in duration-700"
        />
        <div className="hero-gradient absolute inset-0 -z-10" />

        <div className="container-editorial w-full pb-16 pt-40 md:pb-24">
          <div className="max-w-3xl">
            <span className="eyebrow text-cream/90">Furia Immobiliare · Pontremoli</span>
            <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-cream md:text-7xl">
              La casa giusta in una terra<br />
              <em className="font-normal italic text-cream/95">che lascia spazio al tempo.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg">
              Selezioniamo case di pietra, ville panoramiche e dimore di carattere
              in tutta la Lunigiana. Per chi non cerca solo un immobile, ma un modo
              diverso di vivere.
            </p>
          </div>

          <div className="mt-10">
            <PropertySearch />
          </div>

          {/* Variant switcher */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {(Object.keys(heroMap) as Array<keyof typeof heroMap>).map((key) => {
              const active = heroVariant === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setHeroVariant(key)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                    active
                      ? "border-cream bg-cream/95 text-ink"
                      : "border-cream/40 text-cream/85 hover:border-cream/80"
                  }`}
                >
                  {heroMap[key].label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="container-editorial grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5">
          <span className="eyebrow">Chi siamo</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
            Abitare la Lunigiana,<br />non solo comprarci casa.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:col-span-6 md:col-start-7">
          <p>
            Da anni a Pontremoli, Furia Immobiliare nasce da un legame
            profondo con questa terra di confine tra Toscana, Liguria ed Emilia.
            Conosciamo le pietre dei borghi, sappiamo dove la luce arriva la
            mattina, dove il bosco fa ombra in agosto.
          </p>
          <p>
            Accompagniamo chi cerca casa con uno sguardo onesto: ti aiutiamo a
            scegliere non solo l'immobile, ma il contesto di vita giusto.
          </p>
          <Link
            to="/chi-siamo"
            className="group inline-flex items-center gap-2 pt-4 text-sm uppercase tracking-[0.2em] text-primary"
          >
            La nostra storia
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="bg-muted/40 py-24 md:py-32">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Scelti per voi</span>
              <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
                Immobili del momento
              </h2>
            </div>
            <Link
              to="/immobili"
              className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary"
            >
              Tutti gli immobili
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY LUNIGIANA */}
      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">Vivere in Lunigiana</span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
              Una terra che<br />si misura in passi,<br />non in orari.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/80">
              Borghi medievali, castelli sulle colline, pievi romaniche, cammini
              storici, boschi di castagno e una cucina che racconta secoli di
              passaggi. La Lunigiana è una scelta di vita, prima ancora che una
              destinazione.
            </p>
            <Link
              to="/territori"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90"
            >
              Esplora il territorio <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 md:col-span-7 md:grid-cols-2">
            <figure className="overflow-hidden rounded-sm md:translate-y-12">
              <img src={territoryBagnone} alt="Castello di Bagnone" loading="lazy"
                className="aspect-[3/4] w-full object-cover" />
              <figcaption className="mt-3 font-serif italic text-foreground/70">
                Il castello di Bagnone tra le nebbie del mattino.
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-sm">
              <img src={lifestyleFood} alt="Cucina di Lunigiana" loading="lazy"
                className="aspect-[3/4] w-full object-cover" />
              <figcaption className="mt-3 font-serif italic text-foreground/70">
                Testaroli, olio nuovo, pane di castagne.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* TERRITORIES STRIP */}
      <section className="bg-ink py-24 text-cream md:py-32">
        <div className="container-editorial">
          <span className="eyebrow text-cream/70">Territori</span>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl text-cream md:text-5xl">
            Sei modi diversi di abitare la stessa terra.
          </h2>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm bg-cream/10 md:grid-cols-3">
            {[
              { name: "Pontremoli", img: territoryPontremoli, body: "Borgo capoluogo, vita culturale, vie acciottolate." },
              { name: "Bagnone", img: territoryBagnone, body: "Castello, mercato, sapori antichi." },
              { name: "Zeri", img: territoryZeri, body: "Boschi profondi, allevamenti, lentezza." },
            ].map((t) => (
              <Link
                key={t.name}
                to="/territori"
                className="group relative block aspect-[4/5] overflow-hidden bg-ink"
              >
                <img src={t.img} alt={t.name} loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="ink-overlay absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="font-serif text-3xl text-cream">{t.name}</div>
                  <p className="mt-2 text-sm text-cream/75">{t.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <span className="eyebrow">Cosa facciamo</span>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
              Un servizio sartoriale,<br />una conoscenza locale.
            </h2>
          </div>
          <div className="grid gap-6">
            {[
              { icon: Compass, title: "Ricerca su misura", body: "Ascoltiamo il tuo progetto di vita prima di mostrarti una casa." },
              { icon: KeyRound, title: "Acquisto e vendita", body: "Ti seguiamo passo dopo passo, dalla visita al rogito notarile." },
              { icon: Sparkles, title: "Valutazioni oneste", body: "Stime fondate sulla reale conoscenza del mercato locale." },
            ].map((s) => (
              <div key={s.title} className="flex gap-5 border-t border-border pt-6">
                <s.icon size={22} className="mt-1 shrink-0 text-primary" />
                <div>
                  <h3 className="font-serif text-2xl text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial pb-32">
        <div className="relative overflow-hidden rounded-sm bg-secondary px-8 py-20 text-center text-cream md:px-16 md:py-28">
          <span className="eyebrow text-cream/80">Iniziamo</span>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Raccontaci che casa stai cercando.<br />
            <em className="font-normal italic">Noi conosciamo dove trovarla.</em>
          </h2>
          <Link
            to="/contatti"
            className="mt-10 inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-cream/90"
          >
            Prenota una consulenza <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
