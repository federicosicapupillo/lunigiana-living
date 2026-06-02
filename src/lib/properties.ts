import rawData from "@/data/properties.json";

export type PropertyCategory = "vendita" | "affitto" | "scelti-per-voi";

export interface RawProperty {
  id: number;
  reference: string;
  title: string;
  location: string;
  price_eur: number | null;
  price_label: string | null;
  description: string;
  attributes: Record<string, string>;
  cover: string | null;
  gallery: string[];
  category: PropertyCategory;
  featured: boolean;
}

export interface Property {
  id: number;
  slug: string;
  reference: string;
  title: string;
  location: string;
  price: string;
  priceValue: number | null;
  type: string;
  sqm: number | null;
  rooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  image: string;
  gallery: string[];
  description: string;
  attributes: Record<string, string>;
  category: PropertyCategory;
  featured: boolean;
  tag?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e8e4dd'/></svg>`,
  );

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function intAttr(attrs: Record<string, string>, key: string): number | null {
  const v = attrs[key];
  if (!v) return null;
  const m = v.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function formatPrice(p: RawProperty): string {
  if (!p.price_eur) return "Info in agenzia";
  const n = p.price_eur;
  const formatted = new Intl.NumberFormat("it-IT").format(n);
  return p.category === "affitto" ? `€ ${formatted} / mese` : `€ ${formatted}`;
}

function buildTag(p: RawProperty): string | undefined {
  if (p.category === "affitto") return "Affitto";
  if (p.category === "scelti-per-voi") return "Scelti per voi";
  if (p.featured) return "In evidenza";
  return undefined;
}

function titleCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function adapt(r: RawProperty): Property {
  const ref = r.reference.replace(/\s+/g, "-");
  return {
    id: r.id,
    slug: `${slugify(ref)}-${slugify(r.title || "immobile")}`.slice(0, 80),
    reference: r.reference,
    title: titleCase(r.title || "Immobile"),
    location: r.location || "Lunigiana",
    price: formatPrice(r),
    priceValue: r.price_eur,
    type: r.attributes["Tipologia"] || "Immobile",
    sqm: intAttr(r.attributes, "Superficie"),
    rooms: intAttr(r.attributes, "Locali"),
    bathrooms: intAttr(r.attributes, "Bagni"),
    floor: r.attributes["Piano"] || null,
    image: r.cover || (r.gallery[0] ?? PLACEHOLDER),
    gallery: r.gallery.length ? r.gallery : r.cover ? [r.cover] : [],
    description: r.description || "",
    attributes: r.attributes,
    category: r.category,
    featured: r.featured,
    tag: buildTag(r),
  };
}

export const allProperties: Property[] = (rawData as RawProperty[])
  .map(adapt)
  .sort((a, b) => {
    // Featured first, then by price desc, undefined last
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.priceValue ?? -1) - (a.priceValue ?? -1);
  });

export const featuredProperties: Property[] = allProperties
  .filter((p) => p.featured && p.category === "vendita")
  .slice(0, 6);

export const propertiesByCategory = (cat: PropertyCategory | "tutti") =>
  cat === "tutti" ? allProperties : allProperties.filter((p) => p.category === cat);

export const getPropertyById = (id: number | string): Property | undefined => {
  const n = typeof id === "string" ? parseInt(id, 10) : id;
  return allProperties.find((p) => p.id === n);
};

export const uniqueLocations = Array.from(
  new Set(allProperties.map((p) => p.location).filter(Boolean)),
).sort();

export const uniqueTypes = Array.from(
  new Set(allProperties.map((p) => p.type).filter(Boolean)),
).sort();

export const territories = [
  {
    slug: "pontremoli",
    name: "Pontremoli",
    tagline: "La capitale di pietra della Lunigiana",
    body: "Vie acciottolate, palazzi affrescati e il torrente Magra che attraversa la città. Vivere a Pontremoli significa abitare la storia con discrezione.",
  },
  {
    slug: "bagnone",
    name: "Bagnone",
    tagline: "Il castello, il borgo, il torrente",
    body: "Un borgo verticale che si affaccia su una piazza-mercato medievale. Adatto a chi cerca silenzio, sapori antichi e una comunità viva.",
  },
  {
    slug: "zeri",
    name: "Zeri",
    tagline: "Boschi, pascoli, lentezza",
    body: "Valli profonde, allevamenti, sentieri storici. Una Lunigiana wild per chi cerca un ritmo davvero diverso, lontano dal turismo di massa.",
  },
  {
    slug: "villafranca",
    name: "Villafranca",
    tagline: "Sul cammino della Francigena",
    body: "Tra il museo etnografico e i ponti antichi. Una porta naturale verso l'alta Lunigiana, ben collegata e ricca di servizi.",
  },
  {
    slug: "filattiera",
    name: "Filattiera",
    tagline: "Pievi romaniche e colline morbide",
    body: "Una delle zone più contemplative della Lunigiana. Perfetta per case di campagna immerse nel verde, a pochi minuti da Pontremoli.",
  },
  {
    slug: "mulazzo",
    name: "Mulazzo",
    tagline: "Dante, Malaspina, e una vista lunga",
    body: "Borgo letterario per eccellenza, con scorci che spaziano sull'intera valle. Casa qui significa luce, panorama, e una storia da custodire.",
  },
];