import { MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageContext";

export function WhatsAppFloat() {
  const t = useT();
  const href = `https://wa.me/393207019985?text=${encodeURIComponent(t("wa.defaultMsg"))}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("wa.aria")}
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-ink p-2.5 text-cream shadow-lg shadow-ink/30 transition hover:bg-primary sm:bottom-5 sm:right-5 sm:p-2 sm:pr-4"
      style={{
        paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white sm:h-8 sm:w-8">
        <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="hidden text-[0.7rem] uppercase tracking-[0.18em] sm:inline">
        {t("cta.writeToElena")}
      </span>
    </a>
  );
}

export function whatsappUrl(message: string) {
  return `https://wa.me/393207019985?text=${encodeURIComponent(message)}`;
}