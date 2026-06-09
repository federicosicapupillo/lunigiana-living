import { MessageCircle } from "lucide-react";

const HOME_MSG =
  "Ciao Elena, sto cercando casa in Lunigiana e vorrei ricevere maggiori informazioni.";

export function WhatsAppFloat() {
  const href = `https://wa.me/393207019985?text=${encodeURIComponent(HOME_MSG)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrivi a Elena su WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-cream shadow-lg shadow-ink/30 transition hover:bg-primary sm:bottom-6 sm:right-6 sm:px-5"
      style={{
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white">
        <MessageCircle size={16} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="hidden text-[0.7rem] uppercase tracking-[0.18em] sm:inline">
        Scrivi a Elena
      </span>
      <span className="text-[0.7rem] uppercase tracking-[0.18em] sm:hidden">
        WhatsApp
      </span>
    </a>
  );
}

export function whatsappUrl(message: string) {
  return `https://wa.me/393207019985?text=${encodeURIComponent(message)}`;
}