import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { trackEvent } from "@/lib/analytics";

const BUDGETS = [
  "Fino a 80.000 €",
  "80.000 – 150.000 €",
  "150.000 – 250.000 €",
  "250.000 – 400.000 €",
  "Oltre 400.000 €",
  "Preferisco parlarne direttamente",
];

const TYPES = [
  "Appartamento",
  "Casa indipendente",
  "Villetta",
  "Rustico / casale",
  "Villa",
  "Terreno",
  "Immobile da ristrutturare",
  "Non ho ancora deciso",
];

type Variant = "buyer" | "seller";

const COPY: Record<
  Variant,
  { submit: string; note: string; thanks: string; label: string }
> = {
  buyer: {
    submit: "Attiva la mia ricerca",
    note: "Registriamo la tua ricerca e ti ricontattiamo per capire meglio le tue esigenze. Nessuna garanzia di disponibilità immediata di immobili.",
    thanks:
      "Abbiamo ricevuto la tua richiesta di Ricerca Riservata. Ti ricontattiamo personalmente per approfondire cosa stai cercando.",
    label: "Ricerca riservata — dati di contatto",
  },
  seller: {
    submit: "Richiedi un contatto riservato",
    note: "Ti ricontattiamo per una prima valutazione riservata, senza impegno e senza pubblicare nulla online.",
    thanks:
      "Abbiamo ricevuto la tua richiesta. Ti ricontattiamo in modo riservato per valutare insieme la strategia più adatta.",
    label: "Vendita riservata — dati di contatto",
  },
};

export function OffMarketForm({ variant }: { variant: Variant }) {
  const notify = useServerFn(sendLeadNotification);
  const copy = COPY[variant];
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [openedAt] = useState(() => Date.now());

  function onFirstInteraction() {
    if (started) return;
    setStarted(true);
    trackEvent(
      variant === "buyer" ? "offmarket_buyer_form_start" : "offmarket_seller_form_start",
      { source: "off_market_page" },
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    if ((fd.get("website") as string)?.length) {
      setStatus("ok");
      return;
    }
    if (Date.now() - openedAt < 2000) {
      setErrorMsg("Invio troppo rapido, riprova.");
      return;
    }
    if (fd.get("privacy") !== "on") {
      setErrorMsg("Devi acconsentire al trattamento dei dati per inviare la richiesta.");
      return;
    }

    const full_name = String(fd.get("full_name") ?? "").trim().slice(0, 200);
    const email = String(fd.get("email") ?? "").trim().slice(0, 320);
    const phone = String(fd.get("phone") ?? "").trim().slice(0, 50);
    const area = String(fd.get("preferred_area") ?? "").trim().slice(0, 200);
    const type = String(fd.get("property_type") ?? "");
    const budget = String(fd.get("budget_range") ?? "");
    const note = String(fd.get("message") ?? "").trim().slice(0, 3000);

    if (!full_name || !email || !phone) {
      setErrorMsg("Compila nome, telefono ed email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Email non valida.");
      return;
    }

    const prefix =
      variant === "buyer"
        ? "[OFF MARKET — Ricerca riservata]"
        : "[OFF MARKET — Vendita riservata]";
    const message = [prefix, note].filter(Boolean).join("\n");

    const payload = {
      full_name,
      email,
      phone,
      preferred_area: area || null,
      budget_range: variant === "buyer" ? budget || null : null,
      property_type: type || null,
      message,
      source_page: "/off-market",
      privacy_accepted: true,
    };

    setStatus("submitting");
    const { error } = await supabase.from("leads").insert(payload);
    if (error) {
      setStatus("error");
      setErrorMsg("Si è verificato un problema. Riprova o scrivici direttamente.");
      return;
    }
    try {
      await notify({
        data: {
          full_name,
          email,
          phone,
          message,
          preferred_area: payload.preferred_area,
          budget_range: payload.budget_range,
          property_type: payload.property_type,
          source_page: payload.source_page,
        },
      });
    } catch (err) {
      console.error("[off-market lead notify] failed", err);
    }
    setStatus("ok");
    form.reset();
    trackEvent(variant === "buyer" ? "offmarket_buyer_lead" : "offmarket_seller_lead", {
      source: "off_market_page",
      property_type: payload.property_type ?? undefined,
      budget_range: payload.budget_range ?? undefined,
    });
  }

  if (status === "ok") {
    return (
      <div className="rounded-sm border border-border bg-cream p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto text-primary" size={32} aria-hidden="true" />
        <h3 className="mt-4 font-serif text-2xl text-ink">Grazie.</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{copy.thanks}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={onFirstInteraction}
      className="grid gap-3 sm:gap-3.5"
      noValidate
      aria-label={copy.label}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
        <Field label="Nome e cognome" name="full_name" required autoComplete="name" maxLength={200} />
        <Field label="Telefono" name="phone" type="tel" required autoComplete="tel" maxLength={50} />
        <Field label="Email" name="email" type="email" required autoComplete="email" maxLength={320} />
        {variant === "buyer" ? (
          <>
            <Field
              label="Zona cercata"
              name="preferred_area"
              maxLength={200}
              placeholder="Es. Pontremoli, Bagnone, alta Lunigiana…"
            />
            <SelectField label="Fascia di budget" name="budget_range" options={BUDGETS} />
            <SelectField label="Tipologia" name="property_type" options={TYPES} />
          </>
        ) : (
          <>
            <Field
              label="Comune dell'immobile"
              name="preferred_area"
              maxLength={200}
              placeholder="Es. Pontremoli"
            />
            <SelectField label="Tipologia" name="property_type" options={TYPES} />
          </>
        )}
      </div>

      <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
        {variant === "buyer"
          ? "Cosa stai cercando? (opzionale)"
          : "Cosa vorresti sapere o raccontarci? (opzionale)"}
        <textarea
          name="message"
          rows={3}
          maxLength={3000}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
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
          Acconsento al trattamento dei dati personali per essere ricontattato da Furia
          Immobiliare in merito a questa richiesta.
          <span className="mt-1 block text-[0.7rem] text-foreground/55">
            I dati sono usati solo per rispondere alla richiesta. Nessuna comunicazione
            commerciale o newsletter è collegata a questo invio.
          </span>
        </span>
      </label>

      {errorMsg && (
        <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="grid gap-2 pt-1">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 disabled:opacity-60 sm:px-7 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Invio in corso…
            </>
          ) : (
            <>
              {copy.submit} <ArrowRight size={14} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-[0.75rem] leading-relaxed text-foreground/60">{copy.note}</p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  maxLength,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
}): ReactNode {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      {required && <span className="sr-only">obbligatorio</span>}
      <input
        type={type}
        name={name}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
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
}): ReactNode {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <select
        name={name}
        defaultValue=""
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink focus:border-primary focus:outline-none"
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
