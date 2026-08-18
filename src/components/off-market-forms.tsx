import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { trackEvent } from "@/lib/analytics";
import { useT } from "@/lib/i18n/LanguageContext";
import { OM_BUDGETS, OM_TYPES } from "@/lib/off-market";

type Variant = "buyer" | "seller";

export function OffMarketForm({ variant }: { variant: Variant }) {
  const t = useT();
  const notify = useServerFn(sendLeadNotification);
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
      setErrorMsg(t("om.form.err.fast"));
      return;
    }
    if (fd.get("privacy") !== "on") {
      setErrorMsg(t("om.form.err.privacy"));
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
      setErrorMsg(t("om.form.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t("om.form.err.email"));
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
      setErrorMsg(t("om.form.err.generic"));
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
        <h3 className="mt-4 font-serif text-2xl text-ink">{t("om.form.thanksTitle")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {t(`om.form.${variant}.thanks`)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={onFirstInteraction}
      className="grid gap-3 sm:gap-3.5"
      noValidate
      aria-label={t(`om.form.${variant}.label`)}
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
        <Field label={t("om.form.name")} requiredLabel={t("om.form.required")} name="full_name" required autoComplete="name" maxLength={200} />
        <Field label={t("om.form.phone")} requiredLabel={t("om.form.required")} name="phone" type="tel" required autoComplete="tel" maxLength={50} />
        <Field label={t("om.form.email")} requiredLabel={t("om.form.required")} name="email" type="email" required autoComplete="email" maxLength={320} />
        {variant === "buyer" ? (
          <>
            <Field
              label={t("om.form.areaBuyer")}
              name="preferred_area"
              maxLength={200}
              placeholder={t("om.form.areaBuyerPh")}
            />
            <SelectField
              label={t("om.form.budget")}
              name="budget_range"
              options={OM_BUDGETS.map((b) => ({ value: b.value, label: t(b.key) }))}
              emptyLabel={t("om.form.select")}
            />
            <SelectField
              label={t("om.form.type")}
              name="property_type"
              options={OM_TYPES.map((o) => ({ value: o.value, label: t(o.key) }))}
              emptyLabel={t("om.form.select")}
            />
          </>
        ) : (
          <>
            <Field
              label={t("om.form.areaSeller")}
              name="preferred_area"
              maxLength={200}
              placeholder={t("om.form.areaSellerPh")}
            />
            <SelectField
              label={t("om.form.type")}
              name="property_type"
              options={OM_TYPES.map((o) => ({ value: o.value, label: t(o.key) }))}
              emptyLabel={t("om.form.select")}
            />
          </>
        )}
      </div>

      <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
        {variant === "buyer" ? t("om.form.msgBuyer") : t("om.form.msgSeller")}
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
          {t("om.form.privacy")}
          <span className="mt-1 block text-[0.7rem] text-foreground/55">
            {t("om.form.privacyNote")}
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-center text-[0.7rem] uppercase tracking-[0.18em] text-cream transition hover:bg-ink/90 disabled:opacity-60 sm:px-7 sm:py-4 sm:text-xs sm:tracking-[0.2em]"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" /> {t("om.form.sending")}
            </>
          ) : (
            <>
              {t(`om.form.${variant}.submit`)} <ArrowRight size={14} className="shrink-0" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-[0.75rem] leading-relaxed text-foreground/60">
          {t(`om.form.${variant}.note`)}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  requiredLabel,
  maxLength,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  requiredLabel?: string;
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
}): ReactNode {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      {required && <span className="sr-only">{requiredLabel}</span>}
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
  emptyLabel,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  emptyLabel: string;
}): ReactNode {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <select
        name={name}
        defaultValue=""
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink focus:border-primary focus:outline-none"
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
