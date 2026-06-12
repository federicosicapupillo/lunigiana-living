import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Printer,
  Download,
  FileText,
  Shuffle,
  X,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoAsset from "@/assets/furia-logo.png.asset.json";

type PropertyData = {
  id: string;
  title: string;
  slug: string | null;
  reference_code: string | null;
  property_type: string | null;
  contract_type: string | null;
  price: number | null;
  price_on_request: boolean;
  municipality: string | null;
  area_zone: string | null;
  province: string | null;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  energy_class: string | null;
  energy_performance_index_value: number | null;
  short_notes: string | null;
  panoramic_view: boolean;
  historic_property: boolean;
  garden: boolean;
  terrace: boolean;
  balcony: boolean;
  garage: boolean;
  cellar: boolean;
  elevator: boolean;
  furnished: boolean;
};

type FlyerImage = {
  id: string;
  url: string;
  isRender: boolean;
  isEnhanced: boolean;
};

type Lang = "it" | "en";

const LAYOUTS = [
  "hero-left",
  "split-trio",
  "mosaic-quad",
  "portrait-hero",
  "filmstrip",
] as const;
type Layout = (typeof LAYOUTS)[number];

const STR = {
  it: {
    title: "Genera cartello vetrina A3",
    selectPhotos: "Seleziona foto (max 4)",
    layout: "Layout",
    language: "Lingua",
    regenerate: "Rigenera layout",
    pdf: "Scarica PDF A3",
    image: "Scarica immagine",
    print: "Stampa",
    close: "Chiudi",
    rendering: "Rendering AI",
    renderingNote: "Immagine illustrativa, non rappresenta lo stato attuale dell'immobile.",
    onRequest: "Prezzo su richiesta",
    sqm: "mq",
    rooms: "camere",
    baths: "bagni",
    floor: "piano",
    energy: "Classe en.",
    code: "Cod. annuncio",
  },
  en: {
    title: "Generate A3 window flyer",
    selectPhotos: "Select photos (max 4)",
    layout: "Layout",
    language: "Language",
    regenerate: "Regenerate layout",
    pdf: "Download A3 PDF",
    image: "Download image",
    print: "Print",
    close: "Close",
    rendering: "AI Rendering",
    renderingNote: "Illustrative image, does not represent the current state of the property.",
    onRequest: "Price on request",
    sqm: "sqm",
    rooms: "bedrooms",
    baths: "bathrooms",
    floor: "floor",
    energy: "Energy",
    code: "Listing code",
  },
} as const;

function formatPrice(p: PropertyData, lang: Lang) {
  if (p.price_on_request || !p.price) return STR[lang].onRequest;
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(p.price);
}

// Keywords to highlight in the description (terracotta + bold)
const HIGHLIGHT_WORDS = [
  "vista panoramica", "vista mare", "vista mozzafiato", "vista aperta",
  "panoramica", "panoramico", "panoramic", "sea view", "mountain view",
  "ristrutturato", "ristrutturata", "renovated", "nuovo", "nuova",
  "piscina", "pool", "giardino", "garden", "terrazza", "terrace",
  "garage", "cantina", "uliveto", "oliveto", "vigneto", "bosco",
  "storico", "storica", "historic", "in pietra", "stone",
  "ampia", "ampio", "luminoso", "luminosa", "esclusivo", "esclusiva",
  "indipendente", "centro storico", "abitabile", "rifinito", "rifinita",
  "borgo", "campagna", "collina", "tramonti", "apuane",
  "investimento", "b&b", "agriturismo", "seconda casa",
];

function condenseDescription(text: string, maxChars = 520): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  // Split into sentences; keep first ones until budget filled
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    if ((out + " " + s).trim().length > maxChars) break;
    out = (out + " " + s).trim();
  }
  if (!out) out = cleaned.slice(0, maxChars - 1).replace(/[\s,.;]\S*$/, "") + "…";
  return out;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/)
    .reduce<string[]>((acc, sentence) => {
      // Pair sentences into 1-2 sentence blocks for readability
      const last = acc[acc.length - 1];
      if (!last || last.length > 160) acc.push(sentence);
      else acc[acc.length - 1] = last + " " + sentence;
      return acc;
    }, [])
    .slice(0, 4);
}

function HighlightedText({ text }: { text: string }) {
  // Build a regex that matches any highlight word (case insensitive, word-ish boundary)
  const escaped = HIGHLIGHT_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort(
    (a, b) => b.length - a.length,
  );
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <strong key={i} style={{ color: "#B76A4C", fontWeight: 700 }}>
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function WindowFlyerDialog({
  property,
  open,
  onClose,
}: {
  property: PropertyData;
  open: boolean;
  onClose: () => void;
}) {
  const [images, setImages] = useState<FlyerImage[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("it");
  const [layout, setLayout] = useState<Layout>("hero-left");
  const [exporting, setExporting] = useState(false);
  const [longDescription, setLongDescription] = useState<string | null>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [imgRes, descRes] = await Promise.all([
        supabase
          .from("property_images")
          .select(
            "id, image_url, rendered_image_url, published_image_url, enhanced_image_url, use_rendered, use_enhanced, sort_order, is_cover",
          )
          .eq("property_id", property.id)
          .order("is_cover", { ascending: false })
          .order("sort_order", { ascending: true }),
        supabase
          .from("property_descriptions")
          .select("edited_description, generated_description")
          .eq("property_id", property.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (imgRes.error) {
        toast.error("Impossibile caricare le foto");
        setLoading(false);
        return;
      }
      const mapped: FlyerImage[] = [];
      for (const r of imgRes.data ?? []) {
        if (r.image_url) mapped.push({ id: `${r.id}-o`, url: r.image_url, isRender: false, isEnhanced: false });
        if (r.enhanced_image_url)
          mapped.push({ id: `${r.id}-e`, url: r.enhanced_image_url, isRender: false, isEnhanced: true });
        if (r.rendered_image_url)
          mapped.push({ id: `${r.id}-r`, url: r.rendered_image_url, isRender: true, isEnhanced: false });
      }
      setImages(mapped);
      setSelected(mapped.slice(0, 4).map((i) => i.id));
      const d = descRes.data as { edited_description?: string | null; generated_description?: string | null } | null;
      setLongDescription(d?.edited_description || d?.generated_description || null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, property.id]);

  const selectedImages = useMemo(
    () => images.filter((i) => selected.includes(i.id)).slice(0, 4),
    [images, selected],
  );

  const t = STR[lang];

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const regenerate = () => {
    const others = LAYOUTS.filter((l) => l !== layout);
    setLayout(others[Math.floor(Math.random() * others.length)]);
  };

  const captureCanvas = async () => {
    if (!flyerRef.current) return null;
    return await html2canvas(flyerRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ECE1D3",
      logging: false,
    });
  };

  const downloadPDF = async () => {
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ unit: "mm", format: "a3", orientation: "landscape" });
      pdf.addImage(img, "JPEG", 0, 0, 420, 297);
      pdf.save(`cartello-${property.reference_code || property.id}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Errore nella generazione PDF");
    } finally {
      setExporting(false);
    }
  };

  const downloadImage = async () => {
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `cartello-${property.reference_code || property.id}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch (e) {
      console.error(e);
      toast.error("Errore nella generazione immagine");
    } finally {
      setExporting(false);
    }
  };

  const doPrint = async () => {
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(`<!doctype html><html><head><title>Cartello</title>
        <style>@page{size:A3 landscape;margin:0} html,body{margin:0;padding:0;background:#fff}
        img{width:420mm;height:297mm;display:block}</style></head>
        <body><img src="${img}" onload="setTimeout(()=>{window.print();},250)"/></body></html>`);
      w.document.close();
    } catch (e) {
      console.error(e);
      toast.error("Errore stampa");
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-cream">
        <div className="flex items-center gap-3">
          <FileText size={18} />
          <h2 className="font-serif text-lg">{t.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-sm border border-cream/30 px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-cream/10"
        >
          <X size={14} /> {t.close}
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-white/10 bg-background p-4 lg:w-80 lg:border-b-0 lg:border-r">
          <div className="space-y-5 text-sm">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                {t.language}
              </label>
              <div className="flex gap-2">
                {(["it", "en"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 rounded-sm border px-3 py-2 text-xs uppercase ${
                      lang === l
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {l === "it" ? "Italiano" : "English"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                {t.layout}
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as Layout)}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="hero-left">Hero a sinistra</option>
                <option value="split-trio">Hero + 2 thumbnails</option>
                <option value="mosaic-quad">Mosaico 4 foto</option>
                <option value="portrait-hero">Singola foto grande</option>
                <option value="filmstrip">Strip orizzontale</option>
              </select>
              <button
                onClick={regenerate}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
              >
                <Shuffle size={13} /> {t.regenerate}
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>{t.selectPhotos}</span>
                <span>{selected.length}/4</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : images.length === 0 ? (
                <p className="rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nessuna foto disponibile
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => {
                    const isSel = selected.includes(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => toggleSelect(img.id)}
                        className={`relative aspect-square overflow-hidden rounded-sm border-2 transition ${
                          isSel ? "border-primary" : "border-transparent hover:border-border"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover"
                          crossOrigin="anonymous"
                        />
                        {img.isRender && (
                          <span className="absolute left-1 top-1 rounded-sm bg-terracotta px-1 py-0.5 text-[8px] font-medium uppercase text-cream">
                            AI
                          </span>
                        )}
                        {img.isEnhanced && !img.isRender && (
                          <span className="absolute left-1 top-1 rounded-sm bg-ink/80 px-1 py-0.5 text-[8px] font-medium uppercase text-cream">
                            HD
                          </span>
                        )}
                        {isSel && (
                          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-cream">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <button
                onClick={downloadPDF}
                disabled={exporting || selectedImages.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {t.pdf}
              </button>
              <button
                onClick={downloadImage}
                disabled={exporting || selectedImages.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
              >
                <ImageIcon size={13} /> {t.image}
              </button>
              <button
                onClick={doPrint}
                disabled={exporting || selectedImages.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
              >
                <Printer size={13} /> {t.print}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-zinc-700 p-4 sm:p-8">
          <div className="mx-auto" style={{ width: "min(100%, 1400px)" }}>
            <div className="origin-top shadow-2xl" style={{ transformOrigin: "top center" }}>
              <FlyerSheet
                ref={flyerRef}
                property={property}
                images={selectedImages}
                layout={layout}
                lang={lang}
                longDescription={longDescription}
              />
            </div>
          </div>
        </main>
      </div>
    </div>,
    document.body,
  );
}

// ---------------- A3 Landscape Flyer Sheet ----------------

// A3 at 96dpi: 420mm x 297mm = ~1587 x 1123 px
const SHEET_W = 1587;
const SHEET_H = 1123;
const PAD = 56;

const FlyerSheet = forwardRef<
  HTMLDivElement,
  {
    property: PropertyData;
    images: FlyerImage[];
    layout: Layout;
    lang: Lang;
    longDescription: string | null;
  }
>(function FlyerSheet({ property, images, layout, lang, longDescription }, ref) {
  const t = STR[lang];

  const price = formatPrice(property, lang);

  // Dominant city line — NO street or civic number
  const cityMain = (property.municipality || property.area_zone || "").toUpperCase();
  const cityProv = property.province ? `(${property.province.toUpperCase()})` : "";
  const cityZone =
    property.area_zone && property.municipality && property.area_zone !== property.municipality
      ? property.area_zone
      : "";

  const rawDescription = (longDescription || property.short_notes || "").trim();
  const condensed = rawDescription ? condenseDescription(rawDescription, 560) : "";
  const paragraphs = condensed ? splitParagraphs(condensed) : [];

  const techData: { label: string; value: string }[] = [];
  if (property.size_sqm) techData.push({ label: t.sqm.toUpperCase(), value: String(property.size_sqm) });
  if (property.bedrooms != null) techData.push({ label: t.rooms, value: String(property.bedrooms) });
  if (property.bathrooms != null) techData.push({ label: t.baths, value: String(property.bathrooms) });
  if (property.floor) techData.push({ label: t.floor, value: property.floor });
  if (property.energy_class) techData.push({ label: t.energy, value: property.energy_class });

  const hasRender = images.some((i) => i.isRender);

  return (
    <div
      ref={ref}
      style={{
        width: SHEET_W,
        height: SHEET_H,
        background: "#ECE1D3",
        color: "#241711",
        fontFamily: "Georgia, 'Times New Roman', serif",
        position: "relative",
        overflow: "hidden",
        padding: PAD,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1.25fr 1fr",
        gridTemplateRows: "auto 1fr",
        columnGap: 44,
        rowGap: 24,
      }}
    >
      {/* Header spans both columns: logo + listing code */}
      <header
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 18,
          borderBottom: "2px solid #B76A4C",
        }}
      >
        <img
          src={logoAsset.url}
          alt="Furia"
          crossOrigin="anonymous"
          style={{ height: 80, width: "auto", objectFit: "contain" }}
        />
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: "#4A3A30",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
            }}
          >
            {t.code}
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#B76A4C",
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: 1.5,
              marginTop: 2,
            }}
          >
            {property.reference_code || "—"}
          </div>
        </div>
      </header>

      {/* Left: visual zone */}
      <section style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>
        <FlyerLayout layout={layout} images={images} lang={lang} />
      </section>

      {/* Right: info column */}
      <section
        style={{
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          overflow: "hidden",
        }}
      >
        {/* City dominant */}
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: "#B76A4C",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
            }}
          >
            {[property.contract_type, property.property_type].filter(Boolean).join(" · ") || ""}
          </div>
          <h1
            style={{
              margin: "6px 0 4px",
              fontSize: 58,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#241711",
            }}
          >
            {cityMain} {cityProv && (
              <span style={{ color: "#B76A4C", fontWeight: 600 }}>{cityProv}</span>
            )}
          </h1>
          {cityZone && (
            <div
              style={{
                fontSize: 18,
                color: "#4A3A30",
                fontFamily: "Helvetica, Arial, sans-serif",
                letterSpacing: 0.4,
                marginTop: 4,
              }}
            >
              {cityZone}
            </div>
          )}
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: "12px 0",
            borderTop: "1px solid #D1BCA6",
            borderBottom: "1px solid #D1BCA6",
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: "#B76A4C",
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: -0.5,
            }}
          >
            {price}
          </div>
        </div>

        {/* Tech data row */}
        {techData.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${techData.length}, 1fr)`,
              gap: 10,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {techData.map((d) => (
              <div
                key={d.label}
                style={{
                  border: "1px solid #B76A4C",
                  padding: "10px 8px",
                  background: "#F3E8DB",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#241711",
                    lineHeight: 1,
                  }}
                >
                  {d.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: "#4A3A30",
                    marginTop: 4,
                  }}
                >
                  {d.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Large readable description */}
        {paragraphs.length > 0 && (
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.45,
                color: "#241711",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {paragraphs.map((p, i) => (
                <p key={i} style={{ margin: i === 0 ? "0 0 14px 0" : "0 0 14px 0" }}>
                  <HighlightedText text={p} />
                </p>
              ))}
            </div>
          </div>
        )}

        {hasRender && (
          <div
            style={{
              fontSize: 11,
              color: "#4A3A30",
              fontStyle: "italic",
              fontFamily: "Helvetica, Arial, sans-serif",
              borderTop: "1px solid #D1BCA6",
              paddingTop: 8,
            }}
          >
            * {t.renderingNote}
          </div>
        )}
      </section>
    </div>
  );
});

// ---------------- Layouts (left visual column) ----------------

function RenderBadge({ lang }: { lang: Lang }) {
  return (
    <span
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        background: "#B76A4C",
        color: "#ECE1D3",
        fontSize: 12,
        letterSpacing: 1.8,
        padding: "6px 12px",
        textTransform: "uppercase",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 700,
      }}
    >
      {STR[lang].rendering}
    </span>
  );
}

function Img({
  img,
  style,
  lang,
}: {
  img: FlyerImage;
  style?: React.CSSProperties;
  lang: Lang;
}) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#241711", ...style }}>
      <img
        src={img.url}
        crossOrigin="anonymous"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {img.isRender && <RenderBadge lang={lang} />}
    </div>
  );
}

function FlyerLayout({
  layout,
  images,
  lang,
}: {
  layout: Layout;
  images: FlyerImage[];
  lang: Lang;
}) {
  if (images.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          background: "#D9C8B4",
          display: "grid",
          placeItems: "center",
          color: "#4A3A30",
          fontSize: 14,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        Seleziona almeno una foto
      </div>
    );
  }

  switch (layout) {
    case "hero-left": {
      const [hero, ...rest] = images;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
          <Img img={hero} lang={lang} style={{ flex: rest.length ? 2.4 : 1, minHeight: 0 }} />
          {rest.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${rest.length}, 1fr)`,
                gap: 10,
                flex: 1,
                minHeight: 0,
              }}
            >
              {rest.map((i) => (
                <Img key={i.id} img={i} lang={lang} style={{ height: "100%" }} />
              ))}
            </div>
          )}
        </div>
      );
    }
    case "split-trio": {
      const [hero, ...rest] = images;
      const side = rest.slice(0, 2);
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: side.length ? "2fr 1fr" : "1fr",
            gap: 10,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Img img={hero} lang={lang} style={{ height: "100%" }} />
          {side.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateRows: `repeat(${side.length}, 1fr)`,
                gap: 10,
              }}
            >
              {side.map((i) => (
                <Img key={i.id} img={i} lang={lang} style={{ height: "100%" }} />
              ))}
            </div>
          )}
        </div>
      );
    }
    case "mosaic-quad": {
      const quad = images.slice(0, 4);
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: quad.length > 2 ? "1fr 1fr" : "1fr",
            gap: 10,
            flex: 1,
            minHeight: 0,
          }}
        >
          {quad.map((i) => (
            <Img key={i.id} img={i} lang={lang} style={{ height: "100%" }} />
          ))}
        </div>
      );
    }
    case "portrait-hero": {
      const hero = images[0];
      return (
        <div style={{ flex: 1, minHeight: 0 }}>
          <Img img={hero} lang={lang} style={{ height: "100%" }} />
        </div>
      );
    }
    case "filmstrip": {
      const strip = images.slice(0, 4);
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${strip.length}, 1fr)`,
            gap: 10,
            flex: 1,
            minHeight: 0,
          }}
        >
          {strip.map((i) => (
            <Img key={i.id} img={i} lang={lang} style={{ height: "100%" }} />
          ))}
        </div>
      );
    }
  }
}