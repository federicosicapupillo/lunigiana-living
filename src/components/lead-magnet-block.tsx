import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Check, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { useT, useLanguage } from "@/lib/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

type Variant = "full" | "compact";

const INTERESTS_IT = [
  { value: "looking", label: "Sto cercando una casa in Lunigiana" },
  { value: "second_home", label: "Sto valutando una seconda casa" },
  { value: "abroad", label: "Vorrei comprare dall'estero" },
  { value: "investment", label: "Sto valutando un investimento" },
  { value: "areas", label: "Voglio capire le zone migliori" },
  { value: "speak", label: "Preferisco parlare direttamente con Elena" },
];
const INTERESTS_EN = [
  { value: "looking", label: "I'm looking for a home in Lunigiana" },
  { value: "second_home", label: "I'm considering a second home" },
  { value: "abroad", label: "I'd like to buy from abroad" },
  { value: "investment", label: "I'm evaluating an investment" },
  { value: "areas", label: "I want to understand the best areas" },
  { value: "speak", label: "I'd rather speak directly with Elena" },
];

export function LeadMagnetBlock({
  source = "lead_magnet",
  variant = "full",
}: {
  source?: string;
  variant?: Variant;
}) {
  const t = useT();
  const { language } = useLanguage();
  const notify = useServerFn(sendLeadNotification);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());
  const viewedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewedRef.current) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true;
            trackEvent("lead_magnet_view", {
              source,
              language,
              page_path: typeof window !== "undefined" ? window.location.pathname : "/",
            });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [source, language]);

  const INTERESTS = language === "en" ? INTERESTS_EN : INTERESTS_IT;
  const bullets = [
    t("magnet.b1"),
    t("magnet.b2"),
    t("magnet.b3"),
    t("magnet.b4"),
    t("magnet.b5"),
    t("magnet.b6"),
  ];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    if ((fd.get("website") as string)?.length) {
      setStatus("ok");
      return;
    }
    if (Date.now() - openedAt < 1500) {
      setErrorMsg(t("form.err.tooFast"));
      return;
    }
    const privacy = fd.get("privacy") === "on";
    if (!privacy) {
      setErrorMsg(t("form.err.privacy"));
      return;
    }

    const full_name = String(fd.get("full_name") ?? "").trim().slice(0, 200);
    const email = String(fd.get("email") ?? "").trim().slice(0, 320);
    const phoneRaw = String(fd.get("phone") ?? "").trim().slice(0, 50);
    const phone = phoneRaw.length >= 3 ? phoneRaw : "—";
    const interestValue = String(fd.get("interest") ?? "").trim().slice(0, 50);
    const interest = INTERESTS.find((i) => i.value === interestValue);
    const sourcePath = typeof window !== "undefined" ? window.location.pathname : "/";

    if (!full_name || !email) {
      setErrorMsg(t("form.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t("form.err.email"));
      return;
    }
    if (!interest) {
      setErrorMsg(t("magnet.err.interest"));
      return;
    }

    const tag = language === "en" ? "Lunigiana Guide" : "Guida Lunigiana";
    const interestLabelIt = INTERESTS_IT.find((i) => i.value === interestValue)?.label ?? interest.label;
    const message = `[${tag}] ${language === "en" ? "Interest" : "Interesse"}: ${interest.label}`;
    const property_type = language === "en"
      ? "Lead magnet — Lunigiana guide"
      : "Lead magnet — Guida Lunigiana";

    setStatus("submitting");
    const insertPayload = {
      full_name,
      email,
      phone,
      preferred_area: null,
      budget_range: null,
      property_type,
      message: message + (language === "en" && interestLabelIt !== interest.label ? ` / ${interestLabelIt}` : ""),
      source_page: `lead_magnet:${sourcePath}`,
      privacy_accepted: true,
    };
    const { error } = await supabase.from("leads").insert(insertPayload);
    if (error) {
      setStatus("error");
      setErrorMsg(t("form.err.generic"));
      trackEvent("lead_magnet_submit_error", {
        source,
        language,
        interest_type: interestValue,
        page_path: sourcePath,
      });
      return;
    }
    try {
      await notify({
        data: {
          full_name,
          email,
          phone,
          message: insertPayload.message,
          preferred_area: null,
          budget_range: null,
          property_type,
          source_page: `lead_magnet:${sourcePath}`,
        },
      });
    } catch (err) {
      console.error("[lead magnet notify] failed", err);
    }
    setStatus("ok");
    form.reset();
    trackEvent("lead_magnet_submit_success", {
      source,
      language,
      interest_type: interestValue,
      page_path: sourcePath,
    });
  }

  const isCompact = variant === "compact";

  return (
    <div
      ref={rootRef}
      className={`rounded-md border border-warm-border/70 bg-warm-cream shadow-[0_1px_0_rgba(36,23,17,.04),0_18px_38px_-24px_rgba(36,23,17,.25)] ${
        isCompact ? "p-6 sm:p-8" : "p-6 sm:p-10"
      }`}
    >
      <div className={`grid gap-8 ${isCompact ? "" : "md:grid-cols-12 md:gap-12"}`}>
        <div className={isCompact ? "" : "md:col-span-5"}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-cream px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-primary">
            <BookOpen size={13} strokeWidth={1.7} />
            {t("magnet.eyebrow")}
          </div>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-ink sm:text-3xl md:text-[2.1rem]">
            {t("magnet.title")}
          </h2>
          <p className="mt-3 font-serif italic text-foreground/80 sm:text-lg">
            {t("magnet.subtitle")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80 sm:text-[0.95rem]">
            {t("magnet.body")}
          </p>
          <ul className="mt-5 grid gap-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/85">
                <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={isCompact ? "" : "md:col-span-7"}>
          {status === "ok" ? (
            <div className="flex h-full flex-col items-start justify-center rounded-sm border border-border bg-cream p-6 text-left">
              <CheckCircle2 className="text-primary" size={32} />
              <h3 className="mt-3 font-serif text-2xl text-ink">{t("magnet.thanks.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {t("magnet.thanks.body")}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:gap-3.5">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
                <FieldLM
                  label={t("magnet.f.name")}
                  name="full_name"
                  required
                  maxLength={200}
                  autoComplete="name"
                />
                <FieldLM
                  label={t("magnet.f.email")}
                  name="email"
                  type="email"
                  required
                  maxLength={320}
                  autoComplete="email"
                />
                <FieldLM
                  label={t("magnet.f.phone")}
                  name="phone"
                  type="tel"
                  maxLength={50}
                  autoComplete="tel"
                  placeholder={t("magnet.f.phonePh")}
                />
                <SelectLM
                  label={t("magnet.f.interest")}
                  name="interest"
                  options={INTERESTS}
                  placeholder={t("form.select")}
                  required
                />
              </div>

              <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
                <input
                  type="checkbox"
                  name="privacy"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                />
                <span>{t("magnet.privacy")}</span>
              </label>

              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  data-track="lead_magnet_cta_click"
                  onClick={() =>
                    trackEvent("lead_magnet_cta_click", {
                      source,
                      language,
                      page_path: typeof window !== "undefined" ? window.location.pathname : "/",
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[var(--terracotta)] px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] text-cream transition hover:bg-[var(--terracotta-hover)] disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t("form.submitting")}
                    </>
                  ) : (
                    <>
                      {t("magnet.cta")} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLM({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <input
        {...input}
        className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-foreground/40 focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function SelectLM({
  label,
  name,
  options,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      <select
        name={name}
        defaultValue=""
        required={required}
        className="rounded-sm border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-ink focus:border-primary focus:outline-none"
      >
        <option value="">{placeholder ?? "—"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}