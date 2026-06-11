import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Client-side SEO localization: keeps <title>, meta description and <html lang>
 * in sync with the current language. Pass translation keys.
 */
export function useLocalizedHead(titleKey: string, descriptionKey?: string) {
  const { language, t } = useLanguage();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const title = t(titleKey);
    if (title) document.title = title;
    if (descriptionKey) {
      const desc = t(descriptionKey);
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", desc);
    }
    document.documentElement.lang = language;
  }, [language, titleKey, descriptionKey, t]);
}