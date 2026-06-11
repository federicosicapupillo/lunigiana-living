import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, BedDouble, ArrowRight } from "lucide-react";
import { WatermarkedImage } from "@/components/watermarked-image";
import { whatsappUrl } from "@/components/whatsapp-float";
import { useT } from "@/lib/i18n/LanguageContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { pickLocalized } from "@/lib/i18n/translations";

type PropertyCardData = {
  id: number | string;
  reference: string;
  title: string;
  titleEn?: string | null;
  location: string;
  type: string;
  image: string;
  price: string;
  sqm?: number | null;
  rooms?: number | null;
  epi?: string;
  tag?: string;
  isRent?: boolean;
};

export function PropertyCard({ p }: { p: PropertyCardData }) {
  const t = useT();
  const { language } = useLanguage();
  const displayTitle = pickLocalized<string | null | undefined>(p.title, p.titleEn ?? null, language) ?? p.title;
  const displayPrice = p.isRent && language === "en"
    ? p.price.replace("/ mese", "/ month")
    : p.price;
  const waHref = whatsappUrl(
    `${t("wa.propertyMsgPrefix")} ${p.reference} — ${displayTitle} (${p.location}).`,
  );
  return (
    <div className="card-property group block overflow-hidden">
      <Link
        to="/immobili/$id"
        params={{ id: String(p.id) }}
        aria-label={`${t("cta.openListing")} ${p.reference} — ${displayTitle} (${p.location})`}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <WatermarkedImage
            src={p.image}
            alt={displayTitle}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            watermarkSize="md"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          {p.tag && (
            <span className="absolute left-4 top-4 rounded-md bg-terracotta px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-cream shadow-sm">
              {p.tag}
            </span>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent p-4 text-[0.65rem] uppercase tracking-[0.2em] text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {t("cta.openListing")} <ArrowRight size={14} />
          </span>
        </div>
        <div className="px-5 pt-5 pb-3">
          <div className="eyebrow">{p.reference} · {p.type}</div>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-primary">
            {displayTitle}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} /> {p.location}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-warm-border/70 pt-4">
            <div className="flex gap-5 text-xs text-muted-foreground">
              {p.sqm != null && (
                <span className="flex items-center gap-1"><Maximize2 size={13} /> {p.sqm} m²</span>
              )}
              {p.rooms != null && (
                <span className="flex items-center gap-1"><BedDouble size={13} /> {p.rooms} {t("card.rooms")}</span>
              )}
            </div>
            <div className="font-serif text-xl font-medium text-terracotta">{displayPrice}</div>
          </div>
          {p.epi && (
            <div className="mt-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              {t("card.epi")}: {p.epi}
            </div>
          )}
          <span className="mt-5 flex items-center justify-between rounded-md bg-ink px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-colors group-hover:bg-terracotta">
            {t("cta.viewProperty")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
      <div className="px-5 pb-4">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-[#1f8a4c] transition hover:border-[#25D366]/60 hover:bg-[#25D366]/15"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#25D366]" />
          {t("cta.infoOnWhatsapp")}
        </a>
      </div>
    </div>
  );
}