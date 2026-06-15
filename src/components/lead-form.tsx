import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/LanguageContext";
import { useServerFn } from "@tanstack/react-start";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { trackClick, trackEvent } from "@/lib/analytics";

const PROPERTY_TYPES_IT = [
  "Appartamento","Casa indipendente","Villetta","Rustico / casale","Villa","Terreno","Immobile da ristrutturare","Non ho ancora deciso",
];
const PROPERTY_TYPES_EN = [
  "Apartment","Detached house","Townhouse","Farmhouse / country house","Villa","Land","Property to renovate","Not decided yet",
];
const BUDGETS_IT = [
  "Fino a 80.000 €","80.000 – 150.000 €","150.000 – 250.000 €","250.000 – 400.000 €","Oltre 400.000 €","Preferisco parlarne direttamente",
];
const BUDGETS_EN = [
  "Up to € 80,000","€ 80,000 – 150,000","€ 150,000 – 250,000","€ 250,000 – 400,000","Over € 400,000","Prefer to discuss directly",
];

export type LeadFormVariant = "generic" | "search" | "property" | "valuation";

export interface LeadFormProps {
  variant?: LeadFormVariant;
  source?: string;
  showPromise?: boolean;
}

export function LeadForm({
  variant = "generic",
  source,
  showPromise = true,
}: LeadFormProps = {}) {
  const t = useT();
  const { language } = useLanguage();
  const notify = useServerFn(sendLeadNotification);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());

  const PROPERTY_TYPES = language === "en" ? PROPERTY_TYPES_EN : PROPERTY_TYPES_IT;
  const BUDGETS = language === "en" ? BUDGETS_EN : BUDGETS_IT;
  const WHATSAPP_URL = `https://wa.me/393207019985?text=${encodeURIComponent(t("wa.defaultMsg"))}`;
  const trackingSource = source ?? "lead_form";

  // Fire a single view event per mount.
  useEffect(() => {
    const page_path = typeof window !== "undefined" ? window.location.pathname : "/";
    trackEvent("contact_form_view", {
      source: trackingSource,
      variant,
      page_path,
      language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promiseTitleKey =
    variant === "property" ? "form.promise.titleProperty" : "form.promise.title";
  const promiseSubtitleKey =
    variant === "property" ? "form.promise.subtitleProperty" : "form.promise.subtitle";
  const submitKey =
    variant === "property"
      ? "form.submit.property"
      : variant === "search"
        ? "form.submit.search"
        : variant === "valuation"
          ? "form.submit.valuation"
          : "form.submit.generic";

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
      setErrorMsg(t("form.err.tooFast"));
      return;
    }

    const privacy = fd.get("privacy") === "on";
    if (!privacy) {
      setErrorMsg(t("form.err.privacy"));
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
      setErrorMsg(t("form.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setErrorMsg(t("form.err.email"));
      return;
    }

    setStatus("submitting");
    const { error } = await supabase.from("leads").insert(payload);
    if (error) {
      setStatus("error");
      setErrorMsg(t("form.err.generic2"));
      trackEvent("lead_form_submit_error", {
        source: trackingSource,
        page_path: payload.source_page,
        budget_range: payload.budget_range ?? undefined,
        property_type: payload.property_type ?? undefined,
        language,
      });
      trackEvent("contact_form_submit_error", {
        source: trackingSource,
        variant,
        page_path: payload.source_page,
        language,
      });
      return;
    }
    try {
      await notify({
        data: {
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone,
          message: payload.message,
          preferred_area: payload.preferred_area,
          budget_range: payload.budget_range,
          property_type: payload.property_type,
          source_page: payload.source_page,
        },
      });
    } catch (err) {
      console.error("[lead notify] failed", err);
    }
    setStatus("ok");
    form.reset();
    trackEvent("lead_form_submit_success", {
      source: trackingSource,
      page_path: payload.source_page,
      budget_range: payload.budget_range ?? undefined,
      property_type: payload.property_type ?? undefined,
      language,
    });
    trackEvent("contact_form_submit_success", {
      source: trackingSource,
      variant,
      page_path: payload.source_page,
      language,
    });
  }

  if (status === "ok") {
    return (
      <div className="rounded-sm border border-border bg-cream p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto text-primary" size={36} />
        <h3 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{t("form.thanksTitle")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
          {t("form.thanksBodyLong")}
        </p>
        {variant === "property" && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
            {t("form.thanksBodyProperty")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {showPromise && (
        <div className="grid gap-2">
          <span className="eyebrow text-[0.65rem]">{t("form.promise.eyebrow")}</span>
          <h3 className="font-serif text-xl text-ink sm:text-2xl">{t(promiseTitleKey)}</h3>
          <p className="text-sm leading-relaxed text-foreground/75">{t(promiseSubtitleKey)}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3 sm:gap-3.5" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
        <Field label={t("form.fullName")} name="full_name" required maxLength={200} autoComplete="name" />
        <Field label={t("form.email")} name="email" type="email" required maxLength={320} autoComplete="email" />
        <Field
          label={t("form.phone")}
          name="phone"
          type="tel"
          required
          maxLength={50}
          autoComplete="tel"
          hint={t("form.hint.phone")}
        />
        <Field label={t("form.area")} name="preferred_area" maxLength={200} placeholder={t("form.areaPh")} />
        <SelectField label={t("form.budget")} name="budget_range" options={BUDGETS} placeholder={t("form.select")} />
        <SelectField label={t("form.propertyType")} name="property_type" options={PROPERTY_TYPES} placeholder={t("form.select")} />
      </div>

      <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
        {t("form.message")}
        <textarea
          name="message"
          rows={3}
          maxLength={3000}
          placeholder={t("form.messagePh")}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
        />
        <span className="text-[0.7rem] normal-case tracking-normal text-foreground/55">
          {t("form.hint.message")}
        </span>
      </label>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
        <input
          type="checkbox"
          name="privacy"
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <span>
          {t("form.privacy")}
          <span className="mt-1 block text-[0.7rem] text-foreground/55">
            {t("form.hint.privacy")}
          </span>
        </span>
      </label>

      {errorMsg && (
        <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="text-destructive">{errorMsg}</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackClick("contact_whatsapp_fallback_click", {
                source: trackingSource,
                variant,
                language,
              })
            }
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle size={14} /> {t("form.alt.cta")}
          </a>
        </div>
      )}

      <div className="grid gap-2 pt-1">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 disabled:opacity-60 sm:px-7 sm:py-4 sm:text-xs sm:tracking-[0.22em]"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> {t("form.submitting")}
            </>
          ) : (
            <>
              {t(submitKey)} <ArrowRight size={14} />
            </>
          )}
        </button>
        <p className="text-[0.75rem] leading-relaxed text-foreground/60">
          {t("form.hint.submit")}
        </p>
      </div>
      </form>

      {/* WhatsApp alternative — discreet, never replaces the form */}
      <div className="flex flex-col gap-2 rounded-sm border border-warm-border/60 bg-warm-ivory/60 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-foreground/75">{t("form.alt.title")}</span>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackClick("contact_whatsapp_fallback_click", {
              source: trackingSource,
              variant,
              language,
            })
          }
          className="inline-flex items-center gap-1.5 self-start font-medium text-primary underline-offset-4 hover:underline sm:self-auto"
        >
          <MessageCircle size={14} /> {t("form.alt.cta")}
        </a>
      </div>
    </div>
  );
}

function emptyToNull(v: string): string | null {
  return v.length ? v : null;
}

function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
      <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <input
        {...input}
        className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
      />
      {hint && (
        <span className="text-[0.7rem] normal-case tracking-normal text-foreground/55">
          {hint}
        </span>
      )}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <select
        name={name}
        defaultValue=""
        className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink focus:border-primary focus:outline-none"
      >
        <option value="">{placeholder ?? "— Seleziona —"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}