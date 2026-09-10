import { useState } from "react";
import { Check, Globe } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";
import { trackClick } from "@/lib/analytics";

const LANGS: { code: Language; label: string; short: string }[] = [
  { code: "it", label: "Italiano", short: "IT" },
  { code: "en", label: "English", short: "EN" },
];

function useSwitch() {
  const { language, setLanguage } = useLanguage();
  return {
    language,
    switchTo: (lang: Language) => {
      if (lang !== language) {
        trackClick("language_switch", {
          from_language: language,
          to_language: lang,
        });
        setLanguage(lang);
      }
    },
  };
}

/** Compact globe + active language control for the mobile header. */
export function MobileLanguageControl({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { language, switchTo } = useSwitch();
  const active = LANGS.find((l) => l.code === language) ?? LANGS[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cambia lingua"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex h-11 min-w-[68px] items-center justify-center gap-1.5 rounded-full border border-warm-border bg-warm-ivory/80 px-3 text-foreground transition-colors hover:border-terracotta/50 hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 ${className}`}
      >
        <Globe size={18} aria-hidden className="shrink-0" />
        <span className="text-sm font-semibold tracking-wide">{active.short}</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-warm-border bg-warm-cream pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg tracking-wide text-foreground">
              {language === "en" ? "Language" : "Lingua"}
            </SheetTitle>
          </SheetHeader>
          <ul className="mt-4 flex flex-col gap-2">
            {LANGS.map((l) => {
              const isActive = l.code === language;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => {
                      switchTo(l.code);
                      setOpen(false);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex min-h-[56px] w-full items-center justify-between rounded-xl border px-4 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 ${
                      isActive
                        ? "border-terracotta/60 bg-warm-ivory font-semibold text-terracotta"
                        : "border-warm-border bg-transparent text-ink-soft hover:bg-warm-ivory/70"
                    }`}
                  >
                    <span>{l.label}</span>
                    {isActive ? (
                      <Check size={20} aria-hidden />
                    ) : (
                      <span className="text-xs font-semibold tracking-widest text-ink-soft/60">
                        {l.short}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Secondary language section for the hamburger menu. */
export function MobileLanguageSection({ onSwitch }: { onSwitch?: () => void }) {
  const { language, switchTo } = useSwitch();
  return (
    <div>
      <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft/70">
        {language === "en" ? "Language" : "Lingua"}
      </p>
      <div className="mt-2 flex gap-2" role="group" aria-label="Cambia lingua">
        {LANGS.map((l) => {
          const isActive = l.code === language;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                switchTo(l.code);
                onSwitch?.();
              }}
              aria-current={isActive ? "true" : undefined}
              className={`min-h-11 flex-1 rounded-lg border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 ${
                isActive
                  ? "border-terracotta/60 bg-warm-ivory font-semibold text-terracotta"
                  : "border-warm-border text-ink-soft hover:bg-warm-ivory/70"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
