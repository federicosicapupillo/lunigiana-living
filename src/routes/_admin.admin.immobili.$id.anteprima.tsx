import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Building2,
  Sparkles,
  Eye,
  Globe,
  Loader2,
} from "lucide-react";
import { WatermarkedImage } from "@/components/watermarked-image";
import { BeforeAfterSlider } from "@/components/before-after-slider";

export const Route = createFileRoute("/_admin/admin/immobili/$id/anteprima")({
  head: () => ({
    meta: [
      { title: "Anteprima immobile — Admin Furia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PropertyPreview,
});

function PropertyPreview() {
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Record<string, unknown> | null>(null);
  const [images, setImages] = useState<Array<Record<string, unknown>>>([]);
  const [features, setFeatures] = useState<Array<Record<string, unknown>>>([]);
  const [description, setDescription] = useState<Record<string, unknown> | null>(null);
  const [lang, setLang] = useState<"it" | "en">("it");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: p, error: e1 }, { data: imgs }, { data: fs }, { data: d }] =
        await Promise.all([
          supabase.from("properties").select("*").eq("id", id).maybeSingle(),
          supabase
            .from("property_images")
            .select("*")
            .eq("property_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("property_features")
            .select("feature_name, feature_value")
            .eq("property_id", id),
          supabase
            .from("property_descriptions")
            .select("*")
            .eq("property_id", id)
            .maybeSingle(),
        ]);
      if (e1 || !p) {
        setLoading(false);
        return;
      }
      setProperty(p);
      setImages(imgs ?? []);
      setFeatures(fs ?? []);
      setDescription(d);
      setLoading(false);
    };
    load();
  }, [id]);

  const gallery = useMemo(
    () =>
      images
        .filter((i) => !i.is_rendering)
        .map((i) => (i.image_url as string) || "")
        .filter(Boolean),
    [images],
  );

  const galleryPairs = useMemo(() => {
    const map: Record<string, string> = {};
    images.forEach((i) => {
      const renderFor = i.render_for_image_url as string | null;
      const url = i.image_url as string;
      if (i.is_rendering && renderFor) {
        map[renderFor] = url;
      }
    });
    return map;
  }, [images]);

  const main = gallery[active] || gallery[0] || "";
  const renderFor = galleryPairs[main];

  const goPrev = () =>
    setActive((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0));
  const goNext = () =>
    setActive((i) => (gallery.length ? (i + 1) % gallery.length : 0));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link
          to="/admin/immobili"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-ink"
        >
          <ArrowLeft size={12} /> Torna all'elenco
        </Link>
        <p className="mt-8 text-muted-foreground">Immobile non trovato.</p>
      </div>
    );
  }

  const title =
    lang === "en" && (description?.title_en as string)
      ? (description?.title_en as string)
      : (property.title as string);

  const desc =
    lang === "en"
      ? (description?.edited_description_en as string) ||
        (description?.description_en as string) ||
        (description?.generated_description_en as string) ||
        ""
      : (description?.edited_description as string) ||
        (description?.generated_description as string) ||
        "";

  const price = property.price as number | null;
  const priceOnRequest = !!property.price_on_request;
  const category = (property.contract_type as string) || "vendita";
  const type = (property.property_type as string) || "";
  const municipality = (property.municipality as string) || "";
  const areaZone = (property.area_zone as string) || "";
  const location = [municipality, areaZone].filter(Boolean).join(" — ");
  const sqm = property.size_sqm as number | null;
  const bedrooms = property.bedrooms as number | null;
  const bathrooms = property.bathrooms as number | null;
  const floors = property.floors as number | null;
  const energyClass = (property.energy_class as string) || "";
  const condition = (property.condition as string) || "";
  const reference = (property.reference_code as string) || (property.id as string);

  const hasEnTranslation = !!(description?.title_en || description?.description_en);

  return (
    <div className="pb-24">
      {/* Admin banner */}
      <div className="border-b border-amber-300 bg-amber-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800">
            <Eye size={14} /> Anteprima riservata admin
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              Stato: {(property.status as string) || "—"}
            </span>
            <Link
              to="/admin/immobili/$id"
              params={{ id }}
              className="inline-flex items-center gap-1 rounded-sm border border-amber-300 bg-white px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber-800 hover:border-amber-400"
            >
              <ArrowLeft size={11} /> Modifica
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-muted/40 pb-8 pt-8 sm:pb-10 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow text-muted-foreground">
                  {reference} · {type}
                </span>
                {hasEnTranslation && (
                  <button
                    type="button"
                    onClick={() => setLang((l) => (l === "it" ? "en" : "it"))}
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:border-primary/50"
                  >
                    <Globe size={10} />
                    {lang === "it" ? "IT" : "EN"}
                  </button>
                )}
              </div>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
                {title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} /> {location}
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-muted-foreground">
                {category === "affitto" ? "Affitto" : "Prezzo"}
              </div>
              <div className="mt-2 font-serif text-2xl text-primary sm:text-3xl md:text-4xl">
                {priceOnRequest
                  ? "Su richiesta"
                  : price
                    ? `€ ${price.toLocaleString("it-IT")}`
                    : "—"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="group relative overflow-hidden rounded-sm bg-cream">
          <div className="mx-auto flex w-full items-center justify-center h-[60vw] max-h-[450px] sm:h-[55vw] sm:max-h-[550px] md:h-[60vh] md:max-h-[650px]">
            {main ? (
              renderFor ? (
                <BeforeAfterSlider
                  key={main}
                  before={main}
                  after={renderFor}
                  alt={title}
                  beforeLabel="Attuale"
                  afterLabel="Rendering AI"
                  beforeCaption=""
                  afterCaption=""
                  aiBadge="Rendering AI"
                  illustrativeNote=""
                  className="h-full w-full border-0 rounded-sm"
                  aspectClassName=""
                  hideCaption
                  objectFit="contain"
                />
              ) : (
                <WatermarkedImage
                  src={main}
                  alt={title}
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  watermarkSize="lg"
                  className="h-full w-full object-contain transition-opacity duration-300"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                Nessuna immagine
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Immagine precedente"
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/80 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-background md:flex"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Immagine successiva"
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/80 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-background md:flex"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 right-3 rounded-sm bg-ink/70 px-2.5 py-1 text-[11px] font-medium tracking-wider text-cream backdrop-blur">
                {active + 1} / {gallery.length}
              </div>
            </>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
            {gallery.map((g: string, i: number) => (
              <button
                key={g + i}
                onClick={() => setActive(i)}
                aria-label={`Vai all'immagine ${i + 1}`}
                className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-muted transition-all duration-200 ${
                  i === active
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100"
                    : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-primary/40"
                }`}
              >
                <WatermarkedImage
                  src={g}
                  alt=""
                  loading="lazy"
                  sizes="160px"
                  watermark={false}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {galleryPairs[g] && (
                  <span className="pointer-events-none absolute left-1 top-1 inline-flex items-center gap-1 rounded-sm bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
                    <Sparkles size={9} /> AI
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pt-12 grid gap-12 sm:pt-16 sm:gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          {desc ? (
            <>
              <span className="eyebrow">Descrizione</span>
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
                {desc}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Nessuna descrizione disponibile.</p>
          )}

          {/* Quick facts */}
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border md:grid-cols-4">
            {[
              { icon: Maximize2, label: "Superficie", value: sqm ? `${sqm} m²` : "—" },
              { icon: BedDouble, label: "Camere", value: bedrooms != null ? String(bedrooms) : "—" },
              { icon: Bath, label: "Bagni", value: bathrooms != null ? String(bathrooms) : "—" },
              { icon: Building2, label: "Piano", value: floors != null ? String(floors) : "—" },
            ].map((f) => (
              <div key={f.label} className="bg-card p-5">
                <f.icon size={18} className="text-primary" />
                <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                <div className="mt-1 font-serif text-xl text-ink">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Full attributes */}
          <div className="mt-12">
            <span className="eyebrow">Dettagli</span>
            <h2 className="mt-3 font-serif text-3xl text-ink">Caratteristiche</h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {features
                .filter((f) => f.feature_value && String(f.feature_value).trim().length > 0)
                .map((f) => (
                  <div key={f.feature_name as string} className="flex justify-between border-b border-border py-3 text-sm">
                    <dt className="text-muted-foreground">{f.feature_name as string}</dt>
                    <dd className="text-right text-ink">{String(f.feature_value)}</dd>
                  </div>
                ))}
              {energyClass && (
                <div className="flex justify-between border-b border-border py-3 text-sm">
                  <dt className="text-muted-foreground">Classe energetica</dt>
                  <dd className="text-right text-ink">{energyClass}</dd>
                </div>
              )}
              {condition && (
                <div className="flex justify-between border-b border-border py-3 text-sm">
                  <dt className="text-muted-foreground">Stato</dt>
                  <dd className="text-right text-ink">{condition}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="md:col-span-5">
          <div className="sticky top-28 rounded-sm border border-border bg-card p-8">
            <div className="eyebrow">Riepilogo</div>
            <h3 className="mt-3 font-serif text-2xl text-ink">
              {title}
            </h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Codice</span>
                <span className="text-ink">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipologia</span>
                <span className="text-ink">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contratto</span>
                <span className="text-ink">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comune</span>
                <span className="text-ink">{municipality}</span>
              </div>
              {sqm && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie</span>
                  <span className="text-ink">{sqm} m²</span>
                </div>
              )}
              {bedrooms != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Camere</span>
                  <span className="text-ink">{bedrooms}</span>
                </div>
              )}
              {bathrooms != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bagni</span>
                  <span className="text-ink">{bathrooms}</span>
                </div>
              )}
            </div>

            {hasEnTranslation && (
              <div className="mt-6 border-t border-border pt-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Traduzione
                </div>
                <button
                  type="button"
                  onClick={() => setLang((l) => (l === "it" ? "en" : "it"))}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
                >
                  <Globe size={13} />
                  {lang === "it" ? "Mostra in inglese" : "Mostra in italiano"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
