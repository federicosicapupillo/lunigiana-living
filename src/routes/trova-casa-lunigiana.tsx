import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Compass, Loader2, MessageCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { useT, useLanguage } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";
import { useLocalizedHead } from "@/hooks/use-localized-head";
import { trackEvent } from "@/lib/analytics";
import { siteUrl } from "@/lib/site-url";
import { whatsappUrl } from "@/components/whatsapp-float";

export const Route = createFileRoute("/trova-casa-lunigiana")({
  head: () => ({
    meta: [
      { title: "Trova la tua casa ideale in Lunigiana — Furia Immobiliare" },
      {
        name: "description",
        content:
          "Rispondi a poche domande: Elena riceverà un profilo chiaro della casa che immagini e potrà aiutarti a capire quali immobili sono davvero adatti a te.",
      },
      { property: "og:title", content: "Trova la tua casa ideale in Lunigiana — Furia Immobiliare" },
      {
        property: "og:description",
        content:
          "Percorso guidato per descrivere la casa che cerchi in Lunigiana. Ti risponde Elena personalmente.",
      },
      { property: "og:url", content: siteUrl("/trova-casa-lunigiana") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/trova-casa-lunigiana") }],
  }),
  component: TrovaCasaPage,
});

type StepId = "goal" | "type" | "area" | "budget" | "features" | "timeline" | "contacts";
const STEPS: StepId[] = ["goal", "type", "area", "budget", "features", "timeline", "contacts"];

type Option = { value: string; labelIt: string; labelEn: string };

const GOAL_OPTIONS: Option[] = [
  { value: "primary", labelIt: "Prima casa", labelEn: "Primary residence" },
  { value: "second", labelIt: "Seconda casa", labelEn: "Second home" },
  { value: "vacation", labelIt: "Casa vacanza", labelEn: "Holiday home" },
  { value: "investment", labelIt: "Investimento", labelEn: "Investment" },
  { value: "relocation", labelIt: "Trasferimento in Lunigiana", labelEn: "Relocation to Lunigiana" },
  { value: "exploring", labelIt: "Sto solo valutando", labelEn: "I'm still exploring" },
];

const TYPE_OPTIONS: Option[] = [
  { value: "apartment", labelIt: "Appartamento", labelEn: "Apartment" },
  { value: "detached", labelIt: "Casa indipendente", labelEn: "Detached house" },
  { value: "rustic", labelIt: "Rustico / casale", labelEn: "Farmhouse / country house" },
  { value: "villa", labelIt: "Villa", labelEn: "Villa" },
  { value: "garden", labelIt: "Casa con giardino", labelEn: "House with garden" },
  { value: "borgo", labelIt: "Casa in borgo", labelEn: "Home in a historic village" },
  { value: "undecided", labelIt: "Non ho ancora deciso", labelEn: "Not decided yet" },
];

const AREA_OPTIONS: Option[] = [
  { value: "Pontremoli", labelIt: "Pontremoli", labelEn: "Pontremoli" },
  { value: "Bagnone", labelIt: "Bagnone", labelEn: "Bagnone" },
  { value: "Mulazzo", labelIt: "Mulazzo", labelEn: "Mulazzo" },
  { value: "Filattiera", labelIt: "Filattiera", labelEn: "Filattiera" },
  { value: "Villafranca in Lunigiana", labelIt: "Villafranca in Lunigiana", labelEn: "Villafranca in Lunigiana" },
  { value: "Zeri", labelIt: "Zeri", labelEn: "Zeri" },
  { value: "Aulla", labelIt: "Aulla", labelEn: "Aulla" },
  { value: "guided", labelIt: "Non so ancora, vorrei essere guidato", labelEn: "I don't know yet, I'd like guidance" },
];

const BUDGET_OPTIONS: Option[] = [
  { value: "<80", labelIt: "Fino a 80.000 €", labelEn: "Up to € 80,000" },
  { value: "80-150", labelIt: "80.000 – 150.000 €", labelEn: "€ 80,000 – 150,000" },
  { value: "150-250", labelIt: "150.000 – 250.000 €", labelEn: "€ 150,000 – 250,000" },
  { value: "250-400", labelIt: "250.000 – 400.000 €", labelEn: "€ 250,000 – 400,000" },
  { value: ">400", labelIt: "Oltre 400.000 €", labelEn: "Over € 400,000" },
  { value: "discuss", labelIt: "Preferisco parlarne direttamente", labelEn: "Prefer to discuss directly" },
];

const FEATURE_OPTIONS: Option[] = [
  { value: "garden", labelIt: "Giardino", labelEn: "Garden" },
  { value: "terrace", labelIt: "Terrazza o balcone", labelEn: "Terrace or balcony" },
  { value: "view", labelIt: "Vista panoramica", labelEn: "Panoramic view" },
  { value: "historic_center", labelIt: "Centro storico", labelEn: "Historic center" },
  { value: "near_services", labelIt: "Vicino ai servizi", labelEn: "Close to amenities" },
  { value: "privacy", labelIt: "Privacy e tranquillità", labelEn: "Privacy and quiet" },
  { value: "to_renovate", labelIt: "Da ristrutturare", labelEn: "To renovate" },
  { value: "move_in_ready", labelIt: "Già abitabile", labelEn: "Move-in ready" },
  { value: "pets", labelIt: "Spazio per animali", labelEn: "Space for pets" },
  { value: "land", labelIt: "Terreno", labelEn: "Land" },
  { value: "garage", labelIt: "Garage / posto auto", labelEn: "Garage / parking" },
  { value: "vacation_rental", labelIt: "Adatta come casa vacanza", labelEn: "Suitable as a holiday rental" },
];

const TIMELINE_OPTIONS: Option[] = [
  { value: "now", labelIt: "Subito, se trovo la casa giusta", labelEn: "Right away, if I find the right home" },
  { value: "3m", labelIt: "Entro 3 mesi", labelEn: "Within 3 months" },
  { value: "6m", labelIt: "Entro 6 mesi", labelEn: "Within 6 months" },
  { value: "12m", labelIt: "Entro 12 mesi", labelEn: "Within 12 months" },
  { value: "just_looking", labelIt: "Sto solo iniziando a guardare", labelEn: "I'm just starting to look" },
];

function label(opt: Option, lang: Language): string {
  return lang === "en" ? opt.labelEn : opt.labelIt;
}

interface State {
  goal: string;
  type: string;
  areas: string[];
  budget: string;
  features: string[];
  timeline: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  privacy: boolean;
}

const EMPTY: State = {
  goal: "",
  type: "",
  areas: [],
  budget: "",
  features: [],
  timeline: "",
  full_name: "",
  email: "",
  phone: "",
  message: "",
  privacy: false,
};

function TrovaCasaPage() {
  const t = useT();
  const { language } = useLanguage();
  useLocalizedHead("guided.seo.title", "guided.seo.desc");

  const notify = useServerFn(sendLeadNotification);
  const [stepIdx, setStepIdx] = useState(-1); // -1 = intro screen
  const [state, setState] = useState<State>(EMPTY);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState(""); // honeypot
  const startedRef = useRef(false);
  const completedRef = useRef<Set<number>>(new Set());

  const totalSteps = STEPS.length;
  const currentStep = stepIdx >= 0 ? STEPS[stepIdx] : null;

  const waHref = useMemo(
    () => whatsappUrl(t("wa.defaultMsg")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  function start() {
    setStepIdx(0);
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("guided_search_start", { source: "trova_casa", language });
    }
  }

  function next() {
    const idx = stepIdx;
    if (!completedRef.current.has(idx)) {
      completedRef.current.add(idx);
      trackEvent("guided_search_step_complete", {
        source: "trova_casa",
        language,
        step: STEPS[idx],
        step_index: idx + 1,
        selected_goal: state.goal || undefined,
        selected_type: state.type || undefined,
        selected_area: state.areas.join(",") || undefined,
        budget_range: state.budget || undefined,
        timeline: state.timeline || undefined,
      });
    }
    setStepIdx((i) => Math.min(i + 1, totalSteps - 1));
  }
  function back() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }

  function canAdvance(): boolean {
    if (!currentStep) return false;
    switch (currentStep) {
      case "goal": return !!state.goal;
      case "type": return !!state.type;
      case "area": return state.areas.length > 0;
      case "budget": return !!state.budget;
      case "features": return true; // optional
      case "timeline": return !!state.timeline;
      case "contacts": return false; // handled by submit
    }
  }

  function toggleArea(v: string) {
    setState((s) => {
      if (v === "guided") {
        // "guided" is exclusive
        return { ...s, areas: s.areas.includes("guided") ? [] : ["guided"] };
      }
      const without = s.areas.filter((x) => x !== "guided");
      return {
        ...s,
        areas: without.includes(v) ? without.filter((x) => x !== v) : [...without, v],
      };
    });
  }

  function toggleFeature(v: string) {
    setState((s) => ({
      ...s,
      features: s.features.includes(v) ? s.features.filter((x) => x !== v) : [...s.features, v],
    }));
  }

  function buildSummaryMessage(): string {
    const lines: string[] = [];
    const head = language === "en" ? "[Guided home search]" : "[Ricerca guidata casa ideale]";
    lines.push(head);
    const L = (key: string) => t(key);
    const opt = (list: Option[], v: string) => list.find((o) => o.value === v);
    if (state.goal) lines.push(`${L("guided.summary.goal")}: ${label(opt(GOAL_OPTIONS, state.goal)!, language)}`);
    if (state.type) lines.push(`${L("guided.summary.type")}: ${label(opt(TYPE_OPTIONS, state.type)!, language)}`);
    if (state.areas.length) {
      const areas = state.areas.map((v) => label(opt(AREA_OPTIONS, v)!, language)).join(", ");
      lines.push(`${L("guided.summary.area")}: ${areas}`);
    }
    if (state.budget) lines.push(`${L("guided.summary.budget")}: ${label(opt(BUDGET_OPTIONS, state.budget)!, language)}`);
    if (state.features.length) {
      const feats = state.features.map((v) => label(opt(FEATURE_OPTIONS, v)!, language)).join(", ");
      lines.push(`${L("guided.summary.features")}: ${feats}`);
    }
    if (state.timeline) lines.push(`${L("guided.summary.timeline")}: ${label(opt(TIMELINE_OPTIONS, state.timeline)!, language)}`);
    if (state.message.trim()) lines.push(`${L("guided.summary.message")}: ${state.message.trim()}`);
    return lines.join("\n");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (website.length) {
      setStatus("ok"); // silent drop
      return;
    }
    if (Date.now() - openedAt < 2000) {
      setErrorMsg(t("form.err.tooFast"));
      return;
    }
    const full_name = state.full_name.trim().slice(0, 200);
    const email = state.email.trim().slice(0, 320);
    const phoneRaw = state.phone.trim().slice(0, 50);
    const phone = phoneRaw.length >= 3 ? phoneRaw : "—";
    if (!full_name || !email) {
      setErrorMsg(t("form.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t("form.err.email"));
      return;
    }
    if (!state.privacy) {
      setErrorMsg(t("form.err.privacy"));
      return;
    }

    const messageSummary = buildSummaryMessage();
    const property_type =
      language === "en"
        ? "Guided search — Find ideal home"
        : "Ricerca guidata — Trova casa ideale";
    const preferred_area =
      state.areas.length && !state.areas.includes("guided")
        ? state.areas.join(", ").slice(0, 200)
        : null;
    const budget_label =
      BUDGET_OPTIONS.find((o) => o.value === state.budget)?.[language === "en" ? "labelEn" : "labelIt"] ?? null;
    const source_page = "guided_search:/trova-casa-lunigiana";

    setStatus("submitting");
    const { error } = await supabase.from("leads").insert({
      full_name,
      email,
      phone,
      preferred_area,
      budget_range: budget_label,
      property_type,
      message: messageSummary,
      source_page,
      privacy_accepted: true,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(t("guided.err.generic"));
      trackEvent("guided_search_submit_error", {
        source: "trova_casa",
        language,
        selected_goal: state.goal || undefined,
        selected_type: state.type || undefined,
        budget_range: state.budget || undefined,
        timeline: state.timeline || undefined,
      });
      return;
    }
    try {
      await notify({
        data: {
          full_name,
          email,
          phone,
          message: messageSummary,
          preferred_area,
          budget_range: budget_label,
          property_type,
          source_page,
        },
      });
    } catch (err) {
      console.error("[guided notify] failed", err);
    }
    setStatus("ok");
    trackEvent("guided_search_submit_success", {
      source: "trova_casa",
      language,
      selected_goal: state.goal || undefined,
      selected_type: state.type || undefined,
      selected_area: state.areas.join(",") || undefined,
      budget_range: state.budget || undefined,
      timeline: state.timeline || undefined,
    });
  }

  // ----- Rendering -----

  if (status === "ok") {
    return (
      <section className="container-editorial pb-24 pt-28 md:pt-36">
        <div className="mx-auto max-w-2xl rounded-md border border-warm-border/70 bg-warm-cream p-8 text-center shadow-sm sm:p-12">
          <CheckCircle2 className="mx-auto text-primary" size={42} />
          <h1 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">{t("guided.success.title")}</h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">{t("guided.success.body")}</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("guided_search_whatsapp_click", { source: "trova_casa_success", language })
            }
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-primary"
          >
            <MessageCircle size={14} /> {t("guided.cta.whatsapp")}
          </a>
          <div className="mt-6 text-sm text-foreground/70">
            <Link to="/immobili" className="underline-offset-4 hover:underline">
              {t("guided.success.exploreLink")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-editorial pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <div className="text-center">
          <span className="eyebrow">{t("guided.eyebrow")}</span>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
            {t("guided.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            {t("guided.subtitle")}
          </p>
        </div>

        {/* Intro / start */}
        {stepIdx === -1 && (
          <div className="mt-10 rounded-md border border-warm-border/70 bg-warm-cream p-8 text-center shadow-sm sm:p-10">
            <Compass className="mx-auto text-terracotta" size={32} />
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/75">
              {t("guided.intro.note")}
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-terracotta px-7 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-terracotta/90 sm:text-sm"
            >
              {t("guided.cta.start")} <ArrowRight size={14} />
            </button>
            <p className="mt-3 text-[0.75rem] text-foreground/55">{t("guided.intro.hint")}</p>
          </div>
        )}

        {/* Wizard */}
        {stepIdx >= 0 && (
          <div className="mt-10 rounded-md border border-warm-border/70 bg-warm-cream p-6 shadow-sm sm:p-8">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-foreground/70">
              <span className="eyebrow text-[0.65rem]">
                {t("guided.progress.step")} {stepIdx + 1} {t("guided.progress.of")} {totalSteps}
              </span>
              <span className="font-medium text-ink">{t(`guided.step.${currentStep}.title`)}</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-warm-border/60">
              <div
                className="h-full bg-terracotta transition-all"
                style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="mt-6">
              <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                {t(`guided.step.${currentStep}.q`)}
              </h2>
              {currentStep === "features" && (
                <p className="mt-1 text-sm text-foreground/65">{t("guided.step.features.hint")}</p>
              )}
              {currentStep === "area" && (
                <p className="mt-1 text-sm text-foreground/65">{t("guided.step.area.hint")}</p>
              )}

              <div className="mt-5">
                {currentStep === "goal" && (
                  <SingleChoice
                    options={GOAL_OPTIONS}
                    value={state.goal}
                    onChange={(v) => setState({ ...state, goal: v })}
                    language={language}
                  />
                )}
                {currentStep === "type" && (
                  <SingleChoice
                    options={TYPE_OPTIONS}
                    value={state.type}
                    onChange={(v) => setState({ ...state, type: v })}
                    language={language}
                  />
                )}
                {currentStep === "area" && (
                  <MultiChoice
                    options={AREA_OPTIONS}
                    values={state.areas}
                    onToggle={toggleArea}
                    language={language}
                  />
                )}
                {currentStep === "budget" && (
                  <SingleChoice
                    options={BUDGET_OPTIONS}
                    value={state.budget}
                    onChange={(v) => setState({ ...state, budget: v })}
                    language={language}
                  />
                )}
                {currentStep === "features" && (
                  <MultiChoice
                    options={FEATURE_OPTIONS}
                    values={state.features}
                    onToggle={toggleFeature}
                    language={language}
                  />
                )}
                {currentStep === "timeline" && (
                  <SingleChoice
                    options={TIMELINE_OPTIONS}
                    value={state.timeline}
                    onChange={(v) => setState({ ...state, timeline: v })}
                    language={language}
                  />
                )}
                {currentStep === "contacts" && (
                  <ContactsAndSummary
                    state={state}
                    onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
                    onSubmit={onSubmit}
                    onBack={back}
                    status={status}
                    errorMsg={errorMsg}
                    language={language}
                    waHref={waHref}
                    setWebsite={setWebsite}
                    website={website}
                    summaryItems={summaryItems(state, language, t)}
                  />
                )}
              </div>
            </div>

            {currentStep !== "contacts" && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={stepIdx === 0}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:bg-warm-ivory disabled:opacity-40"
                >
                  <ArrowLeft size={14} /> {t("guided.cta.back")}
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance()}
                  className="inline-flex items-center gap-2 rounded-sm bg-terracotta px-6 py-3.5 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-terracotta/90 disabled:opacity-50 sm:text-sm"
                >
                  {t("guided.cta.next")} <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SingleChoice({
  options,
  value,
  onChange,
  language,
}: {
  options: Option[];
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
            className={
              "flex items-center justify-between rounded-sm border px-4 py-3.5 text-left text-sm transition " +
              (active
                ? "border-terracotta bg-terracotta/10 text-ink"
                : "border-warm-border/70 bg-background text-foreground/85 hover:border-terracotta/60 hover:bg-warm-ivory")
            }
          >
            <span>{label(o, language)}</span>
            {active && <Check size={16} className="text-terracotta" />}
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
  options: Option[];
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
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition " +
              (active
                ? "border-terracotta bg-terracotta/10 text-ink"
                : "border-warm-border/70 bg-background text-foreground/80 hover:border-terracotta/60 hover:bg-warm-ivory")
            }
          >
            {active && <Check size={14} className="text-terracotta" />}
            {label(o, language)}
          </button>
        );
      })}
    </div>
  );
}

function summaryItems(
  state: State,
  language: Language,
  t: (k: string) => string,
): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const find = (list: Option[], v: string) =>
    list.find((o) => o.value === v) ?? null;
  const lbl = (o: Option | null) => (o ? label(o, language) : "");
  if (state.goal) items.push({ label: t("guided.summary.goal"), value: lbl(find(GOAL_OPTIONS, state.goal)) });
  if (state.type) items.push({ label: t("guided.summary.type"), value: lbl(find(TYPE_OPTIONS, state.type)) });
  if (state.areas.length)
    items.push({
      label: t("guided.summary.area"),
      value: state.areas.map((v) => lbl(find(AREA_OPTIONS, v))).join(", "),
    });
  if (state.budget) items.push({ label: t("guided.summary.budget"), value: lbl(find(BUDGET_OPTIONS, state.budget)) });
  if (state.features.length)
    items.push({
      label: t("guided.summary.features"),
      value: state.features.map((v) => lbl(find(FEATURE_OPTIONS, v))).join(", "),
    });
  if (state.timeline)
    items.push({ label: t("guided.summary.timeline"), value: lbl(find(TIMELINE_OPTIONS, state.timeline)) });
  return items;
}

function ContactsAndSummary({
  state,
  onChange,
  onSubmit,
  onBack,
  status,
  errorMsg,
  language,
  waHref,
  setWebsite,
  website,
  summaryItems,
}: {
  state: State;
  onChange: (patch: Partial<State>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  status: "idle" | "submitting" | "ok" | "error";
  errorMsg: string | null;
  language: Language;
  waHref: string;
  setWebsite: (v: string) => void;
  website: string;
  summaryItems: { label: string; value: string }[];
}) {
  const t = useT();
  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {/* Summary */}
      <div className="rounded-sm border border-warm-border/70 bg-background p-5">
        <div className="eyebrow text-[0.65rem]">{t("guided.summary.eyebrow")}</div>
        <h3 className="mt-2 font-serif text-xl text-ink">{t("guided.summary.title")}</h3>
        <dl className="mt-4 grid gap-2 text-sm">
          {summaryItems.length === 0 && (
            <div className="text-foreground/60">{t("guided.summary.empty")}</div>
          )}
          {summaryItems.map((it) => (
            <div key={it.label} className="grid grid-cols-[7.5rem_1fr] gap-3">
              <dt className="text-foreground/60">{it.label}</dt>
              <dd className="text-ink">{it.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Honeypot */}
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label={t("form.fullName")}>
          <input
            required
            maxLength={200}
            autoComplete="name"
            value={state.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </Labeled>
        <Labeled label={t("form.email")}>
          <input
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            value={state.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </Labeled>
        <Labeled label={t("guided.phone")} hint={t("form.hint.phone")}>
          <input
            type="tel"
            maxLength={50}
            autoComplete="tel"
            value={state.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </Labeled>
      </div>

      <Labeled label={t("guided.messageLabel")} hint={t("guided.messageHint")}>
        <textarea
          rows={3}
          maxLength={2000}
          value={state.message}
          onChange={(e) => onChange({ message: e.target.value })}
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        />
      </Labeled>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-foreground/75">
        <input
          type="checkbox"
          required
          checked={state.privacy}
          onChange={(e) => onChange({ privacy: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        />
        <span>{t("form.privacy")}</span>
      </label>

      {errorMsg && (
        <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="text-destructive">{errorMsg}</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("guided_search_whatsapp_click", {
                source: "trova_casa_error",
                language,
              })
            }
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle size={14} /> {t("form.alt.cta")}
          </a>
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:bg-warm-ivory"
        >
          <ArrowLeft size={14} /> {t("guided.cta.back")}
        </button>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-terracotta px-6 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-terracotta/90 disabled:opacity-60 sm:text-sm"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> {t("form.submitting")}
            </>
          ) : (
            <>
              {t("guided.cta.submit")} <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
      <p className="text-[0.75rem] leading-relaxed text-foreground/60">{t("form.hint.submit")}</p>
    </form>
  );
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/70">
      {label}
      {children}
      {hint && (
        <span className="text-[0.7rem] normal-case tracking-normal text-foreground/55">{hint}</span>
      )}
    </label>
  );
}