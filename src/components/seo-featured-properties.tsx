import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import type { PublicProperty } from "@/lib/public-properties.functions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SeoFeaturedProperties({ properties, area }: { properties: PublicProperty[]; area: "lunigiana" | "pontremoli" }) {
  const { language } = useLanguage();
  if (properties.length === 0) return null;
  const en = language === "en";
  return (
    <section aria-labelledby="featured-properties-title" className="bg-cream py-12 md:py-16">
      <div className="container-editorial">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-terracotta/20 pb-5">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-terracotta">{en ? "From our catalogue" : "Dal nostro catalogo"}</span>
            <h2 id="featured-properties-title" className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {en ? `Homes for sale in ${area === "pontremoli" ? "Pontremoli" : "Lunigiana"}` : `Immobili in evidenza ${area === "pontremoli" ? "a Pontremoli" : "in Lunigiana"}`}
            </h2>
          </div>
          <Link to="/immobili" className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline">
            {en ? "View the full catalogue" : "Vedi tutto il catalogo"} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}