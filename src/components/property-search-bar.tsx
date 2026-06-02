import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, ChevronDown } from "lucide-react";
import { PROPERTY_TYPES, ALL_AMENITIES } from "@/lib/admin/property-constants";

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

export type SearchValues = {
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
  type: "", comune: "", price_min: "", price_max: "",
  size: "", rooms: "", features: [], sort: "recent",
};

function sanitizePrice(v: string): string {
  const cleaned = v.replace(/[^0-9]/g, "");
  return cleaned;
}

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
  const navigate = useNavigate();
  const [state, setState] = useState<SearchValues>({ ...EMPTY, ...initial });
  const [featOpen, setFeatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when URL-controlled `initial` changes (e.g. user clicks reset on parent).
  useEffect(() => {
    setState({ ...EMPTY, ...initial });
  }, [
    initial?.type, initial?.comune, initial?.price_min, initial?.price_max,
    initial?.size, initial?.rooms, initial?.sort,
    (initial?.features ?? []).join(","),
  ]);

  const comuniList = comuni && comuni.length ? comuni : COMUNI_FALLBACK;

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
        return "Controlla il range prezzo inserito.";
      }
    }
    return null;
  };

  const buildSearch = (s: SearchValues): Record<string, string> => {
    const out: Record<string, string> = {};
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

  const featLabel = state.features.length
    ? `${state.features.length} selezionate`
    : "Tutte";

  const Body = (
    <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-4 lg:grid-cols-8">
      <SelectField
        label="Tipologia"
        value={state.type}
        onChange={(v) => setState({ ...state, type: v })}
      >
        <option value="">Tutte</option>
        {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </SelectField>

      <SelectField
        label="Comune"
        value={state.comune}
        onChange={(v) => setState({ ...state, comune: v })}
      >
        <option value="">Tutti i comuni</option>
        {comuniList.map((c) => <option key={c} value={c}>{c}</option>)}
      </SelectField>

      <InputField
        label="Prezzo da"
        value={state.price_min}
        placeholder="Da €"
        onChange={(v) => setState({ ...state, price_min: sanitizePrice(v) })}
      />
      <InputField
        label="Prezzo a"
        value={state.price_max}
        placeholder="A €"
        onChange={(v) => setState({ ...state, price_max: sanitizePrice(v) })}
      />

      <SelectField
        label="Superficie"
        value={state.size}
        onChange={(v) => setState({ ...state, size: v })}
      >
        {SIZE_RANGES.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
      </SelectField>

      <SelectField
        label="Camere"
        value={state.rooms}
        onChange={(v) => setState({ ...state, rooms: v })}
      >
        {ROOM_OPTS.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
      </SelectField>

      <div className="relative flex flex-col gap-1 bg-card px-4 py-3 text-left">
        <span className="eyebrow text-[0.6rem]">Caratteristiche</span>
        <button
          type="button"
          onClick={() => setFeatOpen((o) => !o)}
          className="flex items-center justify-between bg-transparent text-sm text-ink focus:outline-none"
        >
          <span className={state.features.length ? "text-ink" : "text-muted-foreground"}>
            {featLabel}
          </span>
          <ChevronDown size={14} className={`transition ${featOpen ? "rotate-180" : ""}`} />
        </button>
        {featOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto border border-border bg-card p-3 shadow-xl">
            <div className="grid grid-cols-1 gap-1.5">
              {ALL_AMENITIES.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85 hover:text-ink">
                  <input
                    type="checkbox"
                    checked={state.features.includes(f)}
                    onChange={() => toggleFeature(f)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  {f}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFeatOpen(false)}
              className="mt-3 w-full rounded-sm bg-ink py-2 text-xs uppercase tracking-[0.18em] text-cream"
            >
              Conferma
            </button>
          </div>
        )}
      </div>

      <SelectField
        label="Ordina per"
        value={state.sort}
        onChange={(v) => setState({ ...state, sort: v })}
      >
        {SORT_OPTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </SelectField>
    </div>
  );

  const Chips = state.features.length > 0 && (
    <div className="flex flex-wrap gap-2 border-t border-border bg-card px-4 py-3">
      {state.features.map((f) => (
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
    </div>
  );

  const ErrorMsg = error && (
    <p className="border-t border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
      {error}
    </p>
  );

  return (
    <div className="w-full">
      {/* Desktop / tablet */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="hidden overflow-hidden rounded-sm border border-border bg-card shadow-sm md:block"
      >
        {Body}
        {Chips}
        {ErrorMsg}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
          <button
            type="button"
            onClick={reset}
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
          >
            Reset filtri
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90"
          >
            <Search size={14} /> Cerca
          </button>
        </div>
      </form>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-sm border border-border bg-card px-5 py-4 text-sm text-ink shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Search size={16} className="text-primary" />
            Filtra immobili
          </span>
          <ChevronDown size={14} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="eyebrow text-[0.65rem]">Filtra immobili</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Chiudi">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); submit(); }}
              className="flex-1 overflow-y-auto"
            >
              {Body}
              {Chips}
              {ErrorMsg}
              <div className="flex flex-col gap-3 p-5">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground"
                >
                  <Search size={14} /> Cerca
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Reset filtri
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
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
    <label className="flex flex-col gap-1 bg-card px-4 py-3 text-left">
      <span className="eyebrow text-[0.6rem]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 bg-transparent p-0 text-sm text-ink focus:outline-none focus:ring-0"
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
    <label className="flex flex-col gap-1 bg-card px-4 py-3 text-left">
      <span className="eyebrow text-[0.6rem]">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 bg-transparent p-0 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-0"
      />
    </label>
  );
}

// Backward-compat alias.
export const HomeSearchBar = PropertySearchBar;