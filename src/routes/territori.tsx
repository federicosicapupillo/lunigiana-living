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
import { useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { LeadMagnetBlock } from "@/components/lead-magnet-block";

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
  const t = useT();
  useLocalizedHead("seo.territori.title", "seo.territori.desc");
  return (
    <>
      <section className="relative isolate -mt-20 flex min-h-[80svh] items-end overflow-hidden">
        <img src={heroAsset.url} alt="Paesaggio della Lunigiana al tramonto" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="hero-gradient absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/75 via-ink/45 to-ink/15" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="container-editorial pb-20 pt-32">
          <span className="eyebrow text-cream/85">{t("terr.hero.eyebrow")}</span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-cream md:text-7xl">
            {t("terr.hero.title1")}<br /><em className="font-normal italic">{t("terr.hero.title2")}</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/85 md:text-xl">
            {t("terr.hero.lead")}
          </p>
        </div>
      </section>

      <section className="bg-warm-cream">
        <div className="container-editorial grid gap-12 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("terr.place.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
              {t("terr.place.title1")}<br /><em className="italic">{t("terr.place.title2")}</em>
            </h2>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {t("terr.place.subtitle")}
            </p>
            <div className="mt-8 h-px w-16 bg-warm-border" />
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-foreground/85 md:col-span-6 md:col-start-7">
            <p>{t("terr.place.p1")}</p>
            <p>{t("terr.place.p2")}</p>
          </div>
        </div>
      </section>

      <section className="bg-warm-sand">
        <div className="container-editorial py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">{t("terr.why.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              {t("terr.why.title1")} <em className="italic">{t("terr.why.title2")}</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            {[
              { icon: MapPin, title: t("terr.why.r1.t"), body: t("terr.why.r1.b") },
              { icon: Mountain, title: t("terr.why.r2.t"), body: t("terr.why.r2.b") },
              { icon: Sparkles, title: t("terr.why.r3.t"), body: t("terr.why.r3.b") },
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

      <section className="bg-warm-ivory pb-0 pt-20 md:pt-24">
        <div className="container-editorial pb-16 md:pb-20">
          <span className="eyebrow">{t("terr.borghi.eyebrow")}</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl text-ink md:text-5xl">
            {t("terr.borghi.title1")}<br /><em className="italic">{t("terr.borghi.title2")}</em>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/80">
            {t("terr.borghi.lead")}
          </p>
        </div>

        {territories.map((terr, i) => {
          const bands = ["bg-warm-soft", "bg-warm-sand", "bg-warm-cream"];
          const bg = bands[i % bands.length];
          return (
            <div key={terr.slug} className={`${bg} border-t border-warm-border/60`}>
              <div className="container-editorial py-14 md:py-20">
                <article
                  className={`grid gap-10 md:grid-cols-12 md:items-center ${i % 2 ? "md:[&>figure]:order-2" : ""}`}
                >
                  <figure className="overflow-hidden rounded-sm shadow-[0_18px_40px_-24px_rgba(36,23,17,0.35)] md:col-span-7">
                    <img
                      src={imageBySlug[terr.slug]}
                      alt={terr.name}
                      loading="lazy"
                      className="aspect-[5/4] w-full object-cover md:aspect-[4/3]"
                    />
                  </figure>
                  <div className="md:col-span-5">
                    <div className="eyebrow">{terr.name}</div>
                    <h3 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
                      {t(`terr.t.${terr.slug}.tagline`)}
                    </h3>
                    <div className="mt-5 h-px w-12 bg-warm-border" />
                    <p className="mt-5 text-base leading-relaxed text-foreground/80">{t(`terr.t.${terr.slug}.body`)}</p>
                    <Link
                      to="/immobili"
                      className="group mt-7 inline-flex items-center gap-2 rounded-sm border border-primary/60 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.22em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {t("terr.borghi.cta")} {terr.name}
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
        <div className="container-editorial grid gap-12 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("terr.market.eyebrow")}</span>
            <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
              {t("terr.market.title1")}<br /><em className="italic">{t("terr.market.title2")}</em>
            </h2>
            <div className="mt-8 h-px w-16 bg-warm-border" />
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-foreground/85 md:col-span-6 md:col-start-7">
          <p>{t("terr.market.p1")}</p>
          <p>{t("terr.market.p2")}</p>
          </div>
        </div>
      </section>

      {/* LEAD MAGNET — Guida Lunigiana */}
      <section className="bg-warm-cream py-16 md:py-20">
        <div className="container-editorial">
          <LeadMagnetBlock source="territori" />
        </div>
      </section>

      <section className="bg-ink py-20 text-cream md:py-24">
        <div className="container-editorial max-w-3xl text-center">
          <span className="eyebrow text-cream/70">{t("terr.cta.eyebrow")}</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {t("terr.cta.title1")}<br />
            <em className="italic">{t("terr.cta.title2")}</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream/80">
            {t("terr.cta.body")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/contatti"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-cream px-8 py-4 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-cream/90"
            >
              {t("cta.talkToElena")} <ArrowRight size={14} />
            </Link>
            <Link
              to="/immobili"
              className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-cream/85 hover:text-cream"
            >
              {t("cta.viewProperties")}
            </Link>
          </div>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-cream/55">
            {t("terr.cta.note")}
          </p>
        </div>
      </section>

      {/* Link interno alle pagine SEO per zona o tipologia */}
      <section className="bg-warm-cream py-14">
        <div className="container-editorial text-center">
          <p className="mx-auto max-w-2xl font-serif text-xl italic leading-relaxed text-foreground/80 md:text-2xl">
            {t("terr.linkBlock.lead")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/case-in-vendita-lunigiana"
              className="inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-3 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta)]"
            >
              {t("terr.linkBlock.byType")} <ArrowRight size={14} />
            </Link>
            <Link
              to="/case-in-vendita"
              className="text-xs uppercase tracking-[0.22em] text-ink/70 hover:text-[var(--terracotta)]"
            >
              {t("terr.linkBlock.byComune")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}