/**
 * Factory centralizzata dei dati strutturati (JSON-LD).
 *
 * Regole di sicurezza applicate:
 * - solo dati aziendali verificati, nessun valore inventato;
 * - nessun `Product` / `MerchantListing`;
 * - nessuna URL firmata con token nel markup (le immagini degli immobili
 *   sono servite tramite URL firmate a scadenza: vengono OMESSE);
 * - `Offer` emesso solo con un prezzo numerico valido.
 */
import { siteUrl } from "@/lib/site-url";
import type { PublicProperty } from "@/lib/public-properties.functions";
import { propertyPath, propertyOgImagePath } from "@/lib/property-url";

export const AGENCY_ID = siteUrl("/#agency");
export const WEBSITE_ID = siteUrl("/#website");

/**
 * Classi energetiche ammesse nel JSON-LD. I valori presenti in banca dati che
 * non rappresentano una classe reale (es. "Classe", "In fase di rilascio")
 * restano visibili nel contenuto della pagina ma NON vengono dichiarati come
 * dato strutturato. Nessuna normalizzazione "creativa": confronto esatto
 * previa rimozione di spazi e differenze di maiuscole.
 */
const ENERGY_CLASS_ALLOWED = new Map<string, string>(
  [
    "A4",
    "A3",
    "A2",
    "A1",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "Esente",
    "Esente da APE",
  ].map((v) => [v.toLowerCase().replace(/\s+/g, " "), v]),
);

/** Restituisce la classe energetica se pubblicabile come dato strutturato. */
export function normalizeEnergyClassForJsonLd(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const key = value.trim().replace(/\s+/g, " ").toLowerCase();
  return ENERGY_CLASS_ALLOWED.get(key) ?? null;
}

/** Nodo agenzia (dati verificati: NAP reale dell'agenzia di Pontremoli). */
export const agencyNode = {
  "@type": "RealEstateAgent",
  "@id": AGENCY_ID,
  name: "Furia Immobiliare",
  description:
    "Agenzia immobiliare a Pontremoli. Vendita e affitto di case, ville e dimore di carattere in Lunigiana.",
  url: siteUrl("/"),
  telephone: "+39 0187 830229",
  email: "furiaimmobiliare@libero.it",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Pirandello 7",
    addressLocality: "Pontremoli",
    postalCode: "54027",
    addressRegion: "MS",
    addressCountry: "IT",
  },
  areaServed: [
    "Pontremoli",
    "Villafranca in Lunigiana",
    "Filattiera",
    "Mulazzo",
    "Bagnone",
    "Zeri",
    "Aulla",
  ],
  memberOf: { "@type": "Organization", name: "FIAIP" },
};

export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: siteUrl("/"),
  name: "Furia Immobiliare",
  inLanguage: "it-IT",
  publisher: { "@id": AGENCY_ID },
};

/** Nodo WebPage generico per una URL canonica. */
export function webPageNode(canonical: string, name: string, description?: string) {
  return {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name,
    ...(description ? { description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "it-IT",
  };
}

/** Grafo della home: agenzia + sito + pagina. */
export function homeGraph(title: string, description: string) {
  const canonical = siteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      agencyNode,
      websiteNode,
      { ...webPageNode(canonical, title, description), about: { "@id": AGENCY_ID } },
    ],
  };
}

/** Tipizzazione dell'immobile fisico a partire dalla tipologia testuale. */
export function accommodationType(type: string | null | undefined): "Apartment" | "House" | "Residence" {
  const t = (type ?? "").toLowerCase();
  if (/(appartamento|attico|mansarda|monolocale|bilocale|trilocale|loft)/.test(t)) return "Apartment";
  if (/(casa|villa|villetta|rustico|casale|cascina|bifamiliare|indipendente|colonica|borgo)/.test(t))
    return "House";
  return "Residence";
}

/** Comune estratto da `location` ("Comune · Zona"). */
function localityOf(location: string | null | undefined): string | null {
  const head = (location ?? "").split("·")[0]?.trim();
  return head && head.length > 0 ? head : null;
}

function cleanText(s: string | null | undefined, max = 600): string | null {
  if (!s) return null;
  const t = s.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/**
 * Grafo di una scheda immobile: WebPage + RealEstateListing (con immobile
 * fisico tipizzato e Offer opzionale) + BreadcrumbList.
 */
export function propertyGraph(p: PublicProperty) {
  const canonical = siteUrl(propertyPath(p));
  const listingId = `${canonical}#listing`;
  const description = cleanText(p.description);
  const locality = localityOf(p.location);

  const about: Record<string, unknown> = {
    "@type": accommodationType(p.type),
    "@id": `${canonical}#accommodation`,
    name: p.title,
    ...(locality
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: locality,
            addressRegion: "MS",
            addressCountry: "IT",
          },
        }
      : {}),
    ...(p.sqm && p.sqm > 0
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: p.sqm,
            unitCode: "MTK",
          },
        }
      : {}),
    // La colonna sorgente è `properties.bedrooms` (UI scheda: "Camere" /
    // "Bedrooms"): rappresenta le camere da letto, non i locali totali.
    // Nessun campo affidabile per il numero complessivo di locali esiste,
    // quindi `numberOfRooms` è volutamente omesso.
    ...(p.rooms && p.rooms > 0 ? { numberOfBedrooms: p.rooms } : {}),
    ...(p.bathrooms && p.bathrooms > 0 ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.energyClass
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Classe energetica",
              value: p.energyClass,
            },
          ],
        }
      : {}),
  };

  const hasPrice = typeof p.priceValue === "number" && Number.isFinite(p.priceValue) && p.priceValue > 0;
  // Per le locazioni non esiste in banca dati alcuna periodicità del prezzo
  // (mensile/settimanale/notte) e il testo pubblico indica "prezzo da
  // concordare": pubblicare un importo senza periodo sarebbe fuorviante,
  // quindi l'intero nodo Offer viene omesso.
  const emitOffer = hasPrice && !p.isRent;

  const listing: Record<string, unknown> = {
    "@type": "RealEstateListing",
    "@id": listingId,
    url: canonical,
    name: p.title,
    ...(description ? { description } : {}),
    ...(p.reference ? { identifier: p.reference } : {}),
    inLanguage: "it-IT",
    isPartOf: { "@id": WEBSITE_ID },
    provider: { "@id": AGENCY_ID },
    about: { "@id": `${canonical}#accommodation` },
    // Immagine stabile servita dalla route social interna: nessun token,
    // nessuna signed URL, nessun UUID nell'URL pubblica.
    image: [siteUrl(propertyOgImagePath(p))],
    ...(emitOffer
      ? {
          offers: {
            "@type": "Offer",
            "@id": `${canonical}#offer`,
            price: p.priceValue,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            businessFunction: p.isRent
              ? "http://purl.org/goodrelations/v1#LeaseOut"
              : "http://purl.org/goodrelations/v1#Sell",
            url: canonical,
            itemOffered: { "@id": `${canonical}#accommodation` },
            seller: { "@id": AGENCY_ID },
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Immobili", item: siteUrl("/immobili") },
      { "@type": "ListItem", position: 3, name: p.title, item: canonical },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPageNode(canonical, p.title, description ?? undefined),
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": listingId },
      },
      listing,
      about,
      breadcrumb,
    ],
  };
}
