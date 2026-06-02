import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, BedDouble } from "lucide-react";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  sqm: number;
  rooms: number;
  image: string;
  tag?: string;
}

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      to="/immobili"
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
        <div className="eyebrow">{p.type}</div>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-ink">{p.title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} /> {p.location}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Maximize2 size={13} /> {p.sqm} m²</span>
            <span className="flex items-center gap-1"><BedDouble size={13} /> {p.rooms} camere</span>
          </div>
          <div className="font-serif text-lg text-primary">{p.price}</div>
        </div>
      </div>
    </Link>
  );
}