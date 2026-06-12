import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applyStatusTransition } from "@/lib/admin/property-status";
import { STATUS_LABELS, type PropertyStatus } from "@/lib/admin/property-constants";
import { toast } from "sonner";
import { X, Loader2, AlertTriangle, CheckCircle2, ImageOff, MapPin, Maximize2, BedDouble, Bath } from "lucide-react";

type Props = {
  propertyId: string | null;
  onClose: () => void;
  onPublished?: () => void;
};

type Data = {
  id: string;
  title: string | null;
  reference_code: string | null;
  municipality: string | null;
  property_type: string | null;
  contract_type: string | null;
  price: number | null;
  price_on_request: boolean;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  cover_url: string | null;
  short_desc: string | null;
};

function validate(d: Data): string[] {
  const miss: string[] = [];
  if (!d.title || !d.title.trim()) miss.push("Titolo");
  if (!d.municipality || !d.municipality.trim()) miss.push("Comune");
  if (!d.property_type) miss.push("Tipologia");
  if (!d.contract_type) miss.push("Contratto (vendita/affitto)");
  if (!d.price_on_request && (d.price == null || d.price <= 0)) miss.push("Prezzo");
  if (!d.cover_url) miss.push("Almeno una foto");
  if (!d.short_desc || !d.short_desc.trim()) miss.push("Descrizione");
  return miss;
}

export function PreviewPublishDialog({ propertyId, onClose, onPublished }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    let alive = true;
    setLoading(true);
    setPublished(false);
    (async () => {
      const [{ data: p }, { data: imgs }, { data: desc }] = await Promise.all([
        supabase.from("properties").select("id,title,reference_code,municipality,property_type,contract_type,price,price_on_request,size_sqm,bedrooms,bathrooms,status").eq("id", propertyId).maybeSingle(),
        supabase.from("property_images").select("image_url,is_cover,sort_order,is_rendering").eq("property_id", propertyId),
        supabase.from("property_descriptions").select("edited_description,generated_description").eq("property_id", propertyId).maybeSingle(),
      ]);
      if (!alive) return;
      if (!p) {
        setData(null);
        setLoading(false);
        return;
      }
      const visible = (imgs ?? []).filter((i) => !i.is_rendering);
      const cover =
        visible.find((i) => i.is_cover)?.image_url ??
        visible.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ??
        null;
      const short = (desc?.edited_description || desc?.generated_description || "").trim();
      setData({
        id: p.id as string,
        title: (p.title as string | null) ?? null,
        reference_code: (p.reference_code as string | null) ?? null,
        municipality: (p.municipality as string | null) ?? null,
        property_type: (p.property_type as string | null) ?? null,
        contract_type: (p.contract_type as string | null) ?? null,
        price: (p.price as number | null) ?? null,
        price_on_request: !!p.price_on_request,
        size_sqm: (p.size_sqm as number | null) ?? null,
        bedrooms: (p.bedrooms as number | null) ?? null,
        bathrooms: (p.bathrooms as number | null) ?? null,
        status: p.status as PropertyStatus,
        cover_url: cover,
        short_desc: short || null,
      });
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [propertyId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (propertyId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [propertyId, onClose]);

  if (!propertyId) return null;

  const missing = data ? validate(data) : [];
  const isPublished = data?.status === "published" || published;
  const canPublish = !!data && !isPublished && missing.length === 0;

  const doPublish = async () => {
    if (!data || !canPublish) return;
    setPublishing(true);
    const action = data.status === "published" ? "republish" : data.status === "draft" || data.status === "ready" ? "publish" : "republish";
    const res = await applyStatusTransition(data.id, action);
    setPublishing(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Annuncio pubblicato correttamente");
    setPublished(true);
    setData({ ...data, status: "published" });
    onPublished?.();
  };

  const shortDescPreview = data?.short_desc ? data.short_desc.slice(0, 280) + (data.short_desc.length > 280 ? "…" : "") : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-[hsl(35_25%_75%)] bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[hsl(35_25%_80%)] bg-cream px-5 py-3">
          <h2 className="font-serif text-lg text-ink">Anteprima annuncio</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-sm p-1 text-muted-foreground hover:bg-background hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-cream px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !data ? (
            <p className="py-10 text-center text-muted-foreground">Immobile non trovato.</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-sm border border-[hsl(35_25%_80%)] bg-muted aspect-[16/9]">
                {data.cover_url ? (
                  <img src={data.cover_url} alt={data.title ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff size={28} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {data.reference_code && <span className="text-primary">{data.reference_code}</span>}
                  {data.property_type && <span>· {data.property_type}</span>}
                  <span
                    className={`ml-auto rounded-sm px-2 py-0.5 ${
                      data.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {STATUS_LABELS[data.status] ?? data.status}
                  </span>
                </div>
                <h3 className="mt-2 font-serif text-2xl text-ink">{data.title || "(Senza titolo)"}</h3>
                {data.municipality && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={14} /> {data.municipality}
                  </div>
                )}
                <div className="mt-3 font-serif text-2xl text-primary">
                  {data.price_on_request
                    ? "Su richiesta"
                    : data.price
                      ? `€ ${data.price.toLocaleString("it-IT")}`
                      : "—"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Fact icon={Maximize2} label="Mq" value={data.size_sqm ? `${data.size_sqm}` : "—"} />
                <Fact icon={BedDouble} label="Camere" value={data.bedrooms != null ? String(data.bedrooms) : "—"} />
                <Fact icon={Bath} label="Bagni" value={data.bathrooms != null ? String(data.bathrooms) : "—"} />
              </div>

              {shortDescPreview && (
                <div>
                  <div className="eyebrow text-muted-foreground">Descrizione</div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                    {shortDescPreview}
                  </p>
                </div>
              )}

              {published && (
                <div className="flex items-start gap-2 rounded-sm border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <CheckCircle2 size={16} className="mt-0.5" />
                  Annuncio pubblicato correttamente.
                </div>
              )}

              {!isPublished && missing.length > 0 && (
                <div className="flex items-start gap-2 rounded-sm border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Non puoi pubblicare: mancano dati obbligatori</div>
                    <ul className="mt-1 list-inside list-disc">
                      {missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[hsl(35_25%_80%)] bg-cream px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider text-ink hover:border-primary/50"
          >
            Chiudi
          </button>
          {isPublished ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-sm bg-emerald-200 px-4 py-2 text-xs uppercase tracking-wider text-emerald-900 opacity-70"
            >
              Già pubblicato
            </button>
          ) : (
            <button
              type="button"
              onClick={doPublish}
              disabled={!canPublish || publishing}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-emerald-600 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing && <Loader2 size={13} className="animate-spin" />}
              Pubblica
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[hsl(35_25%_80%)] bg-background p-3">
      <Icon size={14} className="text-primary" />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-serif text-base text-ink">{value}</div>
    </div>
  );
}