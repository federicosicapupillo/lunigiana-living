import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { whatsappUrl } from "@/components/whatsapp-float";
import { LeadForm } from "@/components/lead-form";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — Furia Immobiliare, Pontremoli" },
      { name: "description", content: "Scrivici o vienici a trovare in agenzia a Pontremoli. Siamo qui per aiutarti a trovare il tuo posto in Lunigiana." },
      { property: "og:title", content: "Contatti — Furia Immobiliare" },
      { property: "og:description", content: "Parla con la nostra agenzia di Pontremoli." },
    ],
    links: [{ rel: "canonical", href: "/contatti" }],
  }),
  component: ContattiPage,
});

function ContattiPage() {
  const waHref = whatsappUrl(
    "Ciao Elena, vorrei parlare con te per una ricerca immobiliare.",
  );
  return (
    <section className="container-editorial pb-24 pt-28 md:pt-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <span className="eyebrow">Contatti</span>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-ink md:text-6xl">
            Raccontaci che casa<br />stai cercando.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            Scrivi a Elena: ti aiuterà a capire quali immobili possono fare al
            caso tuo. Rispondiamo a tutti, di persona.
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex items-start gap-4">
              <MapPin size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Agenzia</div>
                <div className="mt-1 text-foreground/85">Furia Immobiliare di Furia Elena<br />Via Pirandello 7<br />54027 Pontremoli (MS)</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Telefono · Cellulare</div>
                <div className="mt-1 text-foreground/85">0187 830229<br />320 7019985</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Email</div>
                <div className="mt-1 text-foreground/85">furiaimmobiliare@libero.it</div>
              </div>
            </li>
          </ul>

          <div className="mt-10 rounded-sm border border-warm-border/70 bg-warm-ivory p-6">
            <div className="eyebrow text-[0.65rem]">WhatsApp</div>
            <h2 className="mt-2 font-serif text-2xl text-ink">Parla direttamente con Elena</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Hai visto una casa che ti interessa o vuoi raccontarci cosa stai
              cercando? Scrivi a Elena su WhatsApp: ti risponderà appena
              possibile.
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-primary"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366]" aria-hidden>
                <span className="block h-2 w-2 rounded-full bg-white" />
              </span>
              Scrivi su WhatsApp
            </a>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="rounded-md border border-warm-border/70 bg-warm-cream p-5 shadow-[0_1px_0_rgba(36,23,17,.04),0_18px_38px_-24px_rgba(36,23,17,.25)] sm:p-6">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}