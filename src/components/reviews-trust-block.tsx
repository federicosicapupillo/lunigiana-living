import { useEffect } from "react";
import { Heart, MapPin, Compass, BookOpen, KeyRound, Scale, ArrowRight, Star } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageContext";
import { trackEvent, trackClick } from "@/lib/analytics";

export const GOOGLE_REVIEWS_URL = "https://share.google/XuLvMM0CG6tmjlwpO";

type Variant = "full" | "compact";

interface Props {
  /** "full" = trust cards + case stories + Google CTA. "compact" = only intro + Google CTA. */
  variant?: Variant;
  /** Tracking source (page id). */
  source: string;
  /** Optional background class override. */
  className?: string;
}

export function ReviewsTrustBlock({ variant = "full", source, className }: Props) {
  const t = useT();

  useEffect(() => {
    trackEvent("trust_block_view", { source, variant });
  }, [source, variant]);

  const trustCards = [
    { icon: Heart, t: t("trust.card1.t"), b: t("trust.card1.b") },
    { icon: MapPin, t: t("trust.card2.t"), b: t("trust.card2.b") },
    { icon: Compass, t: t("trust.card3.t"), b: t("trust.card3.b") },
  ];

  const stories = [
    { icon: KeyRound, t: t("trust.story1.t"), b: t("trust.story1.b") },
    { icon: BookOpen, t: t("trust.story2.t"), b: t("trust.story2.b") },
    { icon: Scale, t: t("trust.story3.t"), b: t("trust.story3.b") },
  ];

  const onGoogle = () =>
    trackClick("reviews_google_click", { source, variant });

  return (
    <section
      className={
        className ??
        "bg-[var(--cream)] py-16 sm:py-20 md:py-24"
      }
    >
      <div className="container-editorial">
        {/* Intro */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t("trust.eyebrow")}</span>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            {t("trust.title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground/80">
            {t("trust.subtitle")}
          </p>
        </div>

        {variant === "full" && (
          <>
            {/* Trust cards (method, not testimonials) */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:mt-14">
              {trustCards.map((c) => (
                <article
                  key={c.t}
                  className="rounded-2xl border border-[var(--terracotta)]/15 bg-[var(--warm-ivory)] p-7 shadow-[0_10px_24px_-22px_rgba(36,23,17,0.35)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--terracotta)]/30 bg-[var(--cream)]">
                    <c.icon size={20} strokeWidth={1.5} className="text-[var(--terracotta)]" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl leading-snug text-ink">{c.t}</h3>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">{c.b}</p>
                </article>
              ))}
            </div>

            {/* Editorial case stories */}
            <div className="mx-auto mt-16 max-w-3xl text-center">
              <span className="eyebrow">{t("trust.stories.eyebrow")}</span>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
                {t("trust.stories.title")}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-foreground/75">
                {t("trust.stories.intro")}
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {stories.map((s) => (
                <article
                  key={s.t}
                  className="rounded-2xl border border-warm-border/70 bg-[var(--warm-ivory)] p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[var(--terracotta)]/50" />
                    <s.icon size={18} strokeWidth={1.5} className="text-[var(--terracotta)]" />
                  </div>
                  <h4 className="mt-4 font-serif text-lg leading-snug text-ink">{s.t}</h4>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">{s.b}</p>
                  <p className="mt-4 text-[0.72rem] uppercase tracking-[0.18em] text-foreground/45">
                    {t("trust.stories.editorialNote")}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Google reviews CTA */}
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--terracotta)]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={18} strokeWidth={1.5} />
            ))}
          </div>
          <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-foreground/70">
            {t("trust.google.body")}
          </p>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="reviews_google_click"
            onClick={onGoogle}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[var(--terracotta)] px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:opacity-90 sm:px-8 sm:py-4 sm:tracking-[0.22em]"
          >
            {t("trust.google.cta")} <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ReviewsTrustBlock;