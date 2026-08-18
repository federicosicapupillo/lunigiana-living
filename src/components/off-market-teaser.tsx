import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageContext";
import { trackClick } from "@/lib/analytics";

/** Richiamo discreto e riutilizzabile alla pagina /off-market. */
export function OffMarketTeaser({ source }: { source: string }) {
  const t = useT();
  return (
    <section className="bg-[var(--warm-ivory)] py-14 sm:py-16">
      <div className="container-editorial">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 rounded-sm border border-warm-border/70 bg-cream p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow text-terracotta">
              <Lock size={12} className="mr-1.5 inline" aria-hidden="true" />
              Furia Off Market
            </span>
            <h2 className="mt-3 font-serif text-xl leading-snug text-ink sm:text-2xl">
              {t("offmarket.teaser.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {t("offmarket.teaser.body")}
            </p>
          </div>
          <Link
            to="/off-market"
            onClick={() => trackClick("offmarket_teaser_click", { source })}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-terracotta sm:w-auto sm:text-xs"
          >
            {t("offmarket.teaser.cta")} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
