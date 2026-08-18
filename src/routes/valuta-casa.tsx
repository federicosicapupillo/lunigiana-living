import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { trackEvent } from "@/lib/analytics";
import { siteUrl } from "@/lib/site-url";
import { institutionalGraph } from "@/lib/structured-data";
import { whatsappUrl } from "@/components/whatsapp-float";
import { COMUNI_MASSA_CARRARA } from "@/lib/comuni-ms";
import {
  OUTDOOR_FEATURES,
  VAL_CONDITIONS,
  VAL_CONTACT_METHODS,
  VAL_FEATURES,
  VAL_GOALS,
  VAL_HAS_PRICE,
  VAL_OCCUPANCY,
  VAL_TIMELINE,
  VAL_TYPES,
  isOffMarketGoal,
  valLabel,
  valLabelOf,
  type ValOption,
} from "@/lib/valuation";

const TITLE_IT = "Valutazione Immobiliare in Lunigiana | Furia Immobiliare";
const DESC_IT =
  "Richiedi una valutazione del tuo immobile con Furia Immobiliare. Raccontaci la tua casa, le sue caratteristiche e le tue aspettative di vendita.";

export const Route = createFileRoute("/valuta-casa")({
  head: () => {
    const url = siteUrl("/valuta-casa");
    const ld = institutionalGraph({
      canonical: url,
      type: "WebPage",
      name: TITLE_IT,
      description: DESC_IT,
    });
    return {
      meta: [
        { title: TITLE_IT },
        { name: "description", content: DESC_IT },
        { property: "og:title", content: TITLE_IT },
        { property: "og:description", content: DESC_IT },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  component: ValutaCasaPage,
});

type StepId =
  | "where"
  | "type"
  | "features"
  | "condition"
  | "price"
  | "timeline"
  | "goal"
  | "notes"
  | "contacts";

const STEPS: StepId[] = [
  "where",
  "type",
  "features",
  "condition",
  "price",
  "timeline",
  "goal",
  "notes",
  "contacts",
];

interface State {
  municipality: string;
  area: string;
  address: string;
  street_number: string;
  property_type: string;
  sqm: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  features: string[];
  outdoor_sqm: string;
  property_condition: string;
  occupancy_status: string;
  has_expected_price: string;
  expected_price: string;
  selling_timeline: string;
  main_goal: string;
  notes: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  preferred_contact_method: string;
  privacy: boolean;
  marketing: boolean;
}

const EMPTY: State = {
  municipality: "",
  area: "",
  address: "",
  street_number: "",
  property_type: "",
  sqm: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  features: [],
  outdoor_sqm: "",
  property_condition: "",
  occupancy_status: "",
  has_expected_price: "",
  expected_price: "",
  selling_timeline: "",
  main_goal: "",
  notes: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  preferred_contact_method: "",
  privacy: false,
  marketing: false,
};

function ValutaCasaPage() {
  const t = useT();
  const { language } = useLanguage();
  useLocalizedHead("val.seo.title", "val.seo.desc");

  const notify = useServerFn(sendLeadNotification);
  const [stepIdx, setStepIdx] = useState(0);
  const [state, setState] = useState<State>(EMPTY);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState("");
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const completedRef = useRef<Set<number>>(new Set());
  const priceYesRef = useRef(false);
  const submittingRef = useRef(false);

  if (!viewedRef.current && typeof window !== "undefined") {
    viewedRef.current = true;
    trackEvent("valuation_page_view", { language });
  }

  const total = STEPS.length;
  const current = STEPS[stepIdx];

  const waHref = useMemo(
    () => whatsappUrl(t("wa.defaultMsg")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  function patch(p: Partial<State>) {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("valuation_form_start", { language });
    }
    setState((s) => ({ ...s, ...p }));
  }

  function next() {
    setErrorMsg(null);
    if (current === "where" && !state.municipality) {
      setErrorMsg(t("val.err.municipality"));
      return;
    }
    if (current === "type" && !state.property_type) {
      setErrorMsg(t("val.err.type"));
      return;
    }
    if (!completedRef.current.has(stepIdx)) {
      completedRef.current.add(stepIdx);
      trackEvent("valuation_step_complete", {
        language,
        step: current,
        step_index: stepIdx + 1,
      });
    }
    setStepIdx((i) => Math.min(i + 1, total - 1));
  }

  function back() {
    setErrorMsg(null);
    setStepIdx((i) => Math.max(i - 1, 0));
  }

  function toggleFeature(v: string) {
    patch({
      features: state.features.includes(v)
        ? state.features.filter((x) => x !== v)
        : [...state.features, v],
    });
  }

  function setHasPrice(v: string) {
    patch({ has_expected_price: v, ...(v === "no" ? { expected_price: "" } : {}) });
    if (v === "yes" && !priceYesRef.current) {
      priceYesRef.current = true;
      trackEvent("valuation_expected_price_yes", { language });
    }
  }

  function setGoal(v: string) {
    patch({ main_goal: v });
    if (isOffMarketGoal(v)) {
      trackEvent("valuation_offmarket_interest", { language, main_goal: v });
    }
  }

  const showOutdoor = state.features.some((f) =>
    (OUTDOOR_FEATURES as readonly string[]).includes(f),
  );
  const offMarketInterest = isOffMarketGoal(state.main_goal);

  function buildSummary(): string {
    const head =
      language === "en" ? "[Property valuation request]" : "[Richiesta di valutazione immobile]";
    const lines: string[] = [head];
    const push = (label: string, value: string | undefined | null) => {
      if (value) lines.push(`${label}: ${value}`);
    };
    push(t("val.f.municipality").replace(" *", ""), state.municipality);
    push(t("val.f.area"), state.area);
    push(
      t("val.f.address"),
      [state.address, state.street_number].filter(Boolean).join(" ") || null,
    );
    push(t("val.f.type").replace(" *", ""), valLabelOf(VAL_TYPES, state.property_type, language));
    push(t("val.f.sqm"), state.sqm);
    push(t("val.f.bedrooms"), state.bedrooms);
    push(t("val.f.bathrooms"), state.bathrooms);
    push(t("val.f.floor"), state.floor);
    if (state.features.length) {
      push(
        t("val.step.features.title"),
        state.features.map((f) => valLabelOf(VAL_FEATURES, f, language)).join(", "),
      );
    }
    push(t("val.f.outdoorSqm"), state.outdoor_sqm);
    push(
      t("val.step.condition.title"),
      valLabelOf(VAL_CONDITIONS, state.property_condition, language),
    );
    push(t("val.q.occupancy"), valLabelOf(VAL_OCCUPANCY, state.occupancy_status, language));
    push(t("val.q.hasPrice"), valLabelOf(VAL_HAS_PRICE, state.has_expected_price, language));
    push(t("val.q.expectedPrice"), state.expected_price);
    push(t("val.q.timeline"), valLabelOf(VAL_TIMELINE, state.selling_timeline, language));
    push(t("val.q.goal"), valLabelOf(VAL_GOALS, state.main_goal, language));
    if (offMarketInterest) lines.push("Off Market: interesse segnalato");
    push(
      t("val.q.contactMethod"),
      valLabelOf(VAL_CONTACT_METHODS, state.preferred_contact_method, language),
    );
    push(t("val.q.notes"), state.notes.trim() || null);
    lines.push(
      `Marketing consent: ${state.marketing ? "yes" : "no"}`,
    );
    return lines.join("\n");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    if (submittingRef.current || status === "submitting") return;

    if (website.length) {
      setStatus("ok");
      return;
    }
    if (Date.now() - openedAt < 2000) {
      setErrorMsg(t("val.err.fast"));
      return;
    }

    const first_name = state.first_name.trim().slice(0, 100);
    const last_name = state.last_name.trim().slice(0, 100);
    const phone = state.phone.trim().slice(0, 50);
    const email = state.email.trim().slice(0, 320);

    if (!first_name || phone.length < 3 || !email) {
      setErrorMsg(t("val.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t("val.err.email"));
      return;
    }
    if (!state.privacy) {
      setErrorMsg(t("val.err.privacy"));
      return;
    }

    const num = (v: string): number | null => {
      const n = Number(String(v).replace(/[^\d]/g, ""));
      return Number.isFinite(n) && String(v).trim() !== "" && n > 0 ? n : null;
    };

    const details = {
      first_name,
      last_name: last_name || null,
      municipality: state.municipality,
      area: state.area.trim() || null,
      address: state.address.trim() || null,
      street_number: state.street_number.trim() || null,
      property_type: state.property_type,
      sqm: num(state.sqm),
      bedrooms: num(state.bedrooms),
      bathrooms: num(state.bathrooms),
      floor: state.floor.trim() || null,
      features: state.features,
      outdoor_sqm: showOutdoor ? num(state.outdoor_sqm) : null,
      property_condition: state.property_condition || null,
      occupancy_status: state.occupancy_status || null,
      has_expected_price: state.has_expected_price === "yes",
      expected_price: state.has_expected_price === "yes" ? num(state.expected_price) : null,
      selling_timeline: state.selling_timeline || null,
      main_goal: state.main_goal || null,
      off_market_interest: offMarketInterest,
      notes: state.notes.trim() || null,
      preferred_contact_method: state.preferred_contact_method || null,
      marketing_consent: state.marketing,
      language,
    };

    const message = buildSummary();
    const full_name = [first_name, last_name].filter(Boolean).join(" ");

    submittingRef.current = true;
    setStatus("submitting");
    const { error } = await supabase.from("leads").insert({
      full_name,
      email,
      phone,
      preferred_area: [state.municipality, state.area.trim()].filter(Boolean).join(" — ").slice(0, 200) || null,
      budget_range:
        details.expected_price != null ? `€ ${details.expected_price.toLocaleString("it-IT")}` : null,
      property_type: state.property_type || null,
      message,
      source: "property_valuation",
      source_page: "/valuta-casa",
      details,
      privacy_accepted: true,
    });
    if (error) {
      submittingRef.current = false;
      setStatus("error");
      setErrorMsg(t("val.err.generic"));
      return;
    }
    try {
      await notify({
        data: {
          full_name,
          email,
          phone,
          message,
          preferred_area: details.municipality,
          budget_range:
            details.expected_price != null ? String(details.expected_price) : null,
          property_type: state.property_type || null,
          source_page: "/valuta-casa",
        },
      });
    } catch (err) {
      console.error("[valuation notify] failed", err);
    }
    setStatus("ok");
    trackEvent("valuation_lead_submit", {
      language,
      property_type: state.property_type,
      municipality: state.municipality,
      has_expected_price: details.has_expected_price,
      selling_timeline: details.selling_timeline ?? undefined,
      main_goal: details.main_goal ?? undefined,
      off_market_interest: offMarketInterest,
    });
  }

  if (status === "ok") {
    return (
      <section className="container-editorial pb-24 pt-28 md:pt-36">
        <div className="mx-auto max-w-2xl rounded-md border border-warm-border/70 bg-warm-cream p-8 text-center shadow-sm sm:p-12">
          <CheckCircle2 className="mx-auto text-primary" size={42} />
          <h1 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">{t("val.success.title")}</h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">{t("val.success.body")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-primary"
            >
              {t("val.cta.home")}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm border border-ink/30 px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition hover:border-primary hover:text-primary"
            >
              <MessageCircle size={14} className="shrink-0" /> {t("val.cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-editorial pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">{t("val.eyebrow")}</span>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
            {t("val.h1")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            {t("val.intro")}
          </p>
          <p className="mt-3 text-[0.8rem] text-foreground/60">{t("val.free")}</p>
        </div>

        <div className="mt-10 rounded-md border border-warm-border/70 bg-warm-cream p-5 shadow-sm sm:p-8">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-foreground/55">
              {t("val.progress.step")} {stepIdx + 1} {t("val.progress.of")} {total}
            </span>
            <div className="h-px flex-1 bg-warm-border/70">
              <div
                className="h-px bg-terracotta transition-all"
                style={{ width: `${((stepIdx + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-6" noValidate>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            {current === "where" && (
              <StepShell question={t("val.step.where.q")} hint={t("val.hint.address")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled label={t("val.f.municipality")}>
                    <select
                      value={state.municipality}
                      onChange={(e) => patch({ municipality: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">{t("val.f.select")}</option>
                      {COMUNI_MASSA_CARRARA.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Altro">{language === "en" ? "Other" : "Altro"}</option>
                    </select>
                  </Labeled>
                  <Labeled label={t("val.f.area")} optional>
                    <input
                      value={state.area}
                      maxLength={120}
                      onChange={(e) => patch({ area: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.address")} optional>
                    <input
                      value={state.address}
                      maxLength={200}
                      autoComplete="address-line1"
                      onChange={(e) => patch({ address: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.streetNumber")} optional>
                    <input
                      value={state.street_number}
                      maxLength={20}
                      onChange={(e) => patch({ street_number: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                </div>
              </StepShell>
            )}

            {current === "type" && (
              <StepShell question={t("val.step.type.q")} hint={t("val.hint.approx")}>
                <SingleChoice
                  options={VAL_TYPES}
                  value={state.property_type}
                  onChange={(v) => patch({ property_type: v })}
                  language={language}
                />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Labeled label={t("val.f.sqm")} optional>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={state.sqm}
                      maxLength={6}
                      onChange={(e) => patch({ sqm: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.bedrooms")} optional>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={state.bedrooms}
                      maxLength={3}
                      onChange={(e) => patch({ bedrooms: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.bathrooms")} optional>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={state.bathrooms}
                      maxLength={3}
                      onChange={(e) => patch({ bathrooms: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.floor")} optional>
                    <input
                      value={state.floor}
                      maxLength={30}
                      onChange={(e) => patch({ floor: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                </div>
              </StepShell>
            )}

            {current === "features" && (
              <StepShell question={t("val.step.features.q")} hint={t("val.step.features.hint")}>
                <MultiChoice
                  options={VAL_FEATURES}
                  values={state.features}
                  onToggle={toggleFeature}
                  language={language}
                />
                {showOutdoor && (
                  <div className="mt-5 max-w-xs">
                    <Labeled label={t("val.f.outdoorSqm")} optional>
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={state.outdoor_sqm}
                        maxLength={8}
                        onChange={(e) => patch({ outdoor_sqm: e.target.value })}
                        className={inputCls}
                      />
                    </Labeled>
                  </div>
                )}
              </StepShell>
            )}

            {current === "condition" && (
              <StepShell question={t("val.step.condition.q")}>
                <SingleChoice
                  options={VAL_CONDITIONS}
                  value={state.property_condition}
                  onChange={(v) => patch({ property_condition: v })}
                  language={language}
                />
                <p className="mt-7 font-serif text-lg text-ink">{t("val.q.occupancy")}</p>
                <div className="mt-3">
                  <SingleChoice
                    options={VAL_OCCUPANCY}
                    value={state.occupancy_status}
                    onChange={(v) => patch({ occupancy_status: v })}
                    language={language}
                  />
                </div>
              </StepShell>
            )}

            {current === "price" && (
              <StepShell question={t("val.q.hasPrice")}>
                <SingleChoice
                  options={VAL_HAS_PRICE}
                  value={state.has_expected_price}
                  onChange={setHasPrice}
                  language={language}
                />
                {state.has_expected_price === "yes" && (
                  <div className="mt-5 max-w-xs">
                    <Labeled label={t("val.q.expectedPrice")} hint={t("val.hint.expectedPrice")}>
                      <input
                        inputMode="numeric"
                        placeholder={t("val.ph.expectedPrice")}
                        value={state.expected_price}
                        maxLength={15}
                        onChange={(e) => patch({ expected_price: e.target.value })}
                        className={inputCls}
                      />
                    </Labeled>
                  </div>
                )}
              </StepShell>
            )}

            {current === "timeline" && (
              <StepShell question={t("val.q.timeline")}>
                <SingleChoice
                  options={VAL_TIMELINE}
                  value={state.selling_timeline}
                  onChange={(v) => patch({ selling_timeline: v })}
                  language={language}
                />
              </StepShell>
            )}

            {current === "goal" && (
              <StepShell question={t("val.q.goal")}>
                <SingleChoice
                  options={VAL_GOALS}
                  value={state.main_goal}
                  onChange={setGoal}
                  language={language}
                />
              </StepShell>
            )}

            {current === "notes" && (
              <StepShell question={t("val.q.notes")}>
                <textarea
                  rows={6}
                  maxLength={3000}
                  placeholder={t("val.ph.notes")}
                  value={state.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  className={inputCls + " min-h-[9rem]"}
                />
              </StepShell>
            )}

            {current === "contacts" && (
              <StepShell question={t("val.step.contacts.title")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled label={t("val.f.firstName")}>
                    <input
                      value={state.first_name}
                      maxLength={100}
                      autoComplete="given-name"
                      onChange={(e) => patch({ first_name: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.lastName")} optional>
                    <input
                      value={state.last_name}
                      maxLength={100}
                      autoComplete="family-name"
                      onChange={(e) => patch({ last_name: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.phone")}>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={state.phone}
                      maxLength={50}
                      autoComplete="tel"
                      onChange={(e) => patch({ phone: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                  <Labeled label={t("val.f.email")}>
                    <input
                      type="email"
                      inputMode="email"
                      value={state.email}
                      maxLength={320}
                      autoComplete="email"
                      onChange={(e) => patch({ email: e.target.value })}
                      className={inputCls}
                    />
                  </Labeled>
                </div>

                <p className="mt-6 font-serif text-lg text-ink">{t("val.q.contactMethod")}</p>
                <div className="mt-3">
                  <SingleChoice
                    options={VAL_CONTACT_METHODS}
                    value={state.preferred_contact_method}
                    onChange={(v) => patch({ preferred_contact_method: v })}
                    language={language}
                  />
                </div>

                <div className="mt-6 grid gap-3">
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
                    <input
                      type="checkbox"
                      checked={state.privacy}
                      onChange={(e) => patch({ privacy: e.target.checked })}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <span>{t("val.privacy.service")}</span>
                  </label>
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
                    <input
                      type="checkbox"
                      checked={state.marketing}
                      onChange={(e) => patch({ marketing: e.target.checked })}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <span>{t("val.privacy.marketing")}</span>
                  </label>
                  <p className="text-[0.72rem] leading-relaxed text-foreground/55">
                    {t("val.privacy.note")}
                  </p>
                </div>
              </StepShell>
            )}

            {errorMsg && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-warm-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={back}
                disabled={stepIdx === 0}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-terracotta hover:text-terracotta disabled:opacity-40"
              >
                <ArrowLeft size={14} className="shrink-0" /> {t("val.cta.back")}
              </button>

              {current !== "contacts" ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-terracotta px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-terracotta/90 sm:w-auto"
                >
                  {t("val.cta.next")} <ArrowRight size={14} className="shrink-0" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-terracotta disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" && <Loader2 size={14} className="animate-spin" />}
                  {t("val.cta.submit")}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none";

function StepShell({
  question,
  hint,
  children,
}: {
  question: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl leading-snug text-ink sm:text-3xl">{question}</h2>
      {hint && <p className="mt-2 text-[0.82rem] leading-relaxed text-foreground/60">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Labeled({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.72rem] uppercase tracking-[0.14em] text-foreground/60">
        {label}
        {optional && <span className="normal-case tracking-normal"> ({t("val.optional")})</span>}
      </span>
      {children}
      {hint && <span className="text-[0.72rem] leading-relaxed text-foreground/55">{hint}</span>}
    </label>
  );
}

function SingleChoice({
  options,
  value,
  onChange,
  language,
}: {
  options: ValOption[];
  value: string;
  onChange: (v: string) => void;
  language: Language;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={
              "flex min-h-[48px] items-center justify-between gap-2 rounded-sm border px-4 py-3.5 text-left text-sm transition " +
              (active
                ? "border-terracotta bg-terracotta/10 text-ink"
                : "border-warm-border/70 bg-background text-foreground/85 hover:border-terracotta/60 hover:bg-warm-ivory")
            }
          >
            <span>{valLabel(o, language)}</span>
            {active && <Check size={16} className="shrink-0 text-terracotta" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  options,
  values,
  onToggle,
  language,
}: {
  options: ValOption[];
  values: string[];
  onToggle: (v: string) => void;
  language: Language;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = values.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            aria-pressed={active}
            className={
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition " +
              (active
                ? "border-terracotta bg-terracotta/10 text-ink"
                : "border-warm-border/70 bg-background text-foreground/80 hover:border-terracotta/60 hover:bg-warm-ivory")
            }
          >
            {active && <Check size={14} className="shrink-0 text-terracotta" />}
            {valLabel(o, language)}
          </button>
        );
      })}
    </div>
  );
}
