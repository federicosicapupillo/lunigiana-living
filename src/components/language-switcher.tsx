import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const btn = (lang: Language, label: string) => {
    const active = language === lang;
    return (
      <button
        key={lang}
        type="button"
        onClick={() => setLanguage(lang)}
        aria-pressed={active}
        aria-label={`Switch language to ${label}`}
        className={`px-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors ${
          active ? "text-terracotta" : "text-ink-soft hover:text-terracotta"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      {btn("it", "IT")}
      <span aria-hidden className="text-warm-border">|</span>
      {btn("en", "EN")}
    </div>
  );
}