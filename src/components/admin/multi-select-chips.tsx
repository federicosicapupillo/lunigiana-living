import { useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import type { MultiSelectValue } from "@/lib/admin/property-constants";

type Props = {
  label: string;
  placeholder: string;
  options: readonly string[];
  otherLabel: string;
  value: MultiSelectValue;
  onChange: (v: MultiSelectValue) => void;
};

const OTHER = "Altro";

export function MultiSelectChips({
  label,
  placeholder,
  options,
  otherLabel,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => [...options, OTHER], [options]);
  const otherSelected = value.selected.includes(OTHER);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter((o) => o.toLowerCase().includes(q));
  }, [allOptions, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (opt: string) => {
    const has = value.selected.includes(opt);
    const next = has
      ? value.selected.filter((x) => x !== opt)
      : [...value.selected, opt];
    const altro = !next.includes(OTHER) ? "" : value.altro;
    onChange({ ...value, selected: next, altro });
  };

  const removeChip = (opt: string) => toggle(opt);

  return (
    <div className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <div className="relative mt-1" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-sm border border-border bg-background px-3 py-2 text-left text-sm hover:border-primary/50 focus:border-primary focus:outline-none"
        >
          <span className={value.selected.length ? "text-ink" : "text-muted-foreground"}>
            {value.selected.length
              ? `${value.selected.length} selezionati`
              : placeholder}
          </span>
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-sm border border-border bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={13} className="text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca…"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-muted-foreground">
                  Nessuna opzione
                </li>
              )}
              {filtered.map((opt) => {
                const checked = value.selected.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => toggle(opt)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/60"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {checked && <Check size={11} />}
                      </span>
                      <span className="text-ink">{opt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {value.selected.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {value.selected.map((s) => (
            <li
              key={s}
              className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-primary/5 px-2 py-1 text-xs text-ink"
            >
              {s}
              <button
                type="button"
                onClick={() => removeChip(s)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Rimuovi ${s}`}
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {otherSelected && (
        <input
          type="text"
          value={value.altro}
          onChange={(e) => onChange({ ...value, altro: e.target.value })}
          placeholder={otherLabel}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      )}

      <textarea
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="Note aggiuntive — scrivi eventuali dettagli personalizzati non presenti nelle opzioni…"
        rows={2}
        className="mt-2 w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}