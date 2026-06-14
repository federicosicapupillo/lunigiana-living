import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedProperty, type PublicProperty } from "@/lib/public-properties.functions";
import { getLocalizedProperty } from "@/lib/property-i18n.functions";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Maximize2, BedDouble, Bath, Building2, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
  const desc = p.description;
  const priceLabel = localizePrice(p.price, language);
  const displayType = localizeType(p.type, language);
  const [active, setActive] = useState(0);
  const main = p.gallery[active] || p.image;
  const galleryCount = p.gallery.length;
  const renderFor = p.galleryPairs?.[main];
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
    <article className="pb-24">
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
            </div>
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
                {p.galleryPairs?.[g] && (
                  <span className="pointer-events-none absolute left-1 top-1 inline-flex items-center gap-1 rounded-sm bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
                    <Sparkles size={9} /> {t("detail.beforeLabel")}/{t("detail.afterLabel")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Body */}
      <section className="container-editorial mt-12 grid gap-12 sm:mt-16 sm:gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="eyebrow">{t("detail.descEyebrow")}</span>
          <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">{t("detail.descTitle")}</h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
            {desc || t("detail.descFallback")}
          </p>

          {p.commercialHighlights && p.commercialHighlights.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {p.commercialHighlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[0.72rem] tracking-wide text-ink/85"
                >
                  {language === "en" ? COMMERCIAL_HIGHLIGHT_EN[h] ?? h : h}
                </li>
              ))}
            </ul>
          )}

          {/* Quick facts */}
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border md:grid-cols-4">
            {[
              { icon: Maximize2, label: t("detail.surface"), value: p.sqmLabel ?? (p.sqm ? `${p.sqm} m²` : "—") },
              { icon: BedDouble, label: t("detail.rooms"), value: localizeRoomsLabel(p.roomsLabel ?? "", language) || "—" },
              { icon: Bath, label: t("detail.bathrooms"), value: p.bathroomsLabel ?? "—" },
              { icon: Building2, label: t("detail.floor"), value: localizeAttrValue(p.floor || "", language) || "—" },
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
        </div>

        {/* Contact card */}
        <aside className="md:col-span-5">
          <div className="sticky top-28 rounded-sm border border-border bg-card p-8">
            <div className="eyebrow">{t("detail.contactEyebrow")}</div>
            <h3 className="mt-3 font-serif text-2xl text-ink">
              {t("detail.contactTitle")} <em className="italic">{p.reference}</em>
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("detail.contactBody")}
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