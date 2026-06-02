import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, BedDouble, ArrowRight } from "lucide-react";
import { WatermarkedImage } from "@/components/watermarked-image";

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
  tag?: string;
};

export function PropertyCard({ p }: { p: PropertyCardData }) {
  return (
    <Link
      to="/immobili/$id"
      params={{ id: String(p.id) }}
      aria-label={`Apri scheda immobile ${p.reference} — ${p.title} a ${p.location}`}
      className="group block overflow-hidden rounded-sm bg-card transition-all duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <WatermarkedImage
          src={p.image}
          alt={p.title}
          loading="lazy"
          watermarkSize="md"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        {p.tag && (
          <span className="absolute left-4 top-4 rounded-sm bg-cream/95 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink">
            {p.tag}
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent p-4 text-[0.65rem] uppercase tracking-[0.2em] text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Apri scheda <ArrowRight size={14} />
        </span>
      </div>
      <div className="px-1 pt-5 pb-2">
        <div className="eyebrow">{p.reference} · {p.type}</div>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-primary">
          {p.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} /> {p.location}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex gap-5 text-xs text-muted-foreground">
            {p.sqm != null && (
              <span className="flex items-center gap-1"><Maximize2 size={13} /> {p.sqm} m²</span>
            )}
            {p.rooms != null && (
              <span className="flex items-center gap-1"><BedDouble size={13} /> {p.rooms} locali</span>
            )}
          </div>
          <div className="font-serif text-lg text-primary">{p.price}</div>
        </div>
        <span className="mt-5 flex items-center justify-between rounded-sm bg-ink px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition group-hover:bg-primary">
          Vedi immobile
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}