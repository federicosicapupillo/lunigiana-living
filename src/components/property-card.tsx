import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, BedDouble, ArrowRight } from "lucide-react";
import { WatermarkedImage } from "@/components/watermarked-image";
import { whatsappUrl } from "@/components/whatsapp-float";

type PropertyCardData = {
  id: number | string;
  reference: string;
  title: string;
  location: string;
  type: string;
  image: string;
  price: string;
  sqm?: number | null;
  rooms?: number | null;
  epi?: string;
  tag?: string;
};

export function PropertyCard({ p }: { p: PropertyCardData }) {
  const waHref = whatsappUrl(
    `Ciao Elena, vorrei ricevere informazioni su questo immobile: ${p.reference} — ${p.title} (${p.location}).`,
  );
  return (
    <div className="card-property group block overflow-hidden">
      <Link
        to="/immobili/$id"
        params={{ id: String(p.id) }}
        aria-label={`Apri scheda immobile ${p.reference} — ${p.title} a ${p.location}`}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <WatermarkedImage
            src={p.image}
            alt={p.title}
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
            Apri scheda <ArrowRight size={14} />
          </span>
        </div>
        <div className="px-5 pt-5 pb-3">
          <div className="eyebrow">{p.reference} · {p.type}</div>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-primary">
            {p.title}
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
                <span className="flex items-center gap-1"><BedDouble size={13} /> {p.rooms} locali</span>
              )}
            </div>
            <div className="font-serif text-xl font-medium text-terracotta">{p.price}</div>
          </div>
          {p.epi && (
            <div className="mt-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              IPE: {p.epi}
            </div>
          )}
          <span className="mt-5 flex items-center justify-between rounded-md bg-ink px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-colors group-hover:bg-terracotta">
            Vedi immobile
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
      <div className="px-5 pb-4">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-terracotta"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#25D366]" />
          Info su WhatsApp
        </a>
      </div>
    </div>
  );
}