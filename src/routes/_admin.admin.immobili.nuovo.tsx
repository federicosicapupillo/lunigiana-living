import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe2,
  ImagePlus,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  PROPERTY_TYPES,
  CONTRACT_TYPES,
  ENERGY_CLASSES,
  CONDITIONS,
  STATUS_LABELS,
  FURNISHED_OPTIONS,
  HEATING_OPTIONS,
  FLOOR_OPTIONS,
  FLOOR_TO_NUMBER,
  REGIONS,
  PROVINCES,
} from "@/lib/admin/property-constants";

export const Route = createFileRoute("/_admin/admin/immobili/nuovo")({
  head: () => ({
    meta: [
      { title: "Nuovo immobile — Admin Furia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NewPropertyPage,
});

type Status = "draft" | "ready" | "published";

type FormState = {
  // Sezione 1
  title: string;
  reference_code: string;
  property_type: string;
  descrizione_libera: string;
  contract_type: string;
  price: string;
  price_on_request: boolean;
  status: Status;
  // Sezione 2
  municipality: string;
  province: string;
  region: string;
  address: string;
  area_zone: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  // Sezione 3
  size_sqm: string;
  bedrooms: string;
  bathrooms: string;
  floor_label: string;
  total_floors: string;
  condition: string;
  energy_class: string;
  heating: string;
  furnished: string; // "Sì" | "No" | "Parzialmente" | ""
  garden: boolean;
  terrace: boolean;
  balcony: boolean;
  garage: boolean;
  cellar: boolean;
  elevator: boolean;
  panoramic_view: boolean;
  historic_property: boolean;
  // Sezione 4
  short_notes: string;
  long_description: string;
  internal_notes: string;
  punti_di_forza: string;
  target_acquirente: string;
  vista_contesto: string;
  elementi_storici: string;
};

const empty: FormState = {
  title: "",
  reference_code: "",
  property_type: "",
  descrizione_libera: "",
  contract_type: "",
  price: "",
  price_on_request: false,
  status: "draft",
  municipality: "",
  province: "",
  region: "Toscana",
  address: "",
  area_zone: "",
  postal_code: "",
  country: "Italia",
  latitude: "",
  longitude: "",
  size_sqm: "",
  bedrooms: "",
  bathrooms: "",
  floor_label: "",
  total_floors: "",
  condition: "",
  energy_class: "",
  heating: "",
  furnished: "",
  garden: false,
  terrace: false,
  balcony: false,
  garage: false,
  cellar: false,
  elevator: false,
  panoramic_view: false,
  historic_property: false,
  short_notes: "",
  long_description: "",
  internal_notes: "",
  punti_di_forza: "",
  target_acquirente: "",
  vista_contesto: "",
  elementi_storici: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const toNum = (v: string): number | null => {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function NewPropertyPage() {
  const navigate = useNavigate();
  const [f, setF] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  /**
   * Crea l'immobile + features narrative.
   * Ritorna l'id se ok, null in caso di errore.
   */
  const persist = async (overrideStatus?: Status): Promise<string | null> => {
    if (!f.title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return null;
    }
    setSaving(true);
    const t = toast.loading("Salvataggio in corso…");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id ?? null;
      const status = overrideStatus ?? f.status;

      const floorNum =
        f.floor_label && f.floor_label in FLOOR_TO_NUMBER
          ? FLOOR_TO_NUMBER[f.floor_label]
          : null;
      const furnishedBool = f.furnished === "Sì" || f.furnished === "Parzialmente";

      const payload = {
        title: f.title.trim(),
        slug: slugify(f.title),
        reference_code: f.reference_code.trim() || null,
        property_type: f.property_type || null,
        contract_type: f.contract_type || null,
        price: f.price_on_request ? null : toNum(f.price),
        price_on_request: f.price_on_request,
        status,
        municipality: f.municipality.trim() || null,
        province: f.province.trim() || null,
        region: f.region.trim() || null,
        address: f.address.trim() || null,
        area_zone: f.area_zone.trim() || null,
        postal_code: f.postal_code.trim() || null,
        country: f.country.trim() || null,
        latitude: toNum(f.latitude),
        longitude: toNum(f.longitude),
        size_sqm: toNum(f.size_sqm),
        bedrooms: toNum(f.bedrooms),
        bathrooms: toNum(f.bathrooms),
        floors: floorNum,
        condition: f.condition || null,
        energy_class: f.energy_class || null,
        furnished: furnishedBool,
        garden: f.garden,
        terrace: f.terrace,
        balcony: f.balcony,
        garage: f.garage,
        cellar: f.cellar,
        elevator: f.elevator,
        panoramic_view: f.panoramic_view,
        historic_property: f.historic_property,
        short_notes: f.short_notes.trim() || null,
        internal_notes: f.internal_notes.trim() || null,
        created_by: userId,
      };

      const { data, error } = await supabase
        .from("properties")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data) {
        console.error("[nuovo] insert failed:", error);
        toast.error(`Impossibile salvare: ${error?.message ?? "errore sconosciuto"}`, { id: t });
        return null;
      }

      // Salva campi narrativi + extra come property_features
      const extraFeatures: Array<{ property_id: string; feature_name: string; feature_value: string }> = [];
      const pushIf = (k: string, v: string) => {
        if (v.trim()) extraFeatures.push({ property_id: data.id, feature_name: k, feature_value: v.trim() });
      };
      pushIf("heating", f.heating);
      pushIf("total_floors", f.total_floors);
      pushIf("floor_label", f.floor_label);
      pushIf("furnished_level", f.furnished);
      pushIf("descrizione_libera", f.descrizione_libera);
      pushIf("long_description", f.long_description);
      pushIf("punti_di_forza", f.punti_di_forza);
      pushIf("target_acquirente", f.target_acquirente);
      pushIf("vista_contesto", f.vista_contesto);
      pushIf("elementi_storici", f.elementi_storici);
      if (extraFeatures.length) {
        const { error: fErr } = await supabase.from("property_features").insert(extraFeatures);
        if (fErr) console.warn("[nuovo] features insert warn:", fErr.message);
      }

      toast.success("Immobile salvato", { id: t });
      return data.id;
    } catch (err) {
      console.error("[nuovo] persist threw:", err);
      toast.error(err instanceof Error ? err.message : "Errore sconosciuto", { id: t });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const onSaveDraft = async () => {
    await persist("draft");
  };
  const onSaveContinue = async () => {
    const id = await persist();
    if (id) navigate({ to: "/admin/immobili/$id", params: { id } });
  };
  const onSaveBack = async () => {
    const id = await persist();
    if (id) navigate({ to: "/admin/immobili" });
  };
  const onPublish = async () => {
    const id = await persist("published");
    if (id) navigate({ to: "/admin/immobili/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-6 mb-8 border-b border-border bg-background/95 px-6 pb-5 pt-4 backdrop-blur">
        <Link
          to="/admin/immobili"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-ink"
        >
          <ArrowLeft size={12} /> Torna all'elenco
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-3xl text-ink">
              {f.title.trim() || "Nuovo immobile"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-sm border border-border bg-card px-2 py-0.5 uppercase tracking-wider">
                {STATUS_LABELS[f.status]}
              </span>
              <span>·</span>
              <span>{f.reference_code || "Nessun codice"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salva bozza
            </button>
            <button
              onClick={onSaveContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <CheckCircle2 size={13} /> Salva e continua
            </button>
            <button
              onClick={onSaveBack}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
            >
              Salva e torna
            </button>
            <button
              onClick={onPublish}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm bg-emerald-700 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <Globe2 size={13} /> Pubblica
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* SEZIONE 1 */}
        <Section title="1. Dati principali" subtitle="Identificazione dell'annuncio">
          <Field label="Titolo annuncio" full required>
            <TextInput value={f.title} onChange={(v) => upd("title", v)} placeholder="Es. Casale in pietra con vista sulle Apuane" />
          </Field>
          <Field label="Codice riferimento">
            <TextInput value={f.reference_code} onChange={(v) => upd("reference_code", v)} placeholder="RIF-2026-014" />
          </Field>
          <Field label="Stato annuncio">
            <SelectInput
              value={f.status}
              onChange={(v) => upd("status", v as Status)}
              options={[
                { value: "draft", label: "Bozza" },
                { value: "ready", label: "Pronto" },
                { value: "published", label: "Pubblicato" },
              ]}
            />
          </Field>
          <Field label="Tipologia immobile">
            <SelectInput
              value={f.property_type}
              onChange={(v) => upd("property_type", v)}
              options={PROPERTY_TYPES.map((o) => ({ value: o, label: o }))}
            />
          </Field>
          <Field label="Contratto">
            <SelectInput
              value={f.contract_type}
              onChange={(v) => upd("contract_type", v)}
              options={CONTRACT_TYPES.map((o) => ({ value: o, label: o }))}
            />
          </Field>
          <Field label="Prezzo (€)">
            <NumberInput
              value={f.price}
              onChange={(v) => upd("price", v)}
              disabled={f.price_on_request}
              step={1000}
              placeholder={f.price_on_request ? "Prezzo su richiesta" : "Es. 450000"}
            />
          </Field>
          <Field label="Modalità prezzo">
            <Toggle label="Prezzo su richiesta" value={f.price_on_request} onChange={(v) => upd("price_on_request", v)} />
          </Field>
        </Section>

        {/* SEZIONE 2 */}
        <Section title="2. Localizzazione" subtitle="Dove si trova l'immobile">
          <Field label="Comune">
            <TextInput value={f.municipality} onChange={(v) => upd("municipality", v)} placeholder="Es. Pietrasanta" />
          </Field>
          <Field label="Provincia">
            <ProvinceCombobox
              value={f.province}
              onChange={(v) => upd("province", v)}
              placeholder="Cerca provincia o sigla (es. MS, Lucca)"
            />
          </Field>
          <Field label="Regione">
            <SelectInput
              value={f.region}
              onChange={(v) => upd("region", v)}
              options={REGIONS.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona regione"
            />
          </Field>
          <Field label="Nazione">
            <TextInput value={f.country} onChange={(v) => upd("country", v)} />
          </Field>
          <Field label="Indirizzo" full>
            <TextInput value={f.address} onChange={(v) => upd("address", v)} placeholder="Via, numero civico" />
          </Field>
          <Field label="Zona / località">
            <TextInput value={f.area_zone} onChange={(v) => upd("area_zone", v)} placeholder="Es. Strettoia, Marina di Pietrasanta" />
          </Field>
          <Field label="CAP">
            <TextInput value={f.postal_code} onChange={(v) => upd("postal_code", v)} placeholder="55045" />
          </Field>
          <Field label="Latitudine">
            <NumberInput value={f.latitude} onChange={(v) => upd("latitude", v)} step={0.000001} placeholder="43.9456" />
          </Field>
          <Field label="Longitudine">
            <NumberInput value={f.longitude} onChange={(v) => upd("longitude", v)} step={0.000001} placeholder="10.2280" />
          </Field>
        </Section>

        {/* SEZIONE 3 */}
        <Section title="3. Caratteristiche principali" subtitle="Dati tecnici e dotazioni">
          <Field label="Superficie (mq)">
            <NumberInput value={f.size_sqm} onChange={(v) => upd("size_sqm", v)} />
          </Field>
          <Field label="Camere">
            <NumberInput value={f.bedrooms} onChange={(v) => upd("bedrooms", v)} />
          </Field>
          <Field label="Bagni">
            <NumberInput value={f.bathrooms} onChange={(v) => upd("bathrooms", v)} />
          </Field>
          <Field label="Piano dell'immobile">
            <SelectInput
              value={f.floor_label}
              onChange={(v) => upd("floor_label", v)}
              options={FLOOR_OPTIONS.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona piano"
            />
          </Field>
          <Field label="Totale piani edificio">
            <NumberInput value={f.total_floors} onChange={(v) => upd("total_floors", v)} />
          </Field>
          <Field label="Stato manutenzione">
            <SelectInput
              value={f.condition}
              onChange={(v) => upd("condition", v)}
              options={CONDITIONS.map((o) => ({ value: o, label: o }))}
            />
          </Field>
          <Field label="Classe energetica">
            <SelectInput
              value={f.energy_class}
              onChange={(v) => upd("energy_class", v)}
              options={ENERGY_CLASSES.map((o) => ({ value: o, label: o }))}
            />
          </Field>
          <Field label="Riscaldamento">
            <SelectInput
              value={f.heating}
              onChange={(v) => upd("heating", v)}
              options={HEATING_OPTIONS.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona riscaldamento"
            />
          </Field>
          <Field label="Arredato">
            <SelectInput
              value={f.furnished}
              onChange={(v) => upd("furnished", v)}
              options={FURNISHED_OPTIONS.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona stato arredo"
            />
          </Field>

          <div className="md:col-span-2">
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Dotazioni</span>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              <Toggle label="Giardino" value={f.garden} onChange={(v) => upd("garden", v)} />
              <Toggle label="Terrazza" value={f.terrace} onChange={(v) => upd("terrace", v)} />
              <Toggle label="Balcone" value={f.balcony} onChange={(v) => upd("balcony", v)} />
              <Toggle label="Garage" value={f.garage} onChange={(v) => upd("garage", v)} />
              <Toggle label="Cantina" value={f.cellar} onChange={(v) => upd("cellar", v)} />
              <Toggle label="Ascensore" value={f.elevator} onChange={(v) => upd("elevator", v)} />
              <Toggle label="Vista panoramica" value={f.panoramic_view} onChange={(v) => upd("panoramic_view", v)} />
              <Toggle label="Immobile storico" value={f.historic_property} onChange={(v) => upd("historic_property", v)} />
            </div>
          </div>
        </Section>

        {/* SEZIONE 4 */}
        <Section title="4. Descrizione e contenuti" subtitle="Testi pubblici e note interne">
          <Field label="Descrizione breve" full>
            <TextArea
              value={f.short_notes}
              onChange={(v) => upd("short_notes", v)}
              rows={3}
              placeholder="Sintesi di 1-2 righe per le card e i risultati di ricerca"
            />
          </Field>
          <Field label="Descrizione completa" full>
            <TextArea
              value={f.long_description}
              onChange={(v) => upd("long_description", v)}
              rows={6}
              placeholder="Scrivi qui la descrizione estesa, oppure generala con l'AI dopo aver salvato la bozza."
            />
          </Field>
          <Field label="Punti di forza">
            <TextArea
              value={f.punti_di_forza}
              onChange={(v) => upd("punti_di_forza", v)}
              rows={3}
              placeholder="Es. vista mare, pietra a vista, posizione panoramica"
            />
          </Field>
          <Field label="Target immobile">
            <TextArea
              value={f.target_acquirente}
              onChange={(v) => upd("target_acquirente", v)}
              rows={3}
              placeholder="Es. famiglia con bambini, investitore short-let, seconda casa"
            />
          </Field>
          <Field label="Atmosfera / contesto">
            <TextArea
              value={f.vista_contesto}
              onChange={(v) => upd("vista_contesto", v)}
              rows={3}
              placeholder="Es. tramonti sulle Apuane, silenzio dei boschi"
            />
          </Field>
          <Field label="Elementi architettonici rilevanti">
            <TextArea
              value={f.elementi_storici}
              onChange={(v) => upd("elementi_storici", v)}
              rows={3}
              placeholder="Es. soffitti a volta, camino in pietra, affreschi"
            />
          </Field>
          <Field label="Note interne (non pubbliche)" full>
            <TextArea
              value={f.internal_notes}
              onChange={(v) => upd("internal_notes", v)}
              rows={3}
              placeholder="Visibili solo allo staff: prezzo trattabile, contatti proprietario, ecc."
            />
          </Field>
        </Section>

        {/* SEZIONI 5 + 6 — handoff al full editor */}
        <div className="rounded-sm border border-dashed border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-ink">Foto e generazione AI della descrizione</p>
              <p className="mt-1">
                Salva la bozza con <strong>"Salva e continua"</strong>: si aprirà l'editor completo dell'immobile con il caricamento foto multiplo,
                ordinamento, scelta della copertina e generazione automatica della descrizione tramite AI.
              </p>
              <button
                onClick={onSaveContinue}
                disabled={saving}
                className="mt-4 inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/5 px-4 py-2 text-xs uppercase tracking-wider text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <ImagePlus size={13} /> Salva bozza e passa a foto / AI
              </button>
            </div>
          </div>
        </div>

        {/* SEZIONE 7 — azioni finali in fondo */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
          >
            Salva bozza
          </button>
          <button
            onClick={onSaveBack}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
          >
            Salva e torna all'elenco
          </button>
          <button
            onClick={onSaveContinue}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Salva e continua
          </button>
          <button
            onClick={onPublish}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-emerald-700 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            <Globe2 size={13} /> Pubblica annuncio
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI primitives ---------- */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-border bg-card p-6">
      <header className="mb-5 border-b border-border pb-3">
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  full,
  required,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-xs uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50";

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={inputCls}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${inputCls} resize-y leading-relaxed`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between rounded-sm border px-4 py-2.5 text-sm transition ${
        value
          ? "border-primary bg-primary/5 text-ink"
          : "border-border bg-card text-muted-foreground hover:border-primary/40"
      }`}
    >
      <span>{label}</span>
      <span className={`ml-3 h-2.5 w-2.5 rounded-full ${value ? "bg-primary" : "bg-muted-foreground/30"}`} />
    </button>
  );
}

/** Combobox ricercabile per la Provincia (sigla o nome). Salva la sigla (es. "MS"). */
function ProvinceCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Mostra "MS — Massa-Carrara" se value è una sigla riconosciuta
  const selected = PROVINCES.find((p) => p.code === value);
  const display = selected ? `${selected.code} — ${selected.name}` : value;

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? PROVINCES.filter(
        (p) =>
          p.code.toLowerCase().includes(needle) ||
          p.name.toLowerCase().includes(needle),
      ).slice(0, 80)
    : PROVINCES;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? q : display}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Cerca provincia"}
        className={inputCls}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-sm border border-border bg-card shadow-md"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">Nessun risultato</li>
          ) : (
            filtered.map((p) => {
              const active = p.code === value;
              return (
                <li key={p.code}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(p.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition hover:bg-muted ${
                      active ? "bg-primary/5 text-ink" : "text-foreground"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {p.code}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}