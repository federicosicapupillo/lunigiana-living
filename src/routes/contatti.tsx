import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappUrl } from "@/components/whatsapp-float";
import { LeadForm } from "@/components/lead-form";
import { useT } from "@/lib/i18n/LanguageContext";

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
  const t = useT();
  const waHref = whatsappUrl(t("wa.defaultMsg"));
  return (
    <section className="container-editorial pb-24 pt-28 md:pt-36">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <span className="eyebrow">{t("contatti.eyebrow")}</span>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-ink md:text-6xl">
            {t("contatti.title1")}<br />{t("contatti.title2")}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            {t("contatti.lead")}
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex items-start gap-4">
              <MapPin size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">{t("contatti.agency")}</div>
                <div className="mt-1 text-foreground/85">Furia Immobiliare di Furia Elena<br />Via Pirandello 7<br />54027 Pontremoli (MS)</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">{t("contatti.phone")}</div>
                <div className="mt-1 text-foreground/85">0187 830229<br />320 7019985</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="eyebrow text-[0.65rem]">{t("contatti.email")}</div>
                <div className="mt-1 text-foreground/85">furiaimmobiliare@libero.it</div>
              </div>
            </li>
          </ul>

          <div className="mt-10 rounded-sm border border-warm-border/70 bg-warm-ivory p-6">
            <div className="eyebrow text-[0.65rem]">{t("contatti.wa")}</div>
            <h2 className="mt-2 font-serif text-2xl text-ink">{t("contatti.waTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {t("contatti.waBody")}
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
              {t("cta.writeOnWhatsapp")}
            </a>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="rounded-md border border-warm-border/70 bg-warm-cream p-5 shadow-[0_1px_0_rgba(36,23,17,.04),0_18px_38px_-24px_rgba(36,23,17,.25)] sm:p-6">
            <LeadForm variant="generic" source="contatti" showPromise={false} />
          </div>
          <div className="mt-6 rounded-sm border border-warm-border/70 bg-warm-ivory/70 p-5 text-sm">
            <div className="eyebrow text-[0.65rem]">{t("guided.altContact.title")}</div>
            <p className="mt-2 text-foreground/80">{t("guided.altContact.body")}</p>
            <Link
              to="/trova-casa-lunigiana"
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("guided.linkBlock.cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}