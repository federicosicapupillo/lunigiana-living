import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedProperty, type PublicProperty } from "@/lib/public-properties.functions";
import { getLocalizedProperty } from "@/lib/property-i18n.functions";
import {
  ArrowLeft, ChevronLeft, ChevronRight, MapPin, Maximize2, BedDouble, Bath, Building2,
  Sparkles, Zap, Leaf, MessageCircle, Mail, Check,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { WatermarkedImage } from "@/components/watermarked-image";
import { Skeleton } from "@/components/ui/skeleton";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { whatsappUrl } from "@/components/whatsapp-float";
import { useLanguage, useT } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { sendLeadNotification } from "@/lib/lead-notify.functions";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  localizeType,
  localizePrice,
  localizeAttrKey,
  localizeAttrValue,
  localizeAmenity,
  localizeKnown,
  localizeRoomsLabel,
  localizePropertyDynamic,
} from "@/lib/i18n/property-localize";
import { COMMERCIAL_HIGHLIGHT_EN } from "@/lib/admin/property-constants";

export const Route = createFileRoute("/immobili/$id")({
  loader: async ({ params }) => {
    const { property } = await getPublishedProperty({ data: { id: params.id } });
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.property;
    if (!p) return { meta: [{ title: "Immobile — Furia Immobiliare" }] };
    return {
      meta: [
        { title: `${p.title} a ${p.location} — ${p.reference} | Furia Immobiliare` },
        { name: "description", content: `${p.title} a ${p.location}. ${p.sqm ? p.sqm + ' m². ' : ''}${p.rooms ? p.rooms + ' locali. ' : ''}${p.price}.` },
        { property: "og:title", content: `${p.title} — ${p.location}` },
        { property: "og:description", content: p.description.slice(0, 200) },
        ...(p.image ? [{ property: "og:image", content: p.image }] : []),
      ],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <div className="container-editorial py-32 text-center">
      <p className="text-muted-foreground">Errore: {error.message}</p>
    </div>
  ),
  component: PropertyDetail,
});

function NotFound() {
  const t = useT();
  return (
    <div className="container-editorial py-32 text-center">
      <h1 className="font-serif text-4xl text-ink">{t("detail.notFound")}</h1>
      <p className="mt-4 text-muted-foreground">{t("detail.notFoundBody")}</p>
      <Link to="/immobili" className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground">
        {t("detail.back")}
      </Link>
    </div>
  );
}

const DETAIL_KEYS = [
  "Tipologia", "Superficie", "Locali", "Camere", "Bagni", "Piano",
  "Riscaldamento", "Cucina", "Stato", "Arredamento", "Box", "Posto auto",
  "Giardino", "Terrazzo", "Balcone", "Cantina", "Ascensore",
  "Infissi interni", "Infissi esterni", "Classe energetica",
  "IPE",
];

/** Clean broken markdown the AI / import sometimes leaves in descriptions. */
function sanitizeDescription(s: string | null | undefined): string {
  if (!s) return "";
  return s
    // strip paired bold markers but keep inner text
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
    // strip lonely / unbalanced markers
    .replace(/\*\*+/g, "")
    .replace(/__+/g, "")
    // single * used for emphasis -> keep text
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, "$1$2")
    // tidy spacing
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

type Lang = "it" | "en";

const LUNIGIANA_CONTEXTS: Record<string, { it: string; en: string }> = {
  pontremoli: {
    it: "Pontremoli è uno dei borghi principali della Lunigiana: centro storico medievale, servizi, stazione ferroviaria e collegamenti rapidi verso La Spezia, Parma e la costa toscana.",
    en: "Pontremoli is one of the main villages of Lunigiana: medieval historic centre, full services, train station and fast connections to La Spezia, Parma and the Tuscan coast.",
  },
  bagnone: {
    it: "Bagnone è un borgo elegante della Lunigiana, conosciuto per il torrente che attraversa il centro, le botteghe e la qualità della vita tranquilla a contatto con la natura.",
    en: "Bagnone is an elegant Lunigiana village, known for the stream running through its centre, its shops and the quiet, nature-rich quality of life.",
  },
  filattiera: {
    it: "Filattiera domina la valle dall'alto con la sua pieve romanica e il castello dei Malaspina: una zona panoramica, silenziosa e ben collegata a Pontremoli.",
    en: "Filattiera overlooks the valley with its Romanesque church and Malaspina castle: a scenic, quiet area well connected to Pontremoli.",
  },
  mulazzo: {
    it: "Mulazzo è un borgo di pietra immerso nella natura, legato alla famiglia Malaspina e a Dante. Ideale per chi cerca silenzio, storia e paesaggi autentici.",
    en: "Mulazzo is a stone village immersed in nature, linked to the Malaspina family and to Dante. Ideal for those seeking quiet, history and authentic landscapes.",
  },
  villafranca: {
    it: "Villafranca in Lunigiana è un crocevia comodo della valle: servizi, scuole, stazione e accesso veloce all'autostrada A15.",
    en: "Villafranca in Lunigiana is a convenient hub of the valley: services, schools, train station and quick access to the A15 motorway.",
  },
  zeri: {
    it: "Zeri è la Lunigiana più verde e selvaggia: pascoli, boschi e il celebre agnello di Zeri. Perfetto per chi cerca aria pulita e ritmi lenti.",
    en: "Zeri is the greenest, wildest side of Lunigiana: pastures, woods and the famous Zeri lamb. Perfect for those after clean air and slow rhythms.",
  },
  aulla: {
    it: "Aulla è il principale centro commerciale della bassa Lunigiana, con stazione, supermercati e accesso immediato all'autostrada verso La Spezia e Parma.",
    en: "Aulla is the main commercial hub of lower Lunigiana, with train station, supermarkets and immediate motorway access toward La Spezia and Parma.",
  },
  fivizzano: {
    it: "Fivizzano è un borgo storico ai piedi delle Alpi Apuane, con un bel centro storico e ampie zone collinari per chi cerca panorama e tranquillità.",
    en: "Fivizzano is a historic village at the foot of the Apuan Alps, with a beautiful old centre and wide hillside areas for those seeking views and quiet.",
  },
};

function contextFor(location: string, lang: Lang): string | null {
  const key = (location || "").toLowerCase().split(/[(,/\-–]/)[0].trim();
  for (const k of Object.keys(LUNIGIANA_CONTEXTS)) {
    if (key.startsWith(k)) return LUNIGIANA_CONTEXTS[k][lang];
  }
  return null;
}

function buildWhyPoints(p: PublicProperty, lang: Lang): string[] {
  const out: string[] = [];
  const isIt = lang === "it";
  const ch = (p.commercialHighlights ?? []).map((x) => x.toLowerCase());
  const attrs = Object.entries(p.attributes ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k.toLowerCase()] = (v ?? "").toLowerCase();
    return acc;
  }, {});
  const has = (k: string) => attrs[k] && attrs[k] !== "no" && attrs[k] !== "non indicato" && attrs[k] !== "—";
  const loc = (p.location || "").toLowerCase();

  if (ch.includes("vista") || ch.includes("panoramica") || ch.includes("panoramico")) {
    out.push(isIt ? "Posizione panoramica con vista aperta sulla valle." : "Panoramic position with open views over the valley.");
  }
  if (has("giardino")) {
    out.push(isIt ? "Spazio esterno privato: un valore raro che fa la differenza." : "Private outdoor space — a rare and meaningful value.");
  } else if (has("terrazzo") || has("balcone")) {
    out.push(isIt ? "Affaccio esterno vivibile per godere della luce del giorno." : "Liveable outdoor area to enjoy daylight.");
  }
  if (ch.includes("storico") || ch.includes("storica") || loc.includes("centro")) {
    out.push(isIt ? "Nel cuore del centro storico, a due passi da servizi e botteghe." : "In the heart of the historic centre, steps from shops and services.");
  }
  if (ch.includes("occasione")) {
    out.push(isIt ? "Rapporto qualità/prezzo interessante rispetto alla zona." : "Attractive value for money compared with the area.");
  }
  if (ch.includes("investimento")) {
    out.push(isIt ? "Adatto come investimento: facilmente locabile o rivendibile." : "Suitable as an investment: easy to rent out or resell.");
  }
  if (ch.includes("ristrutturato") || ch.includes("nuovo")) {
    out.push(isIt ? "Pronto da abitare, senza interventi importanti da prevedere." : "Move-in ready, no major works needed.");
  }
  // Dedup keeping max 4
  return Array.from(new Set(out)).slice(0, 4);
}

function buildIdealFor(p: PublicProperty, t: (k: string) => string): string[] {
  const out = new Set<string>();
  const ch = (p.commercialHighlights ?? []).map((x) => x.toLowerCase());
  const attrs = Object.entries(p.attributes ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k.toLowerCase()] = (v ?? "").toLowerCase();
    return acc;
  }, {});
  const has = (k: string) => attrs[k] && attrs[k] !== "no" && attrs[k] !== "non indicato";
  const sqm = p.sqm ?? 0;
  const rooms = p.rooms ?? 0;

  if (sqm >= 90 && rooms >= 3 && has("giardino")) out.add(t("detail.idealFamilies"));
  if (ch.includes("seconda casa") || ch.includes("vacanza") || rooms <= 3) out.add(t("detail.idealSecondHome"));
  if (ch.includes("vacanza") || ch.includes("turistico")) out.add(t("detail.idealVacation"));
  if (ch.includes("investimento") || ch.includes("occasione")) out.add(t("detail.idealInvestment"));
  if (ch.includes("verde") || ch.includes("natura") || has("giardino")) out.add(t("detail.idealNature"));
  if (ch.includes("tranquill") || ch.includes("silenzio") || ch.includes("panoramic")) out.add(t("detail.idealQuiet"));
  return Array.from(out).slice(0, 5);
}

/** Small section header used by the new editorial blocks. */
function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">{title}</h2>
    </div>
  );
}

function PropertyDetail() {
  const { property: base } = Route.useLoaderData() as { property: PublicProperty };
  const t = useT();
  const { language } = useLanguage();
  const localize = useServerFn(getLocalizedProperty);
  const { data: localized } = useQuery({
    queryKey: ["property-localized", base.id, language],
    queryFn: () => localize({ data: { id: base.id, lang: language } }),
    enabled: language === "en",
    staleTime: 1000 * 60 * 60, // 1h
    placeholderData: { property: base },
  });
  const p: PublicProperty = (localized?.property as PublicProperty | null) ?? localizePropertyDynamic(base, language);
  const title = p.title;
  const desc = useMemo(() => sanitizeDescription(p.description), [p.description]);
  const priceLabel = localizePrice(p.price, language);
  const displayType = localizeType(p.type, language);
  const lang: Lang = language === "en" ? "en" : "it";
  const whyPoints = useMemo(() => buildWhyPoints(p, lang), [p, lang]);
  const idealFor = useMemo(() => buildIdealFor(p, t), [p, t]);
  const contextText = useMemo(() => contextFor(p.location, lang), [p.location, lang]);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [active, setActive] = useState(0);
  const main = p.gallery[active] || p.image;
  const galleryCount = p.gallery.length;
  const renderFor = p.galleryPairs?.[main];
  const mainIsRendering = !!p.galleryRenderingFlags?.[main];
  const [mainLoaded, setMainLoaded] = useState(false);
  useEffect(() => {
    setMainLoaded(false);
  }, [main]);
  const notify = useServerFn(sendLeadNotification);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const full_name = String(fd.get("nome") ?? "").trim().slice(0, 200);
    const email = String(fd.get("email") ?? "").trim().slice(0, 320);
    const phone = String(fd.get("telefono") ?? "").trim().slice(0, 50);
    const message = String(fd.get("messaggio") ?? "").trim().slice(0, 3000);

    if (!full_name || !email || !phone) {
      setSubmitError(t("form.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError(t("form.err.email"));
      return;
    }
    if (phone.length < 3) {
      setSubmitError(t("form.err.required"));
      return;
    }

    setSubmitState("submitting");
    const source_page = typeof window !== "undefined" ? window.location.pathname : `/immobili/${base.id}`;
    const composedMessage = `[${p.reference}] ${p.title} — ${p.location}${message ? `\n\n${message}` : ""}`;

    const { error } = await supabase.from("leads").insert({
      full_name,
      email,
      phone,
      message: composedMessage,
      source_page,
      privacy_accepted: true,
    });
    if (error) {
      setSubmitState("error");
      setSubmitError(t("form.err.generic"));
      return;
    }

    try {
      await notify({
        data: {
          full_name,
          email,
          phone,
          message: message || null,
          property_reference: p.reference,
          source_page,
        },
      });
    } catch (err) {
      console.error("[lead notify] failed", err);
    }

    form.reset();
    setSubmitState("ok");
  }
  // Preload neighbor images so prev/next feels instant.
  useEffect(() => {
    if (typeof window === "undefined" || galleryCount <= 1) return;
    const neighbors = [
      p.gallery[(active + 1) % galleryCount],
      p.gallery[(active - 1 + galleryCount) % galleryCount],
    ];
    const imgs: HTMLImageElement[] = [];
    for (const src of neighbors) {
      if (!src) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      imgs.push(img);
    }
    return () => {
      imgs.forEach((i) => (i.src = ""));
    };
  }, [active, galleryCount, p.gallery]);
  const goPrev = () => setActive((i) => (galleryCount ? (i - 1 + galleryCount) % galleryCount : 0));
  const goNext = () => setActive((i) => (galleryCount ? (i + 1) % galleryCount : 0));
  const waMessage =
    `${t("wa.propertyMsgPrefix")} ` +
    `${p.reference} — ${title} (${p.location}).` +
    (typeof window !== "undefined" ? `\n${window.location.href}` : "");
  const waHref = whatsappUrl(waMessage);

  return (
    <article className="pb-32 md:pb-24">
      {/* Header */}
      <header className="border-b border-border bg-muted/40 pb-8 pt-24 sm:pb-10 sm:pt-28 md:pt-36">
        <div className="container-editorial">
          <Link to="/immobili" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-ink">
            <ArrowLeft size={14} /> {t("detail.back")}
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">{p.reference} · {displayType}</span>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">{title}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={15} /> {p.location}
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-muted-foreground">{p.category === "affitto" ? t("detail.rent") : t("detail.price")}</div>
              <div className="mt-2 font-serif text-2xl text-primary sm:text-3xl md:text-4xl">{priceLabel}</div>
              {p.occasione && p.occasione.onDetail && (
                p.occasione.style === "headline" ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-sm bg-terracotta px-4 py-2.5 font-serif text-base font-medium tracking-wide text-cream shadow-lg ring-1 ring-cream/40 sm:text-lg">
                    <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-cream/90" />
                    {t("detail.occasioneHeadline")}
                    <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-cream/90" />
                  </div>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-terracotta/40 bg-cream px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-terracotta">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta" />
                    {t("detail.occasioneBadge")}
                  </span>
                )
              )}
            </div>
          </div>
          {/* Hero CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90"
            >
              <Mail size={14} /> {t("detail.heroRequestInfo")}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-background px-5 py-3 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-ink/40"
            >
              <MessageCircle size={14} className="text-[#1f8a4c]" /> {t("detail.heroWhatsapp")}
            </a>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <section className="container-editorial mt-8 sm:mt-10">
        <div
          className="group relative overflow-hidden rounded-sm bg-cream touch-pan-y select-none"
          onTouchStart={(e) => {
            (e.currentTarget as any)._tsx = e.touches[0].clientX;
            (e.currentTarget as any)._tsy = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const el = e.currentTarget as any;
            if (typeof el._tsx !== "number") return;
            const dx = e.changedTouches[0].clientX - el._tsx;
            const dy = e.changedTouches[0].clientY - el._tsy;
            el._tsx = undefined;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) goNext();
              else goPrev();
            }
          }}
        >
          <div className="mx-auto flex w-full items-center justify-center h-[60vw] max-h-[450px] sm:h-[55vw] sm:max-h-[550px] md:h-[60vh] md:max-h-[650px]">
            {renderFor ? (
              <BeforeAfterSlider
                key={main}
                before={main}
                after={renderFor}
                alt={title}
                beforeLabel={t("detail.beforeLabel")}
                afterLabel={t("detail.afterLabel")}
                beforeCaption={t("detail.beforeCaption")}
                afterCaption={t("detail.afterCaption")}
                aiBadge={t("detail.emotionalBadge")}
                illustrativeNote={t("detail.illustrativeNote")}
                className="h-full w-full border-0 rounded-sm"
                aspectClassName=""
                hideCaption
                objectFit="contain"
              />
            ) : (
              <>
                {!mainLoaded && (
                  <Skeleton className="absolute inset-0 h-full w-full rounded-sm" />
                )}
                <WatermarkedImage
                  key={main}
                  src={main}
                  alt={title}
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  watermarkSize="lg"
                  onLoad={() => setMainLoaded(true)}
                  onError={() => setMainLoaded(true)}
                  className={`h-full w-full object-contain transition-opacity duration-300 ${mainLoaded ? "opacity-100" : "opacity-0"}`}
                />
                {mainIsRendering && (
                  <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/80 shadow-sm backdrop-blur-sm">
                    <Sparkles size={11} className="text-primary" />
                    {t("detail.renderingBadge")}
                  </span>
                )}
              </>
            )}
          </div>
          {galleryCount > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Immagine precedente"
                className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink shadow-sm backdrop-blur transition hover:bg-background sm:left-3 sm:h-11 sm:w-11"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Immagine successiva"
                className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-ink shadow-sm backdrop-blur transition hover:bg-background sm:right-3 sm:h-11 sm:w-11"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 right-3 rounded-sm bg-ink/70 px-2.5 py-1 text-[11px] font-medium tracking-wider text-cream backdrop-blur">
                {active + 1} / {galleryCount}
              </div>
            </>
          )}
        </div>
        {galleryCount > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
            {p.gallery.map((g: string, i: number) => (
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
                <WatermarkedImage src={g} alt="" loading="lazy" sizes="160px" watermark={false} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                {p.galleryRenderingFlags?.[g] ? (
                  <span className="pointer-events-none absolute left-1 top-1 inline-flex items-center gap-1 rounded-sm border border-primary/25 bg-background/85 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink/80 backdrop-blur">
                    <Sparkles size={9} className="text-primary" /> {t("detail.renderingBadgeShort")}
                  </span>
                ) : p.galleryPairs?.[g] && (
                  <span className="pointer-events-none absolute left-1 top-1 inline-flex items-center gap-1 rounded-sm bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
                    <Sparkles size={9} /> {t("detail.beforeLabel")}/{t("detail.afterLabel")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* First Vision — dedicated rendering section */}
      {p.renderings && p.renderings.length > 0 && (
        <section className="container-editorial mt-16 sm:mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">{t("detail.firstVisionEyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              {t("detail.firstVisionTitle")}
            </h2>
            <p className="mt-4 font-serif text-lg italic text-ink/75 sm:text-xl">
              {t("detail.firstVisionSubtitle")}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-foreground/75 sm:text-base">
              {t("detail.firstVisionBody")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-2">
            {p.renderings.map((src, i) => (
              <figure
                key={src + i}
                className="group relative overflow-hidden rounded-sm border border-border/60 bg-muted shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <WatermarkedImage
                    src={src}
                    alt={`${title} — ${t("detail.renderingBadge")} ${i + 1}`}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/80 shadow-sm backdrop-blur-sm">
                    <Sparkles size={11} className="text-primary" />
                    {t("detail.renderingBadge")}
                  </span>
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Body */}
      <section className="container-editorial mt-12 grid gap-12 sm:mt-16 sm:gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="eyebrow">{t("detail.descEyebrow")}</span>
          <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">{t("detail.descTitle")}</h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
            {desc || t("detail.descFallback")}
          </p>

          {(() => {
            const hidden = p.occasione && p.occasione.onDetail ? "Occasione" : null;
            const list = (p.commercialHighlights ?? []).filter((h) => h !== hidden);
            if (list.length === 0) return null;
            return (
            <ul className="mt-6 flex flex-wrap gap-2">
              {list.map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[0.72rem] tracking-wide text-ink/85"
                >
                  {language === "en" ? COMMERCIAL_HIGHLIGHT_EN[h] ?? h : h}
                </li>
              ))}
            </ul>
            );
          })()}

          {/* In sintesi — quick facts (hide empty rows) */}
          <div className="mt-10">
            <span className="eyebrow">{t("detail.summaryEyebrow")}</span>
            {(() => {
              const isYes = (v?: string | null) => !!v && !["no", "non indicato", "—", ""].includes(v.toLowerCase());
              const items: Array<{ icon: typeof Maximize2; label: string; value: string }> = [];
              if (p.sqm || p.sqmLabel) items.push({ icon: Maximize2, label: t("detail.surface"), value: p.sqmLabel ?? `${p.sqm} m²` });
              const roomsTxt = localizeRoomsLabel(p.roomsLabel ?? "", language);
              if (roomsTxt) items.push({ icon: BedDouble, label: t("detail.rooms"), value: roomsTxt });
              if (p.bathroomsLabel) items.push({ icon: Bath, label: t("detail.bathrooms"), value: p.bathroomsLabel });
              const floorTxt = localizeAttrValue(p.floor || "", language);
              if (floorTxt) items.push({ icon: Building2, label: t("detail.floor"), value: floorTxt });
              if (p.energyClass) items.push({ icon: Zap, label: t("detail.summaryEnergy"), value: p.energyClass });
              if (p.epi) items.push({ icon: Zap, label: t("detail.summaryEpi"), value: localizeAttrValue(p.epi, language) });
              if (isYes(p.attributes["Giardino"])) items.push({ icon: Leaf, label: t("detail.summaryGarden"), value: localizeAttrValue(p.attributes["Giardino"], language) });
              if (isYes(p.attributes["Terrazzo"])) items.push({ icon: Leaf, label: t("detail.summaryTerrace"), value: localizeAttrValue(p.attributes["Terrazzo"], language) });
              if (isYes(p.attributes["Balcone"])) items.push({ icon: Leaf, label: t("detail.summaryBalcony"), value: localizeAttrValue(p.attributes["Balcone"], language) });
              if (items.length === 0) return null;
              return (
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border md:grid-cols-4">
                  {items.slice(0, 8).map((f) => (
                    <div key={f.label} className="bg-card p-5">
                      <f.icon size={18} className="text-primary" />
                      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                      <div className="mt-1 font-serif text-xl text-ink">{f.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Perché è interessante */}
          {whyPoints.length > 0 && (
            <div className="mt-12 rounded-sm border border-warm-border/70 bg-cream/40 p-6 sm:p-8">
              <SectionHead title={t("detail.whyTitle")} />
              <ul className="mt-5 space-y-3">
                {whyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                    <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ideale per */}
          {idealFor.length > 0 && (
            <div className="mt-10">
              <SectionHead title={t("detail.idealForTitle")} />
              <ul className="mt-4 flex flex-wrap gap-2">
                {idealFor.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-ink/15 bg-background px-3.5 py-1.5 text-xs tracking-wide text-ink/85"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full attributes */}
          <div className="mt-12">
            <span className="eyebrow">{t("detail.detailsEyebrow")}</span>
            <h2 className="mt-3 font-serif text-3xl text-ink">{t("detail.detailsTitle")}</h2>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {DETAIL_KEYS.filter((k) => p.attributes[k] && p.attributes[k].toLowerCase() !== "non indicato").map((k) => (
                <div key={k} className="flex justify-between border-b border-border py-3 text-sm">
                  <dt className="text-muted-foreground">{localizeAttrKey(k, language)}</dt>
                  <dd className="text-right text-ink">{localizeAttrValue(p.attributes[k], language)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Dotazioni */}
          {(p.amenities.length > 0 || p.altreDotazioni) && (
            <div className="mt-12">
              <span className="eyebrow">{t("detail.amenitiesEyebrow")}</span>
              <h2 className="mt-3 font-serif text-3xl text-ink">{t("detail.amenitiesTitle")}</h2>
              {p.amenities.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <li
                      key={a}
                      className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-wider text-ink"
                    >
                      {localizeAmenity(a, language)}
                    </li>
                  ))}
                </ul>
              )}
              {p.altreDotazioni && (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                  {p.altreDotazioni}
                </p>
              )}
            </div>
          )}

          {/* Highlights: punti di forza, target, atmosfera, architettonici */}
          {p.highlights && p.highlights.length > 0 && (
            <div className="mt-12 space-y-8">
              {p.highlights.map((h) => (
                <div key={h.key}>
                  <span className="eyebrow">{localizeKnown(h.label, language)}</span>
                  {h.items.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {h.items.map((it) => (
                        <li
                          key={it}
                          className="rounded-sm border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs tracking-wide text-ink"
                        >
                          {localizeKnown(it, language)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {h.note && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                      {h.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Il contesto */}
          {contextText && (
            <div className="mt-12">
              <span className="eyebrow">{t("detail.contextEyebrow")}</span>
              <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">{t("detail.contextTitle")}</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
                {contextText}
              </p>
            </div>
          )}
        </div>

        {/* Contact card */}
        <aside className="md:col-span-5">
          <div ref={contactRef} className="sticky top-28 rounded-sm border border-terracotta/25 bg-card p-8 shadow-sm">
            <div className="eyebrow text-terracotta">{t("detail.contactEyebrow")} · {p.reference}</div>
            <h3 className="mt-3 font-serif text-2xl text-ink sm:text-[1.6rem]">
              {t("detail.contactStrongTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {t("detail.contactStrongBody")}
            </p>

            {submitState === "ok" ? (
              <div className="mt-6 rounded-sm border border-border bg-cream p-6 text-center">
                <CheckCircle2 className="mx-auto text-primary" size={28} />
                <h4 className="mt-3 font-serif text-lg text-ink">{t("form.thanks")}</h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{t("form.thanksBody")}</p>
              </div>
            ) : (
              <form onSubmit={onSubmitLead} className="mt-6 space-y-3" noValidate>
                <input name="nome" required maxLength={200} autoComplete="name" placeholder={t("detail.namePh")} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                <input name="email" type="email" required maxLength={320} autoComplete="email" placeholder={t("detail.emailPh")} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                <input name="telefono" type="tel" required maxLength={50} autoComplete="tel" placeholder={t("detail.phonePh")} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                <textarea name="messaggio" rows={4} maxLength={3000} placeholder={t("detail.msgPh")} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitState === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitState === "submitting" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t("form.submitting")}
                    </>
                  ) : (
                    t("detail.submit")
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
              <div>{t("detail.orCall")}</div>
              <a href="tel:+390187830229" className="mt-1 block font-serif text-xl text-ink">0187 830229</a>
              <a href="tel:+393207019985" className="block font-serif text-xl text-ink">320 7019985</a>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm border border-ink bg-ink px-6 py-4 text-xs uppercase tracking-[0.22em] text-cream transition hover:bg-primary hover:border-primary"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366]" aria-hidden>
                <span className="block h-2 w-2 rounded-full bg-white" />
              </span>
              {t("detail.waBtn")}
            </a>
          </div>
        </aside>
      </section>
    </article>
  );
}