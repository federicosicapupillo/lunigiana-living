import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  SIZE_RANGE_OPTIONS,
  SIZE_CUSTOM,
  BEDROOMS_OPTIONS,
  BEDROOMS_CUSTOM,
  BEDROOMS_TO_NUMBER,
  BATHROOMS_OPTIONS,
  BATHROOMS_CUSTOM,
  BATHROOMS_TO_NUMBER,
  TOTAL_FLOORS_OPTIONS,
  TOTAL_FLOORS_CUSTOM,
  AMENITY_GROUPS,
  AMENITY_TO_COLUMN,
  AMENITY_FEATURE_PREFIX,
  FURNISHED_TO_BOOL,
} from "@/lib/admin/property-constants";
import {
  MULTI_SELECT_FIELDS,
  EMPTY_MULTI,
  serializeMultiSelect,
  type MultiSelectValue,
  type MultiSelectKey,
} from "@/lib/admin/property-constants";
import { MultiSelectChips } from "@/components/admin/multi-select-chips";
import { LocationFields, EMPTY_LOCATION, type LocationValue } from "@/components/admin/location-fields";

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
  locality: string;
  area_zone: string;
  postal_code: string;
  country: string;
  show_full_address: boolean;
  // Sezione 3 — selezioni rapide + valore preciso
  size_range: string;
  size_sqm_exact: string;
  bedrooms_label: string;
  bedrooms_exact: string;
  bathrooms_label: string;
  bathrooms_exact: string;
  floor_label: string;
  total_floors_label: string;
  total_floors_exact: string;
  condition: string;
  energy_class: string;
  heating: string;
  furnished: string;
  amenities: Record<string, boolean>;
  altre_dotazioni: string;
  // Sezione 4
  short_notes: string;
  long_description: string;
  internal_notes: string;
  multi: Record<MultiSelectKey, MultiSelectValue>;
};

const empty: FormState = {
  title: "",
  property_type: "",
  descrizione_libera: "",
  contract_type: "",
  price: "",
  price_on_request: false,
  status: "draft",
  municipality: "",
  province: "",
  region: "",
  address: "",
  locality: "",
  area_zone: "",
  postal_code: "",
  country: "Italia",
  show_full_address: false,
  size_range: "",
  size_sqm_exact: "",
  bedrooms_label: "",
  bedrooms_exact: "",
  bathrooms_label: "",
  bathrooms_exact: "",
  floor_label: "",
  total_floors_label: "",
  total_floors_exact: "",
  condition: "",
  energy_class: "",
  heating: "",
  furnished: "",
  amenities: {},
  altre_dotazioni: "",
  short_notes: "",
  long_description: "",
  internal_notes: "",
  multi: {
    punti_di_forza: { ...EMPTY_MULTI },
    target_acquirente: { ...EMPTY_MULTI },
    vista_contesto: { ...EMPTY_MULTI },
    elementi_storici: { ...EMPTY_MULTI },
  },
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
    if (!f.property_type) {
      toast.error("La tipologia immobile è obbligatoria");
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
      const furnishedBool = f.furnished ? FURNISHED_TO_BOOL[f.furnished] ?? false : false;

      // Superficie: se "Inserisci valore preciso" → usa il numero, altrimenti
      // niente intero in colonna (resta solo il range nei features).
      const sizeNum =
        f.size_range === SIZE_CUSTOM ? toNum(f.size_sqm_exact) : null;
      const bedroomsNum =
        f.bedrooms_label === BEDROOMS_CUSTOM
          ? toNum(f.bedrooms_exact)
          : f.bedrooms_label
            ? BEDROOMS_TO_NUMBER[f.bedrooms_label] ?? null
            : null;
      const bathroomsNum =
        f.bathrooms_label === BATHROOMS_CUSTOM
          ? toNum(f.bathrooms_exact)
          : f.bathrooms_label
            ? BATHROOMS_TO_NUMBER[f.bathrooms_label] ?? null
            : null;

      // Mappa amenities → colonne boolean note
      const amenityBools: Record<string, boolean> = {
        garden: false,
        terrace: false,
        balcony: false,
        garage: false,
        cellar: false,
        elevator: false,
        panoramic_view: false,
        historic_property: false,
      };
      Object.entries(f.amenities).forEach(([label, on]) => {
        if (!on) return;
        const col = AMENITY_TO_COLUMN[label];
        if (col) amenityBools[col] = true;
      });

      const payload = {
        title: f.title.trim(),
        slug: slugify(f.title),
        property_type: f.property_type || null,
        contract_type: f.contract_type || null,
        price: f.price_on_request ? null : toNum(f.price),
        price_on_request: f.price_on_request,
        status,
        municipality: f.municipality.trim() || null,
        province: f.province.trim() || null,
        region: f.region.trim() || null,
        address: f.address.trim() || null,
        locality: f.locality.trim() || null,
        area_zone: f.area_zone.trim() || null,
        postal_code: f.postal_code.trim() || null,
        country: f.country.trim() || null,
        show_full_address: f.show_full_address,
        size_sqm: sizeNum,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        floors: floorNum,
        condition: f.condition || null,
        energy_class: f.energy_class || null,
        furnished: furnishedBool,
        ...amenityBools,
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
      pushIf("floor_label", f.floor_label);
      pushIf("furnished_level", f.furnished);
      pushIf("descrizione_libera", f.descrizione_libera);
      pushIf("long_description", f.long_description);
      // Multi-select narrative fields → JSON
      (Object.keys(f.multi) as MultiSelectKey[]).forEach((k) => {
        const serialized = serializeMultiSelect(f.multi[k]);
        if (serialized) {
          extraFeatures.push({ property_id: data.id, feature_name: k, feature_value: serialized });
        }
      });
      // Range/label sezione 3
      pushIf("size_range", f.size_range);
      pushIf("bedrooms_label", f.bedrooms_label);
      pushIf("bathrooms_label", f.bathrooms_label);
      pushIf("total_floors_label", f.total_floors_label);
      if (f.total_floors_label === TOTAL_FLOORS_CUSTOM) {
        pushIf("total_floors_exact", f.total_floors_exact);
      }
      pushIf("altre_dotazioni", f.altre_dotazioni);
      // Dotazioni selezionate
      Object.entries(f.amenities).forEach(([label, on]) => {
        if (on) {
          extraFeatures.push({
            property_id: data.id,
            feature_name: AMENITY_FEATURE_PREFIX + label,
            feature_value: label,
          });
        }
      });
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
              <span className="italic text-muted-foreground">
                Riferimento generato al salvataggio
              </span>
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
          <Field label="Tipologia immobile" full required>
            <SelectInput
              value={f.property_type}
              onChange={(v) => upd("property_type", v)}
              options={PROPERTY_TYPES.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona tipologia immobile"
            />
          </Field>
          <Field label="Descrizione libera" full>
            <TextArea
              value={f.descrizione_libera}
              onChange={(v) => upd("descrizione_libera", v)}
              rows={5}
              placeholder="Scrivi qui una descrizione personalizzata dell'immobile, del contesto, della vista, del terreno, delle potenzialità o di altri dettagli importanti…"
            />
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
          <LocationFields
            value={{
              region: f.region,
              province: f.province,
              municipality: f.municipality,
              locality: f.locality,
              area_zone: f.area_zone,
              postal_code: f.postal_code,
              address: f.address,
              show_full_address: f.show_full_address,
            }}
            onChange={(patch) =>
              setF((s) => ({ ...s, ...patch }))
            }
          />
        </Section>

        {/* SEZIONE 3 */}
        <Section title="3. Caratteristiche principali" subtitle="Dati tecnici e dotazioni">
          <Field label="Superficie (mq)">
            <SelectInput
              value={f.size_range}
              onChange={(v) => upd("size_range", v)}
              options={[
                ...SIZE_RANGE_OPTIONS.map((o) => ({ value: o, label: o })),
                { value: SIZE_CUSTOM, label: SIZE_CUSTOM },
              ]}
              placeholder="Seleziona superficie"
            />
            {f.size_range === SIZE_CUSTOM && (
              <div className="mt-2">
                <NumberInput
                  value={f.size_sqm_exact}
                  onChange={(v) => upd("size_sqm_exact", v)}
                  placeholder="Es. 145"
                />
              </div>
            )}
          </Field>
          <Field label="Camere">
            <SelectInput
              value={f.bedrooms_label}
              onChange={(v) => upd("bedrooms_label", v)}
              options={[
                ...BEDROOMS_OPTIONS.map((o) => ({ value: o, label: o })),
                { value: BEDROOMS_CUSTOM, label: BEDROOMS_CUSTOM },
              ]}
              placeholder="Seleziona camere"
            />
            {f.bedrooms_label === BEDROOMS_CUSTOM && (
              <div className="mt-2">
                <NumberInput
                  value={f.bedrooms_exact}
                  onChange={(v) => upd("bedrooms_exact", v)}
                  placeholder="Numero camere"
                />
              </div>
            )}
          </Field>
          <Field label="Bagni">
            <SelectInput
              value={f.bathrooms_label}
              onChange={(v) => upd("bathrooms_label", v)}
              options={[
                ...BATHROOMS_OPTIONS.map((o) => ({ value: o, label: o })),
                { value: BATHROOMS_CUSTOM, label: BATHROOMS_CUSTOM },
              ]}
              placeholder="Seleziona bagni"
            />
            {f.bathrooms_label === BATHROOMS_CUSTOM && (
              <div className="mt-2">
                <NumberInput
                  value={f.bathrooms_exact}
                  onChange={(v) => upd("bathrooms_exact", v)}
                  placeholder="Numero bagni"
                />
              </div>
            )}
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
            <SelectInput
              value={f.total_floors_label}
              onChange={(v) => upd("total_floors_label", v)}
              options={[
                ...TOTAL_FLOORS_OPTIONS.map((o) => ({ value: o, label: o })),
                { value: TOTAL_FLOORS_CUSTOM, label: TOTAL_FLOORS_CUSTOM },
              ]}
              placeholder="Seleziona piani edificio"
            />
            {f.total_floors_label === TOTAL_FLOORS_CUSTOM && (
              <div className="mt-2">
                <NumberInput
                  value={f.total_floors_exact}
                  onChange={(v) => upd("total_floors_exact", v)}
                  placeholder="Numero piani"
                />
              </div>
            )}
          </Field>
          <Field label="Stato manutenzione">
            <SelectInput
              value={f.condition}
              onChange={(v) => upd("condition", v)}
              options={CONDITIONS.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona stato"
            />
          </Field>
          <Field label="Classe energetica">
            <SelectInput
              value={f.energy_class}
              onChange={(v) => upd("energy_class", v)}
              options={ENERGY_CLASSES.map((o) => ({ value: o, label: o }))}
              placeholder="Seleziona classe"
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

          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Dotazioni</span>
              <p className="mt-1 text-xs text-muted-foreground">Seleziona tutte le dotazioni presenti. Tap per attivare/disattivare.</p>
            </div>
            {AMENITY_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
                  {group.title}
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {group.items.map((label) => (
                    <Toggle
                      key={label}
                      label={label}
                      value={!!f.amenities[label]}
                      onChange={(v) =>
                        setF((s) => ({
                          ...s,
                          amenities: { ...s.amenities, [label]: v },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            <Field label="Altre dotazioni" full>
              <TextArea
                value={f.altre_dotazioni}
                onChange={(v) => upd("altre_dotazioni", v)}
                rows={3}
                placeholder="Scrivi eventuali dotazioni particolari non presenti nell'elenco…"
              />
            </Field>
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
          {MULTI_SELECT_FIELDS.map((ms) => (
            <Field key={ms.key} label={ms.label} full>
              <MultiSelectChips
                label=""
                placeholder={ms.placeholder}
                options={ms.options}
                otherLabel={ms.otherLabel}
                value={f.multi[ms.key]}
                onChange={(v) =>
                  setF((s) => ({ ...s, multi: { ...s.multi, [ms.key]: v } }))
                }
              />
            </Field>
          ))}
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

/* ProvinceCombobox rimosso: la cascata Regione/Provincia/Comune/CAP è gestita da LocationFields */