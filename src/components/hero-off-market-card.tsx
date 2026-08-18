import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageContext";
import { trackClick } from "@/lib/analytics";

/**
 * Card discreta "Furia Off Market" per la hero della home.
 * `tone="dark"` per hero fotografica (testo chiaro su vetro scuro),
 * `tone="light"` per hero su fondo cream.
 */
export function HeroOffMarketCard({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const t = useT();
  const dark = tone === "dark";
  return (
    <aside
      aria-label="Furia Off Market"
      className={[
        "rounded-sm border p-5 backdrop-blur-[2px] sm:p-6",
        dark
          ? "border-cream/25 bg-ink/35 text-cream"
          : "border-warm-border/70 bg-warm-ivory/70 text-ink",
      ].join(" ")}
    >
      <span
        className={
          "eyebrow " + (dark ? "text-cream/85" : "text-terracotta")
        }
      >
        <Lock size={12} className="mr-1.5 inline" aria-hidden="true" />
        {t("home.offmarket.eyebrow")}
      </span>
      <p
        className={
          "mt-3 font-serif text-xl leading-snug sm:text-2xl " +
          (dark ? "text-cream" : "text-ink")
        }
      >
        {t("home.offmarket.title")}
      </p>
      <p
        className={
          "mt-2.5 text-sm leading-relaxed " +
          (dark ? "text-cream/85" : "text-foreground/80")
        }
      >
        {t("home.offmarket.body")}
      </p>
      <Link
        to="/off-market"
        onClick={() => trackClick("home_offmarket_cta_click", { source: "home_hero" })}
        className={
          "mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm border px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
          (dark
            ? "border-cream/70 text-cream hover:bg-cream hover:text-ink focus-visible:ring-cream focus-visible:ring-offset-ink/40"
            : "border-ink text-ink hover:bg-ink hover:text-cream focus-visible:ring-ink focus-visible:ring-offset-cream")
        }
      >
        {t("home.offmarket.cta")} <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}
