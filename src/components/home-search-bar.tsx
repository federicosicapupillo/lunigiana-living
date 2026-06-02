import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, ChevronDown } from "lucide-react";

const TYPES = [
  "Casale","Rustico","Villa","Casa indipendente","Terratetto","Appartamento",
  "Attico","Bifamiliare","Semindipendente","Podere","Agriturismo",
  "Borgo / proprietà storica","Terreno","Locale commerciale",
];

const COMUNI = [
  "Pontremoli","Bagnone","Villafranca in Lunigiana","Mulazzo","Filattiera",
  "Licciana Nardi","Aulla","Fivizzano","Fosdinovo","Sarzana",
];

const PRICE_RANGES = [
  { label: "Qualsiasi prezzo", value: "" },
  { label: "Fino a 100.000 €", value: "0-100000" },
  { label: "100.000 € - 200.000 €", value: "100000-200000" },
  { label: "200.000 € - 300.000 €", value: "200000-300000" },
  { label: "300.000 € - 500.000 €", value: "300000-500000" },
  { label: "500.000 € - 800.000 €", value: "500000-800000" },
  { label: "Oltre 800.000 €", value: "800000-" },
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

const FEATURES = [
  "Giardino","Terreno","Vista panoramica","Vista mare","Vista montagne",
  "Piscina","Immobile storico","Casale in pietra","Ristrutturato",
  "Da ristrutturare","Ideale seconda casa","Ideale investimento",
];

const EMPTY = {
  type: "", comune: "", price: "", size: "", rooms: "",
  features: [] as string[],
};

export function HomeSearchBar() {
  const navigate = useNavigate();
  const [state, setState] = useState(EMPTY);
  const [featOpen, setFeatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleFeature = (f: string) =>
    setState((s) => ({
      ...s,
      features: s.features.includes(f)
        ? s.features.filter((x) => x !== f)
        : [...s.features, f],
    }));

  const submit = () => {
    const search: Record<string, string> = {};
    if (state.type) search.type = state.type;
    if (state.comune) search.comune = state.comune;
    if (state.price) search.price = state.price;
    if (state.size) search.size = state.size;
    if (state.rooms) search.rooms = state.rooms;
    if (state.features.length) search.features = state.features.join(",");
    navigate({ to: "/immobili", search });
  };

  const reset = () => setState(EMPTY);

  const featLabel = state.features.length
    ? `${state.features.length} selezionate`
    : "Tutte";

  const Body = (
    <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-6">
      <SelectField
        label="Tipologia"
        value={state.type}
        onChange={(v) => setState({ ...state, type: v })}
      >
        <option value="">Tutte le tipologie</option>
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </SelectField>

      <SelectField
        label="Comune"
        value={state.comune}
        onChange={(v) => setState({ ...state, comune: v })}
      >
        <option value="">Tutti i comuni</option>
        {COMUNI.map((c) => <option key={c} value={c}>{c}</option>)}
      </SelectField>

      <SelectField
        label="Prezzo"
        value={state.price}
        onChange={(v) => setState({ ...state, price: v })}
      >
        {PRICE_RANGES.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
      </SelectField>

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
              {FEATURES.map((f) => (
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
    </div>
  );

  return (
    <div className="w-full">
      {/* Desktop / tablet */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="hidden overflow-hidden rounded-sm border border-border bg-card shadow-sm md:block"
      >
        {Body}
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
            Apri filtri ricerca
          </span>
          <ChevronDown size={14} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="eyebrow text-[0.65rem]">Filtri ricerca</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Chiudi">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); submit(); setMobileOpen(false); }}
              className="flex-1 overflow-y-auto p-5"
            >
              {Body}
              <div className="mt-6 flex flex-col gap-3">
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