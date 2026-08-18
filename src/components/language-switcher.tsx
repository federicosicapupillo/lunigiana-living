import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";
import { trackClick } from "@/lib/analytics";

const FLAGS: Record<Language, { flag: string; label: string }> = {
  it: { flag: "🇮🇹", label: "Italiano" },
  en: { flag: "🇬🇧", label: "English" },
};

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const btn = (lang: Language) => {
    const active = language === lang;
    const { flag, label } = FLAGS[lang];
    return (
      <button
        key={lang}
        type="button"
        onClick={() => {
          if (lang !== language) {
            trackClick("language_switch", {
              from_language: language,
              to_language: lang,
            });
          }
          setLanguage(lang);
        }}
        aria-pressed={active}
        aria-label={`Switch language to ${label}`}
        title={label}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-sm text-lg leading-none transition-all duration-200 ${
          active
            ? "opacity-100 ring-1 ring-terracotta/60"
            : "opacity-60 hover:opacity-100 hover:ring-1 hover:ring-ink/15"
        }`}
      >
        <span aria-hidden>{flag}</span>
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      {btn("it")}
      {btn("en")}
    </div>
  );
}