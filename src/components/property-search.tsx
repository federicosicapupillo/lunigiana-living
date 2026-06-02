import { Search } from "lucide-react";

const types = ["Tutti", "Casa di pietra", "Villa", "Appartamento", "Rustico", "Terreno"];
const zones = ["Tutte", "Pontremoli", "Villafranca", "Filattiera", "Mulazzo", "Bagnone", "Zeri"];
const prices = ["Indifferente", "Fino a 150k", "150k – 300k", "300k – 600k", "Oltre 600k"];

export function PropertySearch({ variant = "hero" }: { variant?: "hero" | "page" }) {
  const isHero = variant === "hero";
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={
        isHero
          ? "grid w-full gap-px rounded-sm border border-cream/25 bg-cream/95 p-1 shadow-2xl backdrop-blur md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          : "grid w-full gap-px rounded-sm border border-border bg-card p-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      }
    >
      <Field label="Tipologia" options={types} />
      <Field label="Comune" options={zones} />
      <Field label="Prezzo" options={prices} />
      <Field label="Contratto" options={["Vendita", "Affitto"]} />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90"
      >
        <Search size={15} /> Cerca
      </button>
    </form>
  );
}

function Field({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1 bg-card px-4 py-3 text-left">
      <span className="eyebrow text-[0.6rem]">{label}</span>
      <select className="border-0 bg-transparent p-0 text-sm text-ink focus:outline-none focus:ring-0">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}