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
  Maximize,
  BedDouble,
  Bath,
  ArrowUpDown,
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
  floor?: string | null;
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

// Layout fixato come da reference (logo | città | codice / hero + 2 thumbs + info / descrizione).
// "Rigenera layout" inverte solo le due foto secondarie.
type Layout = "fixed";

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
  // Keywords richiesti per il cartello vetrina (reference)
  "secondo piano", "primo piano", "terzo piano", "piano terra", "ultimo piano",
  "comoda", "comodo", "ben servita", "ben servito",
  "ampio soggiorno", "cucina abitabile",
  "due camere matrimoniali", "tre camere matrimoniali", "camera matrimoniale",
  "bagno finestrato", "doppia esposizione", "luce naturale",
  "riscaldamento autonomo", "infissi doppio vetro", "spazi ampi",
  "buone condizioni", "zona servita", "balcone",
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
  const testRe = new RegExp(`^(?:${escaped.join("|")})$`, "i");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        testRe.test(p) ? (
          <strong key={i} style={{ color: "#B23D2A", fontWeight: 800 }}>
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
  const [layout, setLayout] = useState<Layout>("fixed");
  const [thumbSwap, setThumbSwap] = useState(false);
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
    // Layout strutturale fisso (come reference). Inverto solo le due foto secondarie.
    setThumbSwap((v) => !v);
  };

  const captureCanvas = async () => {
    if (!flyerRef.current) return null;
    const el = flyerRef.current;
    // Lock export layout
    el.classList.add("a3-export-mode");
    try {
      // Wait for fonts
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Wait for all images inside to be loaded/decoded
      const imgs = Array.from(el.querySelectorAll("img"));
      await Promise.all(
        imgs.map((im) => {
          if (im.complete && im.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            im.addEventListener("load", () => resolve(), { once: true });
            im.addEventListener("error", () => resolve(), { once: true });
          });
        }),
      );
      // Two animation frames so the browser commits final layout
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F5ECDD",
        logging: false,
        width: SHEET_W,
        height: SHEET_H,
        windowWidth: SHEET_W,
        windowHeight: SHEET_H,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      el.classList.remove("a3-export-mode");
    }
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
              <button
                onClick={regenerate}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
              >
                <Shuffle size={13} /> {t.regenerate}
              </button>
              <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                Layout fisso come da modello vetrina. La rigenerazione cambia solo le foto.
              </p>
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
                thumbSwap={thumbSwap}
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
    thumbSwap?: boolean;
  }
>(function FlyerSheet({ property, images, layout, lang, longDescription, thumbSwap }, ref) {
  // `layout` kept for prop-compat; structure is fixed (header / body / desc)
  void layout;
  const t = STR[lang];

  const price = formatPrice(property, lang);

  const cityMain = (property.municipality || property.area_zone || "").toUpperCase();
  const cityProv = property.province ? `(${property.province.toUpperCase()})` : "";

  const rawDescription = (longDescription || property.short_notes || "").trim();
  const condensed = rawDescription ? condenseDescription(rawDescription, 720) : "";
  const paragraphs = condensed ? splitParagraphs(condensed) : [];

  type TechCell = { label: string; value: string; icon: React.ReactNode };
  const ICON_SZ = 30;
  const ICON_COLOR = "#B23D2A";
  const techData: TechCell[] = [
    {
      label: t.sqm.toUpperCase(),
      value: property.size_sqm ? String(property.size_sqm) : "—",
      icon: <Maximize size={ICON_SZ} color={ICON_COLOR} strokeWidth={2.2} />,
    },
    {
      label: (lang === "it" ? "CAMERE" : "BEDROOMS"),
      value: property.bedrooms != null ? String(property.bedrooms) : "—",
      icon: <BedDouble size={ICON_SZ} color={ICON_COLOR} strokeWidth={2.2} />,
    },
    {
      label: (lang === "it" ? "BAGNO" : "BATH"),
      value: property.bathrooms != null ? String(property.bathrooms) : "—",
      icon: <Bath size={ICON_SZ} color={ICON_COLOR} strokeWidth={2.2} />,
    },
    {
      label: (lang === "it" ? "PIANO" : "FLOOR"),
      value: property.floor ? String(property.floor) : "—",
      icon: <ArrowUpDown size={ICON_SZ} color={ICON_COLOR} strokeWidth={2.2} />,
    },
  ];

  const hasRender = images.some((i) => i.isRender);

  const hero = images[0];
  const thumbsRaw = images.slice(1, 3).filter(Boolean);
  const thumbs = thumbSwap ? [...thumbsRaw].reverse() : thumbsRaw;
  const hasThumbs = thumbs.length > 0;

  // Checklist principale (max 8 voci, 2 colonne). Usa attributi reali quando presenti,
  // poi completa con un set standard di pregi sempre validi per il cartello vetrina.
  const checklist: string[] = [];
  const add = (s: string) => {
    if (s && !checklist.includes(s) && checklist.length < 8) checklist.push(s);
  };
  if (property.panoramic_view) add(lang === "it" ? "Vista panoramica" : "Panoramic view");
  if (property.garden) add(lang === "it" ? "Giardino" : "Garden");
  if (property.terrace) add(lang === "it" ? "Terrazza" : "Terrace");
  if (property.balcony) add(lang === "it" ? "Balcone" : "Balcony");
  if (property.garage) add("Garage");
  if (property.cellar) add(lang === "it" ? "Cantina" : "Cellar");
  if (property.elevator) add(lang === "it" ? "Ascensore" : "Elevator");
  if (property.furnished) add(lang === "it" ? "Arredato" : "Furnished");
  if (property.historic_property) add(lang === "it" ? "Storico" : "Historic");
  // Standard fillers (sempre veri per la maggior parte degli annunci Furia)
  const fillers =
    lang === "it"
      ? [
          "Luminoso",
          "Cucina abitabile",
          "Riscaldamento autonomo",
          "Infissi doppio vetro",
          "Spazi ampi",
          "Buone condizioni",
          "Zona servita",
          "Balcone",
        ]
      : [
          "Bright",
          "Eat-in kitchen",
          "Independent heating",
          "Double-glazed windows",
          "Spacious",
          "Good condition",
          "Well served area",
          "Balcony",
        ];
  for (const f of fillers) add(f);

  return (
    <div
      ref={ref}
      style={{
        width: SHEET_W,
        height: SHEET_H,
        background: "#F5ECDD",
        color: "#1A1A1A",
        fontFamily: "Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: PAD,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto 1fr auto",
        rowGap: 18,
        outline: "3px solid #B23D2A",
        outlineOffset: -PAD / 2,
      }}
    >
      {/* Header: logo | city | code */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1px 1fr auto",
          alignItems: "center",
          gap: 26,
          paddingBottom: 12,
          minHeight: 180,
        }}
      >
        <img
          src={logoAsset.url}
          alt="Furia"
          crossOrigin="anonymous"
          style={{ height: 170, width: "auto", objectFit: "contain" }}
        />
        <div style={{ width: 2, height: 130, background: "#1A1A1A", justifySelf: "center" }} />
        <div
          style={{
            textAlign: "center",
            minWidth: 0,
            display: "grid",
            placeItems: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: (() => {
                const len = `${cityMain} ${cityProv}`.trim().length;
                if (len <= 10) return 92;
                if (len <= 14) return 78;
                if (len <= 18) return 66;
                return 56;
              })(),
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1,
              color: "#0F0F0F",
              fontFamily: "Helvetica, Arial, sans-serif",
              whiteSpace: "nowrap",
              overflow: "visible",
              padding: 0,
              margin: 0,
              transform: "translateY(-6px)",
            }}
          >
            {cityMain} {cityProv}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            border: "3px solid #B23D2A",
            background: "transparent",
            padding: "18px 28px 22px",
            minWidth: 340,
            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#1A1A1A",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 700,
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            {t.code}
          </div>
          <div
            style={{
              fontSize: (property.reference_code || "—").length > 12 ? 36 : 46,
              fontWeight: 900,
              color: "#B23D2A",
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: 0.5,
              marginTop: 6,
              lineHeight: 1.25,
              whiteSpace: "nowrap",
              overflow: "visible",
              paddingBlock: 4,
            }}
          >
            {property.reference_code || "—"}
          </div>
        </div>
      </header>

      {/* Body: hero | thumbs | info box */}
      <section
        style={{
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: hasThumbs ? "1.55fr 0.6fr 1fr" : "2.15fr 1fr",
          gap: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ minHeight: 0 }}>
          {hero ? (
            <Img img={hero} lang={lang} style={{ width: "100%", height: "100%" }} />
          ) : (
            <EmptyPhoto />
          )}
        </div>

        {hasThumbs && (
          <div
            style={{
              display: "grid",
              gridTemplateRows: thumbs.length === 2 ? "1fr 1fr" : "1fr",
              gap: 14,
              minHeight: 0,
            }}
          >
            {thumbs.map((ti) => (
              <Img key={ti.id} img={ti} lang={lang} style={{ width: "100%", height: "100%" }} />
            ))}
          </div>
        )}

        <aside
          style={{
            background: "transparent",
            border: "3px solid #B23D2A",
            padding: "22px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Price */}
          <div>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#B23D2A",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontWeight: 700,
              }}
            >
              {lang === "it" ? "PREZZO" : "PRICE"}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1,
                color: "#B23D2A",
                fontFamily: "Helvetica, Arial, sans-serif",
                letterSpacing: -1,
                wordBreak: "break-word",
              }}
            >
              {price}
            </div>
          </div>

          {/* 2x2 data grid with icons */}
          <div
            style={{
              borderTop: "1px solid #B23D2A",
              paddingTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 14,
              columnGap: 18,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {techData.map((d) => (
              <div
                key={d.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ display: "grid", placeItems: "center", width: 44 }}>{d.icon}</div>
                <div style={{ lineHeight: 1 }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#1A1A1A" }}>
                    {d.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: "#1A1A1A",
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checklist 2-col with red checks */}
          {checklist.length > 0 && (
            <div
              style={{
                borderTop: "1px solid #B23D2A",
                paddingTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: 14,
                rowGap: 8,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {checklist.slice(0, 8).map((c) => (
                <div
                  key={c}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 15,
                    color: "#1A1A1A",
                    fontWeight: 600,
                  }}
                >
                  <Check size={16} color="#B23D2A" strokeWidth={3.2} />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      {/* Bottom: large description band */}
      <section
        style={{
          border: "3px solid #B23D2A",
          padding: "20px 24px",
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {paragraphs.length > 0 ? (
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.35,
              color: "#1A1A1A",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 500,
              columnCount: 1,
            }}
          >
            {paragraphs.slice(0, 3).map((p, i) => (
              <p
                key={i}
                style={{ margin: "0 0 10px 0", breakInside: "avoid" }}
              >
                <HighlightedText text={p} />
              </p>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 20, color: "#5A4A40", fontStyle: "italic" }}>
            {lang === "it" ? "Descrizione non disponibile." : "Description not available."}
          </div>
        )}
        {hasRender && (
          <div
            style={{
              fontSize: 12,
              color: "#5A4A40",
              fontStyle: "italic",
              fontFamily: "Helvetica, Arial, sans-serif",
              marginTop: 4,
            }}
          >
            * {t.renderingNote}
          </div>
        )}
      </section>
    </div>
  );
});

function EmptyPhoto() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#E3D3BD",
        border: "2px dashed #B76A4C",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: 24,
        color: "#4A3A30",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: 20,
        fontWeight: 600,
      }}
    >
      Seleziona almeno una foto per generare il cartello
    </div>
  );
}

// ---------------- Layouts (left visual column) ----------------

function RenderBadge({ lang }: { lang: Lang }) {
  return (
    <span
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        background: "#B23D2A",
        color: "#ECE1D3",
        fontSize: 16,
        letterSpacing: 2.5,
        padding: "7px 14px",
        textTransform: "uppercase",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 800,
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

