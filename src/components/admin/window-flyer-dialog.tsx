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
import QRCode from "qrcode";
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
    renderingNote: "Immagine illustrativa non rappresentante lo stato attuale.",
    onRequest: "Prezzo su richiesta",
    sqm: "mq",
    rooms: "camere",
    baths: "bagni",
    energy: "Classe energetica",
    ipe: "IPE",
    contact: "Contatta l'agenzia",
    phone: "Tel",
    whatsapp: "WhatsApp",
    scan: "Scansiona per la scheda online",
    ref: "Rif.",
    features: "Caratteristiche",
    techData: "Dati tecnici",
    description: "Descrizione",
    feat: {
      panoramic_view: "Vista panoramica",
      historic_property: "Immobile storico",
      garden: "Giardino",
      terrace: "Terrazza",
      balcony: "Balcone",
      garage: "Garage",
      cellar: "Cantina",
      elevator: "Ascensore",
      furnished: "Arredato",
    },
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
    renderingNote: "Illustrative image, does not represent the current state.",
    onRequest: "Price on request",
    sqm: "sqm",
    rooms: "bedrooms",
    baths: "bathrooms",
    energy: "Energy class",
    ipe: "EPI",
    contact: "Contact the agency",
    phone: "Tel",
    whatsapp: "WhatsApp",
    scan: "Scan for the online listing",
    ref: "Ref.",
    features: "Features",
    techData: "Technical data",
    description: "Description",
    feat: {
      panoramic_view: "Panoramic view",
      historic_property: "Historic property",
      garden: "Garden",
      terrace: "Terrace",
      balcony: "Balcony",
      garage: "Garage",
      cellar: "Cellar",
      elevator: "Elevator",
      furnished: "Furnished",
    },
  },
} as const;

const AGENCY = {
  name: "Furia Immobiliare",
  phone: "0187 830229",
  mobile: "320 7019985",
  email: "furiaimmobiliare@libero.it",
  city: "Pontremoli (MS)",
};

function formatPrice(p: PropertyData, lang: Lang) {
  if (p.price_on_request || !p.price) return STR[lang].onRequest;
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(p.price);
}

function splitParagraphs(text: string | null | undefined, max = 1200): string[] {
  if (!text) return [];
  const cleaned = text.trim().replace(/\r\n/g, "\n");
  const truncated = cleaned.length > max ? cleaned.slice(0, max - 1).replace(/[\s,.;]\S*$/, "") + "…" : cleaned;
  return truncated
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
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
  const [qrData, setQrData] = useState<string | null>(null);
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

  useEffect(() => {
    if (!open) return;
    const slug = property.slug || property.id;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://furia.cap-ann-one.life";
    const url = `${origin}/immobili/${slug}`;
    QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: "#241711", light: "#ECE1D3" } })
      .then(setQrData)
      .catch(() => setQrData(null));
  }, [open, property.id, property.slug]);

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
      // A3 landscape: 420mm x 297mm
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
                qrData={qrData}
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
    qrData: string | null;
    longDescription: string | null;
  }
>(function FlyerSheet({ property, images, layout, lang, qrData, longDescription }, ref) {
  const t = STR[lang];

  const price = formatPrice(property, lang);
  // Generic location only — NO street/civic number
  const location = [property.area_zone, property.municipality, property.province]
    .filter(Boolean)
    .join(" · ");

  const descriptionSource = longDescription || property.short_notes;
  const paragraphs = splitParagraphs(descriptionSource, 900);

  const featuresList = (
    [
      ["panoramic_view", property.panoramic_view],
      ["historic_property", property.historic_property],
      ["garden", property.garden],
      ["terrace", property.terrace],
      ["balcony", property.balcony],
      ["garage", property.garage],
      ["cellar", property.cellar],
      ["elevator", property.elevator],
      ["furnished", property.furnished],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([k]) => t.feat[k as keyof typeof t.feat]);

  const techData: { label: string; value: string }[] = [];
  if (property.size_sqm) techData.push({ label: t.sqm.toUpperCase(), value: String(property.size_sqm) });
  if (property.bedrooms != null) techData.push({ label: t.rooms, value: String(property.bedrooms) });
  if (property.bathrooms != null) techData.push({ label: t.baths, value: String(property.bathrooms) });
  if (property.energy_class) techData.push({ label: t.energy, value: property.energy_class });
  if (property.energy_performance_index_value != null)
    techData.push({ label: t.ipe, value: `${property.energy_performance_index_value} kWh/m²` });

  const hasRender = images.some((i) => i.isRender);

  // Sheet is split: left visual zone, right info column
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
        gridTemplateColumns: "1.35fr 1fr",
        gridTemplateRows: "auto 1fr auto",
        columnGap: 40,
        rowGap: 22,
      }}
    >
      {/* Header spans both columns */}
      <header
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 18,
          borderBottom: "1px solid #B76A4C",
        }}
      >
        <img
          src={logoAsset.url}
          alt="Furia"
          crossOrigin="anonymous"
          style={{ height: 72, width: "auto", objectFit: "contain" }}
        />
        <div style={{ textAlign: "right", fontSize: 13, color: "#4A3A30", letterSpacing: 1.6 }}>
          <div style={{ textTransform: "uppercase", fontWeight: 600 }}>{AGENCY.name}</div>
          <div style={{ marginTop: 3 }}>
            {t.ref} {property.reference_code || "—"}
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
          gap: 16,
          overflow: "hidden",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2.4,
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
              margin: "8px 0 6px",
              fontSize: 42,
              lineHeight: 1.08,
              fontWeight: 400,
              letterSpacing: -0.5,
            }}
          >
            {property.title}
          </h1>
          {location && (
            <div
              style={{
                fontSize: 15,
                color: "#4A3A30",
                fontFamily: "Helvetica, Arial, sans-serif",
                letterSpacing: 0.3,
              }}
            >
              {location}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 0",
            borderTop: "1px solid #D1BCA6",
            borderBottom: "1px solid #D1BCA6",
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#B76A4C",
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: -0.5,
            }}
          >
            {price}
          </div>
        </div>

        {paragraphs.length > 0 && (
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <SectionHeading>{t.description}</SectionHeading>
            <div
              style={{
                marginTop: 6,
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "#3A2A22",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {paragraphs.slice(0, 3).map((p, i) => (
                <p key={i} style={{ margin: "0 0 8px 0" }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        )}

        {techData.length > 0 && (
          <div>
            <SectionHeading>{t.techData}</SectionHeading>
            <div
              style={{
                marginTop: 6,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {techData.map((d) => (
                <div
                  key={d.label}
                  style={{
                    border: "1px solid #D1BCA6",
                    padding: "8px 10px",
                    background: "#F3E8DB",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: "#4A3A30",
                    }}
                  >
                    {d.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#241711", marginTop: 2 }}>
                    {d.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {featuresList.length > 0 && (
          <div>
            <SectionHeading>{t.features}</SectionHeading>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              {featuresList.slice(0, 10).map((f) => (
                <span
                  key={f}
                  style={{
                    fontSize: 11,
                    padding: "5px 12px",
                    border: "1px solid #B76A4C",
                    color: "#B76A4C",
                    borderRadius: 999,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasRender && (
          <div
            style={{
              fontSize: 10,
              color: "#4A3A30",
              fontStyle: "italic",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            * {t.renderingNote}
          </div>
        )}
      </section>

      {/* Footer spans both columns */}
      <footer
        style={{
          gridColumn: "1 / -1",
          paddingTop: 18,
          borderTop: "1px solid #B76A4C",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 13, lineHeight: 1.55, color: "#241711" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              color: "#B76A4C",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            {t.contact}
          </div>
          <div>
            <strong>{t.phone}.</strong> {AGENCY.phone} &nbsp;·&nbsp; <strong>{t.whatsapp}</strong>{" "}
            {AGENCY.mobile}
          </div>
          <div>{AGENCY.email}</div>
          <div style={{ color: "#4A3A30" }}>{AGENCY.city}</div>
        </div>
        {qrData && (
          <div style={{ textAlign: "center" }}>
            <img
              src={qrData}
              alt="QR"
              style={{ width: 120, height: 120, display: "block", background: "#ECE1D3" }}
            />
            <div style={{ fontSize: 10, marginTop: 4, color: "#4A3A30", maxWidth: 130 }}>
              {t.scan}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: 2.2,
        textTransform: "uppercase",
        color: "#B76A4C",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 600,
        paddingBottom: 4,
        borderBottom: "1px solid #D1BCA6",
      }}
    >
      {children}
    </div>
  );
}

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
        fontSize: 11,
        letterSpacing: 1.8,
        padding: "5px 10px",
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