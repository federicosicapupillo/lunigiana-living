import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

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
  return (
    <section className="container-editorial pb-32 pt-32 md:pt-40">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <span className="eyebrow">Contatti</span>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-ink md:text-6xl">
            Raccontaci la casa<br />che hai in mente.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            Rispondiamo a tutti, di persona. Scrivici una mail, una telefonata,
            o vienici a trovare in agenzia a Pontremoli.
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex items-start gap-4">
              <MapPin size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Agenzia</div>
                <div className="mt-1 text-foreground/85">Piazza della Repubblica<br />54027 Pontremoli (MS)</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Telefono</div>
                <div className="mt-1 text-foreground/85">+39 0187 000 000</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">Email</div>
                <div className="mt-1 text-foreground/85">info@furiaimmobiliare.it</div>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={(e) => e.preventDefault()}
          className="space-y-5 rounded-sm bg-card p-8 md:col-span-6 md:col-start-7 md:p-12">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome" />
            <Field label="Cognome" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Email" type="email" />
            <Field label="Telefono" type="tel" />
          </div>
          <Field label="Comune di interesse" placeholder="Pontremoli, Bagnone, Zeri…" />
          <label className="block">
            <span className="eyebrow text-[0.65rem]">Raccontaci</span>
            <textarea rows={5} placeholder="Che casa stai cercando? Per chi? In che zona?"
              className="mt-2 w-full border-0 border-b border-border bg-transparent pb-2 text-sm text-ink placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-0" />
          </label>
          <button type="submit"
            className="mt-4 w-full rounded-sm bg-primary py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90">
            Invia messaggio
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.65rem]">{label}</span>
      <input type={type} placeholder={placeholder}
        className="mt-2 w-full border-0 border-b border-border bg-transparent pb-2 text-sm text-ink placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-0" />
    </label>
  );
}