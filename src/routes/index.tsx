import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroTramontoVignetiAsset from "@/assets/real/hero-tramonto-ulivi.png.asset.json";
import heroPontremoliCentroStorico from "@/assets/real/pontremoli-hero-centro-storico.png.asset.json";
import heroElenaCometa from "@/assets/elena-furia.png.asset.json";
import territoryPontremoli from "@/assets/real/pontremoli-lunigiana-v2.png.asset.json";
import territoryBagnone from "@/assets/real/bagnone-lunigiana.png.asset.json";
import territoryZeri from "@/assets/real/zeri-lunigiana.png.asset.json";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchBar } from "@/components/property-search-bar";
import { listPublishedProperties, type PublicProperty } from "@/lib/public-properties.functions";
import { getHomeHeroVariant, type HomeHeroVariant } from "@/lib/site-settings.functions";
import { ArrowRight, Compass, KeyRound, Sparkles, Star, ShieldCheck, MapPin, Home as HomeIcon } from "lucide-react";

const AGENCY_FACTS = {
  yearsActive: 18,
  propertiesManaged: 500,
  comuniCovered: 6,
  association: "FIAIP",
  phone: "0187 830229",
  mobile: "320 7019985",
  address: "Via Pirandello 7, 54027 Pontremoli (MS)",
  email: "furiaimmobiliare@libero.it",
  googleReviewsUrl: "https://share.google/XuLvMM0CG6tmjlwpO",
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Furia Immobiliare",
  description:
    "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e dimore di carattere in Lunigiana.",
  url: "https://furiaimmobiliare.it/",
  telephone: "+39 0187 830229",
  email: AGENCY_FACTS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Pirandello 7",
    addressLocality: "Pontremoli",
    postalCode: "54027",
    addressRegion: "MS",
    addressCountry: "IT",
  },
  areaServed: [
    "Pontremoli",
    "Villafranca in Lunigiana",
    "Filattiera",
    "Mulazzo",
    "Bagnone",
    "Zeri",
  ],
  memberOf: { "@type": "Organization", name: "FIAIP" },
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const [props, hero] = await Promise.all([listPublishedProperties(), getHomeHeroVariant()]);
    return { ...props, heroVariant: hero.variant };
  },
  head: () => ({
    meta: [
      { title: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { name: "description", content: "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e immobili in Lunigiana: Pontremoli, Villafranca, Filattiera, Mulazzo, Bagnone, Zeri." },
      { property: "og:title", content: "Furia Immobiliare — Case di carattere in Lunigiana" },
      { property: "og:description", content: "Trova il tuo posto in Lunigiana. Immobili scelti per chi cerca autenticità, panorama e qualità del vivere." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: heroTramontoVignetiAsset.url, fetchpriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANIZATION_JSONLD),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { properties, heroVariant } = Route.useLoaderData() as {
    properties: PublicProperty[];
    heroVariant: HomeHeroVariant;
  };
  const featuredProperties = properties
    .filter((p) => p.featured && p.category === "vendita" && p.gallery && p.gallery.length > 0)
    .slice(0, 6);
  const isPontremoli = heroVariant === "pontremoli_historic_center";
  const isElena = heroVariant === "elena_cometa";
  const heroSrc = isElena
    ? heroElenaCometa.url
    : isPontremoli
      ? heroPontremoliCentroStorico.url
      : heroTramontoVignetiAsset.url;
  const heroAlt = isPontremoli
    ? "Pontremoli: il fiume Magra, il Duomo con cupola in rame, il centro storico e il Castello del Piagnaro sullo sfondo"
    : isElena
    ? "Elena Furia con Cometa, volto di Furia Immobiliare in Lunigiana"
    : "Tramonto infuocato sulle Apuane con vigneti, uliveti e borgo della Lunigiana in lontananza";
  const heroObjectPosition = isPontremoli ? "center center" : "center";
  return (
    <>
      {/* HERO */}
      {isElena ? (
        <section className="relative isolate -mt-20 overflow-hidden bg-cream">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-cream to-[hsl(var(--muted))]" />
          <div className="container-editorial grid min-h-[88svh] grid-cols-1 items-center gap-10 pb-12 pt-32 sm:min-h-[92svh] sm:pb-16 sm:pt-40 md:min-h-[100svh] md:grid-cols-12 md:gap-12 md:pb-24">
            <div className="md:col-span-6 lg:col-span-6">
              <span className="eyebrow text-primary">Furia Immobiliare · Lunigiana</span>
              <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] text-ink sm:text-5xl sm:leading-[1.02] md:text-6xl lg:text-7xl">
                La casa giusta si riconosce<br />
                <em className="font-normal italic">anche dal cuore.</em>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg">
                Con Elena e Cometa, Furia Immobiliare accompagna chi cerca una casa
                autentica in Lunigiana: non solo un immobile, ma un luogo in cui
                sentirsi davvero a casa.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
                <Link
                  to="/immobili"
                  className="inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
                >
                  Cerca la tua casa <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://wa.me/393207019985?text=${encodeURIComponent("Ciao Elena, sto cercando casa in Lunigiana e vorrei ricevere maggiori informazioni.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:bg-ink hover:text-cream sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
                >
                  Parla con Elena
                </a>
              </div>
            </div>
            <div className="md:col-span-6 lg:col-span-6">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm shadow-2xl md:max-w-none">
                <img
                  src={heroElenaCometa.url}
                  alt={heroAlt}
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/40 to-transparent p-5">
                  <div className="text-[0.65rem] uppercase tracking-[0.22em] text-cream/90">
                    Elena e Cometa · Furia Immobiliare
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
      <section className="relative isolate -mt-20 flex min-h-[88svh] items-end overflow-hidden sm:min-h-[92svh] md:min-h-[100svh]">
        <img
          src={heroSrc}
          alt={heroAlt}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover animate-in fade-in duration-700"
          style={{ objectPosition: heroObjectPosition }}
        />
        <div className="hero-gradient absolute inset-0 -z-10" />

        <div className="container-editorial w-full pb-12 pt-32 sm:pb-16 sm:pt-40 md:pb-24">
          <div className="max-w-3xl">
            <span className="eyebrow text-cream/90">Furia Immobiliare · Pontremoli</span>
            <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] text-cream sm:text-5xl sm:leading-[1.02] md:text-7xl">
              La casa giusta in una terra<br />
              <em className="font-normal italic text-cream/95">che lascia spazio al tempo.</em>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base md:text-lg">
              Selezioniamo case di pietra, ville panoramiche e dimore di carattere
              in tutta la Lunigiana. Per chi non cerca solo un immobile, ma un modo
              diverso di vivere.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink transition hover:bg-cream/90 sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
            >
              Cerca la tua casa in Lunigiana <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* BRAND STATEMENT */}
      <section className="container-editorial grid gap-10 py-16 sm:py-20 md:grid-cols-12 md:gap-12 md:py-32">
        <div className="md:col-span-5">
          <span className="eyebrow">Chi siamo</span>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
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
      <section className="bg-muted/40 py-16 sm:py-20 md:py-32">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Scelti per voi</span>
              <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
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

          <div className="mt-10">
            <PropertySearchBar />
          </div>

          <div className="mt-10 grid gap-8 sm:mt-14 sm:gap-10 md:grid-cols-3">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY LUNIGIANA */}
      <section className="container-editorial py-16 sm:py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8 lg:col-span-7">
            <span className="eyebrow">Vivere in Lunigiana</span>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              Una terra che<br />si misura in passi,<br />non in orari.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80">
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
        </div>
      </section>

      {/* TERRITORIES STRIP */}
      <section className="bg-ink py-16 text-cream sm:py-20 md:py-32">
        <div className="container-editorial">
          <span className="eyebrow text-cream/70">Territori</span>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl text-cream sm:text-4xl md:text-5xl">
            Sei modi diversi di abitare la stessa terra.
          </h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm bg-cream/10 sm:mt-14 md:grid-cols-3">
            {[
                { name: "Pontremoli", img: territoryPontremoli.url, body: "Borgo capoluogo, vita culturale, vie acciottolate." },
                { name: "Bagnone", img: territoryBagnone.url, body: "Castello, mercato, sapori antichi." },
                { name: "Zeri", img: territoryZeri.url, body: "Boschi profondi, allevamenti, lentezza." },
            ].map((t) => (
              <Link
                key={t.name}
                to="/territori"
                className="group relative block aspect-[16/10] overflow-hidden bg-ink md:aspect-[4/5]"
              >
                <img src={t.img} alt={t.name} loading="lazy" decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="ink-overlay absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="font-serif text-2xl text-cream sm:text-3xl">{t.name}</div>
                  <p className="mt-2 text-sm text-cream/75">{t.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-editorial py-16 sm:py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <span className="eyebrow">Cosa facciamo</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
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
      <section className="container-editorial pb-20 sm:pb-32">
        <div className="relative overflow-hidden rounded-sm bg-secondary px-6 py-14 text-center text-cream sm:px-8 sm:py-20 md:px-16 md:py-28">
          <span className="eyebrow text-cream/80">Iniziamo</span>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-6xl">
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
