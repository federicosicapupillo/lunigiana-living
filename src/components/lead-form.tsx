import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

const PROPERTY_TYPES = [
  "Appartamento",
  "Casa indipendente",
  "Villetta",
  "Rustico / casale",
  "Villa",
  "Terreno",
  "Immobile da ristrutturare",
  "Non ho ancora deciso",
];

const BUDGETS = [
  "Fino a 80.000 €",
  "80.000 – 150.000 €",
  "150.000 – 250.000 €",
  "250.000 – 400.000 €",
  "Oltre 400.000 €",
  "Preferisco parlarne direttamente",
];

const WHATSAPP_URL = `https://wa.me/393207019985?text=${encodeURIComponent(
  "Ciao Elena, sto cercando casa in Lunigiana e vorrei ricevere qualche informazione.",
)}`;

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if ((fd.get("website") as string)?.length) {
      setStatus("ok"); // pretend success, drop silently
      return;
    }
    // Min time guard (2s)
    if (Date.now() - openedAt < 2000) {
      setErrorMsg("Invio troppo rapido, riprova.");
      return;
    }

    const privacy = fd.get("privacy") === "on";
    if (!privacy) {
      setErrorMsg("Devi accettare l'informativa privacy.");
      return;
    }

    const payload = {
      full_name: String(fd.get("full_name") ?? "").trim().slice(0, 200),
      email: String(fd.get("email") ?? "").trim().slice(0, 320),
      phone: String(fd.get("phone") ?? "").trim().slice(0, 50),
      preferred_area: emptyToNull(String(fd.get("preferred_area") ?? "").trim().slice(0, 200)),
      budget_range: emptyToNull(String(fd.get("budget_range") ?? "")),
      property_type: emptyToNull(String(fd.get("property_type") ?? "")),
      message: emptyToNull(String(fd.get("message") ?? "").trim().slice(0, 3000)),
      source_page: typeof window !== "undefined" ? window.location.pathname : "/",
      privacy_accepted: true,
    };

    if (!payload.full_name || !payload.email || !payload.phone) {
      setErrorMsg("Compila i campi obbligatori.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setErrorMsg("Email non valida.");
      return;
    }

    setStatus("submitting");
    const { error } = await supabase.from("leads").insert(payload);
    if (error) {
      setStatus("error");
      setErrorMsg("Si è verificato un problema. Riprova o scrivici su WhatsApp.");
      return;
    }
    setStatus("ok");
    form.reset();
  }

  if (status === "ok") {
    return (
      <div className="rounded-sm border border-border bg-cream p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto text-primary" size={36} />
        <h3 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">Grazie.</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
          La tua richiesta è stata inviata. Elena ti ricontatterà appena possibile.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome e cognome *" name="full_name" required maxLength={200} autoComplete="name" />
        <Field label="Email *" name="email" type="email" required maxLength={320} autoComplete="email" />
        <Field label="Telefono / WhatsApp *" name="phone" type="tel" required maxLength={50} autoComplete="tel" />
        <Field label="Comune o zona di interesse" name="preferred_area" maxLength={200} placeholder="Es. Pontremoli, Val di Magra…" />
        <SelectField label="Budget indicativo" name="budget_range" options={BUDGETS} />
        <SelectField label="Tipologia desiderata" name="property_type" options={PROPERTY_TYPES} />
      </div>

      <label className="grid gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
        Messaggio
        <textarea
          name="message"
          rows={4}
          maxLength={3000}
          placeholder="Es. cerco una casa con giardino vicino a Pontremoli, possibilmente abitabile e con vista…"
          className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
        <input
          type="checkbox"
          name="privacy"
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <span>
          Acconsento al trattamento dei dati personali per essere ricontattato da Furia Immobiliare in merito alla mia richiesta.
        </span>
      </label>

      {errorMsg && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 disabled:opacity-60 sm:w-auto sm:px-8 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Invio in corso…
            </>
          ) : (
            <>
              Invia la tua richiesta a Elena <ArrowRight size={14} />
            </>
          )}
        </button>
        <div className="text-xs text-foreground/70">
          Preferisci fare prima una domanda veloce?{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle size={14} /> Scrivi a Elena su WhatsApp
          </a>
        </div>
      </div>
    </form>
  );
}

function emptyToNull(v: string): string | null {
  return v.length ? v : null;
}

function Field({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <input
        {...input}
        className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <select
        name={name}
        defaultValue=""
        className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-ink focus:border-primary focus:outline-none"
      >
        <option value="">— Seleziona —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}