import { createFileRoute, Link } from "@tanstack/react-router";
import elenaAsset from "@/assets/elena-furia.png.asset.json";
import { useT } from "@/lib/i18n/LanguageContext";
import { useLocalizedHead } from "@/hooks/use-localized-head";

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
  const t = useT();
  useLocalizedHead("seo.chi.title", "seo.chi.desc");
  return (
    <>
      <section className="container-editorial grid items-center gap-12 pb-16 pt-28 md:grid-cols-12 md:gap-16 md:pt-36">
        <div className="md:col-span-6 lg:col-span-7">
          <span className="eyebrow">{t("chi.eyebrow")}</span>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-ink md:text-6xl lg:text-7xl">
            {t("chi.title1")}<br />
            {t("chi.title2")}
          </h1>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/85">
            <p>{t("chi.intro.p1")}</p>
            <p>{t("chi.intro.p2")}</p>
            <p>{t("chi.intro.p3")}</p>
            <p>{t("chi.intro.p4")}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/immobili"
              className="inline-block rounded-sm bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:opacity-90">
              {t("cta.discoverProperties")}
            </Link>
            <Link to="/contatti"
              className="inline-block rounded-sm border border-ink/20 px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-cream">
              {t("cta.tellUsHome")}
            </Link>
          </div>
        </div>
        <figure className="md:col-span-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-sm shadow-xl shadow-ink/10">
            <img
              src={elenaAsset.url}
              alt={t("chi.caption")}
              loading="eager"
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 eyebrow text-center md:text-left">
            {t("chi.caption")}
          </figcaption>
        </figure>
      </section>

      <section className="bg-warm-sand">
        <div className="container-editorial py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <span className="eyebrow">{t("chi.method.eyebrow")}</span>
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              {t("chi.method.title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: t("chi.method.s1.t"), b: t("chi.method.s1.b") },
              { t: t("chi.method.s2.t"), b: t("chi.method.s2.b") },
              { t: t("chi.method.s3.t"), b: t("chi.method.s3.b") },
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

          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
            {[
              { n: "18+", l: t("chi.stats.1.l"), b: t("chi.stats.1.b") },
              { n: "500+", l: t("chi.stats.2.l"), b: t("chi.stats.2.b") },
              { n: "6", l: t("chi.stats.3.l"), b: t("chi.stats.3.b") },
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

      <section className="container-editorial py-20 md:py-28">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-3xl italic leading-relaxed text-ink md:text-4xl">
            {t("chi.quote")}
          </p>
          <footer className="mt-6 eyebrow">{t("chi.quoteAuthor")}</footer>
        </blockquote>

        <div className="mt-16 border-t border-border pt-12 text-center">
          <h2 className="font-serif text-3xl text-ink md:text-5xl">
            {t("chi.outro.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
            {t("chi.outro.body")}
          </p>
          <Link to="/contatti"
            className="mt-8 inline-block rounded-sm bg-primary px-10 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:opacity-90">
            {t("cta.contactUs")}
          </Link>
        </div>
      </section>
    </>
  );
}
