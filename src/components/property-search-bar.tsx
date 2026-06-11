import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, ChevronDown, Star, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/admin/property-constants";
import { useT } from "@/lib/i18n/LanguageContext";

const COMUNI_FALLBACK = [
  "Pontremoli","Bagnone","Villafranca in Lunigiana","Mulazzo","Filattiera",
  "Licciana Nardi","Aulla","Fivizzano","Fosdinovo","Zeri","Tresana",
  "Podenzana","Comano","Casola in Lunigiana",
];

const SIZE_RANGES = [
  { label: "Qualsiasi superficie", value: "" },
  { label: "Fino a 80 mq", value: "0-80" },
  { label: "80 - 120 mq", value: "80-120" },
  { label: "120 - 200 mq", value: "120-200" },
  { label: "200 - 300 mq", value: "200-300" },
  { label: "Oltre 300 mq", value: "300-" },
];

const ROOM_OPTS = [
  { label: "Qualsiasi numero", value: "" },
  { label: "1 camera", value: "1" },
  { label: "2 camere", value: "2" },
  { label: "3 camere", value: "3" },
  { label: "4 camere", value: "4" },
  { label: "5 o più camere", value: "5" },
];

const SORT_OPTS = [
  { label: "Più recenti", value: "recent" },
  { label: "Prezzo crescente", value: "price-asc" },
  { label: "Prezzo decrescente", value: "price-desc" },
  { label: "Superficie crescente", value: "size-asc" },
  { label: "Superficie decrescente", value: "size-desc" },
];

const PRICE_STEPS = [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000];
const fmtPrice = (n: number) => `${n.toLocaleString("it-IT")} €`;
const PRICE_MIN_OPTS = [
  { label: "Nessun minimo", value: "" },
  ...PRICE_STEPS.map((n) => ({ label: fmtPrice(n), value: String(n) })),
  { label: "Oltre 1.000.000 €", value: "1000001" },
];
const PRICE_MAX_OPTS = [
  { label: "Nessun massimo", value: "" },
  ...PRICE_STEPS.map((n) => ({ label: fmtPrice(n), value: String(n) })),
  { label: "Oltre 1.000.000 €", value: "1000001" },
];

const RENT_MIN_STEPS = [300, 500, 700, 900, 1200, 1500, 2000];
const RENT_MAX_STEPS = [500, 700, 900, 1200, 1500, 2000, 3000];
const RENT_MIN_OPTS = [
  { label: "Nessun minimo", value: "" },
  ...RENT_MIN_STEPS.map((n) => ({ label: fmtPrice(n), value: String(n) })),
  { label: "Oltre 2.000 €", value: "2001" },
];
const RENT_MAX_OPTS = [
  { label: "Nessun massimo", value: "" },
  ...RENT_MAX_STEPS.map((n) => ({ label: fmtPrice(n), value: String(n) })),
  { label: "Oltre 3.000 €", value: "3001" },
];

const FEATURE_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Esterni",
    items: [
      "Giardino","Giardino privato","Corte privata","Terreno","Uliveto","Vigneto","Bosco",
      "Terrazza","Terrazza panoramica","Balcone","Loggia","Portico","Patio","Veranda",
      "Piscina","Possibilità piscina","Vista panoramica","Vista montagne","Vista mare",
      "Vista borgo","Vista fiume",
    ],
  },
  {
    label: "Pertinenze",
    items: [
      "Garage","Posto auto","Posto auto coperto","Cantina","Taverna","Soffitta","Mansarda",
      "Deposito","Legnaia","Fienile","Annesso agricolo","Dependence","Locale tecnico",
    ],
  },
  {
    label: "Comfort e impianti",
    items: [
      "Camino","Stufa","Aria condizionata","Pannelli solari","Fotovoltaico","Impianto allarme",
      "Videosorveglianza","Domotica","Internet / fibra","Cancello automatico","Doppi vetri",
      "Zanzariere","Porta blindata",
    ],
  },
  {
    label: "Accessibilità",
    items: [
      "Ascensore","Accesso disabili","Ingresso indipendente","Strada privata",
      "Facile accesso auto","Vicino ai servizi","Vicino al centro","Posizione riservata",
    ],
  },
  {
    label: "Caratteristiche speciali",
    items: [
      "Immobile storico","Casale in pietra","Rustico","Travature a vista","Pavimenti originali",
      "Soffitti affrescati","Torretta","Mura storiche","Ideale per B&B","Ideale per agriturismo",
      "Ideale come seconda casa","Ideale per investimento","Proprietà divisibile",
      "Possibilità ampliamento","Possibilità cambio destinazione d'uso",
    ],
  },
];

export type SearchValues = {
  contract: "" | "vendita" | "affitto";
  featured: boolean;
  type: string;
  comune: string;
  price_min: string;
  price_max: string;
  size: string;
  rooms: string;
  features: string[];
  sort: string;
};

const EMPTY: SearchValues = {
  contract: "", featured: false,
  type: "", comune: "", price_min: "", price_max: "",
  size: "", rooms: "", features: [], sort: "recent",
};

export interface PropertySearchBarProps {
  initial?: Partial<SearchValues>;
  comuni?: string[];
  /** When true, navigate to /immobili on submit (used on home). When false, stay (used on listing). */
  navigateOnSubmit?: boolean;
  onSubmit?: (v: SearchValues) => void;
  onReset?: () => void;
}

export function PropertySearchBar({
  initial,
  comuni,
  navigateOnSubmit = true,
  onSubmit,
  onReset,
}: PropertySearchBarProps) {
  const t = useT();
  const navigate = useNavigate();
  const [state, setState] = useState<SearchValues>({ ...EMPTY, ...initial });
  const [featOpen, setFeatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const featTriggerRef = useRef<HTMLButtonElement>(null);
  const [featCoords, setFeatCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const hasAdvanced = useMemo(
    () =>
      Boolean(
        (initial?.size && initial.size.length) ||
          (initial?.rooms && initial.rooms.length) ||
          (initial?.features && initial.features.length) ||
          (initial?.sort && initial.sort && initial.sort !== "recent"),
      ),
    [initial?.size, initial?.rooms, initial?.sort, (initial?.features ?? []).join(",")],
  );
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(hasAdvanced);

  // Sync when URL-controlled `initial` changes (e.g. user clicks reset on parent).
  useEffect(() => {
    setState({ ...EMPTY, ...initial });
  }, [
    initial?.contract, initial?.featured,
    initial?.type, initial?.comune, initial?.price_min, initial?.price_max,
    initial?.size, initial?.rooms, initial?.sort,
    (initial?.features ?? []).join(","),
  ]);

  useLayoutEffect(() => {
    if (!featOpen) return;
    const update = () => {
      const el = featTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 380);
      const left = Math.min(
        r.left + window.scrollX,
        window.scrollX + window.innerWidth - width - 12,
      );
      setFeatCoords({ top: r.bottom + window.scrollY + 6, left, width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [featOpen]);

  const comuniList = comuni && comuni.length ? comuni : COMUNI_FALLBACK;

  const isRent = state.contract === "affitto";
  const priceMinOpts = isRent ? RENT_MIN_OPTS : PRICE_MIN_OPTS;
  const priceMaxOpts = isRent ? RENT_MAX_OPTS : PRICE_MAX_OPTS;
  const priceMinLabel = isRent ? t("search.label.rentMin") : t("search.label.priceMin");
  const priceMaxLabel = isRent ? t("search.label.rentMax") : t("search.label.priceMax");

  const setContract = (id: SearchValues["contract"]) => {
    setState((s) => {
      const switchingToRent = id === "affitto" && s.contract !== "affitto";
      const switchingFromRent = id !== "affitto" && s.contract === "affitto";
      const resetPrice = switchingToRent || switchingFromRent;
      return {
        ...s,
        contract: id,
        price_min: resetPrice ? "" : s.price_min,
        price_max: resetPrice ? "" : s.price_max,
      };
    });
  };

  const toggleFeature = (f: string) =>
    setState((s) => ({
      ...s,
      features: s.features.includes(f)
        ? s.features.filter((x) => x !== f)
        : [...s.features, f],
    }));

  const validate = (s: SearchValues): string | null => {
    if (s.price_min && s.price_max) {
      const a = Number(s.price_min);
      const b = Number(s.price_max);
      if (Number.isFinite(a) && Number.isFinite(b) && a > b) {
        return t("search.errRange");
      }
    }
    return null;
  };

  const buildSearch = (s: SearchValues): Record<string, string> => {
    const out: Record<string, string> = {};
    if (s.contract) out.contract = s.contract;
    if (s.featured) out.featured = "1";
    if (s.type) out.type = s.type;
    if (s.comune) out.comune = s.comune;
    if (s.price_min) out.price_min = s.price_min;
    if (s.price_max) out.price_max = s.price_max;
    if (s.size) out.size = s.size;
    if (s.rooms) out.rooms = s.rooms;
    if (s.features.length) out.features = s.features.join(",");
    if (s.sort && s.sort !== "recent") out.sort = s.sort;
    return out;
  };

  const submit = () => {
    const err = validate(state);
    setError(err);
    if (err) return;
    const search = buildSearch(state);
    if (navigateOnSubmit) navigate({ to: "/immobili", search });
    onSubmit?.(state);
    setMobileOpen(false);
  };

  const reset = () => {
    setState(EMPTY);
    setError(null);
    if (navigateOnSubmit) navigate({ to: "/immobili", search: {} });
    onReset?.();
  };

  const featCount = state.features.length;
  const featLabel = featCount ? `${featCount} ${t("search.featSelected")}` : t("search.featAll");

  const ContractTabs = (
    <div className="inline-flex flex-wrap gap-1 rounded-md border border-warm-border bg-warm-ivory p-1 shadow-[0_1px_0_rgba(36,23,17,0.04)]">
      {([
        { id: "", label: t("search.tab.all") },
        { id: "vendita", label: t("search.tab.sale") },
        { id: "affitto", label: t("search.tab.rent") },
      ] as const).map((t) => {
        const active = state.contract === t.id;
        return (
          <button
            key={t.id || "all"}
            type="button"
            onClick={() => setContract(t.id)}
            className={`rounded-[3px] px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_rgba(184,106,75,0.6)]"
                : "bg-transparent text-muted-foreground hover:bg-warm-sand hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );

  const FeaturedToggle = (
    <button
      type="button"
      onClick={() => setState({ ...state, featured: !state.featured })}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all ${
        state.featured
          ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_rgba(184,106,75,0.55)]"
          : "border-warm-border bg-warm-ivory text-muted-foreground hover:border-primary/50 hover:text-ink"
      }`}
      aria-pressed={state.featured}
    >
      <Star size={13} className={state.featured ? "fill-current" : ""} />
      {t("search.featured")}
    </button>
  );

  const Fields = (
    <>
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label={t("search.label.type")} value={state.type} onChange={(v) => setState({ ...state, type: v })}>
        <option value="">{t("search.label.allTypes")}</option>
        {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        <SelectField label={t("search.label.comune")} value={state.comune} onChange={(v) => setState({ ...state, comune: v })}>
        <option value="">{t("search.label.allComuni")}</option>
        {comuniList.map((c) => <option key={c} value={c}>{c}</option>)}
        </SelectField>
        <SelectField label={priceMinLabel} value={state.price_min}
          onChange={(v) => setState({ ...state, price_min: v })}>
        {priceMinOpts.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
        </SelectField>
        <SelectField label={priceMaxLabel} value={state.price_max}
          onChange={(v) => setState({ ...state, price_max: v })}>
        {priceMaxOpts.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
        </SelectField>
      </div>
      {advancedOpen && (
        <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label={t("search.label.size")} value={state.size} onChange={(v) => setState({ ...state, size: v })}>
        {SIZE_RANGES.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
          </SelectField>
          <SelectField label={t("search.label.rooms")} value={state.rooms} onChange={(v) => setState({ ...state, rooms: v })}>
        {ROOM_OPTS.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
          </SelectField>
          <div className="flex min-w-0 flex-col gap-0.5 bg-card px-3 py-2 text-left">
        <span className="eyebrow text-[0.6rem]">{t("search.label.features")}</span>
        <button
          ref={featTriggerRef}
          type="button"
          onClick={() => setFeatOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 bg-transparent text-sm text-ink focus:outline-none"
        >
          <span className={`truncate ${featCount ? "text-ink" : "text-muted-foreground"}`}>
            {featLabel}
          </span>
          <ChevronDown size={14} className={`shrink-0 transition ${featOpen ? "rotate-180" : ""}`} />
        </button>
          </div>
          <SelectField label={t("search.label.sort")} value={state.sort} onChange={(v) => setState({ ...state, sort: v })}>
        {SORT_OPTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </SelectField>
        </div>
      )}
    </>
  );

  const visibleChips = state.features.slice(0, 3);
  const remainingChips = state.features.length - visibleChips.length;
  const Chips = state.features.length > 0 && (
    <div className="flex flex-wrap items-center gap-2 border-t border-border bg-card px-4 py-3">
      {visibleChips.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => toggleFeature(f)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-ink hover:border-primary/50"
        >
          {f}
          <X size={12} />
        </button>
      ))}
      {remainingChips > 0 && (
        <button
          type="button"
          onClick={() => setFeatOpen(true)}
          className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:text-ink"
        >
          + {remainingChips}
        </button>
      )}
    </div>
  );

  const ErrorMsg = error && (
    <p className="border-t border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
      {error}
    </p>
  );

  const FeaturesPortal = featOpen && featCoords && typeof document !== "undefined"
    ? createPortal(
        <>
          <div
            className="fixed inset-0 z-[80]"
            onClick={() => setFeatOpen(false)}
            aria-hidden
          />
          <div
            className="absolute z-[81] max-h-[60vh] overflow-y-auto rounded-sm border border-border bg-card p-4 shadow-2xl"
            style={{ top: featCoords.top, left: featCoords.left, width: featCoords.width }}
          >
            <div className="space-y-4">
              {FEATURE_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="eyebrow text-[0.6rem] text-primary">{g.label}</p>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {g.items.map((f) => (
                      <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-ink">
                        <input
                          type="checkbox"
                          checked={state.features.includes(f)}
                          onChange={() => toggleFeature(f)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span className="leading-tight">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 mt-4 flex items-center justify-between gap-3 border-t border-border bg-card pt-3">
              <button
                type="button"
                onClick={() => setState({ ...state, features: [] })}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
              >
                {t("search.clean")}
              </button>
              <button
                type="button"
                onClick={() => setFeatOpen(false)}
                className="rounded-sm bg-ink px-5 py-2 text-xs uppercase tracking-[0.18em] text-cream"
              >
                {t("search.confirm")}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="w-full">
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {ContractTabs}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-md border border-warm-border bg-warm-ivory px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/50 hover:text-ink"
              aria-expanded={advancedOpen}
            >
              <SlidersHorizontal size={13} />
              {advancedOpen ? t("search.moreOptions") : t("search.moreOptions")}
            </button>
            {FeaturedToggle}
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="overflow-visible rounded-sm border border-border bg-card shadow-sm"
        >
          {Fields}
          {Chips}
          {ErrorMsg}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-border bg-warm-sand/60 px-3 py-2.5">
            <button
              type="button"
              onClick={reset}
              className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
            >
              {t("search.reset")}
            </button>
            <button type="submit" className="btn-primary">
              <Search size={14} /> {t("search.search")}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-sm border border-border bg-card px-5 py-4 text-sm text-ink shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Search size={16} className="text-primary" />
            {t("search.search")}
          </span>
          <ChevronDown size={14} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="eyebrow text-[0.65rem]">{t("search.search")}</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); submit(); }}
              className="flex-1 overflow-y-auto"
            >
              <div className="space-y-3 p-5">
                {ContractTabs}
                {FeaturedToggle}
              </div>
              {Fields}
              {Chips}
              {ErrorMsg}
              <div className="flex flex-col gap-3 p-5">
                <button type="submit" className="btn-primary w-full">
                  <Search size={14} /> {t("search.search")}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {t("search.reset")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {FeaturesPortal}
    </div>
  );
}

function SelectField({
  label, value, onChange, children,
}: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5 bg-card px-3 py-2 text-left">
      <span className="eyebrow text-[0.6rem]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-ink focus:outline-none focus:ring-0"
      >
        {children}
      </select>
    </label>
  );
}

function InputField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5 bg-card px-3 py-2 text-left">
      <span className="eyebrow text-[0.6rem]">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-0"
      />
    </label>
  );
}

// Backward-compat alias.
export const HomeSearchBar = PropertySearchBar;