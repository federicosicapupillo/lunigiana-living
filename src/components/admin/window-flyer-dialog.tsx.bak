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

const LAYOUTS = ["hero-stack", "split-duo", "grid-quad", "hero-side", "vertical-editorial"] as const;
type Layout = (typeof LAYOUTS)[number];

const STR = {
  it: {
    title: "Genera cartello A4",
    selectPhotos: "Seleziona foto (max 4)",
    layout: "Layout",
    language: "Lingua",
    regenerate: "Rigenera layout",
    pdf: "Scarica PDF A4",
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
    title: "Generate A4 window flyer",
    selectPhotos: "Select photos (max 4)",
    layout: "Layout",
    language: "Language",
    regenerate: "Regenerate layout",
    pdf: "Download A4 PDF",
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
  address: "Via Pirandello 7, 54027 Pontremoli (MS)",
};

function formatPrice(p: PropertyData, lang: Lang) {
  if (p.price_on_request || !p.price) return STR[lang].onRequest;
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(p.price);
}

function shorten(text: string | null | undefined, max = 280) {
  if (!text) return "";
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/[,.;\s]\S*$/, "") + "…";
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
  const [layout, setLayout] = useState<Layout>("hero-stack");
  const [qrData, setQrData] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  // Load images when opened
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("property_images")
        .select(
          "id, image_url, rendered_image_url, published_image_url, enhanced_image_url, use_rendered, use_enhanced, sort_order, is_cover",
        )
        .eq("property_id", property.id)
        .order("is_cover", { ascending: false })
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error("Impossibile caricare le foto");
        setLoading(false);
        return;
      }
      const mapped: FlyerImage[] = [];
      for (const r of data ?? []) {
        // Original
        if (r.image_url) {
          mapped.push({ id: `${r.id}-o`, url: r.image_url, isRender: false, isEnhanced: false });
        }
        if (r.enhanced_image_url) {
          mapped.push({
            id: `${r.id}-e`,
            url: r.enhanced_image_url,
            isRender: false,
            isEnhanced: true,
          });
        }
        if (r.rendered_image_url) {
          mapped.push({
            id: `${r.id}-r`,
            url: r.rendered_image_url,
            isRender: true,
            isEnhanced: false,
          });
        }
      }
      setImages(mapped);
      // Pre-select up to 4 originals (cover first)
      setSelected(mapped.slice(0, 4).map((i) => i.id));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, property.id]);

  // Generate QR code for property page
  useEffect(() => {
    if (!open) return;
    const slug = property.slug || property.id;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://furia.cap-ann-one.life";
    const url = `${origin}/immobili/${slug}`;
    QRCode.toDataURL(url, { width: 256, margin: 1, color: { dark: "#241711", light: "#ECE1D3" } })
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
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      pdf.addImage(img, "JPEG", 0, 0, 210, 297);
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
        <style>@page{size:A4;margin:0} html,body{margin:0;padding:0;background:#fff}
        img{width:210mm;height:297mm;display:block}</style></head>
        <body><img src="${img}" onload="setTimeout(()=>{window.print();},200)"/></body></html>`);
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
        {/* Sidebar controls */}
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
                <option value="hero-stack">Hero + dati sotto</option>
                <option value="split-duo">Due foto affiancate</option>
                <option value="grid-quad">Griglia 4 foto</option>
                <option value="hero-side">Hero + colonna dati</option>
                <option value="vertical-editorial">Editoriale verticale</option>
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

        {/* Preview */}
        <main className="flex-1 overflow-auto bg-zinc-700 p-4 sm:p-8">
          <div className="mx-auto" style={{ width: "min(100%, 794px)" }}>
            <div
              className="origin-top shadow-2xl"
              style={{ transform: "scale(1)", transformOrigin: "top center" }}
            >
              <FlyerSheet
                ref={flyerRef}
                property={property}
                images={selectedImages}
                layout={layout}
                lang={lang}
                qrData={qrData}
              />
            </div>
          </div>
        </main>
      </div>
    </div>,
    document.body,
  );
}

// ---------------- A4 Flyer Sheet ----------------

const FlyerSheet = forwardRef<
  HTMLDivElement,
  {
    property: PropertyData;
    images: FlyerImage[];
    layout: Layout;
    lang: Lang;
    qrData: string | null;
  }
>(function FlyerSheet({ property, images, layout, lang, qrData }, ref) {
  const t = STR[lang];
  // A4 at 96dpi: 794 x 1123 px
  const SHEET_W = 794;
  const SHEET_H = 1123;

  const price = formatPrice(property, lang);
  const location = [property.area_zone, property.municipality, property.province]
    .filter(Boolean)
    .join(" · ");
  const description = shorten(property.short_notes, 320);

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

  const stats = [
    property.size_sqm ? `${property.size_sqm} ${t.sqm}` : null,
    property.bedrooms != null ? `${property.bedrooms} ${t.rooms}` : null,
    property.bathrooms != null ? `${property.bathrooms} ${t.baths}` : null,
  ].filter(Boolean) as string[];

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
        padding: 48,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header band */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 16,
          borderBottom: "1px solid #B76A4C",
        }}
      >
        <img
          src={logoAsset.url}
          alt="Furia"
          crossOrigin="anonymous"
          style={{ height: 56, width: "auto", objectFit: "contain" }}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "#4A3A30", letterSpacing: 1.5 }}>
          <div style={{ textTransform: "uppercase" }}>{AGENCY.name}</div>
          <div style={{ marginTop: 2 }}>
            {t.ref} {property.reference_code || "—"}
          </div>
        </div>
      </header>

      {/* Layout body */}
      <FlyerLayout layout={layout} images={images} hasRender={hasRender} lang={lang} />

      {/* Title + location + price block */}
      <section style={{ marginTop: 18 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#B76A4C",
          }}
        >
          {[property.contract_type, property.property_type].filter(Boolean).join(" · ") || ""}
        </div>
        <h1
          style={{
            margin: "6px 0 6px",
            fontSize: 32,
            lineHeight: 1.1,
            fontWeight: 400,
            letterSpacing: -0.5,
          }}
        >
          {property.title}
        </h1>
        {location && (
          <div style={{ fontSize: 13, color: "#4A3A30", fontFamily: "Helvetica, Arial, sans-serif" }}>
            {location}
          </div>
        )}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#B76A4C",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            {price}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#241711",
              fontFamily: "Helvetica, Arial, sans-serif",
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {stats.map((s) => (
              <span key={s}>{s}</span>
            ))}
            {property.energy_class && (
              <span>
                {t.energy}: <strong>{property.energy_class}</strong>
              </span>
            )}
            {property.energy_performance_index_value != null && (
              <span>
                {t.ipe}: {property.energy_performance_index_value} kWh/m²
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {description && (
        <p
          style={{
            marginTop: 14,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "#3A2A22",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {description}
        </p>
      )}

      {/* Features chips */}
      {featuresList.length > 0 && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {featuresList.slice(0, 8).map((f) => (
            <span
              key={f}
              style={{
                fontSize: 10,
                padding: "4px 10px",
                border: "1px solid #B76A4C",
                color: "#B76A4C",
                borderRadius: 999,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Rendering disclaimer */}
      {hasRender && (
        <div
          style={{
            marginTop: 10,
            fontSize: 9,
            color: "#4A3A30",
            fontStyle: "italic",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          * {t.renderingNote}
        </div>
      )}

      {/* Footer: contacts + QR */}
      <footer
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid #B76A4C",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "#241711" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#B76A4C",
              marginBottom: 4,
            }}
          >
            {t.contact}
          </div>
          <div>
            <strong>{t.phone}.</strong> {AGENCY.phone} &nbsp;·&nbsp; <strong>{t.whatsapp}</strong> {AGENCY.mobile}
          </div>
          <div>{AGENCY.email}</div>
          <div style={{ color: "#4A3A30" }}>{AGENCY.address}</div>
        </div>
        {qrData && (
          <div style={{ textAlign: "center" }}>
            <img
              src={qrData}
              alt="QR"
              style={{ width: 84, height: 84, display: "block", background: "#ECE1D3" }}
            />
            <div style={{ fontSize: 8, marginTop: 4, color: "#4A3A30", maxWidth: 90 }}>
              {t.scan}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

// ---------------- Layouts ----------------

function RenderBadge({ lang }: { lang: Lang }) {
  return (
    <span
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "#B76A4C",
        color: "#ECE1D3",
        fontSize: 9,
        letterSpacing: 1.5,
        padding: "4px 8px",
        textTransform: "uppercase",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 600,
      }}
    >
      {STR[lang].rendering}
    </span>
  );
}

function Img({ img, style }: { img: FlyerImage; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#241711", ...style }}>
      <img
        src={img.url}
        crossOrigin="anonymous"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {img.isRender && <RenderBadge lang="it" />}
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
  hasRender: boolean;
  lang: Lang;
}) {
  const HEIGHT = 460; // total visual area for images
  const placeholder = (
    <div
      style={{
        height: HEIGHT,
        background: "#D9C8B4",
        display: "grid",
        placeItems: "center",
        color: "#4A3A30",
        fontSize: 12,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      Seleziona almeno una foto
    </div>
  );
  if (images.length === 0) return <div style={{ marginTop: 18 }}>{placeholder}</div>;

  const wrap = (children: React.ReactNode) => (
    <div style={{ marginTop: 18 }}>{children}</div>
  );

  void lang;

  switch (layout) {
    case "hero-stack": {
      const [hero, ...rest] = images;
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: HEIGHT }}>
          <Img img={hero} style={{ flex: rest.length ? 2 : 1, minHeight: 0 }} />
          {rest.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${rest.length}, 1fr)`, gap: 8, flex: 1, minHeight: 0 }}>
              {rest.map((i) => (
                <Img key={i.id} img={i} style={{ height: "100%" }} />
              ))}
            </div>
          )}
        </div>,
      );
    }
    case "split-duo": {
      const pair = images.slice(0, 2);
      return wrap(
        <div
          style={{
            display: "grid",
            gridTemplateColumns: pair.length === 2 ? "1fr 1fr" : "1fr",
            gap: 8,
            height: HEIGHT,
          }}
        >
          {pair.map((i) => (
            <Img key={i.id} img={i} style={{ height: "100%" }} />
          ))}
        </div>,
      );
    }
    case "grid-quad": {
      const quad = images.slice(0, 4);
      return wrap(
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: quad.length > 2 ? "1fr 1fr" : "1fr",
            gap: 8,
            height: HEIGHT,
          }}
        >
          {quad.map((i) => (
            <Img key={i.id} img={i} style={{ height: "100%" }} />
          ))}
        </div>,
      );
    }
    case "hero-side": {
      const [hero, ...rest] = images;
      const side = rest.slice(0, 3);
      return wrap(
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, height: HEIGHT }}>
          <Img img={hero} style={{ height: "100%" }} />
          <div style={{ display: "grid", gridTemplateRows: `repeat(${Math.max(side.length, 1)}, 1fr)`, gap: 8 }}>
            {side.length > 0
              ? side.map((i) => <Img key={i.id} img={i} style={{ height: "100%" }} />)
              : <Img img={hero} style={{ height: "100%", opacity: 0.5 }} />}
          </div>
        </div>,
      );
    }
    case "vertical-editorial": {
      const [hero, second] = images;
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: HEIGHT }}>
          <Img img={hero} style={{ height: second ? "65%" : "100%" }} />
          {second && <Img img={second} style={{ height: "35%" }} />}
        </div>,
      );
    }
  }
}