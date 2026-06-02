import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, BedDouble } from "lucide-react";
import type { Property } from "@/lib/properties";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      to="/immobili/$id"
      params={{ id: String(p.id) }}
      className="group block overflow-hidden rounded-sm bg-card transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        {p.tag && (
          <span className="absolute left-4 top-4 rounded-sm bg-cream/95 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink">
            {p.tag}
          </span>
        )}
      </div>
      <div className="px-1 pt-5 pb-2">
        <div className="eyebrow">{p.reference} · {p.type}</div>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-ink">{p.title}</h3>
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
      </div>
    </Link>
  );
}