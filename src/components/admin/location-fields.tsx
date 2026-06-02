import { useEffect, useMemo, useRef, useState } from "react";
import {
  REGIONI_IT,
  provinceByRegion,
  comuniByProvincia,
  capByComune,
  inferFromComune,
  PROVINCE_IT,
} from "@/lib/admin/comuni-helpers";

export type LocationValue = {
  region: string;
  province: string; // sigla (es. "MS")
  municipality: string; // nome comune
  locality: string; // località / frazione
  area_zone: string; // zona / quartiere
  postal_code: string;
  address: string;
  show_full_address: boolean;
};

export const EMPTY_LOCATION: LocationValue = {
  region: "",
  province: "",
  municipality: "",
  locality: "",
  area_zone: "",
  postal_code: "",
  address: "",
  show_full_address: false,
};

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50";

function Field({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputCls}
    >
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Combobox ricercabile generico per stringhe.
 * Mantiene il valore corrente anche se non è nella lista (utile per zona/località libere).
 */
function Combobox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  allowFree = true,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  allowFree?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    const base = needle
      ? options.filter((o) => o.toLowerCase().includes(needle))
      : options;
    return base.slice(0, 200);
  }, [options, needle]);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={open ? q : value}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          if (allowFree) onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-sm border border-border bg-card shadow-md"
        >
          {filtered.map((o) => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(o);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition hover:bg-muted ${
                  o === value ? "bg-primary/5 text-ink" : "text-foreground"
                }`}
              >
                <span>{o}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LocationFields({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (patch: Partial<LocationValue>) => void;
}) {
  // Se la regione manca ma comune/provincia sono presenti, prova a dedurre dai dati ISTAT
  // (utile per annunci già esistenti salvati prima dell'aggiornamento)
  useEffect(() => {
    if (!value.region && value.municipality) {
      const c = inferFromComune(value.municipality);
      if (c) {
        onChange({
          region: value.region || c.r,
          province: value.province || c.s,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const provinces = provinceByRegion(value.region);
  const comuni = comuniByProvincia(value.province);
  const caps = capByComune(value.municipality, value.province);

  const onRegionChange = (region: string) => {
    // se la provincia attuale non appartiene alla nuova regione, azzeriamo a catena
    const stillValid = provinceByRegion(region).some((p) => p.code === value.province);
    onChange({
      region,
      ...(stillValid
        ? {}
        : { province: "", municipality: "", locality: "", postal_code: "" }),
    });
  };

  const onProvinceChange = (sigla: string) => {
    const rec = PROVINCE_IT.find((p) => p.code === sigla);
    onChange({
      province: sigla,
      region: rec?.region || value.region,
      municipality: "",
      locality: "",
      postal_code: "",
    });
  };

  const onComuneChange = (nome: string) => {
    const newCaps = capByComune(nome, value.province);
    onChange({
      municipality: nome,
      // se il comune ha un solo CAP, compilazione automatica
      postal_code: newCaps.length === 1 ? newCaps[0] : "",
      // svuota località: appartiene al comune precedente
      locality: "",
    });
  };

  return (
    <>
      <Field label="Regione *">
        <Select
          value={value.region}
          onChange={onRegionChange}
          options={REGIONI_IT.map((r) => ({ value: r, label: r }))}
          placeholder="Seleziona regione"
        />
      </Field>
      <Field
        label="Provincia *"
        hint={!value.region ? "Seleziona prima una regione" : undefined}
      >
        <Select
          value={value.province}
          onChange={onProvinceChange}
          options={provinces.map((p) => ({
            value: p.code,
            label: `${p.name} (${p.code})`,
          }))}
          placeholder="Seleziona provincia"
          disabled={!value.region}
        />
      </Field>
      <Field
        label="Comune *"
        hint={!value.province ? "Seleziona prima una provincia" : undefined}
      >
        <Combobox
          value={value.municipality}
          onChange={(v) => onComuneChange(v)}
          options={comuni.map((c) => c.n)}
          placeholder="Cerca o seleziona comune"
          disabled={!value.province}
          allowFree={false}
        />
      </Field>
      <Field label="Località / frazione">
        <Combobox
          value={value.locality}
          onChange={(v) => onChange({ locality: v })}
          options={[]}
          placeholder="Es. Strettoia, Marina di Pietrasanta"
          disabled={!value.municipality}
          allowFree
        />
      </Field>
      <Field label="Zona / quartiere">
        <input
          type="text"
          value={value.area_zone}
          onChange={(e) => onChange({ area_zone: e.target.value })}
          placeholder="Es. centro storico, collina, lungomare"
          className={inputCls}
        />
      </Field>
      <Field
        label="CAP"
        hint={
          caps.length > 1
            ? `Il comune ha ${caps.length} CAP: seleziona quello corretto`
            : undefined
        }
      >
        {caps.length > 1 ? (
          <Select
            value={value.postal_code}
            onChange={(v) => onChange({ postal_code: v })}
            options={caps.map((c) => ({ value: c, label: c }))}
            placeholder="Seleziona CAP"
          />
        ) : (
          <input
            type="text"
            value={value.postal_code}
            onChange={(e) => onChange({ postal_code: e.target.value })}
            placeholder="CAP"
            className={inputCls}
          />
        )}
      </Field>
      <Field label="Indirizzo / Via" full>
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Es. Via Roma 12"
          className={inputCls}
        />
      </Field>
      <div className="md:col-span-2">
        <span className="block text-xs uppercase tracking-wider text-muted-foreground">
          Visibilità indirizzo sull'annuncio pubblico
        </span>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onChange({ show_full_address: false })}
            className={`flex items-start gap-3 rounded-sm border px-4 py-3 text-left text-sm transition ${
              !value.show_full_address
                ? "border-primary bg-primary/5 text-ink"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span
              className={`mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full border ${
                !value.show_full_address ? "border-primary bg-primary" : "border-muted-foreground/40"
              }`}
            />
            <span>
              <span className="block font-medium text-ink">No, mostra solo Comune / Zona / Località</span>
              <span className="block text-xs text-muted-foreground">
                L'indirizzo esatto resta riservato; nella scheda pubblica si vede solo Comune, Zona, Provincia, Regione.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ show_full_address: true })}
            className={`flex items-start gap-3 rounded-sm border px-4 py-3 text-left text-sm transition ${
              value.show_full_address
                ? "border-primary bg-primary/5 text-ink"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span
              className={`mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full border ${
                value.show_full_address ? "border-primary bg-primary" : "border-muted-foreground/40"
              }`}
            />
            <span>
              <span className="block font-medium text-ink">Sì, mostra indirizzo completo</span>
              <span className="block text-xs text-muted-foreground">
                L'indirizzo esatto sarà visibile pubblicamente.
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}