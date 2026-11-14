import type { PublicProperty } from "@/lib/public-properties.functions";
import { COMUNE_SEO, municipalityMatches } from "@/lib/seo-comuni";
import { isForSale, propertyMunicipality } from "@/lib/seo-taxonomy";

/** Input comes exclusively from the existing published catalogue endpoint. */
export function selectSeoFeaturedProperties(properties: PublicProperty[], area: "lunigiana" | "pontremoli") {
  const municipalities = COMUNE_SEO.filter((c) => area === "lunigiana" || c.slug === area);
  const eligible = properties.filter((p) =>
    isForSale(p) && p.image && !p.image.startsWith("data:") &&
    municipalities.some((c) => municipalityMatches(c, propertyMunicipality(p))),
  );
  // Preserve the catalogue's editorial order within each group; never invent a featured flag.
  const ordered = [...eligible.filter((p) => p.featured), ...eligible.filter((p) => !p.featured)];
  return ordered.filter((p, i) => ordered.findIndex((other) => other.id === p.id) === i).slice(0, 3);
}