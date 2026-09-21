import { useEffect, useState } from "react";
import {
  PRICE_OPTIONS,
  PRICE_CUSTOM,
  isCustomPrice,
} from "@/lib/admin/property-constants";

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-base focus:border-primary focus:outline-none sm:py-2 sm:text-sm";

/**
 * Menu guidato per il prezzo: importi comuni a tendina + "Altro importo"
 * che apre il campo con il valore esatto.
 * Un prezzo storico fuori elenco viene mostrato come "Altro importo"
 * con il valore preciso già compilato: nessuna perdita di dato.
 */
export function PriceGuidedInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [custom, setCustom] = useState(() => isCustomPrice(value));
  const [text, setText] = useState(value == null ? "" : String(value));

  // Allinea lo stato locale quando l'immobile viene (ri)caricato.
  useEffect(() => {
    if (isCustomPrice(value)) {
      setCustom(true);
      setText(value == null ? "" : String(value));
    } else if (value == null) {
      setText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const selectValue = custom ? PRICE_CUSTOM : value == null ? "" : String(value);

  return (
    <div className="space-y-2">
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === PRICE_CUSTOM) {
            setCustom(true);
            return;
          }
          setCustom(false);
          setText(v);
          onChange(v ? Number(v) : null);
        }}
        className={inputCls}
      >
        <option value="">Seleziona un importo</option>
        {PRICE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value={PRICE_CUSTOM}>{PRICE_CUSTOM}</option>
      </select>
      {custom && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step={1000}
            min={0}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const n = Number(e.target.value);
              onChange(e.target.value.trim() === "" || !Number.isFinite(n) ? null : n);
            }}
            placeholder="Importo esatto in euro. Es. 187500"
            className={inputCls}
          />
          <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
            euro
          </span>
        </div>
      )}
    </div>
  );
}
